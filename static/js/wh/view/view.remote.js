/**
 * Overview list of all assigned MIDI controller assignments.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteView(specs, my) {
        var that,
            midiRemote = specs.midiRemote,
            rootEl = document.querySelector('#remote'),
            listEl = document.querySelector('.remote__list'),
            groupViews = [],
            
            createRemoteGroup = function(processor) {
                var remoteGroupView = ns.createRemoteGroupView({
                    processor: processor,
                    parentEl: listEl
                });
                groupViews.push(remoteGroupView);
            },
            
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
            
            toggleVisibility = function(isVisible) {
                rootEl.style.display = isVisible ? 'block' : 'none';
            },
            
            addParameter = function(param) {
                var n = groupViews.length;
                while (--n >= 0) {
                    if (groupViews[n].hasParameter(param)) {
                        groupViews[n].addParameter(param, midiRemote.unassingParameter);
                        return;
                    }
                }
            },
            
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
