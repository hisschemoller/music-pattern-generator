/**
 * MIDI input port processor.
 *
 * MIDI timestamps are in milliseconds since document start, so performance.now().
 * Processors communicate using ticks since timeline start.
 * 
 * @namespace WH
 */

window.WH = window.WH || {};

(function (WH) {
    
    function createMIDIPortIn(specs, my) {
        var that,
            midiInput = specs.midiInput,
            incoming = [],
            
            addEventListeners = function() {
                midiInput.addListener('noteon', 'all', function(e) {
                    incoming.push({
                        timestamp: e.receivedTime,
                        channel: e.channel,
                        type: e.type,
                        pitch: e.note.number,
                        velocity: e.rawVelocity
                    });
                });
                midiInput.addListener('noteoff', 'all', function(e) {
                    incoming.push({
                        timestamp: e.receivedTime,
                        channel: e.channel,
                        type: e.type,
                        pitch: e.note.number,
                        velocity: e.rawVelocity
                    });
                });
                midiInput.addListener('controlchange', 'all', function(e) {
                    incoming.push({
                        timestamp: e.receivedTime,
                        channel: e.channel,
                        type: e.type,
                        controller: e.controller.number,
                        value: e.value
                    });
                });
            },
            
            /**
             * Process events to happen in a time slice.
             * @param {Number} scanStart Timespan start in ticks from timeline start.
             * @param {Number} scanEnd   Timespan end in ticks from timeline start.
             * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
             * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
             * @param {Number} offset Time from doc start to timeline start in ticks.
             */
            process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {
                var timelineStartToNow = scanStart - nowToScanStart,
                    n = incoming.length;
                for (var i = 0; i < n; i++) {
                    var message = incoming[i];
                    message.timestampTicks = (message.timestamp / ticksToMsMultiplier) - offset
                    my.setOutputData(message);
                }
            },
            
            getPort = function() {
                return midiInput;
            },
            
            getProcessorSpecificData = function(data) {
                data.midiPortID = midiInput.id;
            };
       
        my = my || {};
        my.getProcessorSpecificData = getProcessorSpecificData;
        my.info = {
            inputs: 0,
            outputs: 1
        };
        
        that = WH.createMIDIProcessorBase(specs, my);
        
        that.process = process;
        that.getPort = getPort;
        return that;
    };
    
    var type = 'input';
    WH.midiProcessors = WH.midiProcessors || {};
    WH.midiProcessors[type] = WH.midiProcessors[type] || {};
    WH.midiProcessors[type].createProcessor = createMIDIPortIn;

})(WH);
