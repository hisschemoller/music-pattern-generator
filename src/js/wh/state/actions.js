import { createUUID } from '../core/util';
import { getMIDIPortByID } from '../state/selectors';

export default function createActions(specs = {}, my = {}) {
    const SET_PREFERENCES = 'SET_PREFERENCES',
        NEW_PROJECT = 'NEW_PROJECT',
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
        // ADD_MIDI_PORT = 'ADD_MIDI_PORT',
        // REMOVE_MIDI_PORT = 'REMOVE_MIDI_PORT',
        MIDI_PORT_CHANGE = 'MIDI_PORT_CHANGE',
        TOGGLE_PORT_NETWORK = 'TOGGLE_PORT_NETWORK',
        TOGGLE_PORT_SYNC = 'TOGGLE_PORT_SYNC',
        TOGGLE_PORT_REMOTE = 'TOGGLE_PORT_REMOTE',
        TOGGLE_MIDI_PREFERENCE = 'TOGGLE_MIDI_PREFERENCE',
        TOGGLE_MIDI_LEARN_MODE = 'TOGGLE_MIDI_LEARN_MODE',
        TOGGLE_MIDI_LEARN_TARGET = 'TOGGLE_MIDI_LEARN_TARGET',
        SET_TRANSPORT = 'SET_TRANSPORT',
        RECEIVE_MIDI_CC = 'RECEIVE_MIDI_CC';

    return {
        SET_PREFERENCES: SET_PREFERENCES,
        setPreferences: (data) => {
            return { type: SET_PREFERENCES, data: data };
        },

        importProject: (file) => {
            return (dispatch, getState, getActions) => {
                let fileReader = new FileReader();
                // closure to capture the file information
                fileReader.onload = (function(f) {
                    return function(e) {
                        let isJSON = true
                        try {
                            const data = JSON.parse(e.target.result);
                            if (data) {
                                dispatch(getActions().setProject(data));
                            }
                        } catch(errorMessage) {
                            console.log(errorMessage);
                            isJSON = false;
                        }
                        if (!isJSON) {
                            // try if it's a legacy xml file
                            const legacyData = my.convertLegacyFile(e.target.result);
                            if (legacyData) {
                                dispatch(getActions().setProject(legacyData));
                            }
                        }
                    };
                })(file);
                fileReader.readAsText(file);
            }
        },

        exportProject: () => {
            return (dispatch, getState, getActions) => {
                let jsonString = JSON.stringify(getState()),
                blob = new Blob([jsonString], {type: 'application/json'}),
                a = document.createElement('a');
                a.download = 'epg.json';
                a.href = URL.createObjectURL(blob);
                a.click();
            }
        },

        NEW_PROJECT: NEW_PROJECT,
        newProject: (data) => {
            return { type: NEW_PROJECT };
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

        // ADD_MIDI_PORT: ADD_MIDI_PORT,
        // addMIDIPort: (id, name, isInput) => { return { type: ADD_MIDI_PORT, id: id, name: name, isInput: isInput } },

        // REMOVE_MIDI_PORT: REMOVE_MIDI_PORT,
        // removeMIDIPort: id => { return { type: REMOVE_MIDI_PORT, id: id } },

        MIDI_PORT_CHANGE: MIDI_PORT_CHANGE,
        midiPortChange: data => ({ type: MIDI_PORT_CHANGE, data: data }),
        // midiPortChange: (data) => {
        //     return (dispatch, getState, getActions) => {
        //         let port = getMIDIPortByID(data.id);
        //         if (port) {

        //         } else {

        //         }
        //         console.log(data);
        //     }
        // },

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
        togglePortSync: (id, isInput) => ({ type: TOGGLE_PORT_SYNC, id: id, isInput: isInput }),

        TOGGLE_PORT_REMOTE: TOGGLE_PORT_REMOTE,
        togglePortRemote: (id, isInput) => ({ type: TOGGLE_PORT_REMOTE, id: id, isInput: isInput }),
        // togglePortRemote: (id, isInput) => {
        //     return (dispatch, getState, getActions) => {
        //         dispatch(getActions().toggleMIDIPreference(id, isInput, 'remoteEnabled'));
                
        //     }
        // },

        TOGGLE_MIDI_PREFERENCE: TOGGLE_MIDI_PREFERENCE,
        toggleMIDIPreference: (id, isInput, preferenceName) => ({ type: TOGGLE_MIDI_PREFERENCE, id: id, isInput: isInput, preferenceName: preferenceName }),

        TOGGLE_MIDI_LEARN_MODE: TOGGLE_MIDI_LEARN_MODE,
        toggleMIDILearnMode: () => ({ type: TOGGLE_MIDI_LEARN_MODE }),

        TOGGLE_MIDI_LEARN_TARGET: TOGGLE_MIDI_LEARN_TARGET,
        toggleMIDILearnTarget: (processorID, parameterKey) => ({ type: TOGGLE_MIDI_LEARN_TARGET, processorID: processorID, parameterKey: parameterKey }),

        SET_TRANSPORT: SET_TRANSPORT,
        setTransport: value => ({ type: SET_TRANSPORT, command: value }),

        RECEIVE_MIDI_CC: RECEIVE_MIDI_CC,
        receiveMIDIControlChange: data => ({type: RECEIVE_MIDI_CC, data: data})
    };
}

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