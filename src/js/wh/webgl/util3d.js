const {
  CircleGeometry,
  Line,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} = THREE;

/**
 * Create a circle outline.
 * @param {Object} lineMaterial
 * @param {Number} radius
 */
export function createCircleOutline(lineMaterial, radius) {
  var numSegments = 64,
    geometry = new CircleGeometry(radius, numSegments);
  
  geometry.vertices.shift();
  return new Line(geometry, lineMaterial);
}

/**
 * Add input and/or output connectors to a processor  .
 * @return {rootObj} Outer object3D.
 */
export function drawConnectors(rootObj, inputs, outputs, lineMaterial) {

  // inputs
  inputs.allIds.forEach(id => {
    drawConnector(inputs.byId[id], id, 'input', rootObj, lineMaterial);
  });

  // outputs
  outputs.allIds.forEach(id => {
    drawConnector(outputs.byId[id], id, 'output', rootObj, lineMaterial);
  });
}

function drawConnector(data, id, name, rootObj, lineMaterial) {
  const connector = createCircleOutline(lineMaterial, 0.6);
  connector.name = name;
  connector.userData.id = id;
  connector.translateX(data.x);
  connector.translateY(data.y);
  rootObj.add(connector);

  const active = createCircleOutline(lineMaterial, 1.2);
  active.name = 'active';
  active.visible = false;
  connector.add(active);
}
