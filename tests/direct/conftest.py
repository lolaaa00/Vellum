import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import gltest.direct.loader as direct_loader
import gltest.direct.sdk_loader as direct_sdk_loader
import pytest

# GenVM lint extracts the exact contract SDK before this suite in CI. Reuse it
# instead of the legacy Direct Mode downloader, whose retired URL returns 404.
SDK_PATH = Path.home() / ".cache/genvm-linter/extracted/genlayerlabs-genvm-manager-v0.6.0-rc6/py-lib-genlayer-std/11rhn002yfajawsz7fai6mykznbxkxs6l91iskj5cm82c92qhy3v"


def _use_pinned_sdk(*_args, **_kwargs):
    if not SDK_PATH.is_dir():
        raise RuntimeError("Pinned GenVM SDK is missing; run genvm-lint check contracts/vellum.py first")
    if str(SDK_PATH) not in sys.path:
        sys.path.insert(0, str(SDK_PATH))
    return [SDK_PATH]


direct_loader.setup_sdk_paths = _use_pinned_sdk
direct_sdk_loader.setup_sdk_paths = _use_pinned_sdk


@pytest.fixture(autouse=True)
def use_pinned_installed_sdk(monkeypatch, direct_vm):
    monkeypatch.setattr(direct_sdk_loader, "setup_sdk_paths", _use_pinned_sdk)
    _use_pinned_sdk()
    from gltest.direct import wasi_mock
    wasi_mock.set_vm(direct_vm)
    sys.modules["_genlayer_wasi"] = wasi_mock
    direct_loader._inject_message_to_fd0(direct_vm)
    from genlayer.gl import genvm_contracts
    genvm_contracts.__known_contract__ = None
    yield
    genvm_contracts.__known_contract__ = None

CONTRACT = "contracts/vellum.py"
ATTO = 10**18
SOURCE = "https://example.org/constitution"
EVIDENCE = "https://example.org/approval/42"
SOURCE_TEXT = """
Community Treasury Constitution. Treasury payments are permitted only for ecosystem
education, public infrastructure and approved contributor grants. Payments require a
published proposal showing the beneficiary, amount and purpose. Personal gifts,
undisclosed related-party payments and spending outside an approved mandate are forbidden.
For grants above 5 GEN, a recorded council approval is required.
""".strip()


def warp_to(vm, seconds):
    vm.warp(datetime.fromtimestamp(seconds, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))


def start_clock(vm):
    t0 = int(time.time()) // 60 * 60
    warp_to(vm, t0)
    return t0


def hex_of(account):
    v = getattr(account, "as_hex", None)
    return v if isinstance(v, str) else "0x" + bytes(account).hex()


def mock_source(vm):
    vm.mock_web(r"^https://example\.org/constitution$", {"status": 200, "body": SOURCE_TEXT})


def mock_evidence(vm, body="Council approval recorded for grant 42; beneficiary Alice; amount 2 GEN."):
    vm.mock_web(r"^https://example\.org/approval/42$", {"status": 200, "body": body})


def mock_decision(vm, verdict="PERMITTED", risk="NONE", rationale="Explicitly authorised grant."):
    payload = json.dumps({
        "verdict": verdict,
        "risk_class": risk,
        "rationale": rationale,
        "material_clause": "approved contributor grants",
        "missing_fact": "" if verdict == "PERMITTED" else "recorded council approval",
    }).encode("utf-8")
    vm.mock_llm(r".*constitutional governance reviewer.*", payload)


def deploy_with_charter(vm, deploy, alice):
    start_clock(vm)
    mock_source(vm)
    c = deploy(CONTRACT)
    vm.sender = alice
    cid = c.publish_charter("Treasury Constitution", SOURCE, "Example DAO", "Governed treasury spending", 0)
    return c, cid


def make_mandate(c, vm, alice, cid, amount=10*ATTO):
    vm.sender = alice
    vm.value = amount
    mid = c.create_mandate(cid, "Ecosystem grants", "Fund contributor grants that satisfy the charter.", 20*ATTO, int(time.time()) + 30*86400)
    vm.value = 0
    return mid
