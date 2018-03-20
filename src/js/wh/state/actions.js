import { createUUID } from '../core/util';
import { getConfig, setConfig } from '../core/config';
import { getAllMIDIPorts } from '../midi/midi';

export default function createActions(specs = {}, my = {}) {
    const RESCAN_TYPES = 'RESCAN_TYPES',
        CREATE_PROJECT = 'CREATE_PROJECT',
        SET_THEME = 'SET_THEME',
        CREATE_PROCESSOR = 'CREATE_PROCESSOR',
        ADD_PROCESSOR = 'ADD_PROCESSOR',
        DELETE_PROCESSOR = 'DELETE_PROCESSOR',
        SELECT_PROCESSOR = 'SELECT_PROCESSOR',
        ENABLE_PROCESSOR = 'ENABLE_PROCESSOR',
        DRAG_SELECTED_PROCESSOR = 'DRAG_SELECTED_PROCESSOR',
        DRAG_ALL_PROCESSORS = 'DRAG_ALL_PROCESSORS',
        CHANGE_PARAMETER = 'CHANGE_PARAMETER',
        RECREATE_PARAMETER = 'RECREATE_PARAMETER',
        SET_TEMPO = 'SET_TEMPO',
        CREATE_MIDI_PORT = 'CREATE_MIDI_PORT',
        UPDATE_MIDI_PORT = 'UPDATE_MIDI_PORT',
        TOGGLE_PORT_SYNC = 'TOGGLE_PORT_SYNC',
        TOGGLE_PORT_REMOTE = 'TOGGLE_PORT_REMOTE',
        TOGGLE_MIDI_PREFERENCE = 'TOGGLE_MIDI_PREFERENCE',
        CREATE_PORT_NETWORK_RELATION = 'CREATE_PORT_NETWORK_RELATION',
        DELETE_PORT_NETWORK_RELATION = 'DELETE_PORT_NETWORK_RELATION',
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

        ENABLE_PROCESSOR,
        enableProcessor: (id, isEnabled) => {
            return { type: ENABLE_PROCESSOR, id, isEnabled };
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
                    const configPort = (config.ports && config.ports.byId) ? config.ports.byId[midiPort.id] : null;

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

        togglePortNetwork: (portID, isInput, isEnabled) => {
            return (dispatch, getState, getActions) => {

                // update flag
                dispatch(getActions().toggleMIDIPreference(portID, isInput, 'networkEnabled', isEnabled));
                
                // create or remove processor and relation between processor and port
                const state = getState();
                if (state.ports.byId[portID].networkEnabled) {

                    // check if there is a (disabled) processor for this port
                    let processor, processorExists = false;
                    state.portProcessor.allIds.forEach(relationID => {
                        const relation = state.portProcessor.byId[relationID];
                        if (relation.portID === portID) {
                            processor = state.processors.byId[relation.processorID];
                            processorExists = true;
                        }
                    });

                    if (processorExists) {

                        // (disabled) processor already exists, so enable it
                        dispatch(getActions().enableProcessor(processor.id, true));
                    } else {

                        // create a processor for this network enabled port
                        const processorID = `${isInput ? 'input' : 'output'}_${createUUID()}`

                        dispatch(getActions().createPortNetworkRelation(
                            `rel_${createUUID()}`, {
                                processorID: processorID,
                                portID: portID
                            }
                        ));
    
                        dispatch(getActions().createProcessor({ 
                            type: 'output',
                            id: processorID,
                            portID: portID,
                            name: state.ports.byId[portID].name,
                            positionX: window.innerWidth / 2,
                            positionY: window.innerHeight - 100
                        }));
                    }
                    
                } else {

                    // find the processor for this port
                    state.portProcessor.allIds.forEach(relationID => {
                        const relation = state.portProcessor.byId[relationID];
                        if (relation.portID === portID) {
                            const processor = state.processors.byId[relation.processorID];
                            
                            if (getProcessorCanBeDeleted(processor, state)) {

                                // port processor not connected, so can be deleted
                                dispatch(getActions().deleteProcessor(relation.processorID));
                                dispatch(getActions().deletePortNetworkRelation(relationID));
                            } else {

                                // port processor connected, do not delete but set disabled
                                dispatch(getActions().enableProcessor(processor.id, false));
                            }
                        }
                    });
                }
            }
        },

        TOGGLE_PORT_SYNC,
        togglePortSync: (id) => ({ type: TOGGLE_PORT_SYNC, id }),

        TOGGLE_PORT_REMOTE,
        togglePortRemote: (id) => ({ type: TOGGLE_PORT_REMOTE, id }),

        TOGGLE_MIDI_PREFERENCE,
        toggleMIDIPreference: (id, isInput, preferenceName, isEnabled) => ({ type: TOGGLE_MIDI_PREFERENCE, id, isInput, preferenceName, isEnabled }),
        
        CREATE_PORT_NETWORK_RELATION,
        createPortNetworkRelation: (id, data) => ({ type: CREATE_PORT_NETWORK_RELATION, id, data }),

        DELETE_PORT_NETWORK_RELATION,
        deletePortNetworkRelation: (id) => ({ type: DELETE_PORT_NETWORK_RELATION, id }),

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

        ASSIGN_EXTERNAL_CONTROL,
        assignExternalControl: data => ({type: ASSIGN_EXTERNAL_CONTROL, data}),

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
                
                // delete the processors if necessary
                state = getState();
                if (getProcessorShouldBeDeleted(sourceProcessor, state)) {
                    dispatch(getActions().deleteProcessor(sourceProcessor.id));
                }
                if (getProcessorShouldBeDeleted(destinationProcessor, state)) {
                    dispatch(getActions().deleteProcessor(destinationProcessor.id));
                }
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

/**
 * Determine whether an input or output port processor can be deleted,
 * which is the case if the port preference is not network enabled
 * and if it isn't connected to any other processor.
 */
function getProcessorCanBeDeleted(processor, state) {
    let canBeDeleted = true;
    if (processor.type === 'input' || processor.type === 'output') {
        
        // find the port for the processor
        let port;
        state.portProcessor.allIds.forEach(relationID => {
            const relation = state.portProcessor.byId[relationID];
            if (processor.id === relation.processorID) {
                // check if the port is not network enabled
                if (state.ports.byId[relation.portID].networkEnabled === false) {
                    // check if the processor is connected to others
                    state.connections.allIds.forEach(connectionID => {
                        const connection = state.connections.byId[connectionID];
                        if (connection.sourceProcessorID === processor.id || connection.destinationProcessorID === processor.id) {
                            // processor is connected, do not delete
                            canBeDeleted = false;
                        }
                    });
                }
            }
        });
    }
    
    // processors that are not inputs or outputs can always be deleted
    return canBeDeleted;
}

/**
 * Check if a processor can be deleted.
 * @param {Object} processor 
 * @param {Object} state 
 * @return {Boolean} True if the processor may be deleted.
 */
function getProcessorShouldBeDeleted(processor, state) {
    return (processor.type === 'input' || processor.type === 'output') && getProcessorCanBeDeleted(processor, state);
}