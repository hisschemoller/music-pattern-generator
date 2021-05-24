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
      
      const pointer = createShape();
      pointer.name = 'pointer';
      
      const necklace = createShape();
      necklace.name = 'necklace';

      const zeroMarker = createCircleOutline(0.5, colorHigh);
      zeroMarker.name = 'zeroMarker';
      zeroMarker.translateY(2.5);
      necklace.add(zeroMarker);

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-8);
      
      const root = new Group();
      root.name = 'root';
      root.userData.id = id;
      root.add(hitarea);
      root.add(centerCircle);
      root.add(selectCircle);
      root.add(centerDot);
      root.add(pointer);
      root.add(necklace);
      root.add(label);

      // add inputs and outputs
      createConnectors(root, inputs, outputs, colorLow);
      
      return root;
    };
  
  init();
  
  return create();
}
