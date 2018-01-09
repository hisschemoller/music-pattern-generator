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

                    case store.actions.SET_PREFERENCES:
                        return Object.assign({}, state, {
                            preferences: {
                                isDarkTheme: action.data.isDarkTheme || false
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
