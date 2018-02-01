let processors = {};
let MIDIPorts = {};

function updateProcessors(state) {
    processors = {};
    state.processors.forEach(processor => {
        processors[processor.id] = processor;
    })
}

function updateMIDIPorts(state) {
    MIDIPorts = {};
    state.ports.forEach(port => {
        MIDIPorts[port.id] = port;
    });
}

export function memoize(state, action = {}, actions) {
    switch(action.type) {
        case actions.CREATE_PROCESSOR:
        case actions.DELETE_PROCESSOR:
            updateProcessors(state);
            break;
        // case actions.ADD_MIDI_PORT:
        // case actions.REMOVE_MIDI_PORT:
        case actions.MIDI_PORT_CHANGE:
        case actions.TOGGLE_PORT_SYNC:
        case actions.TOGGLE_PORT_REMOTE:
        case actions.TOGGLE_MIDI_PREFERENCE:
            updateMIDIPorts(state);
            break;
    }
}

/**
 * Memoised selector to access processors by id as object key.
 * Recreates the memoised data each time a processor is created or deleted.
 */
export const getProcessorByID = id => processors[id];

export const getMIDIPortByID = id => MIDIPorts[id];