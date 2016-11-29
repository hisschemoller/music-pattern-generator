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
                },
                midiin: {
                    type: 'select',
                    select: document.getElementById('inputs-select')
                }
            },
            
            init = function() {
                inputs.midiout.select.addEventListener('change', function(e) {
                    midi.selectOutputByID(e.target.value);
                });
                inputs.midiin.select.addEventListener('change', function(e) {
                    midi.selectInputByID(e.target.value);
                });
            },
            
            /**
             * Populate the MIDI inputs dropdown.
             * @param {Array} midiPorts WebMidi.inputs or WebMidi.outputs
             * @param {Boolean} isInputs True if inputs, else outputs.
             */
            setMidiPorts = function(midiPorts, isInputs) {
                var port, optionEl, 
                    selectEl = isInputs ? inputs.midiin.select : inputs.midiout.select,
                    n = midiPorts.length;
                for (var i = 0; i < n; i++) {
                    port = midiPorts[i];
                    optionEl = document.createElement('option');
                    optionEl.text = port.name;
                    optionEl.value = port.id;
                    selectEl.add(optionEl);
                }
            },
            
            /**
             * Show the selected output in the dropdown.
             * @param {String} output WebMidi output ID.
             * @param {Boolean} isInput True if input, else output.
             */
            setSelectedMidiPort = function(id, isInput) {
                var selectEl = isInput ? inputs.midiin.select : inputs.midiout.select;
                selectEl.value = id;
            };
        
        that = specs.that;
        
        init();
        
        that.setMidiPorts = setMidiPorts;
        that.setSelectedMidiPort = setSelectedMidiPort;
        return that;
    }

    ns.createEPGPreferences = createEPGPreferences;

})(WH);
