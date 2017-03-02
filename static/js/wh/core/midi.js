/**
 * Handles MIDI, interfaces with the WebMIDI library.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createMidi(specs) {
        var that,
            controlsView = specs.controlsView,
            epgModel = specs.epgModel,
            preferencesView = specs.preferencesView,
            transport = specs.transport,
            selectedInput,
            selectedInputID,
            selectedOutput,
            selectedOutputID,
            isClockInEnabled,
            isNoteInEnabled,
            
            init = function() {},
            
            /**
             * Retrieve access to the MIDI devices.
             */
            enable = function() {
                WebMidi.enable(function(err) {
                    if (err) {
                        console.log('WebMidi could not be enabled.', err);
                    } else {
                        console.log('WebMidi enabled');
                        preferencesView.setMidiPorts(WebMidi.inputs, true);
                        preferencesView.setMidiPorts(WebMidi.outputs, false);
                        if (typeof selectedInputID === 'string') {
                            selectInputByID(selectedInputID);
                        }
                        if (typeof selectedOutputID === 'string') {
                            selectOutputByID(selectedOutputID);
                        }
                    }
                });
            },
            
            /**
             * Select an input.
             * @param {String} id ID of the input.
             */
            selectInputByID = function(id) {
                selectedInputID = id;
                if (WebMidi.enabled) {
                    selectedInput = WebMidi.getInputById(selectedInputID);
                    preferencesView.setSelectedMidiPort(selectedInputID, true);
                    setClockInEnabled(isClockInEnabled);
                    setNoteInEnabled(isNoteInEnabled);
                }
            },
            
            /**
             * Select an output.
             * @param {String} id ID of the output.
             */
            selectOutputByID = function(id) {
                selectedOutputID = id;
                if (WebMidi.enabled) {
                    selectedOutput = WebMidi.getOutputById(selectedOutputID);
                    preferencesView.setSelectedMidiPort(selectedOutputID, false);
                }
            },
            
            /**
             * Toggle between internal clock and external MIDI clock sync.
             * @param {Boolean} isEnabled Sync to MIDI clock when true.
             */
            setClockInEnabled = function(isEnabled) {
                isClockInEnabled = isEnabled;
                controlsView.setControlsEnabled(!isClockInEnabled);
                preferencesView.setMidiClockInEnabled(isClockInEnabled);
                // only enable if there is a MIDI input port
                if ((isClockInEnabled && selectedInput) || !isClockInEnabled) {
                    transport.setExternalClockEnabled(isClockInEnabled, selectedInput);
                }
            },
            
            /**
             * Enable pattern play control by MIDI note on and off.
             * @param {Boolean} isEnabled Pattern play control enabled when true.
             */
            setNoteInEnabled = function(isEnabled) {
                isNoteInEnabled = isEnabled;
                preferencesView.setMidiNoteInEnabled(isNoteInEnabled);
                // only enable if there is a MIDI input port
                if ((isNoteInEnabled && selectedInput) || !isNoteInEnabled) {
                    epgModel.setExternalNoteInEnabled(isNoteInEnabled, selectedInput);
                }
            },
            
            /**
             * Send a MIDI note On and Off message.
             * @param  {Number} pitch          Note pitch 0 - 127
             * @param  {Number} velocity       Note velocity 0 - 127
             * @param  {Number} channelIndex   Channel 0 - 15
             * @param  {Number} startTimeStamp Note start time in ms.
             * @param  {Number} duration       Note duration in ms.
             */
            playNote = function(pitch, velocity, channelIndex, startTimeStamp, duration) {
                if (selectedOutput) {
                    // selectedOutput.clear();
                    selectedOutput.playNote(pitch, channelIndex + 1, {
                        velocity: velocity,
                        rawVelocity: true,
                        time: startTimeStamp,
                        duration: duration
                    });
                }
            },
            
            /**
             * Set all preferences from a data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                selectInputByID(data.midiin);
                selectOutputByID(data.midiout);
                setClockInEnabled(data.clockin);
                setNoteInEnabled(data.notein);
            }, 
            
            /**
             * Save the preferences when the page unloads.
             */
            getData = function() {
                return {
                    'midiin': selectedInput ? selectedInput.id : '',
                    'midiout': selectedOutput ? selectedOutput.id : '',
                    'clockin': isClockInEnabled,
                    'notein': isNoteInEnabled
                };
            };
        
        that = specs.that;
        
        init();
        
        that.enable = enable;
        that.selectInputByID = selectInputByID;
        that.selectOutputByID = selectOutputByID;
        that.setClockInEnabled = setClockInEnabled;
        that.setNoteInEnabled = setNoteInEnabled;
        that.playNote = playNote;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createMidi = createMidi;

})(WH);
