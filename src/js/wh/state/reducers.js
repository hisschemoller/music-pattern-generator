
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
            inputs: [],
            outputs: []
        },
        
        reduce = function(state = initialState, action = {}, actions) {
            let newState;
            switch(action.type) {

                case actions.SET_PREFERENCES:
                    newState = Object.assign({}, state);
                    newState.preferences.isDarkTheme = action.data ? action.data.isDarkTheme : false;
                    return newState;

                case actions.SET_PROJECT:
                    return Object.assign({}, state, {
                        bpm: action.data.bpm || initialState.bpm,
                        network: action.data.network || initialState.network,
                        remote: action.data.remote || initialState.remote
                    });

                case actions.SET_THEME:
                    return Object.assign({}, state, {
                        preferences: {
                            isDarkTheme: action.data || false
                        }
                    });

                case actions.ADD_PROCESSOR:
                    newState = Object.assign({}, state);
                    const numInputProcessors = newState.processors.filter(item => item.type === 'input').length;
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
                
                case actions.ADD_MIDI_PORT:
                    newState = Object.assign({}, state);
                    let portObj = { 
                        id: action.id, 
                        name: action.name,
                        networkEnabled: false,
                        syncEnabled: false,
                        remoteEnabled: false
                    };
                    if (action.isInput) {
                        newState.inputs = [ ...state.inputs, portObj ]
                        newState.inputs.sort((a, b) => {
                            if (a.name < b.name) { return -1 }
                            if (a.name > b.name) { return 1 }
                            return 0;
                        });
                    } else {
                        newState.outputs = [ ...state.outputs, portObj ]
                        newState.outputs.sort((a, b) => {
                            if (a.name < b.name) { return -1 }
                            if (a.name > b.name) { return 1 }
                            return 0;
                        });
                    }
                    return newState;
                
                case actions.REMOVE_MIDI_PORT:
                    newState = Object.assign({}, state);
                    if (action.isInput) {
                        newState.inputs = newState.inputs.filter(input => input.id !== action.id);
                    } else {
                        newState.outputs = newState.outputs.filter(output => output.id !== action.id);
                    }
                    return newState;
                
                case actions.TOGGLE_MIDI_PREFERENCE:
                    newState = toggleMIDIPreference(state, action.id, action.isInput, action.preferenceName);
                    return newState;
                
                case actions.SET_TRANSPORT:
                    let value = action.command;
                    if (action.command === 'toggle') {
                        value = state.transport === 'play' ? 'pause' : 'play';
                    }
                    return Object.assign({}, state, { 
                        transport: value
                    });

                default:
                    return state;
            }
        };
    
    return {
        reduce: reduce
    }
}

function toggleMIDIPreference(state, id, isInput, preferenceName) {
    const newState = Object.assign({}, state);
    if (isInput) {
        newState.inputs = newState.inputs.map((item, index) => {
            if (item.id === id) {
                item = Object.assign({}, item);
                item[preferenceName] = !item[preferenceName];
            }
            return item;
        });
    } else {
        newState.outputs = newState.outputs.map((item, index) => {
            if (item.id === id) {
                item = Object.assign({}, item);
                item[preferenceName] = !item[preferenceName];
            }
            return item;
        });
    }
    return newState;
}