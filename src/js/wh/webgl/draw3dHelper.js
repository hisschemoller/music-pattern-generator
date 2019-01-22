const {
  CircleGeometry,
  Color,
  Group,
  Line2,
  LineGeometry,
  LineMaterial,
  Mesh,
  MeshBasicMaterial,
  VertexColors,
} = THREE;

const defaultSegments = 64;
const defaultLineWidth = 0.003;
const defaultLineColor = new Color(0xdddddd);

const lineMaterial = new LineMaterial({
  color: defaultLineColor,
  linewidth: defaultLineWidth,
  vertexColors: VertexColors,
  dashed: false,
});

export function createShape(points, color) {
  const col = new Color(color);

  const positions = points.reduce((acc, p) => [ ...acc, p.x, p.y, 0 ], []);
  const colors = points.reduce((acc, p) => [ ...acc, col.r, col.g, col.b ], []);
  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);
  const line = new Line2(geometry, lineMaterial);
  line.computeLineDistances();
  return line;
}

/** 
 * Draw a circle outline.
 * @param {Number} radius Circle radius.
 * @param {Number} color Circle color.
 * @return {Object} Line2 3D object.
 */
export function createCircleOutline(radius, color) {
  const col = new Color(color);
  
  // create a circle, just for it's vertice points
  const circle = new CircleGeometry(radius, defaultSegments);
  const vertices = circle.vertices;

  // remove first point which is the center of the circle
  vertices.shift();

  // copy the first to the end so the cirle is closed
  vertices.push(vertices[0].clone());

  // create the geometry and line
  const positions = vertices.reduce((acc, v) => [ ...acc, v.x, v.y, v.z ], []);
  const colors = vertices.reduce((acc, v) => [ ...acc, col.r, col.g, col.b ], []);
  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);
  const line = new Line2(geometry, lineMaterial);
  line.computeLineDistances();
  return line;
}

function drawLine(points, color) {

}

/** 
 * Draw a circle fill.
 * @param {Number} radius Circle radius.
 * @param {Number} color Circle color.
 * @return {Object} Mesh 3D object.
 */
export function createCircleFilled(radius, color, alpha = 1) {
  const numSegments = 8;
  const material = new MeshBasicMaterial({ color, transparent: true, });
  const geometry = new CircleGeometry(radius, numSegments);              
  material.opacity = alpha;
  return new Mesh(geometry, material);
}

/**
 * Create circle with outline and fill.
 * @param {Number} radius Circle radius.
 * @param {Number} color Circle color.
 * @return {object} Group 3D object.
 */
export function createCircleOutlineFilled(radius, color) {
  var circle = new Group();
  circle.add(createCircleFilled(radius, color));
  circle.add(createCircleOutline(radius, color));
  return circle;
}

/**
 * Add input and/or output connectors to a processor.
 * @param {Object} rootObj Outer object3D.
 * @param {Array} inputs Inputs to draw a connector for.
 * @param {Array} outputs Outputs to draw a connector for.
 */
export function drawConnectors(rootObj, inputs, outputs) {

  // inputs
  inputs.allIds.forEach(id => {
    drawConnector(inputs.byId[id], id, 'input', rootObj);
  });

  // outputs
  outputs.allIds.forEach(id => {
    drawConnector(outputs.byId[id], id, 'output', rootObj);
  });
}

/**
 * Add input and/or output connector to a processor.
 * @param {Object} data Input or output data.
 * @param {String} id Connector ID.
 * @param {String} name Connector name.
 * @param {Object} rootObj Outer object3D.
 */
function drawConnector(data, id, name, rootObj) {
  const connector = createCircleOutline(0.6);
  connector.name = name;
  connector.userData.id = id;
  connector.translateX(data.x);
  connector.translateY(data.y);
  rootObj.add(connector);

  const active = createCircleOutline(1.2);
  active.name = 'active';
  active.visible = false;
  connector.add(active);
}
