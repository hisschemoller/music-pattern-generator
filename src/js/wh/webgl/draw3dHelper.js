const {
  CircleGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  LineGeometry,
  LineMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  VertexColors,
} = THREE;

const defaultSegments = 64;
const defaultLineWidth = 0.003; // in pixels ???
const defaultLineColor = new Color(0xcccccc);

const lineMaterial = new LineMaterial({
  color: defaultLineColor,
  linewidth: defaultLineWidth,
  vertexColors: VertexColors,
  dashed: false,
});

/** 
 * 
 */
export function createCircleOutline(radius, color) {
  const col = new Color(color);
  
  // create a circle, just for it's vertice points
  const circle = new CircleGeometry(radius, defaultSegments);
  const vertices = circle.vertices;

  // remove first point which is the center of the circle
  vertices.shift();
console.log(radius);
  // copy the first to the end so the cirle is closed
  vertices.push(vertices[0].clone());

  // create the geometry and line
  const positions = vertices.reduce((acc, v) => [ ...acc, v.x, v.y, v.z ], []);
  const colors = vertices.reduce((acc, v) => [ ...acc, col.r, col.g, col.b ], []);
  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);
  const line = new THREE.Line2(geometry, lineMaterial);
  line.computeLineDistances();
  return line;
}
    
/**
 * Create a circle fill.
 * @param {number} color Fill color.
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
