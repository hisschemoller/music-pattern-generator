export default function createReducers() {

    const initialState = {
            processors: {
                byId: {},
                allIds: []
            },
            connections: {
                byId: {},
                allIds: []
            },
            ports: {
                byId: {},
                allIds: []
            },
            bpm: 120,
            selectedID: null,
            preferences: {
                isDarkTheme: false
            },
            transport: 'stop', // 'play|pause|stop'
            connectModeActive: false,
            learnModeActive: false,
            learnTargetProcessorID: null,
            learnTargetParameterKey: null,
            showHelpPanel: false,
            showPreferencesPanel: false,
            showSettingsPanel: false,
        },
        
        reduce = function(state = initialState, action = {}, actions = {}) {
            let newState;
            switch(action.type) {

                case actions.SET_PREFERENCES:
                    newState = Object.assign({}, state);
                    newState.preferences.isDarkTheme = action.data ? action.data.isDarkTheme : false;
                    return newState;

                case actions.NEW_PROJECT:
                    return { ...initialState };

                case actions.SET_PROJECT:
                    console.log({ ...state, ...action.data });
                    return { ...state, ...action.data };

                case actions.SET_THEME:
                    return Object.assign({}, state, {
                        preferences: {
                            isDarkTheme: action.data || false
                        }
                    });

                case actions.ADD_PROCESSOR:
                    newState = { 
                        ...state,
                        processors: {
                            byId: { 
                                ...state.processors.byId,
                                [action.data.id]: action.data
                            },
                            allIds: [ ...state.processors.allIds ]
                        } };

                    // array index depends on processor type
                    let numInputProcessors = newState.processors.allIds.filter(id => { newState.processors.byId[id].type === 'input' }).length;
                    switch (action.data.type) {
                        case 'input':
                            newState.processors.allIds.unshift(action.data.id);
                            numInputProcessors++;
                            break;
                        case 'output':
                            newState.processors.allIds.push(action.data.id);
                            break;
                        default:
                            newState.processors.allIds.splice(numInputProcessors, 0, action.data.id);
                            newState.showSettingsPanel = true;

                    }
                    return newState;
                
                case actions.DELETE_PROCESSOR:
                    newState = { 
                        ...state,
                        processors: {
                            byId: { ...state.processors.byId },
                            allIds: state.processors.allIds.filter(id => id !== action.id)
                        } };
                    delete newState.processors.byId[action.id];
                    return newState;
                
                case actions.SELECT_PROCESSOR:
                    return Object.assign({}, state, {
                        selectedID: action.id
                    });
                
                case actions.DRAG_SELECTED_PROCESSOR:
                    newState = { 
                        ...state,
                        processors: {
                            byId: { ...state.processors.byId },
                            allIds: [ ...state.processors.allIds ]
                        } };
                    newState.processors.byId[newState.selectedID].positionX = action.x;
                    newState.processors.byId[newState.selectedID].positionY = action.y;
                    return newState;

                case actions.DRAG_ALL_PROCESSORS:
                    newState = { 
                        ...state,
                        processors: {
                            byId: { ...state.processors.byId },
                            allIds: [ ...state.processors.allIds ]
                        } };
                    newState.processors.allIds.forEach(id => {
                        newState.processors.byId[id].positionX += action.x;
                        newState.processors.byId[id].positionY += action.y;
                    });
                    return newState;
                
                case actions.CHANGE_PARAMETER:
                    newState = { 
                        ...state,
                        processors: {
                            byId: { ...state.processors.byId },
                            allIds: [ ...state.processors.allIds ]
                        } };
                    const param = newState.processors.byId[action.processorID].params.byId[action.paramKey];
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
                    return newState;
                
                case actions.RECREATE_PARAMETER:
                    newState = { 
                        ...state,
                        processors: {
                            byId: { ...state.processors.byId },
                            allIds: [ ...state.processors.allIds ]
                        } };
                    newState.processors.byId[action.processorID].params.byId[action.paramKey] = {
                        ...newState.processors.byId[action.processorID].params.byId[action.paramKey],
                        ...action.paramObj
                    };
                    return newState;
                
                case actions.SET_TEMPO:
                    return Object.assign({}, state, { bpm: action.value });
                
                case actions.MIDI_PORT_CHANGE:
                    newState = { 
                        ...state,
                        ports: {
                            byId: { ...state.ports.byId },
                            allIds: [ ...state.ports.allIds ]
                    }};
                    
                    if (state.ports.byId[action.midiPort.id]) {
                        // update existing port
                        newState.ports.byId[action.midiPort.id] = {
                            ...state.ports.byId[action.midiPort.id],
                            connection: action.midiPort.connection,
                            state: action.midiPort.state
                        }
                    } else {
                        // add new port
                        newState.ports.byId[action.midiPort.id] = {
                            id: action.midiPort.id, 
                            type: action.midiPort.type,
                            name: action.midiPort.name,
                            connection: action.midiPort.connection,
                            state: action.midiPort.state,
                            networkEnabled: false,
                            syncEnabled: false,
                            remoteEnabled: false
                        }
                        newState.ports.allIds.push(action.midiPort.id);
                        newState.ports.allIds.sort((a, b) => {
                            if (a.name < b.name) { return -1 }
                            if (a.name > b.name) { return 1 }
                            return 0;
                        });
                    }
                    return newState;
                
                case actions.TOGGLE_PORT_SYNC:
                    return toggleMIDIPreference(state, action.id, 'syncEnabled');
                
                case actions.TOGGLE_PORT_REMOTE:
                    return toggleMIDIPreference(state, action.id, 'remoteEnabled');
                
                case actions.TOGGLE_MIDI_PREFERENCE:
                    return toggleMIDIPreference(state, action.id, action.preferenceName);
                
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
                        newState = { 
                            ...state,
                            processors: {
                                allIds: [ ...state.processors.allIds ],
                                byId: { ...state.processors.byId }
                            } };
                        newState.processors.byId[state.learnTargetProcessorID].params.byId = assignParameter(newState.processors.byId[state.learnTargetProcessorID].params.byId, action, state);
                        return newState;
                    }
                    return state;

                case actions.UNASSIGN_EXTERNAL_CONTROL:
                    if (state.learnModeActive && state.learnTargetProcessorID && state.learnTargetParameterKey) {
                        newState = { 
                            ...state,
                            processors: {
                                allIds: [ ...state.processors.allIds ],
                                byId: { ...state.processors.byId }
                            } };
                        newState.processors.byId[state.learnTargetProcessorID].params.byId = unassignParameter(newState.processors.byId[state.learnTargetProcessorID].params.byId, action, state);
                        return newState;
                    }
                    return state;
                
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
                        connectModeActive: !state.connectModeActive
                    };
                
                case actions.CONNECT_PROCESSORS:
                    // abort if the connection already exists
                    for (let i = 0, n = state.connections.allIds.length; i < n; i++) {
                        const connection = state.connections.byId[state.connections.allIds[i]];
                        if (connection.sourceProcessorID === action.payload.sourceProcessorID &&
                            connection.sourceConnectorID === action.payload.sourceConnectorID &&
                            connection.destinationProcessorID === action.payload.destinationProcessorID &&
                            connection.destinationConnectorID === action.payload.destinationConnectorID) {
                            return state;
                        } 
                    }
                    // add new connection
                    return {
                        ...state,
                        connections: {
                            byId: { ...state.connections.byId, [action.id]: action.payload },
                            allIds: [ ...state.connections.allIds, action.id ]
                        }
                    };
                
                case actions.DISCONNECT_PROCESSORS:
                    return {
                        ...state,
                        connections: deleteFromNormalizedTable(state.connections, action.id)
                    };

                default:
                    return state;
            }
        };
    
    return {
        reduce: reduce
    }
}

// function addToNormalizedTable(stateObj, newItemID, newItem) {
//     const clone = {
//         byId: { ...stateObj.byId, [newItemID]: newItem },
//         allIds: [ ...stateObj.allIds, newItemID ]
//     };
//     return clone;
// }

function deleteFromNormalizedTable(table, id) {
    const clone = {
        byId: { ...table.byId },
        allIds: table.allIds.filter(iid => iid !== id)
    };
    delete clone.byId[id];
    return clone;
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

function toggleMIDIPreference(state, id, preferenceName) {
    const newState = {
        ...state,
        ports: {
            allIds: [ ...state.ports.allIds ],
            byId: { ...state.ports.byId }
        }
    };
    newState.ports.byId[id] = {
        ...newState.ports.byId[id],
        [preferenceName]: !state.ports.byId[id][preferenceName]
    };
    return newState;
}
