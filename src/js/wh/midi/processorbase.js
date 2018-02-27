import createMIDIConnectorIn from './connectorin';
import createMIDIConnectorOut from './connectorout';

/**
 * Base functionality for all MIDI processors.
 */
export default function createMIDIProcessorBase(specs, my) {
    var that,
        
        getType = function() {
            return my.type;
        },
        
        getID = function() {
            return my.id;
        };
    
    my = my || {};
    my.type = specs.data.type,
    my.id = specs.data.id,
    my.params = specs.data.params.byId;
    
    that = specs.that || {};
    if (specs.data.inputs.allIds.length >= 1) {
        that = createMIDIConnectorIn(specs, my);
    }
    if (specs.data.outputs.allIds.length >= 1) {
        that = createMIDIConnectorOut(specs, my);
    }
    that.getType = getType;
    that.getID = getID;
    
    return that;
}
