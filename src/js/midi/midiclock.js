import { PPQN } from '../core/config.js';

const MIDICLOCK_PPQN = 24;
const clockIntervalInTicks = PPQN / MIDICLOCK_PPQN;
const midiOutputs = [];
let timestampTicks = 0;

/**
 * Process events to happen in a time slice.
 * timeline start        now      scanStart     scanEnd
 * |----------------------|-----------|------------|
 *                        |-----------| 
 *                        nowToScanStart
 * @param {Number} scanStart Timespan start in ticks from timeline start.
 * @param {Number} scanEnd   Timespan end in ticks from timeline start.
 * @param {Number} nowToScanStart Timespan from current timeline position to scanStart, in ticks.
 * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
 * @param {Number} offset Time from doc start to timeline start in ticks.
 */
export function process(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {
  const origin = performance.now() - (offset * ticksToMsMultiplier);
  while (timestampTicks < scanEnd) {
    const timestamp = origin + (timestampTicks * ticksToMsMultiplier);
    // if (timestampTicks < 400) {
    //   console.log(timestamp);
    // }
    midiOutputs.forEach((midiOutput) => midiOutput.send(0xf8, timestamp));
    timestampTicks += clockIntervalInTicks;
  }
}
