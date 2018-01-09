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
            previousState = {},
            currentState = {},
            
            dispatch = (action) => {
                previousState = currentState;
                currentState = reducers.reduce(currentState, action);
                document.dispatchEvent(new CustomEvent(STATE_CHANGE, { detail: {
                    previousState: previousState, 
                    currentState: currentState
                }}));
            };

        that = specs.that || {};
        
        that.STATE_CHANGE = STATE_CHANGE;
        that.actions = actions;
        that.dispatch = dispatch;
        return that;
    }

    WH.createStore = createStore;

})(WH);