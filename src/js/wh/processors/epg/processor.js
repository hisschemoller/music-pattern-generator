import createMIDIProcessorBase from '../../midi/processorbase' 

export function createProcessor(specs, my) {
    let that;

    const initialize = function() {},

        terminate = function() {},

        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {},
        
        render = function(pos) {};

    my = my || {};
    my.info = {
        inputs: 0,
        outputs: 1
    };
    
    that = createMIDIProcessorBase(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    that.render = render;
    return that;
}