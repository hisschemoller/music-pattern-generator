const maxDepth = 100;

/**
 * Order thee processors according to their connections
 * to optimise the flow from inputs to outputs.
 * 
 * Rule: when connected, the source goes before the destination
 * 
 * @param {Object} state The whole state object.
 */
export default function orderProcessors(state) {
    console.log('ORDER', state.processors.allIds.length);
    state.processors.allIds.sort((a, b) => {
        console.log('---');
        console.log('start sort');
        console.log('start search a', a);
        console.log('start search b', b);
        if (searchUpStream(a, b, state)) {
            console.log(`1, source ${b} to destination ${a}`);
            return 1;
        } else if (searchDownStream(a, b, state)) {
            console.log(`-1, source ${a} to destination ${b}`);
            return -1;
        } else {
            console.log(`0, no stream between ${a} and ${b}`);
            return 0;
        }
    });
}

function searchUpStream(a, b, state, depth = 0) {
    if (depth >= maxDepth) {
        console.log(`Error: maximum (${maxDepth}) recursions reached while searching source.`);
        return false;
    }
    const sources = getSources(a, state);
    for (let i = 0, n = sources.length; i < n; i++) {
        if (sources[i] === b) {
            console.log('found upstream');
            return true;
        } else {
            return searchUpStream(sources[i], b, state, depth + 1);
        }
    }
    console.log('not found upstream');
    return false;
}

function searchDownStream(a, b, state, depth = 0) {
    if (depth >= maxDepth) {
        console.log(`Error: maximum (${maxDepth}) recursions reached while searching destination.`);
        return false;
    }
    const destinations = getDestinations(a, state);
    for (let i = 0, n = destinations.length; i < n; i++) {
        if (destinations[i] === b) {
            console.log('found downstream');
            return true;
        } else {
            return searchDownStream(destinations[i], b, state, depth + 1);
        }
    }
    console.log('not found downstream');
    return false;
}

function getSources(processorID, state) {
    const sourceIDs = [];
    state.connections.allIds.forEach(connectionID => {
        const connection = state.connections.byId[connectionID];
        if (connection.destinationProcessorID === processorID) {
            sourceIDs.push(connection.sourceProcessorID);
        }
    });
    return sourceIDs;
}

function getDestinations(processorID, state) {
    const destinationIDs = [];
    state.connections.allIds.forEach(connectionID => {
        const connection = state.connections.byId[connectionID];
        if (connection.sourceProcessorID === processorID) {
            destinationIDs.push(connection.destinationProcessorID);
        }
    });
    return destinationIDs;
}
