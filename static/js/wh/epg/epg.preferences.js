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
                window.addEventListener('beforeunload', onBeforeUnload);
                WH.pubSub.on('midi.outputs', setMidiOutputs);
                WH.pubSub.on('midi.output', setSelectedMidiOutput);
                WH.pubSub.on('set.preferences', setPreferences);
            }, 
            
            /**
             * Save the preferences when the page unloads.
             */
            onBeforeUnload = function(e) {
                var data = {
                    'midiout': inputs.midiout.select.options[inputs.midiout.select.selectedIndex].value
                };
                WH.pubSub.fire('save.preferences', data);
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
            },
            
            /**
             * Set all preferences from a data object.
             */
            setPreferences = function(data) {
                midi.selectOutputByID(data.midiout);
            };
        
        that = specs.that;
        
        init();
    
        return that;
    }

    ns.createEPGPreferences = createEPGPreferences;

})(WH);
