import {
  createCircleFilled,
  createCircleOutline,
  createCircleOutlineFilled,
  createConnectors,
} from '../../webgl/draw3dHelper.js';
import { getTheme } from '../../state/selectors.js';
import {
  Group,
} from '../../lib/threejs/build/three.module.js';

export function createObject3d(id, inputs, outputs) {
    
  const radius = 3,
    
    /**
     * Initialization.
     */
    init = function() {
    },
    
    createGraphic = function() {
      const { colorLow, colorHigh, } = getTheme();

      const hitarea = createCircleFilled(3, colorHigh);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-7);
      
      const centerCircle = createCircleOutline(radius, colorHigh);
      centerCircle.name = 'centerCircle';
      
      const selectCircle = createCircleOutline(2, colorHigh);
      selectCircle.name = 'select';
      selectCircle.visible = false;
      
      const centerDot = createCircleOutlineFilled(1.5, colorHigh);
      centerDot.name = 'centerDot';
      centerDot.visible = false;
      
      const outerCircle = createCircleOutline(4, colorHigh);
      outerCircle.name = 'outerCircle';

      const group = new Group();
      group.name = 'output';
      group.userData.id = id;
      group.add(hitarea);
      group.add(centerCircle);
      group.add(selectCircle);
      group.add(centerDot);
      group.add(outerCircle);
      group.add(label);

      // add inputs and outputs 
      createConnectors(group, inputs, outputs, colorLow);

      return group;
    };
  
  init();
  
  return createGraphic();
}
  