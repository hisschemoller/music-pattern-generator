import {
  Group,
  LineBasicMaterial,
  Vector2,
} from '../../../lib/three.module.js';
import {
  createCircleFilled,
  createCircleOutline,
  drawConnectors,
  createShape,
} from '../../webgl/draw3dHelper.js';
import { getThemeColors } from '../../state/selectors.js';

export function createObject3d(id, inputs, outputs) {
    
  let defaultColor,
    lineMaterial,
    radius = 3,

    init = function() {
      defaultColor = getThemeColors().colorHigh;
      lineMaterial = new LineBasicMaterial({
        color: defaultColor,
      });
    },
    
    createGraphic = function() {
      const hitarea = createCircleFilled(3, defaultColor);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-7);
      
      const centreCircle = createCircleOutline(radius, defaultColor);
      centreCircle.name = 'centreCircle';
      
      const selectCircle = createCircleOutline(2, defaultColor);
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
      const graphic = createShape(points, defaultColor);

      const group = new Group();
      group.name = 'output';
      group.userData.id = id;
      group.add(hitarea);
      group.add(graphic);
      group.add(centreCircle);
      group.add(selectCircle);
      group.add(label);

      // add inputs and outputs 
      drawConnectors(group, inputs, outputs, defaultColor);

      return group;
    };
  
  init();
  
  return createGraphic();
}
  