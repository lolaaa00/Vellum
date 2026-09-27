import json
import time
from datetime import datetime, timezone

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
