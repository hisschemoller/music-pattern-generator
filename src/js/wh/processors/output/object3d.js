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
    
  let defaultColor,
    lineMaterial,

    init = function() {
      defaultColor = getThemeColors().colorHigh;
      lineMaterial = new LineBasicMaterial({
        color: defaultColor,
      });
    },
    
    createGraphic = function() {
      const hitarea = createCircleFilled(defaultColor, 3);
      hitarea.name = 'hitarea';
      hitarea.material.opacity = 0.0;

      const label = new Group();
      label.name = 'label';
      label.scale.set(0.1, 0.1, 1);
      label.translateY(-7);
      
      const centreCircle = createCircleOutline(lineMaterial, 3);
      centreCircle.name = 'centreCircle';
      
      const selectCircle = createCircleOutline(lineMaterial, 2);
      selectCircle.name = 'select';
      selectCircle.visible = false;

      const group = new Group();
      group.name = 'output';
      group.userData.id = id;
      group.add(hitarea);
      group.add(centreCircle);
      group.add(selectCircle);
      group.add(label);

      // add inputs and outputs
      drawConnectors(group, inputs, outputs, lineMaterial);

      return group;
    };
  
  init();
  
  return createGraphic();
}
  