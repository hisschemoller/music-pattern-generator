import { getMIDIPortByID } from '../state/selectors';

export default function createReducers() {

    const initialState = {
            bpm: 120,
            processors: [],
            selectedID: null,
            preferences: {
                isDarkTheme: false
            },
            remote: {},
            transport: 'stop', // 'play|pause|stop'
            // inputs: [],
            // outputs: [],
            ports: [],
            connectModeActive: false,
            learnModeActive: false,
            learnTargetProcessorID: null,
            learnTargetParameterKey: null,
            showHelpPanel: false,
            showPreferencesPanel: false,
            showSettingsPanel: false,
        },
        
        reduce = function(state = initialState, action = {}, actions) {
            let newState;
            switch(action.type) {

                case actions.SET_PREFERENCES:
                    newState = Object.assign({}, state);
                    newState.preferences.isDarkTheme = action.data ? action.data.isDarkTheme : false;
                    return newState;

                case actions.NEW_PROJECT:
                    return { ...initialState };

                case actions.SET_PROJECT:
                    return { ...state, ...action.data };

                case actions.SET_THEME:
                    return Object.assign({}, state, {
                        preferences: {
                            isDarkTheme: action.data || false
                        }
                    });

                case actions.ADD_PROCESSOR:
                    newState = Object.assign({}, state);
                    let numInputProcessors = newState.processors.filter(item => item.type === 'input').length;
                    // array index depends on processor type
                    switch (action.data.type) {
                        case 'input':
                            newState.processors.unshift(action.data);
                            numInputProcessors++;
                            break;
                        case 'output':
                            newState.processors.push(action.data);
                            break;
                        default:
                            newState.processors.splice(numInputProcessors, 0, action.data);
                            newState.showSettingsPanel = true;

                    }
                    return newState;
                
                case actions.DELETE_PROCESSOR:
                    return Object.assign({}, state, {
                        processors: state.processors.filter(processor => processor.id !== action.id)
                    });
                
                case actions.SELECT_PROCESSOR:
                    return Object.assign({}, state, {
                        selectedID: action.id
                    });
                
                case actions.DRAG_SELECTED_PROCESSOR:
                    newState = Object.assign({}, state);
                    newState.processors.forEach(processor => {
                        if (processor.id === newState.selectedID) {
                            processor.params.position2d.value.x = action.x;
                            processor.params.position2d.value.y = action.y;
                        }
                    });
                    return newState;

                case actions.DRAG_ALL_PROCESSORS:
                    newState = Object.assign({}, state);
                    newState.processors.forEach(processor => {
                        processor.params.position2d.value.x += action.x;
                        processor.params.position2d.value.y += action.y;
                    });
                    return newState;
                
                case actions.CHANGE_PARAMETER:
                    newState = Object.assign({}, state);
                    newState.processors.forEach(processor => {
                        if (processor.id === action.processorID) {
                            const param = processor.params[action.paramKey];
                            switch (param.type) {
                                case 'integer':
                                    param.value = Math.max(param.min, Math.min(action.paramValue, param.max));
                                    break;
                                case 'boolean':
                                    param.value = !!action.paramValue;
                                    break;
                                case 'itemized':
                                    param.value = action.paramValue;
                                    break;
                                case 'string':
                                    param.value = action.paramValue;
                                    break;
                            }
                        }
                    });
                    return newState;
                
                case actions.RECREATE_PARAMETER:
                    newState = Object.assign({}, state);
                    newState.processors.forEach(processor => {
                        if (processor.id === action.processorID) {
                            processor.params[action.paramKey] = Object.assign(
                                processor.params[action.paramKey],
                                action.paramObj);
                        }
                    });
                    return newState;
                
                case actions.SET_TEMPO:
                    return Object.assign({}, state, { bpm: action.value });
                
                // case actions.ADD_MIDI_PORT:
                //     newState = Object.assign({}, state);
                //     let portObj = { 
                //         id: action.id, 
                //         name: action.name,
                //         networkEnabled: false,
                //         syncEnabled: false,
                //         remoteEnabled: false
                //     };
                //     if (action.isInput) {
                //         newState.inputs = [ ...state.inputs, portObj ]
                //         newState.inputs.sort((a, b) => {
                //             if (a.name < b.name) { return -1 }
                //             if (a.name > b.name) { return 1 }
                //             return 0;
                //         });
                //     } else {
                //         newState.outputs = [ ...state.outputs, portObj ]
                //         newState.outputs.sort((a, b) => {
                //             if (a.name < b.name) { return -1 }
                //             if (a.name > b.name) { return 1 }
                //             return 0;
                //         });
                //     }
                //     return newState;
                
                // case actions.REMOVE_MIDI_PORT:
                //     newState = Object.assign({}, state);
                //     if (action.isInput) {
                //         newState.inputs = newState.inputs.filter(input => input.id !== action.id);
                //     } else {
                //         newState.outputs = newState.outputs.filter(output => output.id !== action.id);
                //     }
                //     return newState;
                
                case actions.MIDI_PORT_CHANGE:
                    if (getMIDIPortByID(action.data.id)) {
                        newState = Object.assign({}, state, {
                            ports: state.ports.map(port => {
                                if (port.id == action.data.id) {
                                    port.connection = action.data.connection;
                                    port.state = action.data.state;
                                }
                                return port;
                            })
                        });
                    } else {
                        newState = Object.assign({}, state, {
                            ports: [...state.ports, {
                                id: action.data.id, 
                                type: action.data.type,
                                name: action.data.name,
                                connection: action.data.connection,
                                state: action.data.state,
                                networkEnabled: false,
                                syncEnabled: false,
                                remoteEnabled: false
                            }]
                        });
                        newState.ports.sort((a, b) => {
                            if (a.name < b.name) { return -1 }
                            if (a.name > b.name) { return 1 }
                            return 0;
                        });
                    }
                    return newState;
                
                case actions.TOGGLE_PORT_SYNC:
                    return toggleMIDIPreference(state, action.id, action.isInput, 'syncEnabled');
                
                case actions.TOGGLE_PORT_REMOTE:
                    return toggleMIDIPreference(state, action.id, action.isInput, 'remoteEnabled');
                
                case actions.TOGGLE_MIDI_PREFERENCE:
                    return toggleMIDIPreference(state, action.id, action.isInput, action.preferenceName);
                
                case actions.TOGGLE_MIDI_LEARN_MODE:
                    return Object.assign({}, state, { 
                        learnModeActive: !state.learnModeActive });
                
                case actions.TOGGLE_MIDI_LEARN_TARGET:
                    return Object.assign({}, state, { 
                        learnTargetProcessorID: action.processorID, 
                        learnTargetParameterKey: action.parameterKey 
                    });
                
                case actions.SET_TRANSPORT:
                    let value = action.command;
                    if (action.command === 'toggle') {
                        value = state.transport === 'play' ? 'pause' : 'play';
                    }
                    return Object.assign({}, state, { 
                        transport: value
                    });

                case actions.ASSIGN_EXTERNAL_CONTROL:
                    if (state.learnModeActive && state.learnTargetProcessorID && state.learnTargetParameterKey) {
                        return {
                            ...state,
                            processors: state.processors.map(processor => {
                                if (processor.id !== state.learnTargetProcessorID) {
                                    return processor;
                                }
                                return {
                                    ...processor,
                                    parameters: assignParameter(processor.params, action, state)
                                }
                            })
                        }
                    }
                    return state;

                case actions.UNASSIGN_EXTERNAL_CONTROL:
                    return {
                        ...state,
                        processors: state.processors.map(processor => {
                            if (processor.id !== action.processorID) {
                                return processor;
                            }
                            return {
                                ...processor,
                                parameters: unassignParameter(processor.params, action, state)
                            }
                        })
                    };
                
                case actions.TOGGLE_PANEL:
                    return {
                        ...state,
                        showHelpPanel: action.panelName === 'help' ? !state.showHelpPanel : state.showHelpPanel,
                        showPreferencesPanel: action.panelName === 'preferences' ? !state.showPreferencesPanel : state.showPreferencesPanel,
                        showSettingsPanel: action.panelName === 'settings' ? !state.showSettingsPanel : state.showSettingsPanel
                    };
                    return state;
                
                case actions.TOGGLE_CONNECT_MODE:
                    return {
                        ...state,
                        learnModeActive: !state.learnModeActive
                    };

                default:
                    return state;
            }
        };
    
    return {
        reduce: reduce
    }
}

function assignParameter(parameters, action, state) {
    const params = { ...parameters };
    params[state.learnTargetParameterKey].remoteChannel = (action.data[0] & 0xf) + 1;
    params[state.learnTargetParameterKey].remoteCC = action.data[1];
    return params;
}

function unassignParameter(parameters, action, state) {
    const params = { ...parameters };
    params[action.paramKey].remoteChannel = null;
    params[action.paramKey].remoteCC = null;
    return params;
}

function toggleMIDIPreference(state, id, isInput, preferenceName) {
    return {
        ...state,
        ports: state.ports.map(port => {
            if (port.id === id) {
                port[preferenceName] = !port[preferenceName];
            }
            return port;
        })
    };
}