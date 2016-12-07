
window.WH = window.WH || {};

(function (ns) {
    
    function createEPGWorldObjects(specs) {
        
        var that,
            defaultColor = 0xeeeeee,
            circleOutline,
            circleFilled,
            circleLineAndFill,
            polygon,
            wheel,
            TWO_PI = Math.PI * 2,
            
            /**
             * Initialization.
             */
            init = function() {
                var lineMaterial;
                
                lineMaterial = new THREE.LineBasicMaterial({
                    color: defaultColor,
                    linewidth: 3
                });
                
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
                var geometry = createPointerGeometry(8, false);
                var line = new THREE.Line(geometry, lineMaterial);
                return line;
            },
            
            /**
             * Create geometry for the pointer.
             * Also used by the pointer update function.
             * @param {Number} radius Pointer radius.
             * @param {Boolean} isSolo Pointer shows solo state.
             * @return {Object} Three.js Geometry object.
             */
            createPointerGeometry = function(radius, isSolo) {
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                	new THREE.Vector3(-2.9, 0.7, 0.0),
                	new THREE.Vector3(0.0, radius, 0.0),
                	new THREE.Vector3(2.9, 0.7, 0.0)
                );
                
                if (isSolo) {
                    geometry.vertices.push(
                        new THREE.Vector3(0.0, radius, 0.0),
                        new THREE.Vector3(0.0, 1.0, 0.0)
                    );
                }
                
                return geometry;
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
            },
            
            /**
             * Create a new wheel mesh in the 3D world and  
             * tell the epgModel to create a pattern.
             * @param {object} ptrn Pattern data object.
             * @param {Boolean} isNew True if this is newly added, no restore.
             * @return {object} 3D pattern object created.
             */
            createPatternWheel = function(ptrn, isNew) {
                var centreScale, selectScale, object3d, i, n, dot, position;
                
                // create the wheel 3D object
                object3d = wheel.clone();
                object3d.position.copy(ptrn.position3d);
                
                // fill properties of the pattern data.
                ptrn.object3d = object3d;
                ptrn.hitarea3d = object3d.getObjectByName('hitarea');
                ptrn.centreCircle3d = object3d.getObjectByName('centreCircle');
                ptrn.pointer3d = object3d.getObjectByName('pointer');
                ptrn.polygon3d = object3d.getObjectByName('polygon');
                ptrn.dots3d = object3d.getObjectByName('dots');
                ptrn.select3d = object3d.getObjectByName('select');
                ptrn.centreDot3d = object3d.getObjectByName('centreDot');
                ptrn.zeroMarker3d = object3d.getObjectByName('zeroMarker');
                ptrn.rotatedMarker3d = object3d.getObjectByName('rotatedMarker');
                
                // set the dots around the wheel
                updateDots(ptrn);
                
                if (isNew) {
                    // create the startup animation
                    new TWEEN.Tween({scale: 0.001})
                        .to({scale: 1.0}, 400)
                        .onUpdate(function() {
                                ptrn.object3d.scale.set(this.scale, this.scale, 1);
                            })
                        .start();
                    
                    // and the startup animation for the dots
                    n = ptrn.dots3d.children.length;
                    for (i = 0; i < n; i++) {
                        dot = ptrn.dots3d.children[i];
                        startupAnimateDot(dot, i * 20);
                    }
                }
                
                return object3d;
            },
            
            /**
             * Create the startup animation for a pattern wheel dot.
             * @param {object} dot One of a pattern's ring's dots.
             */
            startupAnimateDot = function(dot, delay) {
                new TWEEN.Tween({
                        x: 0,
                        y: 0
                    })
                    .to({
                        x: dot.position.x,
                        y: dot.position.y
                    }, 700)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .onUpdate(function() {
                        dot.position.set(this.x, this.y, 0);
                    })
                    .delay(delay)
                    .start();
                
                dot.position.set(0, 0, 0);
            },
            
            /**
             * Add trackball controls to move the camera around the world.
             * @param {object} camera Camera.
             */
            createControls = function(camera) {
                var controls = new THREE.TrackballControls(camera);
                controls.rotateSpeed = 1.0;
                controls.zoomSpeed = 1.2;
                controls.panSpeed = 0.8;
                controls.noZoom = false;
                controls.noPan = false;
                controls.staticMoving = true;
                controls.dynamicDampingFactor = 0.3;
                controls.enabled = false;
                return controls;
            },
            
            /**
             * Update the pattern dots.
             * @param {object} patternData Pattern data object.
             */
            updateDots = function(patternData) {
                var dots, i, n, dot, rad, polygonPoints;
                
                dots = patternData.dots3d;
                
                // remove all existing dots
                n = dots.children.length;
                for (i = 0; i < n; i++) {
                    dots.remove(dots.children[0]);
                }
                
                polygonPoints = [];
                
                // add new dots
                n = patternData.steps;
                patternData.radius3d = 8 + (n > 16 ? (n - 16) * 0.5 : 0);
                for (i = 0; i < n; i++) {
                    rad = TWO_PI * (i / n);
                    if (patternData.euclidPattern[i]) {
                        dot = circleLineAndFill.clone();
                    } else {
                        dot = circleOutline.clone();
                    }
                    dot.scale.set(0.1, 0.1, 1);
                    dot.translateX(Math.sin(rad) * patternData.radius3d);
                    dot.translateY(Math.cos(rad) * patternData.radius3d);
                    dots.add(dot);
                    
                    // add coordinate of filled dot to polygon points
                    if (patternData.euclidPattern[i]) {
                        polygonPoints.push(dot.position.clone());
                    }
                }
                
                polygonPoints.push(polygonPoints[0].clone());
                
                updatePolygon(patternData, polygonPoints);
                updateHitarea(patternData);
                updatePointer(patternData);
                updateZeroMarker(patternData);
                updateRotatedMarker(patternData);
            },
            
            /**
             * Update the polygon shape that connects the dots.
             * @param {object} patternData Pattern data object.
             * @param {array} points Coordinates of the shape points.
             */
            updatePolygon = function(patternData, points) {
                var i, n, polygon, line, lineGeom, fillShape, fillGeom;
                
                polygon = patternData.polygon3d;
                
                if (points.length > 2) {
                    polygon.visible = true;
                } else {
                    polygon.visible = false;
                    return;
                }
                
                if (points.length > 3) {
                    fillShape = new THREE.Shape();
                    fillShape.moveTo(points[0].x, points[0].y);
                    n = points.length;
                    for (i = 1; i < n; i++) {
                        fillShape.lineTo(points[i].x, points[i].y);
                    }
                    fillShape.lineTo(points[0].x, points[0].y);
                    fillGeom = new THREE.ShapeGeometry(fillShape);
                    fill = polygon.getObjectByName('polygonFill');
                    fill.geometry = fillGeom;
                } else {
                    fill = null;
                }
                
                line = polygon.getObjectByName('polygonLine');
                line.geometry.dispose();
                line.geometry = new THREE.Geometry();
                line.geometry.vertices = points;
                line.geometry.verticesNeedUpdate = true;
            },
            
            /**
             * Update the hitarea used for mouse detection.
             * @param {object} patternData Pattern data object.
             */
            updateHitarea = function(patternData) {
                var scale = (patternData.radius3d + 3) * 0.1;
                patternData.hitarea3d.scale.set(scale, scale, 1);
            },
            
            /**
             * Update the pointer that connects the dots.
             * @param {object} patternData Pattern data object.
             */
            updatePointer = function(patternData) {
                var mutedRadius = 4.5,
                    radius = (patternData.isMute || patternData.isNotSolo) ? mutedRadius : patternData.radius3d;
                patternData.pointer3d.geometry.dispose();
                patternData.pointer3d.geometry = createPointerGeometry(radius, patternData.isSolo);
            },
            
            /**
             * Update the zero marker.
             * @param {object} patternData Pattern data object.
             */
            updateZeroMarker = function(patternData) {
                var rad = TWO_PI * (-patternData.rotation / patternData.steps),
                    radius = patternData.radius3d + 3;
                patternData.zeroMarker3d.position.x = Math.sin(rad) * radius;
                patternData.zeroMarker3d.position.y = Math.cos(rad) * radius;
            },
            
            /**
             * Update the marker that indicates if the pattern is rotated.
             * @param {object} patternData Pattern data object.
             */
            updateRotatedMarker = function(patternData) {
                patternData.rotatedMarker3d.position.y = patternData.radius3d + 3;
                patternData.rotatedMarker3d.visible = patternData.rotation !== 0;
            };
        
        that = {};
        
        init();
        
        that.createPatternWheel = createPatternWheel;
        that.createControls = createControls;
        that.updateDots = updateDots;
        that.updatePointer = updatePointer;
        return that;
    }

    ns.createEPGWorldObjects = createEPGWorldObjects;

})(WH);
