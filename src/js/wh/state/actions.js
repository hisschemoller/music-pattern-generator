import { createUUID } from '../core/util';
import { getConfig, setConfig } from '../core/config';
import { getAllMIDIPorts } from '../midi/midi';
import { getAssignedParamsByMIDIData } from './selectors';
import orderProcessors from '../midi/network_ordering';

export default function createActions(specs = {}, my = {}) {
    const RESCAN_TYPES = 'RESCAN_TYPES',
        CREATE_PROJECT = 'CREATE_PROJECT',
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
        CREATE_MIDI_PORT = 'CREATE_MIDI_PORT',
        UPDATE_MIDI_PORT = 'UPDATE_MIDI_PORT',
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

        newProject: () => {
            return (dispatch, getState, getActions) => {

                // create an empty initial state
                dispatch(getActions().createProject());

                // add the existing MIDI ports
                const existingMIDIPorts = getAllMIDIPorts();
                existingMIDIPorts.forEach(port => {
                    dispatch(getActions().midiAccessChange(port));
                });

                // recreate the state with the existing ports
                dispatch(getActions().createProject(getState()));
            }
        },

        setProject: (data) => {
            return (dispatch, getState, getActions) => {

                // create an empty initial state
                dispatch(getActions().createProject());

                // add the existing MIDI ports
                const existingMIDIPorts = getAllMIDIPorts();
                existingMIDIPorts.forEach(port => {
                    dispatch(getActions().midiAccessChange(port));
                });

                // copy the port settings of existing ports
                const existingPorts = { ...getState().ports }

                // copy the port settings defined in the project
                const projectPorts = { ...data.ports };

                // clear the project's port settings
                data.ports.allIds = [];
                data.ports.byId = {};

                // add all existing ports to the project data
                existingPorts.allIds.forEach(existingPortID => {
                    data.ports.allIds.push(existingPortID);
                    data.ports.byId[existingPortID] = existingPorts.byId[existingPortID];
                });

                // set the existing ports to the project's settings,
                // and create ports that do not exist
                projectPorts.allIds.forEach(projectPortID => {
                    const projectPort = projectPorts.byId[projectPortID];
                    let portExists = false;
                    existingPorts.allIds.forEach(existingPortID => {
                        if (existingPortID === projectPortID) {
                            
                            portExists = true;

                            // project port's settings exists, update the settings
                            const existingPort = existingPorts.byId[existingPortID];
                            existingPort.syncEnabled = projectPort.syncEnabled;
                            existingPort.remoteEnabled = projectPort.remoteEnabled;
                            existingPort.networkEnabled = projectPort.networkEnabled;
                        }
                    });

                    // port settings object doesn't exist, so create it, but disabled
                    if (!portExists) {
                        data.ports.allIds.push(projectPortID);
                        data.ports.byId[projectPortID] = {
                            id: projectPortID,
                            type: projectPort.type,
                            name: projectPort.name,
                            connection: 'closed', // closed | open | pending
                            state: 'disconnected', // disconnected | connected
                            syncEnabled: projectPort.syncEnabled,
                            remoteEnabled: projectPort.remoteEnabled,
                            networkEnabled: projectPort.networkEnabled
                        }
                    }
                });

                // order the processors according to their connection (fix faulty data)
                orderProcessors(data);

                // create the project with the merged ports
                dispatch(getActions().createProject(data));
            }
        },

        CREATE_PROJECT,
        createProject: (data) => {
            return { type: CREATE_PROJECT, data };
        },

        SET_THEME,
        setTheme: (themeName) => {
            return { type: SET_THEME, themeName };
        },

        CREATE_PROCESSOR,
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

        ADD_PROCESSOR,
        addProcessor: (data) => {
            return { type: ADD_PROCESSOR, data };
        },

        DELETE_PROCESSOR,
        deleteProcessor: id => {
            return { type: DELETE_PROCESSOR, id };
        },

        SELECT_PROCESSOR,
        selectProcessor: id => {
            return { type: SELECT_PROCESSOR, id };
        },

        DRAG_SELECTED_PROCESSOR,
        dragSelectedProcessor: (x, y) => {
            return { type: DRAG_SELECTED_PROCESSOR, x, y };
        },

        DRAG_ALL_PROCESSORS,
        dragAllProcessors: (x, y) => {
            return { type: DRAG_ALL_PROCESSORS, x, y };
        },

        CHANGE_PARAMETER,
        changeParameter: (processorID, paramKey, paramValue) => {
            return { type: CHANGE_PARAMETER, processorID, paramKey, paramValue };
        },

        RECREATE_PARAMETER,
        recreateParameter: (processorID, paramKey, paramObj) => {
            return { type: RECREATE_PARAMETER, processorID, paramKey, paramObj };
        },

        SET_TEMPO,
        setTempo: value => { return { type: SET_TEMPO, value } },

        CREATE_MIDI_PORT,
        createMIDIPort: (portID, data) => { return { type: CREATE_MIDI_PORT, portID, data } },

        UPDATE_MIDI_PORT,
        updateMIDIPort: (portID, data) => { return { type: UPDATE_MIDI_PORT, portID, data } },

        midiAccessChange: midiPort => {
            return (dispatch, getState, getActions) => {

                // check if the port already exists
                const state = getState();
                const portExists = state.ports.allIds.indexOf(midiPort.id) > -1;

                // create port or update existing
                if (portExists) {

                    // update existing port
                    dispatch(getActions().updateMIDIPort(midiPort.id, {
                        connection: midiPort.connection,
                        state: midiPort.state
                    }));
                } else {
                    
                    // restore settings from config
                    const config = getConfig();
                    let configPort = (config.ports && config.ports.byId) ? config.ports.byId[midiPort.id] : null;

                    if (!configPort && config.ports && config.ports.allIds) {
                        for (let i = config.ports.allIds.length - 1; i >= 0; i--) {
                            const port = config.ports.byId[config.ports.allIds[i]];
                            if (port.name === midiPort.name && port.type === midiPort.type) {
                                configPort = port;
                                break;
                            }
                        }
                    }

                    // create port
                    dispatch(getActions().createMIDIPort(midiPort.id, {
                        id: midiPort.id,
                        type: midiPort.type,
                        name: midiPort.name,
                        connection: midiPort.connection,
                        state: midiPort.state,
                        networkEnabled: configPort ? configPort.networkEnabled : false,
                        syncEnabled: configPort ? configPort.syncEnabled : false,
                        remoteEnabled: configPort ? configPort.remoteEnabled : false
                    }));
                }

                // store the changes in configuration
                setConfig(getState());
            };
        },

        TOGGLE_MIDI_PREFERENCE,
        toggleMIDIPreference: (id, preferenceName, isEnabled) => ({ type: TOGGLE_MIDI_PREFERENCE, id, preferenceName, isEnabled }),
        
        TOGGLE_MIDI_LEARN_MODE,
        toggleMIDILearnMode: () => ({ type: TOGGLE_MIDI_LEARN_MODE }),

        TOGGLE_MIDI_LEARN_TARGET,
        toggleMIDILearnTarget: (processorID, parameterKey) => ({ type: TOGGLE_MIDI_LEARN_TARGET, processorID, parameterKey }),

        SET_TRANSPORT,
        setTransport: command => ({ type: SET_TRANSPORT, command }),

        RECEIVE_MIDI_CC,
        receiveMIDIControlChange: (data) => {
            return (dispatch, getState, getActions) => {
                const state = getState();
                const remoteChannel = (data[0] & 0xf) + 1;
                const remoteCC = data[1];

                if (state.learnModeActive) {
                    dispatch(getActions().unassignExternalControl(state.learnTargetProcessorID, state.learnTargetParameterKey));
                    dispatch(getActions().assignExternalControl(`assign_${createUUID()}`, state.learnTargetProcessorID, state.learnTargetParameterKey, remoteChannel, remoteCC));
                } else {
                    state.assignments.allIds.forEach(assignID => {
                        const assignment = state.assignments.byId[assignID];
                        if (assignment.remoteChannel === remoteChannel && assignment.remoteCC === remoteCC) {
                            const param = state.processors.byId[assignment.processorID].params.byId[assignment.paramKey];
                            const paramValue = midiControlToParameterValue(param, data[2]);
                            dispatch(getActions().changeParameter(assignment.processorID, assignment.paramKey, paramValue));
                        }
                    });
                }
            }
        },

        ASSIGN_EXTERNAL_CONTROL,
        assignExternalControl: (assignID, processorID, paramKey, remoteChannel, remoteCC) => ({type: ASSIGN_EXTERNAL_CONTROL, assignID, processorID, paramKey, remoteChannel, remoteCC}),

        UNASSIGN_EXTERNAL_CONTROL,
        unassignExternalControl: (processorID, paramKey) => ({type: UNASSIGN_EXTERNAL_CONTROL, processorID, paramKey}),
        
        TOGGLE_PANEL,
        togglePanel: panelName => ({type: TOGGLE_PANEL, panelName}),

        TOGGLE_CONNECT_MODE,
        toggleConnectMode: () => ({ type: TOGGLE_CONNECT_MODE }),

        CONNECT_PROCESSORS,
        connectProcessors: payload => ({ type: CONNECT_PROCESSORS, payload, id: `conn_${createUUID()}` }),

        DISCONNECT_PROCESSORS,
        disconnectProcessors2: id => ({ type: DISCONNECT_PROCESSORS, id }),

        disconnectProcessors: id => {
            return (dispatch, getState, getActions) => {
                let state = getState();
                const connection = state.connections.byId[id];
                const sourceProcessor = state.processors.byId[connection.sourceProcessorID];
                const destinationProcessor = state.processors.byId[connection.destinationProcessorID];

                // disconnect the processors
                dispatch(getActions().disconnectProcessors2(id));
            }
        },

        RESCAN_TYPES,
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

/**
 * Convert a MIDI control value to a parameter value, depending on the parameter type.
 * @param {Object} param Processor parameter.
 * @param {Number} controllerValue MIDI controller value in the range 0 to 127.
 */
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
 * Provide a default processor name.
 * @param {Object} processor Processor to name.
 * @return {String} Name for a newly created processor.
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
