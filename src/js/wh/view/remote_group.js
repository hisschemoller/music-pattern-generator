import createRemoteItemView from './remote_item';

/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 */
export default function createRemoteGroupView(specs, my) {
    var that,
        store = specs.store,
        processorID = specs.processor.id,
        parentEl = specs.parentEl,
        el,
        listEl,
        nameParam,
        views = {
            byId: {},
            allIds: []
        },
        
        initialize = function() {
            // create the DOM element.
            let template = document.querySelector('#template-remote-group');
            let clone = template.content.cloneNode(true);
            el = clone.firstElementChild;
            parentEl.appendChild(el);
            
            listEl = el.querySelector('.remote__group-list');

            setName(specs.processor.params.byId.name.value);
            updateViews(specs.processor);

            document.addEventListener(store.STATE_CHANGE, handleStateChange);
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            document.removeEventListener(store.STATE_CHANGE, handleStateChange);

            views.allIds.forEach(id => {
                views.byId[id].terminate();
            });

            parentEl.removeChild(el);
            views = null;
            parentEl = null;
        },

        handleStateChange = function(e) {
            switch (e.detail.action.type) {
                case e.detail.actions.CHANGE_PARAMETER:
                    if (e.detail.action.processorID === processorID && 
                        e.detail.action.paramKey === 'name') {
                        setName(e.detail.state.processors.byId[processorID].params.byId.name.value);
                    }
                    break;
            }
        },

        updateViews = function(processor) {
            processor.params.allIds.forEach(id => {
                const param = processor.params.byId[id],
                    isAssigned = param.isMidiControllable && param.remoteChannel && param.remoteCC,
                    viewExists = views.byId[id];
                if (isAssigned && !viewExists) {
                    addView(id, param);
                } else if (!isAssigned && viewExists) {
                    removeView(id);
                }
            });
            el.dataset.hasAssignments = (views.allIds.length > 0);
        },

        addView = function(key, param) {
            views.byId[key] = createRemoteItemView({
                store: store,
                paramKey: key,
                param: param,
                processorID: processorID,
                parentEl: listEl
            });
            views.allIds.push(key);
        },

        removeView = function(key) {
            views.byId[key].terminate();
            delete views.byId[key];
            views.allIds.splice(views.allIds.indexOf(key), 1);
        },
        
        /**
         * If a group has no assignments its header is hidden.
         */
        updateGroupVisibility = function() {
            el.dataset.hasAssignments = (itemViews.length > 0);
        },
        
        /**
         * Set the group's header to the processor's name.
         * @param {String} name Processor's name.
         */
        setName = function(name) {
            el.querySelector('.remote__group-header-label').innerHTML = name;
        };
    
    that = specs.that || {};
    
    initialize();
    
    that.terminate = terminate;
    that.updateViews = updateViews;
    return that;
}
