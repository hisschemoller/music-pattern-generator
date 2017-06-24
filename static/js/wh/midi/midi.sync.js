/**
 * MIDISync listens to incoming sync data.
 * 11111000 timing clock
 * 11111010 start
 * 11111011 continue
 * 11111100 stop
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
             * Add a MIDI Input port only if it doesn't yet exist.
             * The port is the object created in midi.port.input.js,
             * not a Web MIDI API MIDIInput.
             * @param {Object} midiInputPort MIDI input port object.
             */
            addMidiInput = function(midiInputPort) {
                var exists = false,
                    midiInputPortID = midiInputPort.getID();
                for (var i = 0, n = midiInputs.length; i < n; i++) {
                    if (midiInputs[i].getID() === midiInputPortID) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    // keep reference to midiInputPort
                    midiInputs.push(midiInputPort);

                    // subscribe to receive messages from this MIDI input
                    midiInputPort.addMIDIMessageListener(onMIDIMessage);
                }
            },

            /**
             * Remove a MIDI input port from being a remote source.
             * @param {Object} midiInputPort MIDI input port object.
             */
            removeMidiInput = function(midiInputPort) {
                for (var i = 0, n = midiInputs.length; i < n; i++) {
                    if (midiInputs[i] === midiInputPort) {
                        midiInputs.splice(i, 1);
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
                console.log(e.data[0] >> 4, e.data[0] & 0xf, e.data[0], e.data[1], e.data[2]);
                // data[1] and data[2] are undefined,
                // for e.data[0] & 0xf:
                //  8 = clock
                // 10 = start
                // 11 = continue
                // 12 = stop
            };

        that = specs.that;

        that.addMidiInput = addMidiInput;
        that.removeMidiInput = removeMidiInput;
        return that;
    }


    ns.createMIDISync = createMIDISync;

})(WH);
