const {
  CircleBufferGeometry,
  CircleGeometry,
  Color,
  Group,
  Line2,
  LineGeometry,
  LineMaterial,
  Mesh,
  MeshBasicMaterial,
  Vector2,
  VertexColors,
} = THREE;

const defaultSegments = 64;
const defaultLineWidth = 2;
const defaultLineColor = 0xdddddd;

const lineMaterial = new LineMaterial({
  color: new Color(defaultLineColor),
  linewidth: defaultLineWidth,
  vertexColors: VertexColors,
  dashed: false,
  resolution: new Vector2(window.innerWidth, window.innerHeight),
});

const textLineMaterial = lineMaterial.clone();
textLineMaterial.linewidth = 1;

/** 
 * Cache of circle outlines, so they can be cloned once created.
 * They are identified by a string made out of the radius and color.
 */
const circleCache = {};

/**
 * Recalculate material so the line thickness remains the same for vertical 
 * and horizontal lines.
 */
export function setLineMaterialResolution() {
  lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
  textLineMaterial.resolution.set(window.innerWidth, window.innerHeight);
}

/** 
 * Create a line along a path of coordinates.
 * @param {Array} points An array of Vector2 points.
 * @param {Number} points.x
 * @param {Number} points.y
 * @param {Number} color Color of the line.
 * @returns {Object} Line2 three.js object.
 */
export function createShape(points = [], color = defaultLineColor) {
  const geometry = new LineGeometry();
  const line2 = new Line2(geometry, lineMaterial);
  line2.name = 'shape';
  redrawShape(line2, points, color);
  return line2;
}

/**
 *Create text with a thinner line.
 * @param {Array} points An array of point objects.
 * @param {Number} points.x
 * @param {Number} points.y
 * @param {String} Character
 * @param {Number} color Color of the line.
 * @returns {Object} Line2 three.js object.
 */
export function createText(points, character, color = defaultLineColor) {
  const geometry = new LineGeometry();
  const line2 = new Line2(geometry, textLineMaterial);
  line2.name = `text_${character}`;
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
    line2.geometry.dispose();
    line2.geometry = new LineGeometry();
    line2.geometry.setPositions(positions);
    line2.geometry.setColors(colors);
    line2.computeLineDistances();
    line2.scale.set(1, 1, 1);
    line2.userData.points = points;
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
    const clone = circleCache[cacheId].clone();
    clone.userData = { ...circleCache[cacheId].userData };
    return clone;
  }
  
  // create a circle, just for it's vertice points
  const circle = new CircleGeometry(radius, defaultSegments);
  const vertices = circle.vertices;

  // remove first point which is the center of the circle
  vertices.shift();

  // copy the first to the end so the cirle is closed
  vertices.push(vertices[0].clone());

  // create the geometry and line
  const geometry = new LineGeometry();
  const line2 = new Line2(geometry, lineMaterial);
  line2.name = 'circle_outline';
  redrawShape(line2, vertices, color);

  // add the circle to the cache
  circleCache[cacheId] = line2;

  return line2;
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
  const geometry = new CircleBufferGeometry(radius, numSegments);              
  material.opacity = alpha;
  const fill = new Mesh(geometry, material);
  fill.name = 'circle_fill';
  return fill;
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
  circle.name = 'circle_outline_and_fill';
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

  const hitarea = createCircleFilled(2, color, 0);
  hitarea.name = name;
  hitarea.userData.id = id;
  hitarea.translateX(data.x);
  hitarea.translateY(data.y);
  rootObj.add(hitarea);

  const connector = createCircleOutline(0.6, color);
  connector.name = 'connector';
  hitarea.add(connector);

  const active = createCircleOutline(1.2, color);
  active.name = 'active';
  active.visible = false;
  hitarea.add(active);
}
