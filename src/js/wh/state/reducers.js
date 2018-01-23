
export default function createReducers() {

    const initialState = {
            bpm: 120,
            processors: [],
            selectedID: null,
            preferences: {
                isDarkTheme: false
            },
            remote: {}
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

                case actions.CREATE_PROCESSOR:
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
                
                case actions.SELECT_PROCESSOR:
                    return Object.assign({}, state, {
                        selectedID: action.id
                    });
                
                case actions.DRAG_SELECTED_PROCESSOR:
                    newState = Object.assign({}, state);
                    newState.processors.forEach(processor => {
                        if (processor.id === newState.selectedID) {
                            processor.params.position2d.value.x += action.x;
                            processor.params.position2d.value.y += action.y;
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
                
                default:
                    return state;
            }
        };
    
    return {
        reduce: reduce
    }
}
