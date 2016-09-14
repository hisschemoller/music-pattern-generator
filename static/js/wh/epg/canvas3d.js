
window.WH = window.WH || {};

(function (ns) {
    
    function createCanvas3d(specs) {
        
        var that = specs.that,
            epgModel = specs.epgModel,
            containerEl = document.getElementById('container-webgl'),
            canvasRect,
            renderer,
            scene,
            camera,
            wheel,
            circleOutline,
            circleFilled,
            dotFilled,
            plane,
            mouse = new THREE.Vector2(),
            raycaster = new THREE.Raycaster(),
            intersection = new THREE.Vector3(),
            offset = new THREE.Vector3(),
            objects = [],
            dragObject,
            controls,
            INTERSECTED,
            isTouchDevice = 'ontouchstart' in document.documentElement,
            isDirty = false,
            doubleClickCounter = 0,
            doubleClickDelay = 300,
            doubleClickTimer,
            TWO_PI = Math.PI * 2,
            defaultColor = 0xeeeeee,
        
            /**
             * Type of events to use, touch or mouse
             * @type {String}
             */
            eventType = {
                start: isTouchDevice ? 'touchstart' : 'mousedown',
                end: isTouchDevice ? 'touchend' : 'mouseup',
                click: isTouchDevice ? 'touchend' : 'click',
                move: isTouchDevice ? 'touchmove' : 'mousemove',
            },
            
            /**
             * Initialise DOM events for click, drag etcetera.
             */
            initDOMEvents = function() {
                renderer.domElement.addEventListener(eventType.click, onClick);
                renderer.domElement.addEventListener(eventType.start, onTouchStart);
                renderer.domElement.addEventListener(eventType.move, dragMove);
                renderer.domElement.addEventListener(eventType.end, dragEnd);
                // prevent system doubleclick to interfere with the custom doubleclick
                renderer.domElement.addEventListener('dblclick', function(e) {e.preventDefault();});
                window.addEventListener('resize', onWindowResize, false);
            },
            
            onWindowResize = function() {
                // camera.aspect = window.innerWidth / window.innerHeight;
				// camera.updateProjectionMatrix();
				// renderer.setSize(window.innerWidth, window.innerHeight);
                // canvasRect = renderer.domElement.getBoundingClientRect();
            },
            
            /**
             * Separate click and doubleclick.
             * @see http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
             */
            onClick = function(e) {
                // separate click from doubleclick
                doubleClickCounter ++;
                if (doubleClickCounter == 1) {
                    doubleClickTimer = setTimeout(function() {
                        doubleClickCounter = 0;
                        // implement single click behaviour here
                    }, doubleClickDelay);
                } else {
                    clearTimeout(doubleClickTimer);
                    doubleClickCounter = 0;
                    // implement double click behaviour here
                    onDoubleClick(e);
                }
            },
            
            /**
             * Start dragging a pattern.
             */
            onTouchStart = function(e) {
                var intersects, outerObject, ptrn;
                // update picking ray.
                updateMouseRay(e);
                // get intersected objects
                intersects = raycaster.intersectObjects(objects, true);
                // select first wheel in the intersects
                if (intersects.length) {
                    // get topmost parent of closest object
                    outerObject = getOuterParentObject(intersects[0]);
                    ptrn = epgModel.getPatternByProperty('object3d', outerObject);
                    epgModel.selectPattern(ptrn);
                    dragStart(outerObject, mouse);
                }
            },
            
            /**
             * Handler for the custom doubleclick event detection.
             * Create a new pattern at the location of the doubleclick.
             */
            onDoubleClick = function(e) {
                // update picking ray.
                updateMouseRay(e);
                // if ray intersects plane, store point in vector 'intersection'
                if (raycaster.ray.intersectPlane(plane, intersection)) {
                    // create a new wheel 3D object
                    var ptrn = epgModel.createPattern({
                        canvasX: e.clientX - canvasRect.left,
                        canvasY: e.clientY - canvasRect.top,
                        position3d: intersection
                    });
                    epgModel.selectPattern(ptrn);
                    createPattern3D(ptrn);
                    isDirty = true;
                }
            },
            
            /**
             * Initialise object dragging.
             * @param {object} object3d The Object3D to be dragged.
             */
            dragStart = function(object3d, mouse) {
                dragObject = object3d;
                // update the picking ray with the camera and mouse position
                raycaster.setFromCamera(mouse, camera);
                // if ray intersects plane, store point in vector 'intersection'
                if (raycaster.ray.intersectPlane(plane, intersection)) {
                    // offset is the intersection point minus object position,
                    // so distance from object to mouse
                    offset.copy(intersection).sub(object3d.position);
                    containerEl.style.cursor = 'move';
                    controls.enabled = false;
                }
            },
            
            dragMove = function(e) {
                e.preventDefault();
                // update picking ray.
                updateMouseRay(e);
                // if ray intersects plane, store point in vector 'intersection'
                if (dragObject) {
                    if (raycaster.ray.intersectPlane(plane, intersection)) {
                        dragObject.position.copy(intersection.sub(offset));
                        isDirty = true;
                    }
                    return;
                }
                
                // when not dragging
                var intersects = raycaster.intersectObjects(objects, true);
                if (intersects.length > 0) {
                    if (INTERSECTED != intersects[0].object) {
                        INTERSECTED = intersects[0].object;
                        // i don't understand this. set the plane based on 
                        //   1. where the camera is pointing to
                        //   2. the object under the mouse
                        // plane.setFromNormalAndCoplanarPoint(
                        //     camera.getWorldDirection(plane.normal),
                        //     INTERSECTED.position);
                    }
                    containerEl.style.cursor = 'pointer';
                } else {
                    INTERSECTED = null;
                    containerEl.style.cursor = 'auto';
                }
            },
            
            dragEnd = function(e) {
                e.preventDefault();
                dragObject = null;
                containerEl.style.cursor = 'auto';
                controls.enabled = false;
            },
            
            /**
             * Create a new wheel mesh in the 3D world and  
             * tell the epgModel to create a pattern.
             * @param {object} ptrn Pattern data object.
             */
            createPattern3D = function(ptrn) {
                var centreScale, selectScale, object3d, i, n, dot, position;
                
                object3d = wheel.clone();
                object3d.position.copy(ptrn.position3d);
                scene.add(object3d);
                objects.push(object3d);
                
                // fill properties of the pattern data.
                ptrn.object3d = object3d;
                ptrn.centreCircle3d = object3d.getObjectByName('centreCircle');
                ptrn.pointer3d = object3d.getObjectByName('pointer');
                ptrn.dots3d = object3d.getObjectByName('dots');
                ptrn.select3d = object3d.getObjectByName('select');
                ptrn.centreDot3d = object3d.getObjectByName('centreDot');
                
                updateDots(ptrn);
                
                new TWEEN.Tween({scale: 0.01})
                    .to({scale: 1.0}, 400)
                    .onUpdate(function() {
                            centreScale = this.scale * 0.3;
                            selectScale = this.scale * 0.2;
                            ptrn.centreCircle3d.scale.set(centreScale, centreScale, 1);
                            ptrn.pointer3d.scale.set(this.scale, this.scale, 1);
                            ptrn.select3d.scale.set(selectScale, selectScale, 1);
                        })
                    .start();
                
                n = ptrn.dots3d.children.length;
                for (i = 0; i < n; i++) {
                    dot = ptrn.dots3d.children[i];
                    startupAnimateDot(dot, i * 20);
                }
            },
            
            /**
             * A pattern has changed and the 3D wheel must be updated.
             * Properties that cause a redraw are steps, pulses and rotation.
             * @param {object} ptrn Pattern data object.
             */
            updatePattern3D = function(ptrn) {
                updateDots(ptrn);
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
             * Update the pattern dots.
             * @param {object} ptrn Pattern data object.
             */
            updateDots = function(ptrn) {
                var dots = ptrn.dots3d,
                    i, n, dot, rad, radius;
                
                // remove all existing dots
                n = dots.children.length;
                for (i = 0; i < n; i++) {
                    dots.remove(dots.children[0]);
                }
                
                // add new dots
                radius = 8;
                n = ptrn.steps;
                for (i = 0; i < n; i++) {
                    rad = TWO_PI * (i / n);
                    if (ptrn.euclidPattern[i]) {
                        dot = dotFilled.clone();
                    } else {
                        dot = circleOutline.clone();
                    }
                    dot.scale.set(0.1, 0.1, 1);
                    dot.translateX(Math.sin(rad) * radius);
                    dot.translateY(Math.cos(rad) * radius);
                    dots.add(dot);
                }
            },
            
            /**
             * Initialise the WebGL 3D world.
             */
            initWorld = function() {
                var light,
                    lineMaterial;
                
                renderer = new THREE.WebGLRenderer({
                    antialias: true
                });
                renderer.setClearColor(0xf9f9f9);
                renderer.setSize(containerEl.offsetWidth, containerEl.offsetHeight);
                containerEl.appendChild(renderer.domElement);
                canvasRect = renderer.domElement.getBoundingClientRect();
                
                scene = new THREE.Scene();
                
                camera = new THREE.PerspectiveCamera(45, containerEl.offsetWidth / containerEl.offsetHeight, 1, 500);
                camera.position.set(0, 0, 80);
                scene.add(camera);
                
                light = new THREE.DirectionalLight(0xffffff, 1.5);
                light.position.set(0, 0, 1);
                scene.add(light);
                
				controls = new THREE.TrackballControls(camera);
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;
				controls.noZoom = false;
				controls.noPan = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;
                controls.enabled = false;
                
                plane = new THREE.Plane();
                plane.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(plane.normal), 
                    new THREE.Vector3(0,0,0));
                    
                lineMaterial = new THREE.LineBasicMaterial({
                    color: defaultColor,
                    linewidth: 3
                });
                
                circleOutline = createLineCircle(lineMaterial);
                circleFilled = createShapeCircle(lineMaterial);
                
                dotFilled = new THREE.Object3D();
                dotFilled.add(circleFilled.clone());
                dotFilled.add(circleOutline.clone());
                
                wheel = createWheel(lineMaterial);
                
                // render world
                isDirty = true;
            },
            
            /**
             * Create combined Object3D of wheel.
             * @param {object} lineMaterial Default line drawing material.
             * @return {object} Object3D of drag plane.
             */
            createWheel = function(lineMaterial) {
                var hitarea = createShapeCircle(),
                    centreCircle = circleOutline.clone(),
                    selectCircle = circleOutline.clone(),
                    centreDot = dotFilled.clone(),
                    pointer = createPointer(lineMaterial),
                    dots = new THREE.Object3D();
                
                centreCircle.name = 'centreCircle';
                centreCircle.scale.set(0.3, 0.3, 1);
                
                selectCircle.name = 'select';
                selectCircle.scale.set(0.2, 0.2, 1);
                selectCircle.visible = false;
                
                centreDot.name = 'centreDot';
                centreDot.scale.set(0.1, 0.1, 1);
                centreDot.visible = false;
                
                pointer.name = 'pointer';
                
                dots.name = 'dots';
                
                hitarea.name = 'hitarea';
                hitarea.material.opacity = 0.0;
                hitarea.add(centreCircle);
                hitarea.add(selectCircle);
                hitarea.add(centreDot);
                hitarea.add(pointer);
                hitarea.add(dots);
                return hitarea;
            },
            
            /**
             * 
             */
            createShapeCircle = function() {
                var radius = 10,
                    numSegments = 8,
                    material = new THREE.MeshBasicMaterial({
                        color: defaultColor,
                        transparent: true
                    }),
                    geometry = new THREE.CircleGeometry(radius, numSegments);              
                material.opacity = 1.0;
                return new THREE.Mesh( geometry, material );
            },
            
            /**
             * 
             * @param {object} lineMaterial Default line drawing material.
             */
            createLineCircle = function(lineMaterial) {
                var radius = 10,
                    numSegments = 64,
                    geometry = new THREE.CircleGeometry(radius, numSegments);
                
                geometry.vertices.shift();
                return new THREE.Line(geometry, lineMaterial);
            },
            
            /**
             * 
             * @param {object} lineMaterial Default line drawing material.
             * @return {object} Line 3D object.
             */
            createPointer = function(lineMaterial) {
                var line, 
                    geometry = new THREE.Geometry();
                geometry.vertices.push(
                	new THREE.Vector3(-2.9, 0.7, 0),
                	new THREE.Vector3(0, 8, 0),
                	new THREE.Vector3(2.9, 0.7, 0)
                );
                line = new THREE.Line(geometry, lineMaterial);
                return line;
            },
            
            /**
             * Recursive function to get top level object of a group.
             * @param {object} object3d An Three.js Object3D.
             */
            getOuterParentObject = function(object3d) {
                if (object3d.object && object3d.object.parent && object3d.object.parent.type !== 'Scene') {
                    return getOuterParentObject(object3d.object.parent);
                } else if (object3d.parent && object3d.parent.type !== 'Scene') {
                    return getOuterParentObject(object3d.parent);
                }
                if (object3d.object) {
                    return object3d.object;
                }
                return object3d;
            },
            
            /**
             * Set a raycaster's ray to point from the camera to the mouse postion.
             * @param {event} mouseEvent Event rom which to get the mouse coordinates.
             */
            updateMouseRay = function(mouseEvent) {
                // update mouse vector with mouse coordinated translated to viewport
                mouse.x = ((mouseEvent.clientX - canvasRect.left) / canvasRect.width ) * 2 - 1;
				mouse.y = - ((mouseEvent.clientY - canvasRect.top) / canvasRect.height ) * 2 + 1;
                // update the picking ray with the camera and mouse position
                raycaster.setFromCamera(mouse, camera);
            },
            
            /**
             * Redraw all patterns on the canvas.
             * @param {array} patternData Array of pattern data objects.
             */
            updateWorld = function(patternData) {
                var ptrn,
                    object3D,
                    i,
                    numPatterns = patternData.length,
                    nextStartTime,
                    pulseData,
                    dot;
                
                for (i = 0; i < numPatterns; i++) {
                    ptrn = patternData[i];
                    ptrn.select3d.visible = ptrn.isSelected;
                    ptrn.pointer3d.rotation.z = TWO_PI * (-ptrn.position / ptrn.duration);
                    
                    // if a pulse starts, start the dot animation.
                    if (ptrn.isNoteOn) {
                        pulseData = ptrn.pulseStartTimes[ptrn.pulseIndex];
                        dot = ptrn.dots3d.children[pulseData.index];
                        drawPatternDotAnimation(ptrn, dot);
                    }
                }
            },
            
            /**
             * Animate the dot in the ring that starts to play and 
             * the centre dot of the wheel.
             * @param {object} ptrn Pattern wheel.
             * @param {object} dot Dot to animate in the pattern wheel ring.
             */
            drawPatternDotAnimation = function(ptrn, dot) {
                // animate current dot in the ring
                new TWEEN.Tween({scale: 0.2})
                    .to({scale: 0.10}, 300)
                    .onUpdate(function() {
                            dot.scale.set(this.scale, this.scale, 1);
                        })
                    .start();
                
                // animate centre dot
                new TWEEN.Tween({scale: 0.1})
                    .to({scale: 0.01}, 150)
                    .onStart(function() {
                            ptrn.centreDot3d.visible = true;
                        })
                    .onUpdate(function() {
                            ptrn.centreDot3d.scale.set(this.scale, this.scale, 1);
                        })
                    .onComplete(function() {
                            ptrn.centreDot3d.visible = false;
                        })
                    .start();    
            },
            
            /**
             * Update and render the 3D world.
             * @param {array} patternData Array of pattern data objects.
             */
            draw = function(patternData) {
                updateWorld(patternData);
                TWEEN.update();
                controls.update();
                renderer.render(scene, camera);
            },
            
            /**
             * Run clock and watch for redraw requests.
             */
            run = function() {
                epgModel.update(Date.now());
                // if (isDirty) {
                    // isDirty = false;
                    draw();
                // }
                TWEEN.update();
                controls.update();
                renderer.render(scene, camera);
                requestAnimationFrame(run.bind(this));
            };
        
        that = specs.that;

        initWorld();
        initDOMEvents();
        onWindowResize();
        // run();
        
        that.updatePattern3D = updatePattern3D;
        that.draw = draw;
        return that;
    }

    ns.createCanvas3d = createCanvas3d;

})(WH);
