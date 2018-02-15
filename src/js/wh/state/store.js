import { memoize } from './selectors';

export default function createStore(specs = {}, my = {}) {
    const STATE_CHANGE = 'STATE_CHANGE';

    let that = {},
        actions = specs.actions,
        reducers = specs.reducers,
        currentState,
        
        dispatch = (action) => {
            // thunk or not
            if (typeof action === 'function') {
                action(dispatch, getState, getActions);
            } else {
                currentState = reducers.reduce(currentState, action, actions);
                memoize(currentState, action, actions);
                document.dispatchEvent(new CustomEvent(STATE_CHANGE, { detail: {
                    state: currentState,
                    action: action,
                    actions: actions
                }}));
            }
        }, 
        
        getActions = () => {
            return actions;
        },
        
        getState = () => {
            return currentState;
        },
        
        persist = () => {
            return;
            const name = 'persist';
            window.addEventListener('beforeunload', e => {
                localStorage.setItem(name, JSON.stringify(currentState));
            });
            let data = localStorage.getItem(name);
            if (data) {
                dispatch(getActions().setProject(JSON.parse(data)));
            }
        };

    that = specs.that || {};
    
    that.STATE_CHANGE = STATE_CHANGE;
    that.dispatch = dispatch;
    that.getActions = getActions;
    that.getState = getState;
    that.persist = persist;
    return that;
}
