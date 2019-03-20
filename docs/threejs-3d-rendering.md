# Three.js 3D rendering

## Line width

The regular Line object can only render lines with 1px width.

Line2 / LineSegments2 by WestLangley, http://github.com/WestLangley is the next one I tried. It does support variable line width but seems to sometimes look a bit weird on retina screens. It's also a lot heavier on the processor.

THREE.MeshLine, https://github.com/spite/THREE.MeshLine, is another possibility.
I haven't tried it yet.

LineSegmentsGeometry is the one I'll try now. It's a new addition to three.js.

Added linewidth support: https://github.com/mrdoob/three.js/pull/11349

https://threejs.org/docs/index.html#api/en/objects/LineSegments

