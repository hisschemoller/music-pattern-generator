/**
 * MIDI input port processor.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortIn(specs, my) {
        var that,
            midiInput = specs.midiInput,
            
            addEventListeners = function() {
                midiInput.addListener('noteon', 'all', function(e) {
                    my.setOutputData({
                        timestamp: e.receivedTime,
                        channel: e.channel,
                        type: e.type,
                        pitch: e.note.number,
                        velocity: e.rawVelocity
                    });
                });
                midiInput.addListener('noteoff', 'all', function(e) {
                    my.setOutputData({
                        timestamp: e.receivedTime,
                        channel: e.channel,
                        type: e.type,
                        pitch: e.note.number,
                        velocity: e.rawVelocity
                    });
                });
                midiInput.addListener('controlchange', 'all', function(e) {
                    my.setOutputData({
                        timestamp: e.receivedTime,
                        channel: e.channel,
                        type: e.type,
                        controller: e.controller.number,
                        value: e.value
                    });
                });
            },
                
            process = function(start, end) {
                // the midi input has nothing to process but needs this function
            };
       
        my = my || {};
        my.props = my.props || {};
        my.props.type = type;
        
        that = ns.createMIDIProcessorBase(specs, my);
        that = ns.createMIDIConnectorOut(specs, my);
        
        that.process = process;
        return that;
    };
    
    var type = 'input';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIPortIn
    };

})(WH);
