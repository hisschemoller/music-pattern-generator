/**
 * Handles MIDI, interfaces with the WebMIDI library.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createMidi(specs) {
        var that,
            
            enable = function() {
                WebMidi.enable(function(err) {
                    if (err) {
                        console.log('WebMidi could not be enabled.', err);
                    } else {
                        console.log('WebMidi enabled!');
                        WH.pubSub.fire('midi.inputs', WebMidi.inputs);
                        WH.pubSub.fire('midi.outputs', WebMidi.outputs);
                    }
                });
            };
        
        that = specs.that;
        
        that.enable = enable;
        return that;
    }

    ns.createMidi = createMidi;

})(WH);
