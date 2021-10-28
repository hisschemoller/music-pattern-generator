import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

export const NOTE_ON = 144;
export const NOTE_OFF = 128;
export const CONTROL_CHANGE = 176;
export const SYSTEM_REALTIME = 240;
export const REALTIME_CLOCK = 248;
export const REALTIME_START = 250;
export const REALTIME_CONTINUE = 251;
export const REALTIME_STOP = 252;

let midiAccess = null,
	syncListeners,
	remoteListeners;

/**
 * Request access to the MIDI devices.
 */
export function accessMidi() { 
  return new Promise((resolve, reject) => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: false })
        .then(
          access => {
            console.log('MIDI enabled.');
						midiAccess = access;
            resolve();
          },
          () => {
            reject(`MIDI access failed.`);
          }
        );
    } else {
      reject(`No MIDI access in this browser.`);
    }
  });
}

/**
 * Listen to MIDI events.
 * @param {Object} midiAccessObj MidiAccess object.
 */
export function listenToMIDIPorts() {
	const inputs = midiAccess.inputs.values();
	
	for (let port = inputs.next(); port && !port.done; port = inputs.next()) {
			port.value.onmidimessage = onMIDIMessage;
	}

	midiAccess.onstatechange = onAccessStateChange;

	addEventListeners();
}

/**
 * Get all MIDI input and output ports.
 * @returns {Array} Array of all ports.
 */
export function getAllMIDIPorts() {
	const allPorts = [];
	const inputs = midiAccess.inputs.values();
	const outputs = midiAccess.outputs.values();

	for (let port = inputs.next(); port && !port.done; port = inputs.next()) {
		allPorts.push(port.value);
	}
	
	for (let port = outputs.next(); port && !port.done; port = outputs.next()) {
		allPorts.push(port.value);
	}

	return allPorts;
}

/**
 * Check MIDI access.
 * @returns {Boolean} True if MIDI access exists.
 */
export function getMIDIAccessible() {
	return midiAccess !== null;
}

/**
 * Get a specific MIDI port by its ID.
 * @param {String} id MIDI port ID.
 */
export function getMIDIPortById(id) {
	const inputs = midiAccess.inputs.values();
	const outputs = midiAccess.outputs.values();

	for (let port = inputs.next(); port && !port.done; port = inputs.next()) {
		if (port.value.id === id) {
			return port.value;
		}
	}
	
	for (let port = outputs.next(); port && !port.done; port = outputs.next()) {
		if (port.value.id === id) {
			return port.value;
		}
	}
}

/**
 * Listen to events.
 */
function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

/**
 * Handle state changes.
 * @param {Object} e Custom event.
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
		case actions.TOGGLE_MIDI_PREFERENCE:
			updateMIDISyncListeners(state.ports);
			updateMIDIRemoteListeners(state.ports);
			break;
	
		case actions.CREATE_MIDI_PORT:
		case actions.UPDATE_MIDI_PORT:
			updateMIDISyncListeners(state.ports);
			updateMIDIRemoteListeners(state.ports);
			break;
	}
}

/**
 * MIDIAccess object statechange handler.
 * If the change is the addition of a new port, create a port module.
 * This handles MIDI devices that are connected after the app initialisation.
 * Disconnected or reconnected ports are handled by the port modules.
 * 
 * @param {Object} e MIDIConnectionEvent object.
 */
function onAccessStateChange(e) {
	e.port.onmidimessage = onMIDIMessage;
	dispatch(getActions().midiAccessChange(e.port));
}

/**
 * MIDI Continuous Control message handler.
 * @param {Object} e MIDIMessageEvent.
 */
function onControlChangeMessage(e) {
	if (remoteListeners.indexOf(e.target.id) > -1) {
		dispatch(getActions().receiveMIDIControlChange(e.data));
	}
}

/**
 * Handler for all incoming MIDI messages.
 * @param {Object} e MIDIMessageEvent.
 */
function onMIDIMessage(e) {
	// console.log(e.data[0] & 0xf0, e.data[0] & 0x0f, e.target.id, e.data[0], e.data[1], e.data[2]);
	switch (e.data[0] & 0xf0) {
		case SYSTEM_REALTIME:
			onSystemRealtimeMessage(e);
			break;
		case CONTROL_CHANGE:
			onControlChangeMessage(e);
			break;
		case NOTE_ON:
		case NOTE_OFF:
			onNoteMessage(e);
			break;
	}
}

/**
 * MIDI Note message handler.
 * @param {Object} e MIDIMessageEvent.
 */
function onNoteMessage(e) {
	if (remoteListeners.indexOf(e.target.id) > -1) {
		dispatch(getActions().receiveMIDINote(e.data));
	}
}

/**
 * Eventlistener for incoming MIDI messages.
 * data[1] and data[2] are undefined,
 * for e.data[0] & 0xf:
 * 8 = clock, 248 (11110000 | 00000100)
 * 10 = start
 * 11 = continue
 * 12 = stop
 * @see https://www.w3.org/TR/webmidi/#idl-def-MIDIMessageEvent
 * @see https://www.midi.org/specifications/item/table-1-summary-of-midi-message
 * @param {Object} e MIDIMessageEvent.
 */
function onSystemRealtimeMessage(e) {
	if (syncListeners.indexOf(e.target.id) > -1) {
		switch (e.data[0]) {
			case REALTIME_CLOCK: // clock
				// TODO: Add remote MIDI clock sync.
				break;
			case REALTIME_START: // start
				dispatch(getActions().setTransport('play'));
				break;
			case REALTIME_CONTINUE: // continue
				dispatch(getActions().setTransport('play'));
				break;
			case REALTIME_STOP: // stop
				dispatch(getActions().setTransport('pause'));
				break;
		}
	}
}

/**
 * Listen to enabled MIDI input ports.
 * @param {Object} ports MIDI ports data from state.
 */
function updateMIDISyncListeners(ports) {
	syncListeners = [];
	ports.allIds.forEach(portId => {
		const { id, syncEnabled, } = ports.byId[portId];
		if (syncEnabled) {
			syncListeners.push(id);
		}
	});
}

/**
 * Listen to enabled MIDI input ports.
 * @param {Object} ports MIDI ports data from state.
 */
function updateMIDIRemoteListeners(ports) {
	remoteListeners = [];
	ports.allIds.forEach(portId => {
		const { id, remoteEnabled, } = ports.byId[portId];
		if (remoteEnabled) {
			remoteListeners.push(id);
		}
	});
}
