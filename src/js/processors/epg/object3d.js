import {
  createCircleFilled,
  createCircleOutline,
  createCircleOutlineFilled,
  createShape,
  drawConnectors,
} from '../../webgl/draw3dHelper.js';
import { getTheme } from '../../state/selectors.js';

const {
  Group,
  Mesh,
  MeshBasicMaterial,
  Shape,
  ShapeBufferGeometry,
  Vector2,
} = THREE;

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
      const defaultColor = getTheme().colorHigh;

      const hitarea = createCircleFilled(3, defaultColor);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;
      
      const centreCircle = createCircleOutline(3, defaultColor);
      centreCircle.name = 'centreCircle';
      
      const selectCircle = createCircleOutline(2, defaultColor);
      selectCircle.name = 'select';
      selectCircle.visible = false;
      
      const centreDot = createCircleOutlineFilled(1.5, defaultColor);
      centreDot.name = 'centreDot';
      centreDot.visible = false;
      
      const pointer = createShape();
      pointer.name = 'pointer';
      
      const polygon = createPolygon(defaultColor);
      polygon.name = 'polygon';
      
      const dots = new Group();
      dots.name = 'dots';

      const zeroMarker = createCircleOutline(0.5, defaultColor);
      zeroMarker.name = 'zeroMarker';

      const points = [
        new Vector2(0, -1),
        new Vector2(0, 1),
        new Vector2(1, 0.5),
        new Vector2(0, 0),
      ];
      const rotatedMarker = createShape(points, defaultColor);
      rotatedMarker.name = 'rotatedMarker';

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-10);
      
      const wheel = new Group();
      wheel.name = 'wheel';
      wheel.userData.id = id;
      wheel.add(hitarea);
      wheel.add(centreCircle);
      wheel.add(selectCircle);
      wheel.add(centreDot);
      wheel.add(pointer);
      wheel.add(polygon);
      wheel.add(dots);
      wheel.add(zeroMarker);
      wheel.add(rotatedMarker);
      wheel.add(label);

      // add inputs and outputs
      drawConnectors(wheel, inputs, outputs, getTheme().colorLow);
      
      return wheel;
    };
  
  init();
  
  return createWheel();
}
