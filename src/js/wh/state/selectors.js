let processors = {};
let MIDIPorts = {};
let remoteControlledParameters = {};

function updateProcessors(state) {
    processors = {};
    state.processors.allIds.forEach(id => {
        processors[id] = state.processors.byId[id];
    });
}

function updateMIDIPorts(state) {
    MIDIPorts = {};
    state.ports.forEach(port => {
        MIDIPorts[port.id] = port;
    });
}

function updateRemoteControlledParameters(state) {
    state.processors.allIds.forEach(id => {
        state.processors.byId[id].parameters.forEach(parameter => {
            if (parameter.remoteChannel && parameter.remoteCC) {
                remoteControlledParameters[`${parameter.remoteChannel}-${parameter.remoteCC}`]
            }
        });
    });
}

export function memoize(state, action = {}, actions) {
    switch(action.type) {
        case actions.CREATE_PROCESSOR:
        case actions.DELETE_PROCESSOR:
        case actions.ADD_PROCESSOR:
            updateProcessors(state);
            break;
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

export const getRemoteControlledParameters = (processorID, parameterKey) => remoteControlledParameters[processorID][parameterKey];