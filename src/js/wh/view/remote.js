import createRemoteGroupView from './remote_group';

/**
 * Overview list of all assigned MIDI controller assignments.
 */
export default function createRemoteView(specs, my) {
    var that,
        store = specs.store,
        listEl = document.querySelector('.remote__list'),
        groupViews = [],

        init = function() {
            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.ADD_PROCESSOR:
                        createRemoteGroup(e.detail.state.processors.byId[e.detail.action.data.id]);
                        break;
                        
                    case e.detail.actions.DELETE_PROCESSOR:
                        // TODO: remote view delete processor
                        break;
                }
            });
        },
        
        /**
         * Create a container view to hold assigned parameter views.
         * @param {Array} processors Processor list.
         */
        createRemoteGroup = function(processor) {
            groupViews.push(createRemoteGroupView({
                store: store,
                id: processor.id,
                name: processor.name,
                parentEl: listEl
            }));
        },
        
        /**
         * Delete a container view to hold assigned parameter views.
         * @param {Object} processor Processor with assignable parameters.
         */
        deleteRemoteGroup = function(processor) {
            var n = groupViews.length;
            while (--n >= 0) {
                if (groupViews[n].hasProcessor(processor)) {
                    groupViews[n].terminate();
                    groupViews.splice(n, 1);
                    return false;
                }
            }
        },
    
    that = specs.that || {};

    init();
    
    return that;
}
