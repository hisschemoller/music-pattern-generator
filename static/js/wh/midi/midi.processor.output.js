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
                var inputData = my.getInputData();
                console.log('MIDIPortOut inputData', inputData);
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
