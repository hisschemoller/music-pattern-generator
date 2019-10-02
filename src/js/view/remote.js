import createRemoteGroupView from './remote_group.js';

/**
 * Overview list of all assigned MIDI controller assignments.
 */
export default function createRemoteView(specs, my) {
    var that,
        store = specs.store,
        listEl = document.querySelector('.remote__list'),
        groupViews = {
            byId: {},
            allIds: []
        },

        init = function() {
            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {

                    case e.detail.actions.CREATE_PROJECT:
                        deleteRemoteGroups();
                        createRemoteGroups(e.detail.state);
                        break;

                    case e.detail.actions.ADD_PROCESSOR:
                        createRemoteGroup(e.detail.state.processors.byId[e.detail.action.data.id]);
                        break;
                        
                    case e.detail.actions.DELETE_PROCESSOR:
                        deleteRemoteGroups(e.detail.state.processors);
                        break;
                    
                    case e.detail.actions.ASSIGN_EXTERNAL_CONTROL:
                        if (e.detail.state.learnTargetProcessorID) {
                            const groupView = groupViews.byId[e.detail.state.learnTargetProcessorID],
                                processor = e.detail.state.processors.byId[e.detail.state.learnTargetProcessorID];
                            if (!groupView) {
                                createRemoteGroups(e.detail.state);
                            } else {
                                groupView.updateViews(e.detail.state);
                            }
                        }
                        break;
                    
                    case e.detail.actions.UNASSIGN_EXTERNAL_CONTROL:
                        const groupView = groupViews.byId[e.detail.action.processorID],
                            processor = e.detail.state.processors.byId[e.detail.state.learnTargetProcessorID];
                            if (groupView && processor) {
                                groupView.updateViews(e.detail.state);
                            }
                        break;
                }
            });
        },

        createRemoteGroups = function(state) {
            state.assignments.allIds.forEach(assignID => {
                const assignment = state.assignments.byId[assignID];
                if (!groupViews.byId[assignment.processorID]) {
                    createRemoteGroup(state.processors.byId[assignment.processorID]);
                }
            });

            // processors.allIds.forEach(id => {
            //     if (!groupViews.byId[id]) {
            //         const processor = processors.byId[id];
            //         let hasAssignment = false;
            //         processor.params.allIds.forEach(id => {
            //             const param = processor.params.byId[id];
            //             if (param.isMidiControllable && param.remoteChannel && param.remoteCC != null) {
            //                 hasAssignment = true;
            //             }
            //         });
            //         if (hasAssignment) {
            //             createRemoteGroup(processor);
            //         }
            //     }
            // });
        },
        
        /**
         * Create a container view to hold assigned parameter views.
         * @param {Array} processors Processor list.
         */
        createRemoteGroup = function(processor) {
            if (!groupViews.byId[processor.id]) {
                groupViews.allIds.push(processor.id);
                groupViews.byId[processor.id] = createRemoteGroupView({
                    store: store,
                    processorID: processor.id,
                    parentEl: listEl
                });
            }
        },
        
        /**
         * Delete a container view to hold assigned parameter views.
         * @param {Object} processor Processor with assignable parameters.
         */
        deleteRemoteGroups = function(processors) {
            let n = groupViews.allIds.length;
            for (let i = groupViews.allIds.length - 1; i >= 0; i--) {
                const id = groupViews.allIds[i];
                if (!processors || !processors.byId || !processors.byId[id]) {
                    groupViews.allIds.splice(i, 1);
                    groupViews.byId[id].terminate();
                    delete groupViews.byId[id];
                }
            }
        },
    
    that = specs.that || {};

    init();
    
    return that;
}
