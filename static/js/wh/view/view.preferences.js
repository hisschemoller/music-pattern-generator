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
                inputs.clockin.input.addEventListener('change', function(e) {
                    midi.setClockInEnabled(e.target.checked);
                });
                inputs.notein.input.addEventListener('change', function(e) {
                    midi.setNoteInEnabled(e.target.checked);
                });
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
             * Create view for a MIDI input or output port.
             * @param {Boolean} isInput True if the port in an input.
             * @param {Object} port MIDI port object.
             */
            createMIDIPortView = function(isInput, port) {
                var view;
                if (isInput) {
                    view = ns.createMIDIInputView({
                        parentEl: midiInputsEl,
                        port: port
                    });
                } else {
                    view = ns.createMIDIOutputView({
                        parentEl: midiOutputsEl,
                        port: port
                    });
                }
                midiPortViews.push(view);
            },
            
            /**
             * Delete view for a MIDI input or output processor.
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
