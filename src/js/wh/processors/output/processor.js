import createMIDIProcessorBase from '../../midi/processorbase';

/**
 * MIDI output port processor.
 */
export function createProcessor(specs, my) {
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
        
        setEnabled = function(isEnabled) {
            my.isEnabled = isEnabled;
        },

        getPort = function() {
            return midiOutput;
        },

        getProcessorSpecificData = function(data) {
            data.midiPortID = midiOutput.id;
        };


    my = my || {};
    my.info = {
        inputs: 1,
        outputs: 0
    };
    my.isEnabled = true;
    my.getProcessorSpecificData = getProcessorSpecificData;
    my.$position2d = function(value, timestamp) {}

    that = createMIDIProcessorBase(specs, my);
    
    // my.defineParams({
    //     position2d: {
    //         label: '2D position',
    //         type: 'vector2d',
    //         default: {x: 0, y: 0},
    //         isMidiControllable: false
    //     }
    // });

    that.process = process;
    that.setEnabled = setEnabled;
    that.getPort = getPort;
    return that;
}
