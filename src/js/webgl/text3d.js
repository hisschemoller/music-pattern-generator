import text3dFontData from './text3dFontData.js';
import { createText } from './draw3dHelper.js';
import {
  Group,
  Vector2,
} from '../lib/threejs/build/three.module.js';

/**
 * Create a single line text object.
 *
 * @export
 * @param {Group} group The Group object to add the 3D text to.
 * @param {String} str The text string to render as 3D.
 * @param {LineBasicMaterial} lineMaterial The material to render the text with.
 * @return Group object containing all the text meshes.
 */
export default function setText3d(group, str, color) {

  // clear old text
  while (group.children.length) {
    group.remove(group.children[0]);
  }
  const lineGroup = new Group();
  group.add(lineGroup);

  let numRenderedChars = 0;

  // loop through the characters in the string
  for (let i = 0, n = str.length; i < n; i++) {
    const char = str.charAt(i);
    const svgPath = text3dFontData.chars[char];

    if (svgPath) {
      numRenderedChars++;

      const svgSubPaths = svgPath.split('M');
      svgSubPaths.shift();
      
      // loop through the paths of the character
      svgSubPaths.forEach(svgSubPath => {
        const points = parsePathNode('M' + svgSubPath);
        const line2 = createText(points, char, color);
        line2.translateX((text3dFontData.viewBox.width + text3dFontData.spacing) * numRenderedChars);
        line2.rotateX(-Math.PI);
        lineGroup.add(line2);
      });
    }
  }

  // center line of text
  lineGroup.translateX((numRenderedChars * (text3dFontData.viewBox.width + text3dFontData.spacing)) / -2);

  return group;
}

/**
 * From here the code is taken from threeJS's SVGLoader.
 */

function parsePathNode(pathString) {
  const point = new Vector2();
  const firstPoint = new Vector2();
  const commands = pathString.match( /[a-df-z][^a-df-z]*/ig );
  const points = [];

  let isFirstPoint = true;
  let doSetFirstPoint = false;

  commands.forEach(command => {
    const type = command.charAt(0);
		const data = command.substr(1).trim();
    
    doSetFirstPoint = isFirstPoint;
    isFirstPoint = false;
    let numbers;

    switch ( type ) {

      // 'M' = Move
      case 'M':
        numbers = parseFloats( data );
        for ( let j = 0, jl = numbers.length; j < jl; j += 2 ) {
          point.x = numbers[ j + 0 ];
          point.y = numbers[ j + 1 ];
          points.push(point.clone());
        }
        break;

      // 'L' = Line
      case 'L':
        numbers = parseFloats( data );
        for ( let j = 0, jl = numbers.length; j < jl; j += 2 ) {
          point.x = numbers[ j + 0 ];
          point.y = numbers[ j + 1 ];
          points.push(point.clone());
        }
        break;

      // 'Z' = straight line back to start point (close the shape)
      case 'Z':
      case 'z':
        if (points.length > 0) {
          points.push(firstPoint.clone());
          isFirstPoint = true;
        }
        break;

      default:
        console.warn( command );
    }

    if ( doSetFirstPoint ) {
      firstPoint.copy( point );
      doSetFirstPoint = false;
    }
  });

  return points;
}

function parseFloats( string ) {
  const array = string.split( /[\s,]+|(?=\s?[+\-])/ );
  for (let i = 0; i < array.length; i ++) {
    const number = array[i];
    // Handle values like 48.6037.7.8
    // TODO Find a regex for this
    if (number.indexOf('.') !== number.lastIndexOf('.')) {
      const split = number.split('.');
      for (let s = 2; s < split.length; s ++) {
        array.splice(i + s - 1, 0, '0.' + split[s]);
      }
    }
    array[i] = parseFloat(number);
  }
  return array;
}
