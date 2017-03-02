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
            midiRemote = specs.midiRemote,
            transport = specs.transport,
            localStorageName = 'midiprefs',
            midiAccess,
            selectedInput,
            selectedInputID,
            selectedOutput,
            selectedOutputID,
            isClockInEnabled,
            isNoteInEnabled,
            
            setup = function() {
                requestAccess(onAccessSuccess, onAccessFailure, false);
            },
            
            /**
             * Request system for access to MIDI ports.
             * @param {function} successCallback
             * @param {function} failureCallback
             * @param {boolean} sysex True if sysex data must be included.
             */
            requestAccess = function(successCallback, failureCallback, sysex) {
                if (navigator.requestMIDIAccess) {
                    navigator.requestMIDIAccess({
                        sysex: !!sysex
                    }).then(function(_midiAccess) {
                        if (!_midiAccess.inputs.size && !_midiAccess.outputs.size) {
                            failureCallback('No MIDI devices found on this system.');
                        } else {
                            successCallback(_midiAccess);
                        }
                    }, function() {
                        failureCallback('RequestMIDIAccess failed. Error message: ', errorMsg);
                    });
                } else {
                    failureCallback('Web MIDI API not available.');
                }
            },
        
            /**
             * MIDI access request failed.
             * @param {String} errorMessage 
             */
            onAccessFailure = function(errorMessage) {
                console.log(errorMessage);
            },
            
            /**
             * MIDI access request succeeded.
             * @param {Object} midiAccessObj MidiAccess object.
             */
            onAccessSuccess = function(midiAccessObj) {
                console.log('Midi enabled.');
                midiAccess = midiAccessObj;
                var inputs = midiAccess.inputs.values();
                var outputs = midiAccess.outputs.values();
                
                // populate input dropdown with MIDI ports
                var portInfos = [];
                for (var port = inputs.next(); port && !port.done; port = inputs.next()) {
                    console.log('MIDI input port:', port.value.name + ' (' + port.value.manufacturer + ')');
                    portInfos.push({
                        name: port.value.name,
                        id: port.value.id
                    });
                    // create a MIDI input processor for each port
                    ns.pubSub.fire('create.processor', {
                        type: 'input',
                        midiInput: port.value
                    });
                    // all midi inputs are available for remote MIDI control
                    midiRemote.addMidiInput(port.value);
                }
                epgPreferences.setMidiPorts(portInfos, true);
                
                // populate output dropdown with MIDI ports
                portInfos = [];
                for (var port = outputs.next(); port && !port.done; port = outputs.next()) {
                    console.log('MIDI output port:', port.value.name + ' (' + port.value.manufacturer + ')');
                    portInfos.push({
                        name: port.value.name,
                        id: port.value.id
                    });
                    // create a MIDI output processor for each port
                    ns.pubSub.fire('create.processor', {
                        type: 'output',
                        midiOutput: port.value
                    });
                }
                epgPreferences.setMidiPorts(portInfos, false);
                
                // select an input and output if they're already known
                if (typeof selectedInputID === 'string' && selectedOutputID.length) {
                    selectInputByID(selectedInputID);
                }
                if (typeof selectedOutputID === 'string' && selectedOutputID.length) {
                    selectOutputByID(selectedOutputID);
                }
            },
            
            /**
             * Select an input.
             * @param {String} id ID of the input.
             */
            selectInputByID = function(id) {
                selectedInputID = id;
                if (midiAccess) {
                    selectedInput = null;
                    var portMap = midiAccess.inputs.values();
                    for (port = portMap.next(); port && !port.done; port = portMap.next()) {
                        if (port.value.id === id) {
                            selectedInput = port.value;
                            epgPreferences.setSelectedMidiPort(selectedInputID, true);
                        }
                    }
                }
            },
            
            /**
             * Select an output.
             * @param {String} id ID of the output.
             */
            selectOutputByID = function(id) {
                selectedOutputID = id;
                if (midiAccess) {
                    selectedOutput = null;
                    var portMap = midiAccess.outputs.values();
                    for (port = portMap.next(); port && !port.done; port = portMap.next()) {
                        if (port.value.id === id) {
                            selectedOutput = port.value;
                            epgPreferences.setSelectedMidiPort(selectedOutputID, false);
                        }
                    }
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
            },
            
            /**
             * Set all preferences from a data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                selectInputByID(data.midiin, true);
                selectOutputByID(data.midiout, false);
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
        
        that.setup = setup;
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
