
const cache = {};

export default function getEuclidPattern(steps, pulses) {
    const cacheKey = `${steps}_${pulses}`;
    if (!cache[cacheKey]) {
        cache[cacheKey] = createBjorklund(steps, pulses);
    }
    return cache[cacheKey];
}

/**
 * Create Euclidean rhythm pattern.
 * @param {Number} steps Total amount of tsteps in the pattern.
 * @param {Number} pulses Pulses to spread over the pattern.
 * @return {Array} Array of Booleans that form the pattern.
 */
function createBjorklund(steps, pulses) {
    var pauses = steps - pulses;
    if (pulses >= steps) {
        return buildPatternListFilledWith(steps, true);
    } else if (steps == 1) {
        return buildPatternListFilledWith(steps, pulses == 1);
    } else if (steps == 0 || pulses == 0) {
        return buildPatternListFilledWith(steps, false);
    } else {
        let distribution = [];
        for (let i = 0; i < steps; i++) {
            distribution.push([i < pulses]);
        }
        return splitDistributionAndContinue(distribution, pauses);
    }
}

/**
 * Divide as much as possible of the remainder over the distribution arrays.
 * @param {Array} distributionArray Two dimensional array of booleans.
 * @param {Number} remainder Amount of items not yet in distribution array.
 * @return {Function} One dimensional array of booleans, the Euclidean pattern.
 */
function splitDistributionAndContinue(distributionArray, remainder) {
    let newDistributionArray = [],
        newRemainderArray = [];
    if (remainder == 0) {
        newDistributionArray = distributionArray;
    } else {
        let newDistributionSize = distributionArray.length - remainder;
        for (let i = 0, n = distributionArray.length; i < n; i++) {
            if (i < newDistributionSize) {
                newDistributionArray.push(distributionArray[i]);
            } else {
                newRemainderArray.push(distributionArray[i]);
            }
        }
    }
    return bjorklund(newDistributionArray, newRemainderArray);
}

/**
 * Divide as much as possible of the remainder over the distribution arrays.
 * @param {Object} distributionArray Two dimensional array.
 * @param {Object} remainderArray Two dimensional array.
 * @return {Object} One dimensional array of booleans, the Euclidean pattern.
 */
function bjorklund(distributionArray, remainderArray) {
    // handy for debugging
    // console.log('distributionArray', toStringArrayList(distributionArray)); 
    // console.log('remainderArray', toStringArrayList(remainderArray));
    
    if (remainderArray.length <= 1) {
        return flattenArrays([distributionArray, remainderArray]);
    } else {
        let fullRounds = Math.floor(remainderArray.length / distributionArray.length),
            remainder = remainderArray.length % distributionArray.length,
            newRemainder = remainder == 0 ? 0 : distributionArray.length - remainder;
        for (let i = 0; i < fullRounds; i++) {
            let p = distributionArray.length;
            for (let j = 0; j < p; j++) {
                distributionArray[j].push(remainderArray.shift());
            }
        }
        for (let i = 0; i < remainder; i++ ) {
            distributionArray[i].push(remainderArray.shift());
        }
        
        return splitDistributionAndContinue(distributionArray, newRemainder);
    }
}

/**
 * Create a pattern filled with only pulses or silences.
 * @param {Number} steps Total amount of tsteps in the pattern.
 * @param {Boolen} value Value to fill the array with, true for pulses.
 * @return {Array} Array of Booleans that form the pattern.
 */
function buildPatternListFilledWith(steps, value) {
    let distribution = [];
    for (let i = 0; i < steps; i++) {
        distribution.push(value);
    }
    return distribution;
}

/**
 * Flatten a multidimensional array.
 * @param {Object} arr The array to flatten.
 * @return {Object} One dimensional flattened array.
 */
function flattenArrays(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flattenArrays(toFlatten) : toFlatten);
    }, []);
}

function toStringArrayList(arrayList) {
    var str = '';
    for (let i = 0, n = arrayList.length; i < n; i++) {
        str += '[' + arrayList[i] + ']';
    }
    return str;
}