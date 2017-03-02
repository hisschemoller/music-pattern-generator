
window.WH = window.WH || {};

(function (ns) {
    
    function createWorldEPGTemplate(lineMaterial, defaultColor) {
        
        var circleOutline,
            circleFilled,
            circleLineAndFill,
            polygon,
            wheel,
            TWO_PI = Math.PI * 2,
            centreRadius = 3,
            
            /**
             * Initialization.
             */
            init = function() {
                circleOutline = createCircleOutline(lineMaterial);
                circleFilled = createCircleFilled(defaultColor);
                circleLineAndFill = createCircleLineAndFill(circleOutline, circleFilled);
                polygon = createPolygon(lineMaterial, defaultColor);
                wheel = createWheel(lineMaterial);
            },
            
            /**
             * Create a circle outline.
             * @param {object} lineMaterial
             */
            createCircleOutline = function(lineMaterial) {
                var radius = 10,
                    numSegments = 64,
                    geometry = new THREE.CircleGeometry(radius, numSegments);
                
                geometry.vertices.shift();
                return new THREE.Line(geometry, lineMaterial);
            },
            
            /**
             * Create a circle fill.
             * @param {number} color Fill color.
             */
            createCircleFilled = function(color) {
                var radius = 10,
                    numSegments = 8,
                    material = new THREE.MeshBasicMaterial({
                        color: color,
                        transparent: true
                    }),
                    geometry = new THREE.CircleGeometry(radius, numSegments);              
                
                material.opacity = 1.0;
                return new THREE.Mesh(geometry, material);
            },
            
            /**
             * Create circle with outline and fill.
             * @param {object} circleOutline Circle outline 3D object.
             * @param {object} circleFill Circle fill 3D object.
             * @return {object} Line 3D object.
             */
            createCircleLineAndFill = function(circleOutline, circleFill) {
                var circle = new THREE.Object3D();
                circle.add(circleFill.clone());
                circle.add(circleOutline.clone());
                return circle;
            },
            
            /**
             * Create pointer triangle.
             * @param {object} lineMaterial Default line drawing material.
             * @return {object} Line 3D object.
             */
            createPointer = function(lineMaterial) {
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(0.0, 0.0, 0.0),
                    new THREE.Vector3(0.0, 1.0, 0.0)
                );
                var line = new THREE.Line(geometry, lineMaterial);
                return line;
            },
            
            /**
             * Create polygon 3D object, the shape that connects the dots. 
             * @param {object} lineMaterial Default line drawing material.
             * @param {number} color Fill color.
             */
            createPolygon = function(lineMaterial, color) {
                var line, lineGeom, fill, fillShape, fillMesh, polygon;

                fillShape = new THREE.Shape();
                fillShape.lineTo(0, 0);
                fillShape.lineTo(1, 0);
                fillShape.lineTo(1, 1);
                fillShape.lineTo(0, 0);
                fillGeom = new THREE.ShapeGeometry(fillShape);
                fillMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true
                });
                fillMaterial.opacity = 0.4;
                fillMesh = new THREE.Mesh(fillGeom, fillMaterial);
                fillMesh.name = 'polygonFill';
                
                lineGeom = new THREE.Geometry();
                line = new THREE.Line(lineGeom, lineMaterial);
                line.name = 'polygonLine';
                
                polygon = new THREE.Object3D();
                polygon.add(line);
                polygon.add(fillMesh);
                
                return polygon;
            },
            
            /**
             *  Create icon to indicate that the pattern is rotated.
             * @param {object} lineMaterial Default line drawing material.
             * @return {object} Object3D of rotated icon.
             */
            createRotatedMarker = function(lineMaterial) {
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                	new THREE.Vector3(0, -1, 0),
                	new THREE.Vector3(0, 1, 0),
                	new THREE.Vector3(1, 0.5, 0),
                	new THREE.Vector3(0, 0, 0)
                );
                var line = new THREE.Line(geometry, lineMaterial);
                return line;
            },
            
            /**
             * Create combined Object3D of wheel.
             * @param {object} lineMaterial Default line drawing material.
             * @return {object} Object3D of drag plane.
             */
            createWheel = function(lineMaterial) {
                var wheel, hitarea, centreCircle, selectCircle, centreDot, pointer, 
                    poly, dots, zeroMarker, rotatedMarker;
                
                hitarea = createCircleFilled(defaultColor);
                hitarea.name = 'hitarea';
                hitarea.material.opacity = 0.0;
                
                centreCircle = circleOutline.clone();
                centreCircle.name = 'centreCircle';
                centreCircle.scale.set(0.3, 0.3, 1);
                
                selectCircle = circleOutline.clone();
                selectCircle.name = 'select';
                selectCircle.scale.set(0.2, 0.2, 1);
                selectCircle.visible = false;
                
                centreDot = circleLineAndFill.clone();
                centreDot.name = 'centreDot';
                centreDot.scale.set(0.1, 0.1, 1);
                centreDot.visible = false;
                
                pointer = createPointer(lineMaterial);
                pointer.name = 'pointer';
                
                poly = polygon.clone();
                poly.name = 'polygon';
                
                dots = new THREE.Object3D();
                dots.name = 'dots';

                zeroMarker = circleOutline.clone();
                zeroMarker.name = 'zeroMarker';
                zeroMarker.scale.set(0.05, 0.05, 1);
                
                rotatedMarker = createRotatedMarker(lineMaterial);
                rotatedMarker.name = 'rotatedMarker';
                
                wheel = new THREE.Object3D();
                wheel.name = 'wheel';
                wheel.add(hitarea);
                wheel.add(centreCircle);
                wheel.add(selectCircle);
                wheel.add(centreDot);
                wheel.add(pointer);
                wheel.add(poly);
                wheel.add(dots);
                wheel.add(zeroMarker);
                wheel.add(rotatedMarker);
                
                return wheel;
            };
        
        init();
        
        return wheel;
    }

    ns.createWorldEPGTemplate = createWorldEPGTemplate;

})(WH);
