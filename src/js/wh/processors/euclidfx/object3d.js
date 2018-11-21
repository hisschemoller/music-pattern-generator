import {
  CircleGeometry,
  Geometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
  Vector3,
  Group,
} from '../../../lib/three.module.js';
import {
  createCircleOutline,
  createCircleFilled,
  createCircleOutlineFilled,
  drawConnectors,
} from '../../webgl/util3d.js';
import { getThemeColors } from '../../state/selectors.js';

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
    },
    
    /**
     * Create combined Object3D of wheel.
     * @return {object} Object3D of drag plane.
     */
    create = function() {
      const hitarea = createCircleFilled(defaultColor, 3);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;
      
      const centreCircle = createCircleOutline(lineMaterial, 3);
      centreCircle.name = 'centreCircle';
      
      const selectCircle = createCircleOutline(lineMaterial, 2);
      selectCircle.name = 'select';
      selectCircle.visible = false;
      
      const centreDot = createCircleOutlineFilled(lineMaterial, defaultColor, 1);
      centreDot.name = 'centreDot';
      centreDot.visible = false;

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-10);
      
      const root = new Object3D();
      root.name = 'root';
      root.userData.id = id;
      root.add(hitarea);
      root.add(centreCircle);
      root.add(selectCircle);
      root.add(centreDot);
      root.add(label);

      // add inputs and outputs
      drawConnectors(root, inputs, outputs, lineMaterial);
      
      return root;
    };
  
  init();
  
  return create();
}
