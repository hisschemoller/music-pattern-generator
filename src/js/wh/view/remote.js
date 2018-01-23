/**
 * Overview list of all assigned MIDI controller assignments.
 */
export default function createRemoteView(specs, my) {
    var that,
        appView = specs.appView,
        midiRemote = specs.midiRemote,
        rootEl = document.querySelector('.remote'),
        listEl = document.querySelector('.remote__list'),
        groupViews = [],
        
        /**
         * Create a container view to hold assigned parameter views.
         * @param {Object} processor Processor with assignable parameters.
         */
        createRemoteGroup = function(processor) {
            var remoteGroupView = ns.createRemoteGroupView({
                processor: processor,
                parentEl: listEl
            });
            groupViews.push(remoteGroupView);
            appView.renderLayout();
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
        addParameter = function(param) {
            var n = groupViews.length;
            while (--n >= 0) {
                if (groupViews[n].hasParameter(param)) {
                    groupViews[n].addParameter(param, midiRemote.unassingParameter);
                    appView.renderLayout();
                    return;
                }
            }
        },
        
        /**
         * Remove a parameter that isn't assigned anymore.
         * @param  {Object} param Processor parameter.
         */
        removeParameter = function(param) {
            var n = groupViews.length;
            while (--n >= 0) {
                if (groupViews[n].hasParameter(param)) {
                    groupViews[n].removeParameter(param);
                    appView.renderLayout();
                    return;
                }
            }
        };
    
    that = specs.that || {};
    
    that.createRemoteGroup = createRemoteGroup;
    that.deleteRemoteGroup = deleteRemoteGroup;
    that.addParameter = addParameter;
    that.removeParameter = removeParameter;
    return that;
}