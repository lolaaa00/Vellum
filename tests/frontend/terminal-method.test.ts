import { describe,expect,it } from 'vitest';
import { terminalMethodForMotion } from '../../lib/genlayer/terminal';

describe('terminalMethodForMotion',()=>{
  it('expires an expired reviewed permitted motion instead of executing it',()=>{
    expect(terminalMethodForMotion({status:'REVIEWED',verdict:'PERMITTED'},100,101)).toBe('expire_motion');
  });

  it('keeps the normal terminal action before mandate expiry',()=>{
    expect(terminalMethodForMotion({status:'REVIEWED',verdict:'PERMITTED'},101,100)).toBe('execute_motion');
  });
});
