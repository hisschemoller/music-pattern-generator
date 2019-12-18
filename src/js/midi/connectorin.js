/**
 * MIDI network processor in connector.
 */
export default function createMIDIConnectorIn(data, that = {}, my = {}) {
	const sources = [],
		outputData = [],
		
		/**
		 * Collects data from all processors this input is connected to.
		 * @return {Array} MIDI event data from all connected processors.
		 */
		getInputData = function() {
			outputData.length = 0;

			sources.forEach(source => {
				source.getOutputData().forEach(data => {
					outputData.push({ ...data });
				});
			});

			return outputData;
		},
		
		/**
		 * Connect a processor as source for this processor.
		 * @param  {Object} processor Network MIDI processor.
		 */
		addConnection = function(processor) {
			sources.push(processor);
		},
		
		/**
		 * Remove a processor as source for this processor.
		 * @param  {Object} processor Network MIDI processor.
		 */
		removeConnection = function(processor) {
			let i = sources.length;
			while (--i >= 0) {
				if (processor === sources[i]) {
					sources.splice(i, 1);
					break;
				}
			}
		},
		
		/**
		 * Get number of connections.
		 * Used by the output port module to determine if 
		 * @return {Number} Number of connections to this output processor.
		 */
		hasInputConnections = function() {
			return sources.length > 0;
		};
	
	my.getInputData = getInputData;

	that.addConnection = addConnection;
	that.removeConnection = removeConnection;
	that.hasInputConnections = hasInputConnections;
	return that;
}
