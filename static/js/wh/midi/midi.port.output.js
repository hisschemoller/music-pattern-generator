/**
 * MIDI output port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortOutput(specs, my) {
        var that,
            
            init = function() {
                
            },
            
            toggleNetwork = function() {
                console.log('toggleNetwork');
            };
        
        that = ns.createMIDIPortBase(specs, my);
        
        init();
        
        that.toggleNetwork = toggleNetwork;
        return that;
    }

    ns.createMIDIPortOutput = createMIDIPortOutput;

})(WH);
