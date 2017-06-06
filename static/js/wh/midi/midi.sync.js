/**
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createMIDISync(specs) {
        var that,
            transport = specs.transport,
            midiInputs = [],

            /**
             * Add a MIDI Input port only if it dosn't yet exist.
             * @param {Object} midiInput Web MIDI input port object.
             */
            addMidiInput = function(midiInput) {
                var exists = false;
                
                for (var i = 0, n = midiInputs.length; i < n; i++) {
                    if (midiInputs[i] === midiInput) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    midiInputs.push(midiInput);
                    // midiInput.onmidimessage = onMIDIMessage;
                }
            },

            removeMidiInput = function(midiInput) {
                for (var i = 0, n = midiInputs.length; i < n; i++) {
                    if (midiInputs[i] === midiInput) {
                        midiInputs.splice(i, 1);
                        break;
                    }
                }
            },

            onMIDIMessage = function(e) {
                // only continuous controller message, 0xB == 11
                // console.log(e.data, e.data[0] >> 4, e.data[0] & 0xf);

            };

        that = specs.that;

        that.addMidiInput = addMidiInput;
        that.removeMidiInput = removeMidiInput;
        return that;
    }


    ns.createMIDISync = createMIDISync;

})(WH);
