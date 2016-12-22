/**
 * MIDI output port processor.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortOut(specs, my) {
        var that,
            midiOutput = specs.midiOutput,
                
            process = function(start, end) {
                var inputData = my.getInputData(),
                    n = inputData.length;
                
                for (var i = 0; i < n; i++) {
                    var item = inputData[i];
                    switch (item.type) {
                        case 'noteon':
                            midiOutput.send(0x90 + (item.channel - 1), [item.pitch, item.velocity], item.timestamp);
                            break;
                        case 'noteoff':
                            midiOutput.send(0x80 + (item.channel - 1), [item.pitch, 0], item.timestamp);
                            break;
                    }
                }
            };
        
       
        my = my || {};
        my.props = my.props || {};
        my.props.type = type;
        
        that = ns.createMIDIProcessorBase(specs, my);
        that = ns.createMIDIConnectorIn(specs, my);
        
        that.process = process;
        return that;
    };
    
    var type = 'output';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIPortOut
    };

})(WH);
