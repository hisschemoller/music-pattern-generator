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
    state.inputs.forEach(input => {
        MIDIPorts[input.id] = input;
    });
    state.outputs.forEach(output => {
        MIDIPorts[output.id] = output;
    });
}

export function memoize(state, action = {}, actions) {
    switch(action.type) {
        case actions.CREATE_PROCESSOR:
        case actions.DELETE_PROCESSOR:
            updateProcessors(state);
            break;
        case actions.ADD_MIDI_PORT:
        case actions.REMOVE_MIDI_PORT:
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