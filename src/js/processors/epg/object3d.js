import {
  createCircleFilled,
  createCircleOutline,
  createCircleOutlineFilled,
  createShape,
  createConnectors,
} from '../../webgl/draw3dHelper.js';
import { getTheme } from '../../state/selectors.js';
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  Shape,
  ShapeBufferGeometry,
  Vector2,
} from '../../lib/threejs/build/three.module.js';

export function createObject3d(id, inputs, outputs) {
    
    /**
     * Initialization.
     */
  let init = function() {
    },
    
    /**
     * Create polygon 3D object, the shape that connects the dots.
     * @param {number} color Fill color.
     */
    createPolygon = function(color) {
      const fillShape = new Shape();
      const fillGeometry = new ShapeBufferGeometry(fillShape);
      const fillMaterial = new MeshBasicMaterial({
          color: color,
          transparent: true
      });
      fillMaterial.opacity = 0.15;
      const fillMesh = new Mesh(fillGeometry, fillMaterial);
      fillMesh.name = 'polygonFill';
      
      const line = createShape();
      line.name = 'polygonLine';
      
      const polygon = new Group();
      polygon.add(line);
      polygon.add(fillMesh);
      
      return polygon;
    },
    
    /**
     * Create combined Group of wheel.
     * @return {object} Group of drag plane.
     */
    createWheel = function() {
      const { colorLow, colorHigh, } = getTheme();

      const hitarea = createCircleFilled(3, colorHigh);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;
      hitarea.renderOrder = 0;
      
      const dots = new Group();
      dots.name = 'dots';
      dots.renderOrder = 1;
      
      const polygon = createPolygon(colorHigh);
      polygon.name = 'polygon';
      polygon.renderOrder = 2;
      
      const centerCircle = createCircleOutline(3, colorHigh);
      centerCircle.name = 'centerCircle';
      centerCircle.renderOrder = 4;
      
      const selectCircle = createCircleOutline(2, colorHigh);
      selectCircle.name = 'select';
      selectCircle.renderOrder = 5;
      selectCircle.visible = false;
      
      const centerDot = createCircleOutlineFilled(1.5, colorHigh);
      centerDot.name = 'centerDot';
      centerDot.renderOrder = 6;
      centerDot.visible = false;
      
      const pointer = createShape();
      pointer.name = 'pointer';
      pointer.renderOrder = 7;

      const zeroMarker = createCircleOutline(0.5, colorHigh);
      zeroMarker.name = 'zeroMarker';
      zeroMarker.renderOrder = 8;

      const points = [
        new Vector2(0, -1),
        new Vector2(0, 1),
        new Vector2(1, 0.5),
        new Vector2(0, 0),
      ];
      const rotatedMarker = createShape(points, colorHigh);
      rotatedMarker.name = 'rotatedMarker';
      rotatedMarker.renderOrder = 8;

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-10);
      label.renderOrder = 8;
      
      const wheel = new Group();
      wheel.name = 'wheel';
      wheel.userData.id = id;
      wheel.add(hitarea);
      wheel.add(polygon);
      wheel.add(centerCircle);
      wheel.add(selectCircle);
      wheel.add(centerDot);
      wheel.add(dots);
      wheel.add(pointer);
      wheel.add(zeroMarker);
      wheel.add(rotatedMarker);
      wheel.add(label);

      // add inputs and outputs
      createConnectors(wheel, inputs, outputs, colorLow);
      
      return wheel;
    };
  
  init();
  
  return createWheel();
}
