let midiAccess;

export default function createMIDI(specs) {
    var that,
        store = specs.store,
        syncListeners = [],
        remoteListeners = [],

        init = function() {
            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {

                    case e.detail.actions.TOGGLE_MIDI_PREFERENCE:
                        updateMIDISyncListeners(e.detail.state.ports);
                        updateMIDIRemoteListeners(e.detail.state.ports);
                        break;
                    
                    case e.detail.actions.CREATE_MIDI_PORT:
                    case e.detail.actions.UPDATE_MIDI_PORT:
                        updateMIDISyncListeners(e.detail.state.ports);
                        updateMIDIRemoteListeners(e.detail.state.ports);
                        break;
                }
            });
        },

        connect = function() {
            return new Promise((resolve, reject) => {
                requestAccess(resolve, reject, false);
            });
        },

        /**
         * Request system for access to MIDI ports.
         * @param {function} successCallback
         * @param {function} failureCallback
         * @param {boolean} sysex True if sysex data must be included.
         */
        requestAccess = function(successCallback, failureCallback, sysex) {
            if (navigator.requestMIDIAccess) {
                navigator.requestMIDIAccess({
                    sysex: !!sysex
                }).then(function(_midiAccess) {
                    onAccessSuccess(_midiAccess);
                    successCallback();
                }, function() {
                    failureCallback('Request for MIDI access failed.');
                });
            } else {
                failureCallback('Web MIDI API not available.');
            }
        },

        /**
         * MIDI access request failed.
         * @param {String} errorMessage
         */
        onAccessFailure = function(errorMessage) {
            console.log(errorMessage);
        },

        /**
         * MIDI access request succeeded.
         * @param {Object} midiAccessObj MidiAccess object.
         */
        onAccessSuccess = function(_midiAccess) {
            console.log('MIDI enabled.');
            midiAccess = _midiAccess;

            const inputs = midiAccess.inputs.values();
            const outputs = midiAccess.outputs.values();
            
            for (let port = inputs.next(); port && !port.done; port = inputs.next()) {
                port.value.onmidimessage = onMIDIMessage;
            }

            midiAccess.onstatechange = onAccessStateChange;
        },

        /**
         * MIDIAccess object statechange handler.
         * If the change is the addition of a new port, create a port module.
         * This handles MIDI devices that are connected after the app initialisation.
         * Disconnected or reconnected ports are handled by the port modules.
         * 
         * If this is
         * @param {Object} e MIDIConnectionEvent object.
         */
        onAccessStateChange = function(e) {

            // start listening to the new port
            e.port.onmidimessage = onMIDIMessage;

            store.dispatch(store.getActions().midiAccessChange(e.port));
        },

        /**
         * Listen to enabled MIDI input ports.
         */
        updateMIDISyncListeners = function(ports) {
            syncListeners = [];
            ports.allIds.forEach(id => {
                const port = ports.byId[id];
                if (port.syncEnabled) {
                    syncListeners.push(port.id);
                }
            });
        },

        /**
         * Listen to enabled MIDI input ports.
         */
        updateMIDIRemoteListeners = function(ports) {
            remoteListeners = [];
            ports.allIds.forEach(id => {
                const port = ports.byId[id];
                if (port.remoteEnabled) {
                    remoteListeners.push(port.id);
                }
            });
        },

        /**
         * Handler for all incoming MIDI messages.
         * @param {Object} e MIDIMessageEvent.
         */
        onMIDIMessage = function(e) {
            // console.log(e.data[0] & 0xf0, e.data[0] & 0x0f, e.target.id, e.data[0], e.data[1], e.data[2]);
            switch (e.data[0] & 0xf0) {
                case 240:
                    onSystemRealtimeMessage(e);
                    break;
                case 176: // CC
                    onControlChangeMessage(e);
                    break;
                case 144: // note on
                case 128: // note off
                    // onNoteMessage(e);
                    break;
            }
        },

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
        onSystemRealtimeMessage = function(e) {
            if (syncListeners.indexOf(e.target.id) > -1) {
                switch (e.data[0]) {
                    case 248: // clock
                        // not implemented
                        break;
                    case 250: // start
                        store.dispatch(store.getActions().setTransport('play'));
                        break;
                    case 251: // continue
                        store.dispatch(store.getActions().setTransport('play'));
                        break;
                    case 252: // stop
                        store.dispatch(store.getActions().setTransport('pause'));
                        break;
                }
            }
        },

        /**
         * MIDI Continuous Control message handler.
         * @param {Object} e MIDIMessageEvent.
         */
        onControlChangeMessage = function(e) {
            if (remoteListeners.indexOf(e.target.id) > -1) {
                store.dispatch(store.getActions().receiveMIDIControlChange(e.data));
            }
        };

    that = specs.that;

    init();

    that.connect = connect;
    return that;
}

export function getMIDIPortByID(id) {
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