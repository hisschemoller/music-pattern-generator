/**
 * MIDI input port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortInput(specs, my) {
        var that,
            
            init = function() {
                
            },
            
            toggleSync = function() {
                console.log('toggleSync');
            },
            
            toggleRemote = function() {
                console.log('toggleRemote');
            };
        
        that = ns.createMIDIPortBase(specs, my);
        
        init();
        
        that.toggleSync = toggleSync;
        that.toggleRemote = toggleRemote;
        return that;
    }

    ns.createMIDIPortInput = createMIDIPortInput;

})(WH);
