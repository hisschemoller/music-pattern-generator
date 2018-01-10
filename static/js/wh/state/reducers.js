window.WH = window.WH || {};

(function (WH) {
    function createReducers(specs = {}, my = {}) {

        const store = specs.store,
            
            initialState = {
                bpm: 120,
                network: {},
                preferences: {
                    isDarkTheme: false
                },
                remote: {}
            },
            
            reduce = function(state = initialState, action = {}) {
                switch(action.type) {

                    case store.getActions().SET_PREFERENCES:
                        return Object.assign({}, state, {
                            preferences: {
                                isDarkTheme: action.data.isDarkTheme || false
                            }
                        });

                    case store.getActions().SET_PROJECT:
                        return Object.assign({}, state, {
                            bpm: action.data.bpm || initialState.bpm,
                            network: action.data.network || initialState.network,
                            remote: action.data.remote || initialState.remote
                        });

                    case store.getActions().SET_THEME:
                        return Object.assign({}, state, {
                            preferences: {
                                isDarkTheme: action.data || false
                            }
                        });
                    
                    default:
                        return state;
                }
            };
        
        return {
            reduce: reduce
        }
    }

    WH.createReducers = createReducers;

})(WH);
