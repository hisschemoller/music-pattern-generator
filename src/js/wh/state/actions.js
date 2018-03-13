import { createUUID } from '../core/util';

export default function createActions(specs = {}, my = {}) {
    const RESCAN_TYPES = 'RESCAN_TYPES',
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
        MIDI_PORT_CHANGE = 'MIDI_PORT_CHANGE',
        TOGGLE_PORT_NETWORK = 'TOGGLE_PORT_NETWORK',
        TOGGLE_PORT_SYNC = 'TOGGLE_PORT_SYNC',
        TOGGLE_PORT_REMOTE = 'TOGGLE_PORT_REMOTE',
        TOGGLE_MIDI_PREFERENCE = 'TOGGLE_MIDI_PREFERENCE',
        TOGGLE_MIDI_LEARN_MODE = 'TOGGLE_MIDI_LEARN_MODE',
        TOGGLE_MIDI_LEARN_TARGET = 'TOGGLE_MIDI_LEARN_TARGET',
        SET_TRANSPORT = 'SET_TRANSPORT',
        RECEIVE_MIDI_CC = 'RECEIVE_MIDI_CC',
        ASSIGN_EXTERNAL_CONTROL = 'ASSIGN_EXTERNAL_CONTROL',
        UNASSIGN_EXTERNAL_CONTROL = 'UNASSIGN_EXTERNAL_CONTROL',
        TOGGLE_PANEL = 'TOGGLE_PANEL',
        TOGGLE_CONNECT_MODE = 'TOGGLE_CONNECT_MODE',
        CONNECT_PROCESSORS = 'CONNECT_PROCESSORS',
        DISCONNECT_PROCESSORS = 'DISCONNECT_PROCESSORS';

    return {
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
            return { type: SET_PROJECT, data };
        },

        SET_THEME: SET_THEME,
        setTheme: (themeName) => {
            return { type: SET_THEME, themeName };
        },

        CREATE_PROCESSOR: CREATE_PROCESSOR,
        createProcessor: (data) => {
            return (dispatch, getState, getActions) => {
                const dataTemplate = require(`json-loader!../processors/${data.type}/config.json`);
                let fullData = JSON.parse(JSON.stringify(dataTemplate));
                const id = data.id || `${data.type}_${createUUID()}`;
                fullData = Object.assign(fullData, data);
                fullData.id = id;
                fullData.positionX = data.positionX;
                fullData.positionY = data.positionY;
                fullData.params.byId.name.value = data.name || getProcessorDefaultName(getState().processors);
                dispatch(getActions().addProcessor(fullData));
                dispatch(getActions().selectProcessor(id));
            }
        },

        ADD_PROCESSOR: ADD_PROCESSOR,
        addProcessor: (data) => {
            return { type: ADD_PROCESSOR, data };
        },

        DELETE_PROCESSOR: DELETE_PROCESSOR,
        deleteProcessor: id => {
            return { type: DELETE_PROCESSOR, id };
        },

        SELECT_PROCESSOR: SELECT_PROCESSOR,
        selectProcessor: id => {
            return { type: SELECT_PROCESSOR, id };
        },

        DRAG_SELECTED_PROCESSOR: DRAG_SELECTED_PROCESSOR,
        dragSelectedProcessor: (x, y) => {
            return { type: DRAG_SELECTED_PROCESSOR, x, y };
        },

        DRAG_ALL_PROCESSORS: DRAG_ALL_PROCESSORS,
        dragAllProcessors: (x, y) => {
            return { type: DRAG_ALL_PROCESSORS, x, y };
        },

        CHANGE_PARAMETER: CHANGE_PARAMETER,
        changeParameter: (processorID, paramKey, paramValue) => {
            return { type: CHANGE_PARAMETER, processorID, paramKey, paramValue };
        },

        RECREATE_PARAMETER: RECREATE_PARAMETER,
        recreateParameter: (processorID, paramKey, paramObj) => {
            return { type: RECREATE_PARAMETER, processorID, paramKey, paramObj };
        },

        SET_TEMPO: SET_TEMPO,
        setTempo: value => { return { type: SET_TEMPO, value } },

        MIDI_PORT_CHANGE: MIDI_PORT_CHANGE,
        midiPortChange: midiPort => ({ type: MIDI_PORT_CHANGE, midiPort }),

        TOGGLE_PORT_NETWORK: TOGGLE_PORT_NETWORK,
        togglePortNetwork: (portID, isInput) => {
            return (dispatch, getState, getActions) => {
                dispatch(getActions().toggleMIDIPreference(portID, isInput, 'networkEnabled'));
                const state = getState();
                if (state.ports.byId[portID].networkEnabled) {
                    dispatch(getActions().createProcessor({ 
                        type: 'output', 
                        portID: portID,
                        name: state.ports.byId[portID].name,
                        positionX: window.innerWidth / 2,
                        positionY: window.innerHeight - 100
                    }));
                } else {
                    state.processors.allIds.forEach(id => {
                        let processor = state.processors.byId[id];
                        if (processor.portID && processor.portID === portID) {
                            dispatch(getActions().deleteProcessor(processor.id));
                        }
                    });
                }
            }
        },

        TOGGLE_PORT_SYNC: TOGGLE_PORT_SYNC,
        togglePortSync: (id, isInput) => ({ type: TOGGLE_PORT_SYNC, id, isInput }),

        TOGGLE_PORT_REMOTE: TOGGLE_PORT_REMOTE,
        togglePortRemote: (id, isInput) => ({ type: TOGGLE_PORT_REMOTE, id, isInput }),

        TOGGLE_MIDI_PREFERENCE: TOGGLE_MIDI_PREFERENCE,
        toggleMIDIPreference: (id, isInput, preferenceName) => ({ type: TOGGLE_MIDI_PREFERENCE, id, isInput, preferenceName }),

        TOGGLE_MIDI_LEARN_MODE: TOGGLE_MIDI_LEARN_MODE,
        toggleMIDILearnMode: () => ({ type: TOGGLE_MIDI_LEARN_MODE }),

        TOGGLE_MIDI_LEARN_TARGET: TOGGLE_MIDI_LEARN_TARGET,
        toggleMIDILearnTarget: (processorID, parameterKey) => ({ type: TOGGLE_MIDI_LEARN_TARGET, processorID, parameterKey }),

        SET_TRANSPORT: SET_TRANSPORT,
        setTransport: command => ({ type: SET_TRANSPORT, command }),

        RECEIVE_MIDI_CC: RECEIVE_MIDI_CC,
        receiveMIDIControlChange: (data) => {
            return (dispatch, getState, getActions) => {
                const state = getState();
                if (state.learnModeActive) {
                    dispatch(getActions().assignExternalControl(data));
                } else {
                    // find all parameters with the channel and conctrol
                    const remoteChannel = (data[0] & 0xf) + 1,
                        remoteCC = data[1];
                    state.processors.allIds.forEach(id => {
                        const processor = state.processors.byId[id];
                        processor.params.allIds.forEach(id => {
                            const param = processor.params.byId[id];
                            if (param.isMidiControllable && 
                                param.remoteChannel === remoteChannel &&
                                param.remoteCC == remoteCC) {
                                let paramValue = midiControlToParameterValue(param, data[2]);
                                dispatch(getActions().changeParameter(processor.id, id, paramValue));
                            }
                        });
                    });
                }
            }
        },

        ASSIGN_EXTERNAL_CONTROL: ASSIGN_EXTERNAL_CONTROL,
        assignExternalControl: data => ({type: ASSIGN_EXTERNAL_CONTROL, data}),

        UNASSIGN_EXTERNAL_CONTROL: UNASSIGN_EXTERNAL_CONTROL,
        unassignExternalControl: (processorID, paramKey) => ({type: UNASSIGN_EXTERNAL_CONTROL, processorID, paramKey}),
        
        TOGGLE_PANEL: TOGGLE_PANEL,
        togglePanel: panelName => ({type: TOGGLE_PANEL, panelName}),

        TOGGLE_CONNECT_MODE: TOGGLE_CONNECT_MODE,
        toggleConnectMode: () => ({ type: TOGGLE_CONNECT_MODE }),

        CONNECT_PROCESSORS: CONNECT_PROCESSORS,
        connectProcessors: payload => ({ type: CONNECT_PROCESSORS, payload, id: `conn_${createUUID()}` }),

        DISCONNECT_PROCESSORS: DISCONNECT_PROCESSORS,
        disconnectProcessors: id => ({ type: DISCONNECT_PROCESSORS, id }),

        RESCAN_TYPES: RESCAN_TYPES,
        rescanTypes: () => {
            const req = require.context('../processors/', true, /\processor.js$/);
            let types = {};
            req.keys().forEach(key => {
                const type = key.substring(2, key.indexOf('/', 2));
                const typeData = require(`json-loader!../processors/${type}/config.json`);
                if (!typeData.excludedFromLibrary) {
                    types[type] = {
                        name: typeData.name
                    };
                }
            });
            return { type: RESCAN_TYPES, types };
        }
    };
}

function midiControlToParameterValue(param, controllerValue) {
    const normalizedValue = controllerValue / 127;
    switch (param.type) {
        case 'integer':
            return Math.round(param.min + (param.max - param.min) * normalizedValue);
        case 'boolean':
            return normalizedValue > .5;
        case 'itemized':
            if (normalizedValue === 1) {
                return param.model[param.model.length - 1].value;
            }
            return param.model[Math.floor(normalizedValue * param.model.length)].value;
        case 'string':
        case 'position':
        default:
            return param.value;
    }
}

/**
 * Set default processor name.
 * @param {Object} processor Processor to name.
 */
function getProcessorDefaultName(processors) {
    let name, number, spaceIndex, 
        highestNumber = 0,
        staticName = 'Processor';
    processors.allIds.forEach(id => {
        name = processors.byId[id].params.byId.name.value;
        if (name && name.indexOf(staticName) == 0) {
            spaceIndex = name.lastIndexOf(' ');
            if (spaceIndex != -1) {
                number = parseInt(name.substr(spaceIndex), 10);
                if (!isNaN(number)) {
                    highestNumber = Math.max(highestNumber, number);
                }
            }
        }
    });
    return `${staticName} ${highestNumber + 1}`;
}
