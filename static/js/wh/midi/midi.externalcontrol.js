/**
 * 
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIExternalControl(specs) {
        var that,
            externalControlView = specs.externalControlView,
            midiInputs = [],
            paramLookup = [],
            isInLearnMode = false,
            
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
                console.log(e, e.data);
                // only continuous controller message, 0xB == 11
                if (e.data[0] >> 4 === 0xB) {
                    var channelIndex = e.data[0] & 0xf,
                        param = paramLookup[e.target.id][(e.data[0] & 0xf) + '_ ' + e.data[1]];
                    if (param) {
                        param.setValueNormalized(e.data[2] / 127);
                    }
                }
            },
            
            onMIDILearnMessage = function(e) {
                
            },
            
            toggleMidiLearn = function(isEnabled) {
                isInLearnMode = isEnabled;
                externalControlView.toggleVisibility(isInLearnMode);
                
                var midimessageListener;
                if (isInLearnMode) {
                    midiMessageListener = onMIDILearnMessage;
                } else {
                    midiMessageListener = onMIDIMessage;
                }
                
                // set listener on all midi ports
                var n = midiInputs.length;
                for (var i = 0; i < n; i++) {
                    midiInputs[i].onmidimessage = midiMessageListener;
                }
                
                
                // ON
                // the assigned parameter list is shown
                // all controllable parameter's setting views show overlay
                // - actually, a callback is called on appView
                // -- the callback contains a callback
                // - appView calls function on all it's settingsviews
                // - settings views call function on all their controllable settingViews
                // - settingViews show clickable overlay
                // overlay click selects the parameter
                // - actually, the selected parameter is referenced to here
                // incoming midi cc assigns port, channel and cc to that parameter
                // - actually, the parameter is stored here in the array
                // the parameter is added to the list view
                // - 
                
                // OFF 
                // the assigned parameter list is hidden
                // all controllable parameter's setting views hide overlay
                
                // CLICK ON PARAMETER SETTING OVERLAY 
                // the callback is called with the parameter as parameter :)
                // the parameter is referenced here as the current selected one
                // if a midi cc is received, the parameter is stored and is assigned
                // - this overwrites old assignments for that port, channel and cc
                
                // PROCESSOR WITH CONTROLLED PARAMETER(S) IS DELETED
                // 
            },
            
            addParameter = function(param) {
                // add parameter to the lookup table
                // add parameter to the list view table
            },
            
            removeParameter = function(param) {
                // remove parameter from the lookup table
                // remove parameter from the list view table
            };
        
        that = specs.that;
        
        that.toggleMidiLearn = toggleMidiLearn;
        return that;
    }
        

    ns.createMIDIExternalControl = createMIDIExternalControl;

})(WH);
        
