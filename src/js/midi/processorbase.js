import createMIDIConnectorIn from './connectorin.js';
import createMIDIConnectorOut from './connectorout.js';

/**
 * Base functionality for all MIDI processors.
 */
export default function createMIDIProcessorBase(data) {
	const { id, type } = data;
	
	const getType = () => {
			return type;
		},
		
		getId = () => {
			return id;
		};
	
	let api = {
		getId,
		getType,
		id,
		type,
	};

	if (data.inputs.allIds.length >= 1) {
		api = { ...api, ...createMIDIConnectorIn() };
	}
	if (data.outputs.allIds.length >= 1) {
		api = { ...api, ...createMIDIConnectorOut() };
	}
	
	return api;
}
