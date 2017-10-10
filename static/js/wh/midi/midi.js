/**
 * Handles connection with soft- and hardware MIDI devices.
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createMIDI(specs) {
        var that,
            preferencesView = specs.preferencesView,
            midiNetwork = specs.midiNetwork,
            midiRemote = specs.midiRemote,
            midiSync = specs.midiSync,
            transport = specs.transport,
            midiAccess,
            inputs = [],
            outputs = [],
            dataFromStorage,

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
                        failureCallback('RequestMIDIAccess failed.');
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
                console.log('MIDI enabled.');
                midiAccess = midiAccessObj;
                var inputs = midiAccess.inputs.values();
                var outputs = midiAccess.outputs.values();
                
                for (var port = inputs.next(); port && !port.done; port = inputs.next()) {
                    createInput(port.value);
                }
                
                for (var port = outputs.next(); port && !port.done; port = outputs.next()) {
                    createOutput(port.value);
                }
                
                restorePortSettings();

                midiAccess.onstatechange = onAccessStateChange;
            },

            /**
             * MIDIAccess object statechange handler.
             * If the change is the addition of a new port, create a port module.
             * This handles MIDI devices that are connected after the app initialisation.
             * Disconnected or reconnected ports are handled by the port modules.
             * @param {Object} e MIDIConnectionEvent object.
             */
            onAccessStateChange = function(e) {
                let ports = (e.port.type == 'input') ? inputs : outputs,
                    exists = false,
                    n = ports.length;

                while (--n >= 0 && exists == false) {
                    exists = (e.port.id == ports[n].getID());
                }

                if (!exists) {
                    if (e.port.type == 'input') {
                        createInput(e.port);
                    } else {
                        createOutput(e.port);
                    }
                }
            },
            
            /**
             * Create a MIDI input model and view.
             * @param  {Object} midiPort MIDIInput module.
             */
            createInput = function(midiPort) {
                console.log('MIDI input port:', midiPort.name + ' (' + midiPort.manufacturer + ')', midiPort.id);
                var input = ns.createMIDIPortInput({
                    midiPort: midiPort,
                    network: midiNetwork,
                    sync: midiSync,
                    remote: midiRemote
                });
                // create a view for this port in the preferences panel
                preferencesView.createMIDIPortView(true, input);
                // store port
                inputs.push(input);
                // port initialisation last
                input.setup();
            },
            
            /**
             * Create a MIDI output model and view.
             * @param  {Object} midiPort MIDIOutput module.
             */
            createOutput = function(midiPort) {
                console.log('MIDI output port:', midiPort.name + ' (' + midiPort.manufacturer + ')', midiPort.id);
                var output = ns.createMIDIPortOutput({
                    midiPort: midiPort,
                    network: midiNetwork,
                    sync: midiSync,
                    remote: midiRemote
                });
                // create a view for this port in the preferences panel
                preferencesView.createMIDIPortView(false, output);
                // store port
                outputs.push(output);
                // port initialisation last
                output.setup();
            },
            
            /**
             * Restore settings at initialisation.
             * If port settings data from localStorage and 
             * access to MIDI ports exists, restore port settings.
             */
            restorePortSettings = function() {
                if (midiAccess && dataFromStorage) {
                    const data = dataFromStorage;
                    
                    if (data.inputs) {
                        let inputData;
                        for (let i = 0, n = data.inputs.length; i < n; i++) {
                            inputData = data.inputs[i];
                            // find the input port by MIDIInput ID
                            for (let j = 0, nn = inputs.length; j < nn; j++) {
                                if (inputData.midiPortID == inputs[j].getID()) {
                                    inputs[j].setData(inputData);
                                }
                            }
                        }
                    }
                    
                    if (data.outputs) {
                        let outputData;
                        for (let i = 0, n = data.outputs.length; i < n; i++) {
                            outputData = data.outputs[i];
                            // find the output port by MIDIOutput ID
                            for (let j = 0, nn = outputs.length; j < nn; j++) {
                                if (outputData.midiPortID == outputs[j].getID()) {
                                    outputs[j].setData(outputData);
                                }
                            }
                        }
                    }
                }
            },

            /**
             * Restore MIDI port object settings from data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                dataFromStorage = data;
                restorePortSettings();
            },

            /**
             * Write MIDI port object settings to data object.
             * @return {Object} MIDI port object data.
             */
            getData = function() {
                const data = {
                    inputs: [],
                    outputs: []
                };
                
                for (let i = 0, n = inputs.length; i < n; i++) {
                    data.inputs.push(inputs[i].getData());
                }
                
                for (let i = 0, n = outputs.length; i < n; i++) {
                    data.outputs.push(outputs[i].getData());
                }
                
                return data;
            };

        that = specs.that;

        that.setup = setup;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createMIDI = createMIDI;

})(WH);
