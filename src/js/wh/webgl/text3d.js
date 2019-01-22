import text3dFontData from './text3dFontData.js';

const { 
  BufferGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Path,
  Vector2,
} = THREE;

const lineMaterial = new LineBasicMaterial({
  color: new Color(0x000000),
  linewidth: 3,
});

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
  lineMaterial.color.set( color );

  // clear old text
  while (group.children.length) {
    group.remove(group.children[0]);
  }
  const lineGroup = new Group();
  group.add(lineGroup);

  let numRenderedChars = 0;

  for (let i = 0, n = str.length; i < n; i++) {
    const char = str.charAt(i);
    const svgPath = text3dFontData.chars[char];

    if (svgPath) {
      numRenderedChars++;

      const svgSubPaths = svgPath.split('M');
      svgSubPaths.shift();
      
      svgSubPaths.forEach(svgSubPath => {
        const path = parsePathNode('M' + svgSubPath);
        const points = path.getPoints();

        const geometry = new BufferGeometry().setFromPoints( points );
        const line = new Line(geometry, lineMaterial);
        line.translateX((text3dFontData.viewBox.width + text3dFontData.spacing) * numRenderedChars);
        line.rotateX(-Math.PI);

        lineGroup.add(line);
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

function parsePathNode(pathString, style) {
  const path = new Path();
  const point = new Vector2();
  const control = new Vector2();
  const firstPoint = new Vector2();
  const commands = pathString.match( /[a-df-z][^a-df-z]*/ig );

  let isFirstPoint = true;
  let doSetFirstPoint = false;

  commands.forEach(command => {
    const type = command.charAt(0);
		const data = command.substr(1).trim();
    
    doSetFirstPoint = isFirstPoint;
    isFirstPoint = false;
    let numbers;

    switch ( type ) {

      case 'M':
        numbers = parseFloats( data );
        for ( let j = 0, jl = numbers.length; j < jl; j += 2 ) {
          point.x = numbers[ j + 0 ];
          point.y = numbers[ j + 1 ];
          control.x = point.x;
          control.y = point.y;
          if ( j === 0 ) {
            path.moveTo( point.x, point.y );
          } else {
            path.lineTo( point.x, point.y );
          }
        }
        break;

      case 'L':
        numbers = parseFloats( data );
        for ( let j = 0, jl = numbers.length; j < jl; j += 2 ) {
          point.x = numbers[ j + 0 ];
          point.y = numbers[ j + 1 ];
          control.x = point.x;
          control.y = point.y;
          path.lineTo( point.x, point.y );
        }
        break;

      case 'Z':
      case 'z':
        path.currentPath.autoClose = true;
        if ( path.currentPath.curves.length > 0 ) {
          // Reset point to beginning of Path
          point.copy( firstPoint );
          path.currentPath.currentPoint.copy( point );
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

  return path;
}

function parseFloats( string ) {
  var array = string.split( /[\s,]+|(?=\s?[+\-])/ );
  for ( var i = 0; i < array.length; i ++ ) {
    var number = array[ i ];
    // Handle values like 48.6037.7.8
    // TODO Find a regex for this
    if ( number.indexOf( '.' ) !== number.lastIndexOf( '.' ) ) {
      var split = number.split( '.' );
      for ( var s = 2; s < split.length; s ++ ) {
        array.splice( i + s - 1, 0, '0.' + split[ s ] );
      }
    }
    array[ i ] = parseFloat( number );
  }
  return array;
}
