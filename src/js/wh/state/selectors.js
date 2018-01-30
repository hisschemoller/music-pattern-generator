let processors = {};

function updateProcessors(state) {
    processors = {};
    state.processors.forEach(processor => {
        processors[processor.id] = processor;
    })
}

export function memoize(state, action = {}, actions) {
    switch(action.type) {
        case actions.CREATE_PROCESSOR:
        case actions.DELETE_PROCESSOR:
            updateProcessors(state);
            break;
    }
}

/**
 * Memoised selector to access processors by id as object key.
 * Recreates the memoised data each time a processor is created or deleted.
 */
export const getProcessorByID = id => processors[id];