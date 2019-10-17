import {
  createCircleFilled,
  createCircleOutline,
  drawConnectors,
  createShape,
} from '../../webgl/draw3dHelper.js';
import { getThemeColors } from '../../state/selectors.js';

const {
  Group,
  Vector2,
} = THREE;

export function createObject3d(id, inputs, outputs) {
    
  const radius = 3,
    
    /**
     * Initialization.
     */
    init = function() {
    },
    
    createGraphic = function() {
      const { colorLow, colorHigh, } = getThemeColors();

      const hitarea = createCircleFilled(3, colorHigh);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-7);
      
      const centreCircle = createCircleOutline(radius, colorHigh);
      centreCircle.name = 'centreCircle';
      
      const selectCircle = createCircleOutline(2, colorHigh);
      selectCircle.name = 'select';
      selectCircle.visible = false;

      const points = [
        new Vector2(-radius, -radius),
        new Vector2(radius, -radius),
        new Vector2(radius, radius),
        new Vector2(-radius, radius),
        new Vector2(-radius, -radius),
        new Vector2(0, -radius * 1.8),
        new Vector2(radius, -radius),
      ];
      const graphic = createShape(points, colorHigh);

      const group = new Group();
      group.name = 'output';
      group.userData.id = id;
      group.add(hitarea);
      group.add(graphic);
      group.add(centreCircle);
      group.add(selectCircle);
      group.add(label);

      // add inputs and outputs 
      drawConnectors(group, inputs, outputs, colorLow);

      return group;
    };
  
  init();
  
  return createGraphic();
}
  