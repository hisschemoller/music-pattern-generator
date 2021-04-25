/**
 * MIDI network processor in connector.
 */
export default function createMIDIConnectorIn() {
	const sources = [],
		outputData = [],
		
		/**
		 * Collects data from all processors this input is connected to.
		 * @return {Array} MIDI event data from all connected processors.
		 */
		getInputData = function() {
			outputData.length = 0;

			sources.forEach(outputDataFunction => {
				outputDataFunction().forEach(data => {
					outputData.push({ ...data });
				});
			});

			return outputData;
		},
		
		/**
		 * Connect another processor as source for this processor.
		 * @param {Function} outputDataFunction Data provider on another processor's output connector.
		 */
		addConnection = function(outputDataFunction) {
			sources.push(outputDataFunction);
		},
		
		/**
		 * Remove another processor that is a source for this processor.
		 * @param {Function} outputDataFunction Data provider on another processor's output connector.
		 */
		removeConnection = function(outputDataFunction) {
			let i = sources.length;
			while (--i >= 0) {
				if (outputDataFunction === sources[i]) {
					sources.splice(i, 1);
					break;
				}
			}
		};

	return {
		addConnection,
		getInputData,
		removeConnection,
	};
}
