import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import { process } from '../midi/network.js';
import {draw } from '../webgl/canvas3d.js';
import { PPQN } from '../core/config.js';

/**
 * Timing, transport and sequencing functionality.
 * Divided in two sets of functionality, Transport and Sequencer.
 * 
 * Unix epoch,                page    AudioContext   Transport        now,
 * 01-01-1970 00:00:00 UTC    load    created        start            the present
 *  |                          |       |              |                | 
 *  |--------------------------|-------|-------//-----|--------//------|
 *  
 *  |------------------------------------------------------------------> Date.now()
 *                             |---------------------------------------> performance.now()
 *                                     |-------------------------------> AudioContext.currentTime
 */

let audioContextOffset = 0,
 bpm = 0,
 processorEvents = {},
 renderThrottleCounter = 0,
 tickInMilliseconds = 0;

/**
 * @description Creates sequencer functionality.
 * Takes time from transport to get music events from arrangement and
 * drives components that process music events.
 * @param {Object} specs External specifications.
 * @param {Object} my Internally shared properties.
 */
export function setup (specs, my) {
  addEventListeners();
  setBPM();
}

/**
 * Get Beats Per Minute of the project.
 * @return [Number] Beats Per Minute.
 */
export function getBPM () {
  return bpm;
}

/**
 * Scan the arrangement for events and send them to concerned components.
 * @param {Number} scanStart Start in ms of timespan to scan.
 * @param {Number} scanEnd End in ms of timespan to scan.
 * @param {Number} nowToScanStart Duration from now until start time in ms.
 * @param {Number} offset Position of transport playhead in ms.
 */
export function scanEvents(scanStart, scanEnd, nowToScanStart, offset) {
  process(
    msec2tick(scanStart),
    msec2tick(scanEnd),
    msec2tick(nowToScanStart),
    tickInMilliseconds,
    msec2tick(offset),
    processorEvents
  );
}

/**
 * Use Timing's requestAnimationFrame as clock for view updates.
 * @param {Number} position Timing position, equal to performance.now(). 
 */
export function updateView(position) {
  if (renderThrottleCounter % 2 === 0) {
    draw(msec2tick(position), processorEvents);
    Object.keys(processorEvents).forEach(v => processorEvents[v] = []);
  }
  renderThrottleCounter++;
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
    case actions.CREATE_PROJECT:
      setBPM(state.bpm);
      break;

    case actions.SET_TEMPO:
      setBPM(state.bpm);
      break;
	}
}

/**
 * Convert milliseconds to ticks.
 */
function msec2tick(sec) {
  return sec / tickInMilliseconds;
}
        
/**
 * Set difference between AudioContext.currentTime and performance.now.
 * Used to convert timing for AudioContext playback.
 * @param {Number} acCurrentTime Timestamp in seconds.
 */
function setAudioContextOffset(acCurrentTime) {
  audioContextOffset = performance.now() - (acCurrentTime * 1000);
}

/**
 * Set Beats Per Minute.
 * @param {Number} newBpm New value for BPM.
 */
function setBPM(newBpm = 120) {
  bpm = newBpm;
  const beatInMilliseconds = 60000.0 / bpm;
  tickInMilliseconds = beatInMilliseconds / PPQN;
}

/**
 * Convert ticks to milliseconds.
 */
function tick2msec(tick) {
    return tick * tickInMilliseconds;
}
