/**
 * MIDI processor o generate Euclidean rhythm patterns.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorEPG(specs, my) {
        var that,
            
            process = function(start, end) {
                
            };
       
        my = my || {};
        my.props = my.props || {};
        my.props.type = type;
        my.props.position3d = specs.position3d || null;

        that = ns.createMIDIProcessorBase(specs, my);
        that = ns.createMIDIConnectorOut(specs, my);
        
        return that;
    };
    
    var type = 'epg';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIProcessorEPG
    };

})(WH);
