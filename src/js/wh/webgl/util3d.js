import {
  CircleGeometry,
  Geometry,
  Line,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from '../../lib/three.module.js';

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
 * Create a circle fill.
 * @param {number} color Fill color.
 */
export function createCircleFilled(color, radius) {
  let numSegments = 8,
    material = new MeshBasicMaterial({
      color,
      transparent: true,
    }),
    geometry = new CircleGeometry(radius, numSegments);              

  material.opacity = 1.0;
  return new Mesh(geometry, material);
}

/**
 * Create circle with outline and fill.
 * @param {object} circleOutline Circle outline 3D object.
 * @param {object} circleFill Circle fill 3D object.
 * @return {object} Line 3D object.
 */
export function createCircleOutlineFilled(lineMaterial, color, radius) {
  var circle = new Object3D();
  circle.add(createCircleFilled(color, radius));
  circle.add(createCircleOutline(lineMaterial, radius));
  return circle;
}

/**
 * Add input and/or output connectors to a processor  .
 * @return {rootObj} Outer object3D.
 */
export function drawConnectors(rootObj, inputs, outputs, lineMaterial) {

  // inputs
  inputs.allIds.forEach(id => {
    const input = inputs.byId[id];
    const connector = createCircleOutline(lineMaterial, 0.6);
    connector.name = 'input';
    connector.userData.id = id;
    connector.translateX(input.x);
    connector.translateY(input.y);
    rootObj.add(connector);
  });

  // outputs
  outputs.allIds.forEach(id => {
    const output = outputs.byId[id];
    const connector = createCircleOutline(lineMaterial, 0.6);
    connector.name = 'output';
    connector.userData.id = id;
    connector.translateX(output.x);
    connector.translateY(output.y);
    rootObj.add(connector);
  });
}
