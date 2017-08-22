/**
 * Overview list of all assigned MIDI controller assignments.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteView(specs, my) {
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
            
            /**
             * Show or hide the remote list element.
             * @param  {Boolean} isVisible [description]
             */
            toggleVisibility = function(isVisible) {
                appView.toggleRemote(isVisible);
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
                        return;
                    }
                }
            };
        
        that = specs.that || {};
        
        that.createRemoteGroup = createRemoteGroup;
        that.deleteRemoteGroup = deleteRemoteGroup;
        that.toggleVisibility = toggleVisibility;
        that.addParameter = addParameter;
        that.removeParameter = removeParameter;
        return that;
    }

    ns.createRemoteView = createRemoteView;

})(WH);
