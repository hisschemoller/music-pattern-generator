window.WH = window.WH || {};

(function (WH) {
    function createReducers(specs = {}, my = {}) {

        const store = specs.store,
            
            initialState = {
                preferences: {
                    isDarkTheme: false
                }
            },
            
            reduce = function(state = initialState, action = {}) {
                switch(action.type) {

                    case store.getActions().SET_PREFERENCES:
                        return Object.assign({}, state, {
                            preferences: {
                                isDarkTheme: action.data.isDarkTheme || false
                            }
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
