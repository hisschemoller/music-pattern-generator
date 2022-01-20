import { dispatch, getActions, getState, STATE_CHANGE, } from '../state/store.js';
import { PPQN } from '../core/config.js';
import {
  getMIDIAccessible,
  getMIDIPortById,
  REALTIME_CLOCK,
  REALTIME_START,
  REALTIME_CONTINUE,
  REALTIME_STOP,
} from './midi.js';

const MIDICLOCK_PPQN = 24;
const clockIntervalInTicks = PPQN / MIDICLOCK_PPQN;
let midiOutputs = [];
let timestampTicks = 0;

/**
 * Listen to events.
 */
function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

/**
 * Handle state changes.
 * @param {Object} e Custom store event.
 */
function handleStateChanges(e) {
  const { state, action, } = e.detail;
  const actions = getActions();
  
  switch (action.type) {
		case actions.SET_TRANSPORT:
			switch (state.transport) {
				case 'pause':
          sendRealtimeMessage(REALTIME_STOP);
					break;
				case 'play':
					sendRealtimeMessage(REALTIME_START);
					break;
				case 'stop':
					sendRealtimeMessage(REALTIME_START);
					break;
			}
			break;
				
    case actions.CREATE_MIDI_PORT:
    case actions.UPDATE_MIDI_PORT:
    case actions.TOGGLE_MIDI_PREFERENCE:
      updateMIDIPorts(state);
      break;
  }
}

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
    midiOutputs.forEach((midiOutput) => midiOutput.send([REALTIME_CLOCK], timestamp));
    timestampTicks += clockIntervalInTicks;
  }
}

/**
 * Send a realtime MIDI message of the given type.
 * @param {Number} messageType MIDI message type.
 */
function sendRealtimeMessage(messageType) {
  midiOutputs.forEach((midiOutput) => midiOutput.send([messageType]));
}

/**
 * General module setup.
 */
export function setup() {
  addEventListeners();
}

/**
 * Recreate array of output ports for which sync is enabled.
 * @param {Object} state App state.
 */
function updateMIDIPorts(state) {
  const { ports } = state;
  midiOutputs = [];

  if (getMIDIAccessible()) {
    ports.allIds.forEach((portId) => {
      const { id, syncEnabled, type } = ports.byId[portId];
      if (syncEnabled && type === 'output') {
        const midiOutput = getMIDIPortById(id);
        if (midiOutput) {
          midiOutputs.push(getMIDIPortById(id));
        }
      }
    });
  }
}
