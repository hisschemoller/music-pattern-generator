/**
 * View for a parameter that's linked to a remote MIDI controller.
 * The items are grouped by processor.
 */
export default function createRemoteItemView(specs, my) {
    var that,
        store = specs.store,
        paramKey = specs.paramKey,
        param = specs.param,
        processorID = specs.processorID,
        parentEl = specs.parentEl,
        // unregisterCallback = specs.unregisterCallback,
        el,
        
        initialize = function() {
            // create the DOM element.
            let template = document.querySelector('#template-remote-item');
            let clone = template.content.cloneNode(true);
            el = clone.firstElementChild;
            el.querySelector('.remote__item-label').innerHTML = param.label;
            el.querySelector('.remote__item-channel').innerHTML = param.remoteChannel;
            el.querySelector('.remote__item-control').innerHTML = param.remoteCC;
            parentEl.appendChild(el);
            
            // add DOM event listeners
            el.querySelector('.remote__item-delete').addEventListener('click', onUnregisterClick);
            // set callback on parameter
            // param.addRemoteStateCallback(changeRemoteState);
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            el.querySelector('.remote__item-delete').removeEventListener('click', onUnregisterClick);
            parentEl.removeChild(el);
            param = null;
            parentEl = null;
        },
        
        /**
         * Unassign button click handler.
         * @param  {Object} e Click event object.
         */
        onUnregisterClick = function(e) {
            store.dispatch(store.getActions().unassignExternalControl(processorID, paramKey));
        },
        
        /**
         * State of the parameter in the assignment process changed,
         * the element will show this visually.
         * @param {String} state New state of the parameter.
         * @param {Function} callback Not used here.
         */
        changeRemoteState = function(state, callback) {
            switch (state) {
                case 'assigned':
                    // TODO: normale tekst
                    break;
                case 'inactive':
                    // TODO: tekst grijs of zoiets
                    break;
            }
        },
        
        /**
         * @return {String} Parameter key.
         */
        getKey = function() {
            return paramKey;
        };
        
    that = specs.that || {};
    
    initialize();
    
    that.terminate = terminate;
    that.getKey = getKey;
    return that;
}
