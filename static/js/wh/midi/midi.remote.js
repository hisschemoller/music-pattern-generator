/**
 * MIDIRemote assigns MIDI Continuous Controllers to processor parameters.
 *
 * If a CC is assigned and that CC was already assigned, the old assignment is removed.
 * If a parameter is assigned and it is then reassigned to a different CC, the old assignment is removed.
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createMIDIRemote(specs) {
        var that,
            remoteView = specs.remoteView,
            midiInputs = [],
            paramLookup = {},
            selectedParameter,
            isInLearnMode = false,
            processors = [],

            /**
             * Add a MIDI Input port only if it doesn't yet exist.
             * The port is the object created in midi.port.input.js,
             * not a Web MIDI API MIDIInput.
             * @param {Object} midiInputPort MIDI input port object.
             */
            addMidiInput = function(midiInputPort) {
                var exists = false,
                    midiInputPortID = midiInputPort.getID();
                for (var i = 0, n = midiInputs.length; i < n; i++) {
                    if (midiInputs[i].port.getID() === midiInputPortID) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    // keep reference to midiInputPort
                    // TODO: params array doesn't seem to be used
                    midiInputs.push({
                        port: midiInputPort,
                        params: []
                    });

                    // quick lookup of assigned parameters
                    paramLookup[midiInputPortID] = [];

                    // subscribe to receive messages from this MIDI input
                    midiInputPort.addMIDIMessageListener(onMIDIMessage);
                }
            },

            /**
             * Remove a MIDI input port from being a remote source.
             * @param {Object} midiInputPort MIDI input port object.
             */
            removeMidiInput = function(midiInputPort) {
                var n = midiInputs.length;
                for (var i = 0; i < n; i++) {
                    if (midiInputs[i].port === midiInputPort) {
                        // remove reference to midiInputPort
                        midiInputs.splice(i, 1);
                        // unassign all processor parameters controlled by this input
                        if (paramLookup.hasOwnProperty(midiInputPort.getID())) {
                            let params = paramLookup[midiInputPort.getID()],
                                n = params.length;
                            while (--n >= 0) {
                                unassingParameter(params[n]);
                            }
                        }
                        // remove parameter lookups
                        paramLookup[midiInputPort.getID()] = null;
                        // unsubscribe from receiving messages from the MIDI input.
                        midiInputPort.removeMIDIMessageListener(onMIDIMessage);
                        // and we're done
                        break;
                    }
                }
            },

            /**
             * Eventlistener for incoming MIDI messages.
             * @see https://www.w3.org/TR/webmidi/#idl-def-MIDIMessageEvent
             * @param  {Object} e MIDIMessageEvent event.
             */
            onMIDIMessage = function(e) {
                // only continuous controller message, 0xB == 11
                if (e.data[0] >> 4 === 0xB) {
                    var channel = (e.data[0] & 0xf) + 1,
                        param = paramLookup[e.target.id][channel + '_' + e.data[1]];
                    if (param) {
                        param.setValueNormalized(e.data[2] / 127);
                    }
                }
            },

            /**
             * Listener for MIDI events in case the app is in MIDI learn mode.
             * @see https://www.w3.org/TR/webmidi/#idl-def-MIDIMessageEvent
             * @param  {Object} e MIDIMessageEvent event.
             */
            onMIDILearnMessage = function(e) {
                if (selectedParameter) {
                    if (e.data[0] >> 4 === 0xB) {
                        var portId = e.target.id,
                            channel = (e.data[0] & 0xf) + 1,
                            controller = e.data[1];
                        assignParameter(selectedParameter, portId, channel, controller);
                        deselectParameter();
                    }
                }
            },

            /**
             * Toggle MIDI learn mode, so incoming MIDI messages are used to
             * assign a selected parameter to the incoming message type.
             * @param {Boolean} isEnabled True to enable MIDI learn mode.
             */
            toggleMidiLearn = function(isEnabled) {
                isInLearnMode = isEnabled;
                deselectParameter();
                remoteView.toggleVisibility(isInLearnMode);

                // set learn mode on all parameters
                var remoteState = isInLearnMode ? 'enter' : 'exit';
                for (var i = 0; i < processors.length; i++) {
                    var processor = processors[i];
                    for (var j = 0; j < processor.params.length; j++) {
                        processor.params[j].setRemoteState(remoteState, selectParameter);
                    }
                }

                // midi listener switches with learn mode
                var midimessageListener,
                    oldMidimessageListener;
                if (isInLearnMode) {
                    oldMidimessageListener = onMIDIMessage;
                    midiMessageListener = onMIDILearnMessage;
                } else {
                    oldMidimessageListener = onMIDILearnMessage;
                    midiMessageListener = onMIDIMessage;
                }

                // set listener on all midi ports
                for (var i = 0, n = midiInputs.length; i < n; i++) {
                    midiInputs[i].port.removeMIDIMessageListener(oldMidimessageListener);
                    midiInputs[i].port.addMIDIMessageListener(midiMessageListener);
                }
            },

            /**
             * Set a parameter as selected to be assigned.
             * @param {Object} param Processor parameter.
             */
            selectParameter = function(param) {
                if (selectedParameter) {
                    deselectParameter();
                }
                selectedParameter = param;
                selectedParameter.setRemoteState('selected');
            },

            /**
             * Unselect the selected parameter so it can't be assigned anymore.
             */
            deselectParameter = function() {
                if (selectedParameter) {
                    selectedParameter.setRemoteState('deselected');
                    selectedParameter = null;
                }
            },

            /**
             * Assign a MIDI controller to a parameter.
             * @param  {Object} param Processor parameter to be assigned a MIDI control.
             * @param  {String} portId MIDI input ID.
             * @param  {Number} channel MIDI channel.
             * @param  {Number} controller MIDI CC number.
             */
            assignParameter = function(param, portId, channel, controller) {
                // add parameter to the lookup table
                paramLookup[portId][channel + '_' + controller] = param;

                // update the parameter
                param.setRemoteProperty('portId', portId);
                param.setRemoteProperty('channel', channel);
                param.setRemoteProperty('controller', controller);
                param.setRemoteState('assigned');

                // add parameter to the view
                remoteView.addParameter(param);
            },

            /**
             * Unassign a parameter from being MIDI controlled.
             * @param  {Object} param Processor parameter to be unassigned.
             */
            unassingParameter = function(param) {
                // remove parameter from the lookup table
                var portId = param.getRemoteProperty('portId'),
                    channel = param.getRemoteProperty('channel'),
                    controller = param.getRemoteProperty('controller');
                paramLookup[portId][channel + '_ ' + controller] = null;

                // update the parameter
                param.setRemoteProperty('portId', null);
                param.setRemoteProperty('channel', null);
                param.setRemoteProperty('controller', null);
                param.setRemoteState('unassigned');

                // remove parameter from the view
                remoteView.removeParameter(param);
            },
            
            /**
             * Register a processor of which parameters might be remote controlled.
             * @param {Object} processor Network processor.
             */
            registerProcessor = function(processor) {
                var params = processor.getParameters(),
                    controllableParams = [];

                // create array of all controllable parameters of the processor
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        if (params[key].getProperty('isMidiControllable') === true) {
                            controllableParams.push(params[key]);
                        }
                    }
                }

                if (controllableParams.length) {
                    // add data to processors list
                    processors.push({
                        processor: processor,
                        params: controllableParams
                    });
                    // update view
                    remoteView.createRemoteGroup(processor);
                }
            },
            
            /**
             * Unregister a processor of which parameters might be remote controlled.
             * @param {Object} processor Network processor.
             */
            unregisterProcessor = function(processor) {
                var n = processors.length;
                while (--n >= 0) {
                    if (processors[n].processor === processor) {
                        // remove data from processors list
                        processors.splice(n, 1);
                        // update view
                        remoteView.deleteRemoteGroup(processor);
                    }
                }
            },

            /**
             * Clear all assignments.
             * Unassign all parameters.
             * Unregister all processors.
             */
            clear = function() {
                // Unassign all parameters.
                for (let lookupPortID in paramLookup) {
                    if (paramLookup.hasOwnProperty(lookupPortID)) {
                        let params = paramLookup[lookupPortID],
                            n = params.length;
                        while (--n >= 0) {
                            unassingParameter(params[n]);
                        }
                    }
                }
                // Unregister all processors.
                for (var i = 0; i < processors.length; i++) {
                    unregisterProcessor(processors[i]);
                }
            },

            /**
             * Restore assigned parameters from data object.
             * @param {Object} data  data object.
             */
            setData = function(data) {
                // clear all old data
                clear();
                
                // loop through midi ports data
                for (let dataPortID in data) {
                    if (data.hasOwnProperty(dataPortID)) {
                        // find MIDI port with this ID
                        for (let lookupPortID in paramLookup) {
                            if (paramLookup.hasOwnProperty(lookupPortID)) {
                                if (dataPortID == lookupPortID) {
                                    // the stored port exists, params can be assigned
                                    let paramsData = data[dataPortID],
                                        numParams = paramsData.length;
                                    for (let i = 0; i < numParams; i++) {
                                        // find processor
                                        let processorID = paramsData[i].processorID;
                                        let n = processors.length;
                                        while (--n >= 0) {
                                            if (processors[n].processor.getID() == processorID) {
                                                // processor found, find parameter
                                                let params = processors[n].params,
                                                    m = params.length;
                                                while (--m >= 0) {
                                                    if (params[m].getProperty('key') == paramsData[i].paramKey) {
                                                        // found parameter, assign to remote controller
                                                        let channel = paramsData[i].paramRemoteData.channel,
                                                            controller = paramsData[i].paramRemoteData.controller;
                                                        assignParameter(params[m], dataPortID, channel, controller)
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

            /**
             * Write assigned parameters to data object.
             * @return {Object} Contains port and parameter data.
             */
            getData = function() {
                let lookupPort, param, processorID,
                    data = {};
                // loop through midi ports lookup
                for (var portKey in paramLookup) {
                    if (paramLookup.hasOwnProperty(portKey)) {
                        lookupPort = paramLookup[portKey];
                        data[portKey] = [];
                        // loop through parameters listening to this port
                        for (var paramKey in lookupPort) {
                            if (lookupPort.hasOwnProperty(paramKey)) {
                                param = lookupPort[paramKey];
                                // find processor for the parameter to get its id
                                processorID = null;
                                let n = processors.length;
                                while (--n >= 0) {
                                    let m = processors[n].params.length;
                                    while (--m >= 0) {
                                        if (param === processors[n].params[m]) {
                                            processorID = processors[n].processor.getID();
                                            break;
                                        }
                                    }
                                }
                                // create the parameter's data entry
                                data[portKey].push({
                                    processorID: processorID,
                                    paramKey: param.getProperty('key'),
                                    paramRemoteData: param.getRemoteData()
                                });
                            }
                        }
                    }
                }
                return data;
            };

        that = specs.that;

        that.addMidiInput = addMidiInput;
        that.removeMidiInput = removeMidiInput;
        that.toggleMidiLearn = toggleMidiLearn;
        that.unassingParameter = unassingParameter;
        that.registerProcessor = registerProcessor;
        that.unregisterProcessor = unregisterProcessor;
        that.clear = clear;
        that.setData = setData;
        that.getData = getData;
        return that;
    }
    
    ns.createMIDIRemote = createMIDIRemote;

})(WH);
