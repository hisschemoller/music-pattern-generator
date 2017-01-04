/**
 * Handles MIDI, interfaces with the WebMIDI library.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createMIDI(specs) {
        var that,
            epgControls = specs.epgControls,
            epgPreferences = specs.epgPreferences,
            midiNetwork = specs.midiNetwork,
            transport = specs.transport,
            selectedInput,
            selectedInputID,
            selectedOutput,
            selectedOutputID,
            isClockInEnabled,
            isNoteInEnabled,
        
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
                    midiNetwork.createProcessor('input', {
                        midiInput: selectedInput
                    });
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
                    epgPreferences.setSelectedMidiPort(selectedOutputID, false);
                    midiNetwork.createProcessor('output', {
                        midiOutput: selectedOutput
                    });
                }
            },
            
            /**
             * Toggle between internal clock and external MIDI clock sync.
             * @param {Boolean} isEnabled Sync to MIDI clock when true.
             */
            setClockInEnabled = function(isEnabled) {
                isClockInEnabled = isEnabled;
                epgControls.setControlsEnabled(!isClockInEnabled);
                epgPreferences.setMidiClockInEnabled(isClockInEnabled);
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
                epgPreferences.setMidiNoteInEnabled(isNoteInEnabled);
                // only enable if there is a MIDI input port
                if ((isNoteInEnabled && selectedInput) || !isNoteInEnabled) {
                    // epgModel.setExternalNoteInEnabled(isNoteInEnabled, selectedInput);
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
        
        that.enable = enable;
        that.selectInputByID = selectInputByID;
        that.selectOutputByID = selectOutputByID;
        that.setClockInEnabled = setClockInEnabled;
        that.setNoteInEnabled = setNoteInEnabled;
        that.setData = setData;
        that.getData = getData;
        return that;
    }
        

    ns.createMIDI = createMIDI;

})(WH);
