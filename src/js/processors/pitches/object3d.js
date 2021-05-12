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
  Vector2,
} from '../../lib/threejs/build/three.module.js';

export function createObject3d(id, inputs, outputs) {

    /**
     * Initialization.
     */
  const init = function() {
    },
    
    /**
     * Create combined Object3D of wheel.
     * @return {object} Group object3D of drag plane.
     */
    create = function() {
      const { colorLow, colorHigh, } = getTheme();

      const hitarea = createCircleFilled(3, colorHigh);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;
      
      const centerCircle = createCircleOutline(3, colorHigh);
      centerCircle.name = 'centerCircle';
      
      const selectCircle = createCircleOutline(2, colorHigh);
      selectCircle.name = 'select';
      selectCircle.visible = false;
      
      const centerDot = createCircleOutlineFilled(1.5, colorHigh);
      centerDot.name = 'centerDot';
      centerDot.visible = false;

      const stick = createShape();
      stick.translateX(3);
      stick.name = 'stick';

      const points = [
        new Vector2(0, 0),
        new Vector2(-0.6, 0.8),
        new Vector2(0.6, 0.8),
        new Vector2(0, 0),
      ];
      const pointer = createShape(points, colorHigh);
      pointer.translateX(3);
      pointer.translateY(1);
      pointer.name = 'pointer';

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-5);
      
      const root = new Group();
      root.name = 'root';
      root.userData.id = id;
      root.add(hitarea);
      root.add(centerCircle);
      root.add(selectCircle);
      root.add(centerDot);
      root.add(stick);
      root.add(pointer);
      root.add(label);

      // add inputs and outputs
      createConnectors(root, inputs, outputs, colorLow);
      
      return root;
    };
  
  init();
  
  return create();
}
