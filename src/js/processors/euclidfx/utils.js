/**
 * Euclidean pattern calculation by Michael Kontogiannis:
 * https://github.com/mkontogiannis/euclidean-rhythms
 * based on a Python script from disappeared website 
 * http://www.atonalmicroshores.com/
 */

const cache = {};

export function getEuclidPattern(steps, pulses) {
	pulses = Math.min(steps, pulses);
	const cacheKey = `${steps}_${pulses}`;
	if (!cache[cacheKey]) {
		cache[cacheKey] = createBjorklund(steps, pulses);
	}
	return cache[cacheKey].slice(0);
}

export function rotateEuclidPattern(pattern, rotation) {
	const elementsToShift = pattern.splice(pattern.length - rotation);
	return elementsToShift.concat(pattern);
}

/**
 * Create Euclidean rhythm pattern.
 * @param {Number} steps Total amount of tsteps in the pattern.
 * @param {Number} pulses Pulses to spread over the pattern.
 * @return {Array} Array of Booleans that form the pattern.
 */
function createBjorklund(steps, pulses) {
	if (pulses < 0 || steps < 0 || steps < pulses) {
		return [];
	}

	// Create the two arrays
	let first = new Array(pulses).fill([1]);
	let second = new Array(steps - pulses).fill([0]);

	let firstLength = first.length;
	let minLength = Math.min(firstLength, second.length);

	let loopThreshold = 0;
	// Loop until at least one array has length gt 2 (1 for first loop)
	while (minLength > loopThreshold) {

		// Allow only loopThreshold to be zero on the first loop
		if (loopThreshold === 0) {
			loopThreshold = 1;
		}

		// For the minimum array loop and concat
		for (let x = 0; x < minLength; x++) {
			first[x] = Array.prototype.concat.call(first[x], second[x]);
		}

		// if the second was the bigger array, slice the remaining elements/arrays and update
		if (minLength === firstLength) {
			second = Array.prototype.slice.call(second, minLength);
		}
		// Otherwise update the second (smallest array) with the remainders of the first
		// and update the first array to include onlt the extended sub-arrays
		else {
			second = Array.prototype.slice.call(first, minLength);
			first = Array.prototype.slice.call(first, 0, minLength);
		}
		firstLength = first.length;
		minLength = Math.min(firstLength, second.length);
	}

	// Build the final array
	let pattern = [];
	first.forEach(f => {
		pattern = Array.prototype.concat.call(pattern, f);
	});
	second.forEach(s => {
		pattern = Array.prototype.concat.call(pattern, s);
	});

	return pattern;
}
