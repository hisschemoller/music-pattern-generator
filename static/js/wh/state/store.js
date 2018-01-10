/**
 * 
 */
window.WH = window.WH || {};

(function (WH) {
    function createStore(specs = {}, my = {}) {
        const STATE_CHANGE = 'STATE_CHANGE';

        let that,
            actions = specs.actions,
            reducers = specs.reducers,
            currentState = {},
            
            dispatch = (action) => {
                currentState = reducers.reduce(currentState, action);
                document.dispatchEvent(new CustomEvent(STATE_CHANGE, { detail: {
                    state: currentState,
                    action: action,
                    actions: actions
                }}));
            },
            
            getActions = () => {
                return actions;
            },
            
            getState = () => {
                return currentState;
            };

        that = specs.that || {};
        
        that.STATE_CHANGE = STATE_CHANGE;
        that.dispatch = dispatch;
        that.getActions = getActions;
        that.getState = getState;
        return that;
    }

    WH.createStore = createStore;

})(WH);