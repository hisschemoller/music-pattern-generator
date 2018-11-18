/**
 * Search for all processors that have no input connectors
 * or that have nothing connected to their inputs.
 * 
 *          o         o   o
 *          |          \ /
 *          o           o
 *         / \          |
 *        o   o         o
 *        
 */



/**
 * 
 * @param {Object} state Application state.
 */
export default function orderProcessorsNew(state) {
  const nodes = createNodes(state);
  const streams = createStreams(nodes);
  orderStreams(streams);
  console.log('nodes', nodes);
  console.log('streams', streams);
}

function orderStreams(streams) {

}

/**
 * Create array of stream objects.
 * @param {Array} allNodes 
 */
function createStreams(allNodes) {
  const streams = [];
  allNodes.forEach(node => {
    
    // search start and join nodes
    if (node.sourceIds.length === 0 || node.sourceIds.length > 1) {
      const streamNodes = createStreamNodes(node, allNodes);
      streams.push({
        nodes: streamNodes,
        sourceIds: streamNodes[0].sourceIds,
        destinationIds: streamNodes[streamNodes.length - 1].destinationIds,
      });
    }
  })
  return streams;
}

function createStreamNodes(startNode, allNodes) {
  let loopCount = 0;
  let currentNode = startNode;
  currentNode.isInStream = true;
  const streamNodes = [ currentNode ];

  while (currentNode) {
    const nextNode = allNodes.find(node => node.id === currentNode.destinationIds[0]);
    currentNode = null;
    if (nextNode && nextNode.sourceIds.length === 1) {
      currentNode = nextNode;
      currentNode.isInStream = true;
      streamNodes.push(currentNode);
      if (loopCount++ > 100) {
        console.warn('Loop count maximum exceeded.');
        break;
      }
    }
  }
  return streamNodes;

  // console.log('begin', currentNode);
  // while (currentNode.destinationIds.length === 1) {
  //   console.log('dest', currentNode.destinationIds);
  //   currentNode = allNodes.find(node => node.id === currentNode.destinationIds[0]);
  //   currentNode.isInStream = true;
  //   streamNodes.push(currentNode);
  //   if (loopCount++ > 100) {
  //     console.warn('Loop count maximum exceeded.');
  //     break;
  //   }
  // }
  // return streamNodes;
}

/**
 * Create node data objects from processors and connections.
 * @param {Object} state Application state.
 */
function createNodes(state) {
  const nodes = state.processors.allIds.map(id => {
    const processor = state.processors.byId[id];
    return {
      id,
      sourceIds: getSourceIds(id, state.connections),
      destinationIds: getDestinationIds(id, state.connections),
      isInStream: false,
    };
  });
  return nodes;
}

function getSourceIds(processorId, connections) {
  return connections.allIds.reduce((sourceIds, connectionId) => {
    const connection = connections.byId[connectionId];
    if (connection.destinationProcessorID === processorId) {
      return [...sourceIds, connection.sourceProcessorID];
    };
    return sourceIds;
  }, []);
}

function getDestinationIds(processorId, connections) {
  return connections.allIds.reduce((destinationIds, connectionId) => {
    const connection = connections.byId[connectionId];
    if (connection.sourceProcessorID === processorId) {
      return [...destinationIds, connection.destinationProcessorID];
    };
    return destinationIds;
  }, []);
}

