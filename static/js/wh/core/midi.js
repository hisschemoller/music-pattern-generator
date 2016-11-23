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
            selectedOutputID,
            
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
                        WH.pubSub.fire('midi.inputs', WebMidi.inputs);
                        WH.pubSub.fire('midi.outputs', WebMidi.outputs);
                        if (typeof selectedOutputID === 'string') {
                            selectOutputByID(selectedOutputID);
                        }
                    }
                });
            },
            
            /**
             * Select an output.
             * @param {String} id ID of the output.
             */
            selectOutputByID = function(id) {
                selectedOutputID = id;
                if (WebMidi.enabled) {
                    selectedOutput = WebMidi.getOutputById(selectedOutputID);
                    WH.pubSub.fire('midi.output', selectedOutputID);
                }
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
                selectOutputByID(data.midiout);
            }, 
            
            /**
             * Save the preferences when the page unloads.
             */
            getData = function() {
                return {
                    'midiout': selectedOutput ? selectedOutput.id : ''
                };
            };
        
        that = specs.that;
        
        init();
        
        that.enable = enable;
        that.selectOutputByID = selectOutputByID;
        that.playNote = playNote;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createMidi = createMidi;

})(WH);
