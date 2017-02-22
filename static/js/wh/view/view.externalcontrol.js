/**
 * Overview list of all assigned MIDI controller assignments.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createExternalControlView(specs, my) {
        var that,
            midiRemote = specs.midiRemote,
            rootEl = document.querySelector('#externalcontrol'),
            listEl = document.querySelector('.externalcontrol__list'),
            
            toggleVisibility = function(isVisible) {
                rootEl.style.display = isVisible ? 'block' : 'none';
            };
        
        that = specs.that || {};
        
        that.toggleVisibility = toggleVisibility;
        return that;
    }

    ns.createExternalControlView = createExternalControlView;

})(WH);
