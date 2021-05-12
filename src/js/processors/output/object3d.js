import {
  createCircleFilled,
  createCircleOutline,
  createCircleOutlineFilled,
  createConnectors,
  createShape,
} from '../../webgl/draw3dHelper.js';
import { getTheme } from '../../state/selectors.js';

import {
  Group,
  Vector2,
} from '../../lib/threejs/build/three.module.js';

export function createObject3d(id, inputs, outputs) {
    
  const radius = 4,
    midiPinRadius = 0.5,
    midiPinDistance = 2.5,
    
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

      const midiPin0Circle = createCircleOutline(midiPinRadius, colorHigh);
      midiPin0Circle.name = 'midiPin0';
      midiPin0Circle.translateY(-midiPinDistance);

      const midiPin1Circle = createCircleOutline(midiPinRadius, colorHigh);
      midiPin1Circle.name = 'midiPin1';
      midiPin1Circle.translateX(-midiPinDistance);

      const midiPin2Circle = createCircleOutline(midiPinRadius, colorHigh);
      midiPin2Circle.name = 'midiPin2';
      midiPin2Circle.translateX(midiPinDistance);

      const midiPin3Circle = createCircleOutline(midiPinRadius, colorHigh);
      midiPin3Circle.name = 'midiPin3';
      midiPin3Circle.translateX(Math.sin(Math.PI * 1.25) * midiPinDistance);
      midiPin3Circle.translateY(Math.cos(Math.PI * 1.25) * midiPinDistance);

      const midiPin4Circle = createCircleOutline(midiPinRadius, colorHigh);
      midiPin4Circle.name = 'midiPin4';
      midiPin4Circle.translateX(Math.sin(Math.PI * 0.75) * midiPinDistance);
      midiPin4Circle.translateY(Math.cos(Math.PI * 0.75) * midiPinDistance);

      const points = [
        new Vector2(-0.6, radius),
        new Vector2(-0.6, radius - 1.2),
        new Vector2( 0.6, radius - 1.2),
        new Vector2( 0.6, radius),
      ];
      const square = createShape(points, colorHigh);

      const group = new Group();
      group.name = 'output';
      group.userData.id = id;
      group.add(hitarea);
      group.add(square);
      group.add(midiPin0Circle);
      group.add(midiPin1Circle);
      group.add(midiPin2Circle);
      group.add(midiPin3Circle);
      group.add(midiPin4Circle);
      group.add(centerDot);
      group.add(centerCircle);
      group.add(selectCircle);
      group.add(label);

      // add inputs and outputs 
      createConnectors(group, inputs, outputs, colorLow);

      return group;
    };
  
  init();
  
  return createGraphic();
}
  