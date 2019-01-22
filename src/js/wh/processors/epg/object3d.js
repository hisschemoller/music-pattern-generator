import {
  createCircleFilled,
  createCircleOutlineFilled,
  drawConnectors,
} from '../../webgl/util3d.js';
import {
  createCircleOutline,
} from '../../webgl/draw3dHelper.js';
import { getThemeColors } from '../../state/selectors.js';

const {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
  Vector3,
} = THREE;

export function createObject3d(id, inputs, outputs) {
    
  let polygon,
    TWO_PI = Math.PI * 2,
    centreRadius = 3,
    defaultColor,
    lineMaterial,
    
    /**
     * Initialization.
     */
    init = function() {
      defaultColor = getThemeColors().colorHigh;
      lineMaterial = new LineBasicMaterial({
        color: defaultColor,
      });
      polygon = createPolygon(lineMaterial, defaultColor);
    },
    
    /**
     * Create pointer triangle.
     * @param {object} lineMaterial Default line drawing material.
     * @return {object} Line 3D object.
     */
    createPointer = function(lineMaterial) {
      return new Line(new BufferGeometry(), lineMaterial);
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
      fillMaterial.opacity = 0.2;
      const fillMesh = new Mesh(fillGeom, fillMaterial);
      fillMesh.name = 'polygonFill';
      
      const lineGeom = new BufferGeometry();
      const line = new Line(lineGeom, lineMaterial);
      line.name = 'polygonLine';
      
      const polygon = new Object3D();
      polygon.add(line);
      polygon.add(fillMesh);
      
      return polygon;
    },
    
    /**
     * Create icon to indicate that the pattern is rotated.
     * @param {object} lineMaterial Default line drawing material.
     * @return {object} Object3D of rotated icon.
     */
    createRotatedMarker = function(lineMaterial) {
      var geometry = new BufferGeometry();
      geometry.addAttribute( 'position', new BufferAttribute( new Float32Array([
        0, -1, 0,
        0, 1, 0,
        1, 0.5, 0,
        0, 0, 0,
      ]), 3));
      var line = new Line(geometry, lineMaterial);
      return line;
    },
    
    /**
     * Create combined Object3D of wheel.
     * @return {object} Object3D of drag plane.
     */
    createWheel = function() {
      const hitarea = createCircleFilled(defaultColor, 3);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;
      
      const centreCircle = createCircleOutline(3, defaultColor);
      centreCircle.name = 'centreCircle';
      
      const selectCircle = createCircleOutline(2, defaultColor);
      selectCircle.name = 'select';
      selectCircle.visible = false;
      
      const centreDot = createCircleOutlineFilled(lineMaterial, defaultColor, 1.5);
      centreDot.name = 'centreDot';
      centreDot.visible = false;
      
      const pointer = createPointer(lineMaterial);
      pointer.name = 'pointer';
      
      const poly = polygon.clone();
      poly.name = 'polygon';
      
      const dots = new Object3D();
      dots.name = 'dots';

      const zeroMarker = createCircleOutline(0.5, defaultColor);
      zeroMarker.name = 'zeroMarker';
      
      const rotatedMarker = createRotatedMarker(lineMaterial);
      rotatedMarker.name = 'rotatedMarker';

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-10);
      
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
      wheel.add(label);

      // add inputs and outputs
      drawConnectors(wheel, inputs, outputs, lineMaterial);
      
      return wheel;
    };
  
  init();
  
  return createWheel();
}
