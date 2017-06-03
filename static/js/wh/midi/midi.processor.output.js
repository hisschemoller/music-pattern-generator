/**
 * MIDI output port processor.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {

    function createMIDIPortOut(specs, my) {
        var that,
            midiOutput = specs.midiOutput,

            /**
             * Process events to happen in a time slice.
             * @param {Number} scanStart Timespan start in ticks from timeline start.
             * @param {Number} scanEnd   Timespan end in ticks from timeline start.
             * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
             * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
             * @param {Number} offset Time from doc start to timeline start in ticks.
             */
            process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {
                var inputData = my.getInputData(),
                    origin = performance.now() - (offset * ticksToMsMultiplier),
                    n = inputData.length;

                if (midiOutput.state === 'connected') {
                    for (var i = 0; i < n; i++) {
                        var item = inputData[i],
                            // item.timestampTicks is time since transport play started
                            timestamp = origin + (item.timestampTicks * ticksToMsMultiplier);
                            
                        switch (item.type) {
                            case 'noteon':
                                midiOutput.send([0x90 + (item.channel - 1), item.pitch, item.velocity], timestamp);
                                break;
                            case 'noteoff':
                                midiOutput.send([0x80 + (item.channel - 1), item.pitch, 0], timestamp);
                                break;
                        }
                    }
                }
            },

            getPort = function() {
                return midiOutput;
            },

            getProcessorSpecificData = function(data) {
                data.midiPortID = midiOutput.id;
            };


        my = my || {};
        my.getProcessorSpecificData = getProcessorSpecificData;

        that = ns.createMIDIProcessorBase(specs, my);
        that = ns.createMIDIConnectorIn(specs, my);

        that.process = process;
        that.getPort = getPort;
        return that;
    };

    var type = 'output';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIPortOut
    };

})(WH);
