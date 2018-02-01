import { createUUID } from '../core/util';
import { getMIDIPortByID } from '../state/selectors';

export default function createActions(specs = {}, my = {}) {
    const SET_PREFERENCES = 'SET_PREFERENCES',
        SET_PROJECT = 'SET_PROJECT',
        SET_THEME = 'SET_THEME',
        CREATE_PROCESSOR = 'CREATE_PROCESSOR',
        ADD_PROCESSOR = 'ADD_PROCESSOR',
        DELETE_PROCESSOR = 'DELETE_PROCESSOR',
        SELECT_PROCESSOR = 'SELECT_PROCESSOR',
        DRAG_SELECTED_PROCESSOR = 'DRAG_SELECTED_PROCESSOR',
        DRAG_ALL_PROCESSORS = 'DRAG_ALL_PROCESSORS',
        CHANGE_PARAMETER = 'CHANGE_PARAMETER',
        RECREATE_PARAMETER = 'RECREATE_PARAMETER',
        SET_TEMPO = 'SET_TEMPO',
        ADD_MIDI_PORT = 'ADD_MIDI_PORT',
        REMOVE_MIDI_PORT = 'REMOVE_MIDI_PORT',
        TOGGLE_PORT_NETWORK = 'TOGGLE_PORT_NETWORK',
        TOGGLE_PORT_SYNC = 'TOGGLE_PORT_SYNC',
        TOGGLE_PORT_REMOTE = 'TOGGLE_PORT_REMOTE',
        TOGGLE_MIDI_PREFERENCE = 'TOGGLE_MIDI_PREFERENCE';
        SET_TRANSPORT = 'SET_TRANSPORT';

    return {
        SET_PREFERENCES: SET_PREFERENCES,
        setPreferences: (data) => {
            return { type: SET_PREFERENCES, data: data };
        },

        SET_PROJECT: SET_PROJECT,
        setProject: (data) => {
            return { type: SET_PROJECT, data: data };
        },

        SET_THEME: SET_THEME,
        setTheme: (value) => {
            return { type: SET_THEME, data: value };
        },

        CREATE_PROCESSOR: CREATE_PROCESSOR,
        createProcessor: (data) => {
            return (dispatch, getState, getActions) => {
                const dataTemplate = require(`json-loader!../processors/${data.type}/config.json`);
                let fullData = JSON.parse(JSON.stringify(dataTemplate));
                const id = `${data.type}_${createUUID()}`;
                fullData = Object.assign(fullData, data);
                fullData.id = id;
                fullData.params.position2d.value = data.position2d;
                fullData.params.name.value = getProcessorDefaultName(getState().processors);
                dispatch(getActions().addProcessor(fullData));
                dispatch(getActions().selectProcessor(id));
            }
        },

        ADD_PROCESSOR: ADD_PROCESSOR,
        addProcessor: (data) => {
            return { type: ADD_PROCESSOR, data: data };
        },

        DELETE_PROCESSOR: DELETE_PROCESSOR,
        deleteProcessor: id => {
            return { type: DELETE_PROCESSOR, id: id };
        },

        SELECT_PROCESSOR: SELECT_PROCESSOR,
        selectProcessor: id => {
            return { type: SELECT_PROCESSOR, id: id };
        },

        DRAG_SELECTED_PROCESSOR: DRAG_SELECTED_PROCESSOR,
        dragSelectedProcessor: (x, y) => {
            return { type: DRAG_SELECTED_PROCESSOR, x: x, y: y };
        },

        DRAG_ALL_PROCESSORS: DRAG_ALL_PROCESSORS,
        dragAllProcessors: (x, y) => {
            return { type: DRAG_ALL_PROCESSORS, x: x, y: y };
        },

        CHANGE_PARAMETER: CHANGE_PARAMETER,
        changeParameter: (processorID, paramKey, paramValue) => {
            return { type: CHANGE_PARAMETER, processorID: processorID, paramKey: paramKey, paramValue: paramValue };
        },

        RECREATE_PARAMETER: RECREATE_PARAMETER,
        recreateParameter: (processorID, paramKey, paramObj) => {
            return { type: RECREATE_PARAMETER, processorID: processorID, paramKey : paramKey, paramObj: paramObj };
        },

        SET_TEMPO: SET_TEMPO,
        setTempo: value => { return { type: SET_TEMPO, value: value } },

        ADD_MIDI_PORT: ADD_MIDI_PORT,
        addMIDIPort: (id, name, isInput) => { return { type: ADD_MIDI_PORT, id: id, name: name, isInput: isInput } },

        REMOVE_MIDI_PORT: REMOVE_MIDI_PORT,
        removeMIDIPort: id => { return { type: REMOVE_MIDI_PORT, id: id } },

        TOGGLE_PORT_NETWORK: TOGGLE_PORT_NETWORK,
        togglePortNetwork: (portID, isInput) => {
            return (dispatch, getState, getActions) => {
                dispatch(getActions().toggleMIDIPreference(portID, isInput, 'networkEnabled'));
                if (getMIDIPortByID(portID).networkEnabled) {
                    dispatch(getActions().createProcessor({ 
                        type: 'output', 
                        portID: portID, 
                        position2d: {
                            x: window.innerWidth / 2,
                            y: window.innerHeight - 100
                        }
                    }));
                } else {
                    getState().processors.forEach(processor => {
                        if (processor.portID && processor.portID === portID) {
                            dispatch(getActions().deleteProcessor(processor.id));
                        }
                    });
                }
            }
        },

        TOGGLE_PORT_SYNC: TOGGLE_PORT_SYNC,
        togglePortSync: (id, isInput) => {
            return (dispatch, getState, getActions) => {
                dispatch(getActions().toggleMIDIPreference(id, isInput, 'syncEnabled'));
                
            }
        },

        TOGGLE_PORT_REMOTE: TOGGLE_PORT_REMOTE,
        togglePortRemote: (id, isInput) => {
            return (dispatch, getState, getActions) => {
                dispatch(getActions().toggleMIDIPreference(id, isInput, 'remoteEnabled'));
                
            }
        },

        TOGGLE_MIDI_PREFERENCE: TOGGLE_MIDI_PREFERENCE,
        toggleMIDIPreference: (id, isInput, preferenceName) => { return { type: TOGGLE_MIDI_PREFERENCE, id: id, isInput: isInput, preferenceName: preferenceName } }

        SET_TRANSPORT: SET_TRANSPORT,
        setTransport: value => { return { type: SET_TRANSPORT, command: value } }
    };
}

/**
 * network
 * - output processor created or activated
 * - output processor canvas view created or enabled
 * 
 * remote
 * - remote object starts listening on activated port
 * 
 * sync
 * - sync object starts listening on activated port
 */
        
/**
 * Set default processor name.
 * @param {Object} processor Processor to name.
 */
function getProcessorDefaultName(processors) {
    let name, number, spaceIndex, 
        highestNumber = 0,
        staticName = 'Processor';
    for (let i = 0, n = processors.length; i < n; i++) {
        name = processors[i].params.name.value;
        if (name && name.indexOf(staticName) == 0) {
            spaceIndex = name.lastIndexOf(' ');
            if (spaceIndex != -1) {
                number = parseInt(name.substr(spaceIndex), 10);
                if (!isNaN(number)) {
                    highestNumber = Math.max(highestNumber, number);
                }
            }
        }
    }
    return `${staticName} ${highestNumber + 1}`;
}