
/**
 * 
 * @param {Object} state Application state.
 */
export default function orderProcessors(state) {
  const ordered = [];
  const nodes = createNodes(state);
  nodes.forEach(node => {
    if (node.sourceIds.length === 0) {
      followDownStream(node, nodes, ordered);
    }
  });
  
  state.processors.allIds = [ ...ordered ];
}

/**
 * Recursively follow the processor nodes by destination.
 * @param {Object} node Processor node.
 * @param {Array} nodes All processor nodes, unordered.
 * @param {Array} ordered Ordered processor IDs.
 */
function followDownStream(node, nodes, ordered) {
  ordered.push(node.id);
  node.destinationIds.forEach(destinationId => {
    const nextNode = nodes.find(node => node.id === destinationId);
    if (nextNode.sourceIds.length === 1) {
      followDownStream(nextNode, nodes, ordered);
    } else if (nextNode.sourceIds.length > 1) {
      const isAllSourcesOrdered = nextNode.sourceIds.every(sourceId => {
        return ordered.indexOf(sourceId) > -1;
      });
      if (isAllSourcesOrdered) {
        followDownStream(nextNode, nodes, ordered);
      }
    }
  });
}

/**
 * Create node objects from state processor and connection data.
 * @param {Object} state Application state.
 */
function createNodes(state) {
  return state.processors.allIds.map(id => {
    return {
      id,
      sourceIds: getSourceIds(id, state.connections),
      destinationIds: getDestinationIds(id, state.connections),
    };
  });
}

/**
 * Find all processors connected to the processor's input.
 * @param {String} processorId Processor ID.
 * @param {Object} connections State connections data.
 * @returns {Array} Processor IDs.
 */
function getSourceIds(processorId, connections) {
  return connections.allIds.reduce((sourceIds, connectionId) => {
    const connection = connections.byId[connectionId];
    if (connection.destinationProcessorID === processorId) {
      return [...sourceIds, connection.sourceProcessorID];
    };
    return sourceIds;
  }, []);
}

/**
 * Find all processors connected to the processor's output.
 * @param {String} processorId Processor ID.
 * @param {Object} connections State connections data.
 * @returns {Array} Processor IDs.
 */
function getDestinationIds(processorId, connections) {
  return connections.allIds.reduce((destinationIds, connectionId) => {
    const connection = connections.byId[connectionId];
    if (connection.sourceProcessorID === processorId) {
      return [...destinationIds, connection.destinationProcessorID];
    };
    return destinationIds;
  }, []);
}