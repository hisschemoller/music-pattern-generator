/**
 * Preferences settings view.
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createPreferencesView(specs) {
        var that,
            midi = specs.midi,
            preferencesEl = document.querySelector('.prefs'),
            midiInputsEl = document.querySelector('.prefs__inputs'),
            midiOutputsEl = document.querySelector('.prefs__outputs'),
            midiPortViews = [],
            inputs = {
                midiout: {
                    type: 'select',
                    select: document.getElementById('outputs-select')
                },
                midiin: {
                    type: 'select',
                    select: document.getElementById('inputs-select')
                },
                clockin: {
                    type: 'checkbox',
                    input: document.getElementById('clockin-check')
                },
                notein: {
                    type: 'checkbox',
                    input: document.getElementById('notein-check')
                }
            },
            
            init = function() {
                inputs.midiout.select.addEventListener('change', function(e) {
                    midi.selectOutputByID(e.target.value);
                });
                inputs.midiin.select.addEventListener('change', function(e) {
                    midi.selectInputByID(e.target.value);
                });
                inputs.clockin.input.addEventListener('change', function(e) {
                    midi.setClockInEnabled(e.target.checked);
                });
                inputs.notein.input.addEventListener('change', function(e) {
                    midi.setNoteInEnabled(e.target.checked);
                });
            },
            
            /**
             * Populate the MIDI inputs or outputs dropdown.
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
            },
            
            /**
             * Show if external MIDI clock sync is selected.
             * @param {Boolean} isEnabled True if external clock is selected.
             */
            setMidiClockInEnabled = function(isEnabled) {
                inputs.clockin.input.checked = isEnabled;
            },
            
            /**
             * Show if pattern control by MIDI note is selected.
             * @param {Boolean} isEnabled True if pattern control is selected.
             */
            setMidiNoteInEnabled = function(isEnabled) {
                inputs.notein.input.checked = isEnabled;
            },
            
            /**
             * Create view for a MIDI input ou output processor.
             * @param  {Object} processor MIDI processor for a MIDI input or output.
             */
            createMIDIPortView = function(processor) {
                var view;
                switch (processor.getType()) {
                    case 'input':
                        view = ns.createMIDIInputView({
                            processor: processor,
                            parentEl: midiInputsEl
                        });
                        break;
                    case 'output':
                        view = ns.createMIDIOutputView({
                            processor: processor,
                            parentEl: midiOutputsEl
                        });
                        break;
                }
                midiPortViews.push(view);
            },
            
            /**
             * Delete view for a MIDI input ou output processor.
             * @param  {Object} processor MIDI processor for a MIDI input or output.
             */
            deleteMIDIPortView = function(processor) {
                var n = midiPortViews.length;
                while (--n >= 0) {
                    if (midiPortViews[n].hasProcessor(processor)) {
                        midiPortViews[n].terminate();
                        midiPortViews.splice(n, 1);
                        return false;
                    }
                }
            },
            
            /**
             * Toggle to show or hide the preferences panel.
             * @param  {Boolean} isVisible True to show the preferences.
             */
            toggle = function(isVisible) {
                preferencesEl.dataset.show = isVisible;
            };
        
        that = specs.that;
        
        init();
        
        that.setMidiPorts = setMidiPorts;
        that.setSelectedMidiPort = setSelectedMidiPort;
        that.setMidiClockInEnabled = setMidiClockInEnabled;
        that.setMidiNoteInEnabled = setMidiNoteInEnabled;
        that.createMIDIPortView = createMIDIPortView;
        that.deleteMIDIPortView = deleteMIDIPortView;
        that.toggle = toggle;
        return that;
    }

    ns.createPreferencesView = createPreferencesView;

})(WH);
