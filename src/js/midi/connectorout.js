/**
 * MIDI network processor out connector.
 */
export default function createMIDIConnectorOut() {
	const outputData = [],
		destinations = [],

		/**
		 * Clear the output stack when event processing starts.
		 */
		clearOutputData = function() {
			outputData.length = 0;
		},
		
		/**
		 * Set output data that is the result of this processor's processing.
		 * It will be collected by the processors attached to this output.
		 * @param {Object} eventData MIDI event data.
		 */
		setOutputData = function(eventData) {
			outputData.push(eventData);
		},
		
		/**
		 * Public function for processors connected to this output to
		 * collect the data this processor's process function has produced.
		 * @return {Object} MIDI event data.
		 */
		getOutputData = function() {
			return outputData;
		},
		
		/**
		 * Connect this processor's output to another processor's input.
		 * @param {Object} processor Processor to connect to.
		 */
		connect = function(processor) {
			const isConnected = destinations.find(destination => destination === processor);
			if (!isConnected) {
				processor.addConnection(getOutputData);
				destinations.push(processor);
			}
		},
		
		/**
		 * Disconnect this processor's output from another processor's input.
		 * @param {Object} processor Processor to disconnect from, or undefined to remove all.
		 */
		disconnect = function(processor) {
			let n = destinations.length;
			while (--n >= 0) {
				if (!processor || (processor && processor === destinations[n])) {
					destinations[n].removeConnection(getOutputData);
					destinations.splice(n, 1);
				}
			}
		},
		
		/**
		 * Get destination processors.
		 * Used to draw the connection cables on canvas.
		 * @return {Array} Processors this output connects to.
		 */
		getDestinations = function() {
			return destinations;
		};
	
	return {
		clearOutputData,
		connect,
		disconnect,
		getDestinations,
		getOutputData,
		setOutputData,
	};
}
