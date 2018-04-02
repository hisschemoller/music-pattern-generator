import createRemoteItemView from './remote_item';

/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 */
export default function createRemoteGroupView(specs, my) {
    var that,
        store = specs.store,
        processorID = specs.processorID,
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

            const state = store.getState();
            setName(state.processors.byId[processorID].params.byId.name.value);
            updateViews(state);

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

        /**
         * Update list to contain all assignments.
         */
        updateViews = function(state) {
            state.processors.byId[processorID].params.allIds.forEach(paramKey => {
                
                // search assignment for this parameter
                let assignment;
                state.assignments.allIds.forEach(assignID => {
                    const assign = state.assignments.byId[assignID];
                    if (assign.processorID === processorID && assign.paramKey === paramKey) {
                        assignment = assign;
                    }
                });

                // create or delete the parameter's view
                const view = views.byId[paramKey];
                if (assignment && !view) {
                    const param = state.processors.byId[processorID].params.byId[paramKey];
                    addView(paramKey, param.label, assignment.remoteChannel, assignment.remoteCC);
                } else if (!assignment && view) {
                    removeView(paramKey);
                }
            });

            // show group if there are assignments
            el.dataset.hasAssignments = (views.allIds.length > 0);
        },

        addView = function(paramKey, paramLabel, remoteChannel, remoteCC) {
            views.byId[paramKey] = createRemoteItemView({
                store,
                paramKey,
                paramLabel,
                processorID,
                remoteChannel,
                remoteCC,
                parentEl: listEl
            });
            views.allIds.push(paramKey);
        },

        removeView = function(paramKey) {
            views.byId[paramKey].terminate();
            delete views.byId[paramKey];
            views.allIds.splice(views.allIds.indexOf(paramKey), 1);
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
