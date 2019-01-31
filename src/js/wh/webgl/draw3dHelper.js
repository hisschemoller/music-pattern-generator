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
const defaultLineWidth = 0.0015;
const defaultLineColor = 0xdddddd;

const lineMaterial = new LineMaterial({
  color: new Color(defaultLineColor),
  linewidth: defaultLineWidth,
  vertexColors: VertexColors,
  dashed: false,
});

const textLineMaterial = lineMaterial.clone();
textLineMaterial.linewidth = 0.001;

/** 
 * Cache of circle outlines, so they can be cloned once created.
 * They are identified by a string made out of the radius and color.
 */
const circleCache = {};

/** 
 * Create a line along a path of coordinates.
 * @param {Array} points An array of point objects.
 * @param {Number} points.x
 * @param {Number} points.y
 * @param {Number} color Color of the line.
 * @returns {Object} Line2 three.js object.
 */
export function createShape(points = [], color = defaultLineColor) {
  const geometry = new LineGeometry();
  const line2 = new Line2(geometry, lineMaterial);
  redrawShape(line2, points, color);
  return line2;
}

/**
 *Create text with a thinner line.
 * @param {Array} points An array of point objects.
 * @param {Number} points.x
 * @param {Number} points.y
 * @param {Number} color Color of the line.
 * @returns {Object} Line2 three.js object.
 */
export function createText(points, color = defaultLineColor) {
  const geometry = new LineGeometry();
  const line2 = new Line2(geometry, textLineMaterial);
  redrawShape(line2, points, color);
  return line2;
}

/** 
 * Draw a line along a path of coordinates on an existing Line2.
 * @param {Object} line2 Line2 mesh line.
 * @param {Array} points An array of point objects.
 * @param {Number} points.x
 * @param {Number} points.y
 * @param {Number} color Color of the line.
 * @returns {Object} Line2 three.js object.
 */
export function redrawShape(line2, points = [], color = defaultLineColor) {
  if (points.length) {
    const col = new Color(color);
    const positions = points.reduce((acc, p) => [ ...acc, p.x, p.y, 0 ], []);
    const colors = points.reduce((acc, p) => [ ...acc, col.r, col.g, col.b ], []);
    line2.geometry = new LineGeometry();
    line2.geometry.setPositions(positions);
    line2.geometry.setColors(colors);
    line2.computeLineDistances();
  }

  return line2;
}

/** 
 * Draw a circle outline.
 * @param {Number} radius Circle radius.
 * @param {Number} color Circle color.
 * @return {Object} Line2 3D object.
 */
export function createCircleOutline(radius, color = defaultLineColor) {

  // check if the circle already exists in cache
  const cacheId = `c${radius}_${color}`;
  if (circleCache[cacheId]) {
    return circleCache[cacheId].clone();
  }

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

  // add the circle to the cache
  circleCache[cacheId] = line;

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
export function drawConnectors(rootObj, inputs, outputs, color) {

  // inputs
  inputs.allIds.forEach(id => {
    drawConnector(inputs.byId[id], id, 'input', rootObj, color);
  });

  // outputs
  outputs.allIds.forEach(id => {
    drawConnector(outputs.byId[id], id, 'output', rootObj, color);
  });
}

/**
 * Add input and/or output connector to a processor.
 * @param {Object} data Input or output data.
 * @param {String} id Connector ID.
 * @param {String} name Connector name.
 * @param {Object} rootObj Outer object3D.
 */
function drawConnector(data, id, name, rootObj, color) {
  const connector = createCircleOutline(0.6, color);
  connector.name = name;
  connector.userData.id = id;
  connector.translateX(data.x);
  connector.translateY(data.y);
  rootObj.add(connector);

  const active = createCircleOutline(1.2, color);
  active.name = 'active';
  active.visible = false;
  connector.add(active);
}
