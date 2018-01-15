
export default function createReducers(specs = {}, my = {}) {

    const initialState = {
            bpm: 120,
            network: {
                processors: []
            },
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
                    const processor = {};
                    // array index depends on processor type
                    switch (action.data.type) {
                        case 'input':
                            processors.unshift(processor);
                            numInputProcessors++;
                            break;
                        case 'output':
                            processors.push(processor);
                            break;
                        default:
                            processors.splice(numInputProcessors, 0, processor);
                    }
                    return newState;
                
                default:
                    return state;
            }
        };
    
    return {
        reduce: reduce
    }
}
