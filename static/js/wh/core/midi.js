/**
 * Handles MIDI, interfaces with the WebMIDI library.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createMidi(specs) {
        var that,
            epgControls = specs.epgControls,
            epgPreferences = specs.epgPreferences,
            selectedInput,
            selectedInputID,
            selectedOutput,
            selectedOutputID,
            isClockInEnabled,
            
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
                        epgPreferences.setMidiPorts(WebMidi.inputs, true);
                        epgPreferences.setMidiPorts(WebMidi.outputs, false);
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
                    epgPreferences.setSelectedMidiPort(selectedInputID, true);
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
                    epgPreferences.setSelectedMidiPort(selectedOutputID, false);
                }
            },
            
            /**
             * Toggle between internal clock and external MIDI clock sync.
             * @param {Boolean} isEnabled Sync to MIDI clock when true.
             */
            setClockInEnabled = function(isEnabled) {
                isClockInEnabled = isEnabled;
                epgControls.setControlsEnabled(!isClockInEnabled);
            },
            
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
            }, 
            
            /**
             * Save the preferences when the page unloads.
             */
            getData = function() {
                return {
                    'midiin': selectedInput ? selectedInput.id : '',
                    'midiout': selectedOutput ? selectedOutput.id : ''
                };
            };
        
        that = specs.that;
        
        init();
        
        that.enable = enable;
        that.selectInputByID = selectInputByID;
        that.selectOutputByID = selectOutputByID;
        that.setClockInEnabled = setClockInEnabled;
        that.playNote = playNote;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createMidi = createMidi;

})(WH);
