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
             * @see https://www.midi.org/specifications/item/table-1-summary-of-midi-message
             * @param  {Object} e MIDIMessageEvent event.
             */
            onMIDIMessage = function(e) {
                // data[1] and data[2] are undefined,
                // for e.data[0] & 0xf:
                //  8 = clock, 248 (11110000 | 00000100)
                // 10 = start
                // 11 = continue
                // 12 = stop
                switch (e.data[0]) {
                    case 248:
                        break;
                    case 250:
                        transport.rewind();
                        transport.start();
                        break;
                    case 251:
                        transport.start();
                        break;
                    case 252:
                        transport.pause();
                        break;
                }
            };

        that = specs.that;

        that.addMidiInput = addMidiInput;
        that.removeMidiInput = removeMidiInput;
        return that;
    }


    ns.createMIDISync = createMIDISync;

})(WH);
