/**
 * Utilities
 * 
 * Mouse or touch event detection.
 */
export const isTouchDevice = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;

/**
 * Type of events to use, touch or mouse
 * @type {String}
 */
export const eventType = {
  start: isTouchDevice ? 'touchstart' : 'mousedown',
  end: isTouchDevice ? 'touchend' : 'mouseup',
  click: isTouchDevice ? 'touchend' : 'click',
  move: isTouchDevice ? 'touchmove' : 'mousemove',
};

/**
 * Create a fairly unique ID.
 * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
export function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Provide a default processor name.
 * @param {Object} processor Processor to name.
 * @return {String} Name for a newly created processor.
 */
export function getProcessorDefaultName(processors) {
	let name, number, spaceIndex, 
		highestNumber = 0,
		staticName = 'Processor';
	processors.allIds.forEach(id => {
		name = processors.byId[id].params.byId.name.value;
		if (name && name.indexOf(staticName) == 0) {
			spaceIndex = name.lastIndexOf(' ');
			if (spaceIndex != -1) {
				number = parseInt(name.substr(spaceIndex), 10);
				if (!isNaN(number)) {
					highestNumber = Math.max(highestNumber, number);
				}
			}
		}
	});
	return `${staticName} ${highestNumber + 1}`;
}

/**
 * Convert a MIDI control value to a parameter value, depending on the parameter type.
 * @param {Object} param Processor parameter.
 * @param {Number} controllerValue MIDI controller value in the range 0 to 127.
 */
export function midiControlToParameterValue(param, controllerValue) {
	const normalizedValue = controllerValue / 127;
	switch (param.type) {
		case 'integer':
			return Math.round(param.min + (param.max - param.min) * normalizedValue);
		case 'boolean':
			return normalizedValue > .5;
		case 'itemized':
			if (normalizedValue === 1) {
				return param.model[param.model.length - 1].value;
			}
			return param.model[Math.floor(normalizedValue * param.model.length)].value;
		case 'object':
		case 'position':
		case 'string':
		default:
			return param.value;
	}
}

/**
 * Convert a MIDI note velocity to a parameter value, depending on the parameter type.
 * @param {Object} param Processor parameter.
 * @param {Number} velocity MIDI note velocity in the range 0 to 127.
 */
export function midiNoteToParameterValue(param, velocity) {
	const normalizedValue = velocity / 127;
	switch (param.type) {
		case 'integer':
			return Math.round(param.min + (param.max - param.min) * normalizedValue);
		case 'boolean':
			return !param.value;
		case 'itemized':
			if (normalizedValue === 1) {
				return param.model[param.model.length - 1].value;
			}
			return param.model[Math.floor(normalizedValue * param.model.length)].value;
		case 'string':
		case 'position':
		default:
			return param.value;
	}
}
