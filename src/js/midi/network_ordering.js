
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
 * Test if a connection between source and destination causes an infinite loop.
 * @param {Object} state Application state.
 * @param {String} sourceId Source processor ID.
 * @param {String} destinationId Destination processor ID.
 * @returns {Boolean} True if an infinite loop would be created.
 */
export function testForInfiniteLoop(state, sourceId, destinationId) {
  const nodes = createNodes(state);
  const node = nodes.find(node => node.id === sourceId);
  return followUpStream(node, nodes, destinationId);
}

/**
 * Recursively follow the processor nodes by source.
 * @param {Object} node Processor node.
 * @param {Array} nodes All processor nodes, unordered.
 * @param {String} destinationId Destination processor ID.
 */
function followUpStream(node, nodes, destinationId) {
  if (node.id === destinationId) {
    return true;
  } else {
    for (let i = 0, n = node.sourceIds.length; i < n; i++) {
      const sourceId = node.sourceIds[i];
      if (sourceId === destinationId) {
        return true;
      } else {
        const nextNode = nodes.find(node => node.id === sourceId);
        return followUpStream(nextNode, nodes, destinationId);
      }
    }
  }
  return false;
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
 * @returns {Array} Processor node objects containing only IDs.  
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
    if (connection.destinationProcessorId === processorId) {
      return [...sourceIds, connection.sourceProcessorId];
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
    if (connection.sourceProcessorId === processorId) {
      return [...destinationIds, connection.destinationProcessorId];
    };
    return destinationIds;
  }, []);
}