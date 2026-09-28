import type { Motion } from '../types';

export function terminalMethodForMotion(motion: Pick<Motion,'verdict'|'status'>, mandateExpiresAt: number, nowSeconds=Math.floor(Date.now()/1000)) {
  if (motion.status==='REVIEWED' && nowSeconds>=mandateExpiresAt) return 'expire_motion';
  return motion.verdict==='PERMITTED' ? 'execute_motion' : 'close_blocked_motion';
}
