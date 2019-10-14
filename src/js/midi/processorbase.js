import createMIDIConnectorIn from './connectorin.js';
import createMIDIConnectorOut from './connectorout.js';

/**
 * Base functionality for all MIDI processors.
 */
export default function createMIDIProcessorBase(data, that = {}, my = {}) {
	const getType = () => {
				return my.type;
		},
		
		getID = () => {
				return my.id;
		};
	
	my.type = data.type;
	my.id = data.id;

	if (data.inputs.allIds.length >= 1) {
		that = createMIDIConnectorIn(data, that, my);
	}
	if (data.outputs.allIds.length >= 1) {
		that = createMIDIConnectorOut(data, that, my);
	}
	that.getType = getType;
	that.getID = getID;
	
	return that;
}
