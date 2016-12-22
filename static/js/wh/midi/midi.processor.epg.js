/**
 * MIDI processor o generate Euclidean rhythm patterns.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorEPG(specs, my) {
        var that,
            noteOffEvents = [],
            
            /**
             * [process description]
             * @param {Number} start Timespan start in ticks from timeline start.
             * @param {Number} end   Timespan end in ticks from timeline start.
             */
            process = function(start, end) {
                
                // check for scheduled note off events
                var i = noteOffEvents.length;
                while (--i > -1) {
                    var noteOffTime = noteOffEvents[i].timestamp;
                    if (start <= noteOffTime && end > noteOffTime) {
                        my.setOutputData(noteOffEvents.splice(i, 1)[0]);
                    }
                }
                
                // once a second 
                if (start % 1000 > end % 1000 || start % 1000 == 0 ) {
                    
                    // note event with duration of 500ms
                    var noteOnEvent = {
                        timestamp: start,
                        channel: my.props.channel,
                        type: 'noteon',
                        pitch: my.props.pitch,
                        velocity: my.props.velocity
                    }
                    var noteOffEvent = {
                        timestamp: start + 500,
                        channel: my.props.channel,
                        type: 'noteoff',
                        pitch: my.props.pitch,
                        velocity: 0
                    }
                    
                    noteOffEvents.push(noteOffEvent);
                    my.setOutputData(noteOnEvent);
                }
            };
       
        my = my || {};
        my.props = my.props || {};
        my.props.type = type;
        my.props.position3d = specs.position3d || null;
        my.props.channel = 1;
        my.props.pitch = 60;
        my.props.velocity = 100;

        that = ns.createMIDIProcessorBase(specs, my);
        that = ns.createMIDIConnectorIn(specs, my);
        that = ns.createMIDIConnectorOut(specs, my);
        
        that.process = process;
        return that;
    };
    
    var type = 'epg';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIProcessorEPG
    };

})(WH);
