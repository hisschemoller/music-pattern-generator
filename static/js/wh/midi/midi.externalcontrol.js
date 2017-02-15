/**
 * 
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIExternalControl(specs) {
        var that,
            midiInputs = [],
            
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
                    midiInput.onmidimessage = onMIDIMessage;
                }
            },
                
            removeMidiInput = function(midiInput) {
                var n = midiInputs.length;
                for (var i = 0; i < n; i++) {
                    if (midiInputs[i] === midiInput) {
                        midiInputs.splice(i, 1);
                        break;
                    }
                }
            },
            
            onMIDIMessage = function(message) {
                console.log(message, message.data);
                // continuous controller message
                if (message.data[0] >> 4 === 0xB) { // 0xB == 11
                    if ('this_is_the_right_port') {
                        var channelIndex = message.data[0] & 0xf,
                            param = midiInputs['the_right_port_index'].params[channelIndex][message.data[1]];
                        if (param) {
                            param.setValueNormalized(message.data[2] / 127);
                        }
                    }
                }
            };
        
        that = specs.that;
        
        return that;
    }
        

    ns.createMIDIExternalControl = createMIDIExternalControl;

})(WH);
        
