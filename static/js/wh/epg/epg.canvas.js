
window.WH = window.WH || {};

(function (ns) {
    
    function createEPGCanvas(specs) {
        
        var that = specs.that,
            epgModel = specs.epgModel,
            containerEl = document.getElementById('container-webgl'),
            worldObjects,
            canvasRect,
            renderer,
            scene,
            camera,
            plane,
            mouse = new THREE.Vector2(),
            raycaster = new THREE.Raycaster(),
            intersection = new THREE.Vector3(),
            offset = new THREE.Vector3(),
            objects = [],
            dragObject,
            controls,
            intersected,
            isTouchDevice = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch,
            isDirty = false,
            doubleClickCounter = 0,
            doubleClickDelay = 300,
            doubleClickTimer,
            TWO_PI = Math.PI * 2,
        
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
             * Initialize.
             */
            setup = function() {
                initWorld();
                initDOMEvents();
                onWindowResize();
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
                        position3d: intersection.clone()
                    });
                    epgModel.selectPattern(ptrn);
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
                    // controls.enabled = false;
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
                    if (intersected != intersects[0].object) {
                        intersected = intersects[0].object;
                        // i don't understand this. set the plane based on 
                        //   1. where the camera is pointing to
                        //   2. the object under the mouse
                        // plane.setFromNormalAndCoplanarPoint(
                        //     camera.getWorldDirection(plane.normal),
                        //     intersected.position);
                    }
                    containerEl.style.cursor = 'pointer';
                } else {
                    intersected = null;
                    containerEl.style.cursor = 'auto';
                }
            },
            
            dragEnd = function(e) {
                e.preventDefault();
                dragObject = null;
                containerEl.style.cursor = 'auto';
                // controls.enabled = false;
            },
            
            /**
             * Initialise the WebGL 3D world.
             */
            initWorld = function() {
                var light,
                    lineMaterial;
                    
                worldObjects = WH.createEPGWorldObjects();
                
                renderer = new THREE.WebGLRenderer({antialias: true});
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
                
				// controls = worldObjects.createControls(camera);
                
                plane = new THREE.Plane();
                plane.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(plane.normal), 
                    new THREE.Vector3(0,0,0));
            },
            
            /**
             * Create a 3D object with the provided data.
             * @param {Object} ptrn Pattern data object.
             * @param {Boolean} isNew True if this is newly added, no restore.
             */
            createPattern3D = function(ptrn, isNew) {
                var object3d = worldObjects.createPatternWheel(ptrn, isNew);
                objects.push(object3d);
                scene.add(object3d);
            },
            
            /**
             * Delete the 3D object associated with the pattern data.
             * @param {object} ptrn Pattern data object.
             */
            deletePattern3D = function(ptrn) {
                var index = objects.indexOf(ptrn.object3d);
                objects.splice(index, 1);
                scene.remove(ptrn.object3d);
            },
            
            /**
             * A pattern has changed and the 3D wheel must be updated.
             * Properties that cause a redraw are steps, pulses and rotation.
             * @param {object} ptrn Pattern data object.
             */
            updatePattern3D = function(ptrn) {
                worldObjects.updateDots(ptrn);
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
                var ptrn, object3D, i, numPatterns, nextStartTime, pulseData, dot;
                
                numPatterns = patternData.length;
                for (i = 0; i < numPatterns; i++) {
                    ptrn = patternData[i];
                    ptrn.select3d.visible = ptrn.isSelected;
                    ptrn.pointer3d.rotation.z = TWO_PI * (-ptrn.position / ptrn.duration);
                    
                    // if a pulse starts, start the dot animation.
                    if (ptrn.isNoteOn) {
                        ptrn.isNoteOn = false;
                        // pulseData = ptrn.pulseStartTimes[ptrn.pulseIndex];
                        // dot = ptrn.dots3d.children[pulseData.index];
                        dot = ptrn.dots3d.children[ptrn.pulseIndex];
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
                    .delay(ptrn.noteStartDelay)
                    .start();
                    
                // stop centre dot animation, if any
                if (ptrn.centreDotEndTween) {
                    ptrn.centreDotEndTween.stop();
                }
                
                // animate centre dot, tween in and tween out
                var startTween = new TWEEN.Tween({scale: 0.01})
                    .to({scale: 0.10}, 10)
                    .onStart(function() {
                            ptrn.centreDot3d.visible = true;
                        })
                    .onUpdate(function() {
                            ptrn.centreDot3d.scale.set(this.scale, this.scale, 1);
                        })
                    .delay(ptrn.noteStartDelay);
                    
                var stopTween = new TWEEN.Tween({scale: 0.10})
                    .to({scale: 0.01}, 150)
                    .onUpdate(function() {
                            ptrn.centreDot3d.scale.set(this.scale, this.scale, 1);
                        })
                    .onComplete(function() {
                            ptrn.centreDot3d.visible = false;
                        })
                    .delay(ptrn.noteStopDelay - ptrn.noteStartDelay);
                
                startTween.chain(stopTween);
                startTween.start();
                
                ptrn.centreDotEndTween = stopTween;
            },
            
            /**
             * Update and render the 3D world.
             * @param {array} patternData Array of pattern data objects.
             */
            draw = function(patternData) {
                updateWorld(patternData);
                TWEEN.update();
                // controls.update();
                renderer.render(scene, camera);
            };
        
        that = specs.that;
        
        that.setup = setup;
        that.createPattern3D = createPattern3D;
        that.deletePattern3D = deletePattern3D;
        that.updatePattern3D = updatePattern3D;
        that.draw = draw;
        return that;
    }

    ns.createEPGCanvas = createEPGCanvas;

})(WH);
