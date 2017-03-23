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
             * Add a MIDI Input port only if it dosn't yet exist.
             * @param {Object} midiInput Web MIDI input port object.
             */
            addMidiInput = function(midiInput) {
                var exists = false,
                    n = midiInputs.length;
                for (var i = 0; i < n; i++) {
                    if (midiInputs[i].port === midiInput) {
                        exists = true;
                        break;
                    }
                }
                
                if (!exists) {
                    midiInputs.push({
                        port: midiInput,
                        params: []
                    });
                    paramLookup[midiInput.id] = [];
                    midiInput.onmidimessage = onMIDIMessage;
                }
            },
                
            removeMidiInput = function(midiInput) {
                var n = midiInputs.length;
                for (var i = 0; i < n; i++) {
                    if (midiInputs[i] === midiInput) {
                        midiInputs.splice(i, 1);
                        paramLookup[midiInput.id] = null;
                        break;
                    }
                }
            },
            
            onMIDIMessage = function(e) {
                // only continuous controller message, 0xB == 11
                if (e.data[0] >> 4 === 0xB) {
                    var channelIndex = e.data[0] & 0xf,
                        param = paramLookup[e.target.id][(e.data[0] & 0xf) + '_' + e.data[1]];
                    if (param) {
                        param.setValueNormalized(e.data[2] / 127);
                    }
                }
            },
            
            /**
             * Listener for MIDI events in case the app is in MIDI learn mode.
             * @param  {Object} e MIDI message.
             */
            onMIDILearnMessage = function(e) {
                if (selectedParameter) {
                    if (e.data[0] >> 4 === 0xB) {
                        var portId = e.target.id,
                            channelIndex = e.data[0] & 0xf,
                            controller = e.data[1];
                        assignParameter(selectedParameter, portId, channelIndex, controller);
                        deselectParameter();
                    }
                }
            },
            
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
                var midimessageListener;
                if (isInLearnMode) {
                    midiMessageListener = onMIDILearnMessage;
                } else {
                    midiMessageListener = onMIDIMessage;
                }
                
                // set listener on all midi ports
                var n = midiInputs.length;
                for (var i = 0; i < n; i++) {
                    midiInputs[i].port.onmidimessage = midiMessageListener;
                }
            },
            
            selectParameter = function(param) {
                if (selectedParameter) {
                    deselectParameter();
                }
                selectedParameter = param;
                selectedParameter.setRemoteState('selected');
            },
            
            deselectParameter = function() {
                if (selectedParameter) {
                    selectedParameter.setRemoteState('deselected');
                    selectedParameter = null;
                }
            },
            
            assignParameter = function(param, portId, channelIndex, controller) {
                // add parameter to the lookup table
                paramLookup[portId][channelIndex + '_' + controller] = param;
                
                // update the parameter
                param.setRemoteProperty('portId', portId);
                param.setRemoteProperty('channel', channelIndex + 1);
                param.setRemoteProperty('controller', controller);
                param.setRemoteState('assigned');
                
                // add parameter to the view
                remoteView.addParameter(param);
            },
            
            unassingParameter = function(param) {
                // remove parameter from the lookup table
                var portId = param.getRemoteProperty('portId'),
                    channelIndex = param.getRemoteProperty('channel') - 1,
                    controller = param.getRemoteProperty('controller');
                paramLookup[portId][channelIndex + '_ ' + controller] = null;
                
                // update the parameter
                param.setRemoteProperty('portId', null);
                param.setRemoteProperty('channel', null);
                param.setRemoteProperty('controller', null);
                param.setRemoteState('unassigned');
                
                // remove parameter from the view
                remoteView.removeParameter(param);
            },
            
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
                                                        // found parameter, assign ti remote controller
                                                        let channelIndex = paramsData[i].paramRemoteData.channel,
                                                            controller = paramsData[i].paramRemoteData.controller;
                                                        assignParameter(params[m], dataPortID, channelIndex, controller)
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
             * @return {Object} Contains 
             */
            getData = function() {
                let lookupPort, param, processorID,
                    data = {};
                // loop through midi ports lookup
                for (var portKey in paramLookup) {
                    if (paramLookup.hasOwnProperty(portKey)) {
                        console.log('port id ', portKey);
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
                                    console.log('processors[n] ', processors[n]);
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
        
