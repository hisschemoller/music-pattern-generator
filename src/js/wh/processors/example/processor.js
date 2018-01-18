export function createMIDIProcessor(specs) {
    let that;

    const initialize = function() {
            console.log(midiProcessors);
        },

        terminate = function() {},

        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {},

    that = createMIDIProcessorBase(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    that.render = render;
    return that;
}