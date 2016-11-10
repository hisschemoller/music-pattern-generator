/**
 * Handles MIDI, interfaces with the WebMIDI library.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createMidi(specs) {
        var that,
            selectedOutput,
            
            /**
             * Retrieve access to the MIDI devices.
             */
            enable = function() {
                WebMidi.enable(function(err) {
                    if (err) {
                        console.log('WebMidi could not be enabled.', err);
                    } else {
                        console.log('WebMidi enabled');
                        WH.pubSub.fire('midi.inputs', WebMidi.inputs);
                        WH.pubSub.fire('midi.outputs', WebMidi.outputs);
                    }
                });
            },
            
            /**
             * Select an output.
             * @param {String} id ID of the output.
             */
            selectOutputByID = function(id) {
                selectedOutput = WebMidi.getOutputById(id);
                WH.pubSub.fire('midi.output', selectedOutput);
            };
        
        that = specs.that;
        
        that.enable = enable;
        that.selectOutputByID = selectOutputByID;
        return that;
    }

    ns.createMidi = createMidi;

})(WH);
