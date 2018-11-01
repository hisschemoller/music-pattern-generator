import {
  CircleGeometry,
  Geometry,
  Line,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
  Vector3,
} from '../../../lib/three.module.js';

export function createObject3d(lineMaterial, defaultColor, id) {
    
  let circleOutline,
    circleFilled,
    circleLineAndFill,
    polygon,
    wheel,
    TWO_PI = Math.PI * 2,
    centreRadius = 3,
    
    /**
     * Initialization.
     */
    init = function() {
      circleOutline = createCircleOutline(lineMaterial);
      circleFilled = createCircleFilled(defaultColor);
      circleLineAndFill = createCircleLineAndFill(circleOutline, circleFilled);
      polygon = createPolygon(lineMaterial, defaultColor);
      wheel = createWheel(lineMaterial);
    },
    
    /**
     * Create a circle outline.
     * @param {object} lineMaterial
     */
    createCircleOutline = function(lineMaterial) {
        var radius = 10,
          numSegments = 64,
          geometry = new CircleGeometry(radius, numSegments);
        
        geometry.vertices.shift();
        return new Line(geometry, lineMaterial);
    },
    
    /**
     * Create a circle fill.
     * @param {number} color Fill color.
     */
    createCircleFilled = function(color) {
      var radius = 10,
        numSegments = 8,
        material = new MeshBasicMaterial({
          color: color,
          transparent: true
        }),
        geometry = new CircleGeometry(radius, numSegments);              
    
      material.opacity = 1.0;
      return new Mesh(geometry, material);
    },
    
    /**
     * Create circle with outline and fill.
     * @param {object} circleOutline Circle outline 3D object.
     * @param {object} circleFill Circle fill 3D object.
     * @return {object} Line 3D object.
     */
    createCircleLineAndFill = function(circleOutline, circleFill) {
      var circle = new Object3D();
      circle.add(circleFill.clone());
      circle.add(circleOutline.clone());
      return circle;
    },
    
    /**
     * Create pointer triangle.
     * @param {object} lineMaterial Default line drawing material.
     * @return {object} Line 3D object.
     */
    createPointer = function(lineMaterial) {
      const geometry = new Geometry();
      geometry.vertices.push(
          new Vector3(0.0, 0.0, 0.0),
          new Vector3(0.0, 1.0, 0.0)
      );
      const line = new Line(geometry, lineMaterial);
      return line;
    },
    
    /**
     * Create polygon 3D object, the shape that connects the dots. 
     * @param {object} lineMaterial Default line drawing material.
     * @param {number} color Fill color.
     */
    createPolygon = function(lineMaterial, color) {
      const fillShape = new Shape();
      fillShape.lineTo(0, 0);
      fillShape.lineTo(1, 0);
      fillShape.lineTo(1, 1);
      fillShape.lineTo(0, 0);
      const fillGeom = new ShapeGeometry(fillShape);
      const fillMaterial = new MeshBasicMaterial({
          color: color,
          transparent: true
      });
      fillMaterial.opacity = 0.4;
      const fillMesh = new Mesh(fillGeom, fillMaterial);
      fillMesh.name = 'polygonFill';
      
      const lineGeom = new Geometry();
      const line = new Line(lineGeom, lineMaterial);
      line.name = 'polygonLine';
      
      const polygon = new Object3D();
      polygon.add(line);
      polygon.add(fillMesh);
      
      return polygon;
    },
    
    /**
     *  Create icon to indicate that the pattern is rotated.
     * @param {object} lineMaterial Default line drawing material.
     * @return {object} Object3D of rotated icon.
     */
    createRotatedMarker = function(lineMaterial) {
      var geometry = new Geometry();
      geometry.vertices.push(
        new Vector3(0, -1, 0),
        new Vector3(0, 1, 0),
        new Vector3(1, 0.5, 0),
        new Vector3(0, 0, 0)
      );
      var line = new Line(geometry, lineMaterial);
      return line;
    },
    
    /**
     * Create combined Object3D of wheel.
     * @param {object} lineMaterial Default line drawing material.
     * @return {object} Object3D of drag plane.
     */
    createWheel = function(lineMaterial) {
      const hitarea = createCircleFilled(defaultColor);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;
      
      const centreCircle = circleOutline.clone();
      centreCircle.name = 'centreCircle';
      centreCircle.scale.set(0.3, 0.3, 1);
      
      const selectCircle = circleOutline.clone();
      selectCircle.name = 'select';
      selectCircle.scale.set(0.2, 0.2, 1);
      selectCircle.visible = false;
      
      const centreDot = circleLineAndFill.clone();
      centreDot.name = 'centreDot';
      centreDot.scale.set(0.1, 0.1, 1);
      centreDot.visible = false;
      
      const pointer = createPointer(lineMaterial);
      pointer.name = 'pointer';
      
      const poly = polygon.clone();
      poly.name = 'polygon';
      
      const dots = new Object3D();
      dots.name = 'dots';

      const zeroMarker = circleOutline.clone();
      zeroMarker.name = 'zeroMarker';
      zeroMarker.scale.set(0.05, 0.05, 1);
      
      const rotatedMarker = createRotatedMarker(lineMaterial);
      rotatedMarker.name = 'rotatedMarker';
      
      const wheel = new Object3D();
      wheel.name = 'wheel';
      wheel.userData.id = id;
      wheel.add(hitarea);
      wheel.add(centreCircle);
      wheel.add(selectCircle);
      wheel.add(centreDot);
      wheel.add(pointer);
      wheel.add(poly);
      wheel.add(dots);
      wheel.add(zeroMarker);
      wheel.add(rotatedMarker);
      
      return wheel;
    };
  
  init();
  
  return wheel;
}
