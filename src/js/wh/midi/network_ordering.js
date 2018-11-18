import orderProcessorsNew from './network_ordering_new.js';

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
        const nameA = state.processors.byId[a].params.byId['name'].value;
        const nameB = state.processors.byId[b].params.byId['name'].value;
        console.log('---');
        console.log('start sort');
        console.log(`start search '${nameA}'`);
        console.log(`start search '${nameB}'`);
        if (searchUpStream(a, b, state)) {
            console.log(`1, source '${nameB}' to destination '${nameA}'`);
            return 1;
        } else if (searchDownStream(a, b, state)) {
            console.log(`-1, source '${nameA}' to destination '${nameB}'`);
            return -1;
        } else {
            console.log(`0, no stream between '${nameA}' and '${nameB}'`);
            return 0;
        }
    });
    logResult(state);
    orderProcessorsNew(state);
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

function logResult(state) {
    console.log('===========');
    console.log('PROCESSOR ORDER');
    console.log('-----------');
    state.processors.allIds.forEach(id => {
        console.log(state.processors.byId[id].params.byId['name'].value);
    });
    console.log('===========');
}