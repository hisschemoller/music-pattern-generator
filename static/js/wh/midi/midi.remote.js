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
                    midiInputPortID = midiInputPort.getID(),
                    existingMidiInputPort = getMIDIInputByID(midiInputPortID);

                if (!existingMidiInputPort) {
                    // keep reference to midiInputPort
                    midiInputs.push({
                        port: midiInputPort,
                        assignments: [],
                        active: true
                    });
                    
                    // subscribe to receive messages from this MIDI input
                    midiInputPort.addMIDIMessageListener(onMIDIMessage);
                } else {
                    // set active
                    existingMidiInputPort.active = true;
                    
                    let assignment;
                        
                    for (var i = 0, n = existingMidiInputPort.assignments.length; i < n; i++) {
                        assignment = existingMidiInputPort.assignments[i];
                        // add assignments to paramLookup
                        
                        paramLookup[assignment.channel + '_' + assignment.controller] = assignment.param;
                        // set the assigned parameters' state to 'inactive'
                        assignment[i].param.setRemoteState('assigned');
                    }
                }
            },

            /**
             * Remove a MIDI input port from being a remote source.
             * @param {Object} midiInputPort MIDI input port object.
             */
            removeMidiInput = function(midiInputPort) {
                var midiInput;
                for (var i = 0,  n = midiInputs.length; i < n; i++) {
                    midiInput = midiInputs[i];
                    if (midiInput.port === midiInputPort) {
                        // set inactive
                        midiInput.active = false;

                        // set the assigned parameters' state to 'inactive'
                        for (var i = 0, n = midiInput.assignments.length; i < n; i++) {
                            midiInput.assignments[i].param.setRemoteState('inactive');
                        }
                        break;
                    }
                }
            },
            
            /**
             * Find midiInputPort from list of added inputs by ID.
             * @param {String} midiInputPortID [description]
             * @return {Object|undefined} MidiInputPort object or undefined if not found.
             */
            getMIDIInputByID = function(midiInputPortID) {
                for (var i = 0, n = midiInputs.length; i < n; i++) {
                    if (midiInputs[i].port.getID() === midiInputPortID) {
                        return midiInputs[i];
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
                        param = paramLookup[channel + '_' + e.data[1]];
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
                // don't assign if the assignment already exists
                var midiInput = getMIDIInputByID(portId),
                    n = midiInput.assignments.length;
                while (--n >= 0) {
                    var a = midiInput.assignments[n];
                    if (a.param == param && a.channel == channel && a.controller == controller) {
                        return;
                    }
                }
                
                // add the assignment to the model
                midiInput.assignments.push({
                    param: param,
                    channel: channel,
                    controller: controller
                });
                
                // add parameter to the lookup table
                paramLookup[channel + '_' + controller] = param;

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
                var portId = param.getRemoteProperty('portId'),
                    channel = param.getRemoteProperty('channel'),
                    controller = param.getRemoteProperty('controller'),
                    midiInput = getMIDIInputByID(portId);
                    
                // remove the assignment from the model
                var n = midiInput.assignments.length;
                while (--n >= 0) {
                    var a = midiInput.assignments[n];
                    if (a.param == param && a.channel == channel && a.controller == controller) {
                        midiInput.assignments.splice(n, 0);
                        break;
                    }
                }
                
                // remove parameter from the lookup table;
                paramLookup[channel + '_ ' + controller] = null;

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
                for (let key in paramLookup) {
                    if (paramLookup.hasOwnProperty(key)) {
                        unassingParameter(paramLookup[key]);
                    }
                }
                paramLookup = {};
                
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
