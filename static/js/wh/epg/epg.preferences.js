/**
 * Handles MIDI, interfaces with the WebMIDI library.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createEPGPreferences(specs) {
        var that,
            midi = specs.midi,
            inputs = {
                midiout: {
                    type: 'select',
                    select: document.getElementById('outputs-select')
                }
            },
            
            init = function() {
                inputs.midiout.select.addEventListener('change', function(e) {
                    midi.selectOutputByID(e.target.value);
                });
                WH.pubSub.on('midi.outputs', setMidiOutputs);
                WH.pubSub.on('midi.output', setSelectedMidiOutput);
            },
            
            /**
             * Set the MIDI outputs.
             * @param {Array} outputs WebMidi.outputs
             */
            setMidiOutputs = function(outputs) {
                var output, optionEl, 
                    selectEl = inputs.midiout.select,
                    n = outputs.length;
                for (var i = 0; i < n; i++) {
                    output = outputs[i];
                    optionEl = document.createElement('option');
                    optionEl.text = output.name;
                    optionEl.value = output.id;
                    selectEl.add(optionEl);
                }
            },
            
            /**
             * Show the selected output in the dropdown.
             * @param {String} output WebMidi output ID.
             */
            setSelectedMidiOutput = function(id) {
                inputs.midiout.select.value = id;
            };
        
        that = specs.that;
        
        init();
    
        return that;
    }

    ns.createEPGPreferences = createEPGPreferences;

})(WH);
