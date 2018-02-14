import createRemoteGroupView from './remote_group';

/**
 * Overview list of all assigned MIDI controller assignments.
 */
export default function createRemoteView(specs, my) {
    var that,
        store = specs.store,
        appView = specs.appView,
        // midiRemote = specs.midiRemote,
        rootEl = document.querySelector('.remote'),
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

            // processors.forEach(processor => {
            //     let exists = false;
            //     for (let i = 0, n = groupViews.length; i < n; i++) {
            //         if (groupViews.getID() === processor.id) {
            //             exists = true;
            //             break;
            //         }
            //     }
            //     if (!exists) {
            //         groupViews.push(createRemoteGroupView({
            //             id: processor.id,
            //             parentEl: listEl
            //         }));
            //     }
            // });

            // var remoteGroupView = ns.createRemoteGroupView({
            //     processor: processor,
            //     parentEl: listEl
            // });
            // groupViews.push(remoteGroupView);
            // appView.renderLayout();
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
                    appView.renderLayout();
                    return false;
                }
            }
        },
        
        /**
         * Add a parameter that is assigned.
         * @param  {Object} param Processor parameter.
         */
        // addParameter = function(param) {
        //     var n = groupViews.length;
        //     while (--n >= 0) {
        //         if (groupViews[n].hasParameter(param)) {
        //             groupViews[n].addParameter(param, midiRemote.unassingParameter);
        //             appView.renderLayout();
        //             return;
        //         }
        //     }
        // },
        
        /**
         * Remove a parameter that isn't assigned anymore.
         * @param  {Object} param Processor parameter.
         */
        // removeParameter = function(param) {
        //     var n = groupViews.length;
        //     while (--n >= 0) {
        //         if (groupViews[n].hasParameter(param)) {
        //             groupViews[n].removeParameter(param);
        //             appView.renderLayout();
        //             return;
        //         }
        //     }
        // };
    
    that = specs.that || {};

    init();
    
    that.createRemoteGroup = createRemoteGroup;
    that.deleteRemoteGroup = deleteRemoteGroup;
    // that.addParameter = addParameter;
    // that.removeParameter = removeParameter;
    return that;
}
