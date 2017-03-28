/**
 * 3D world.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createWorld(specs) {
        
        var that,
            containerEl = document.querySelector('.webgl'),
            canvasRect,
            renderer,
            scene,
            camera,
            plane,
            mouse = new THREE.Vector2(),
            raycaster = new THREE.Raycaster(),
            intersection = new THREE.Vector3(),
            offset = new THREE.Vector3(),
            templates = {},
            views = [],
            objects = [],
            dragObject,
            intersected,
            isTouchDevice = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch,
            doubleClickCounter = 0,
            doubleClickDelay = 300,
            doubleClickTimer,
            defaultColor = 0xeeeeee,
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
                draw();
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
                window.addEventListener('scroll', onWindowScroll, false);
            },
            
            /**
             * Window resize event handler.
             */
            onWindowResize = function() {
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                canvasRect = renderer.domElement.getBoundingClientRect();
                // move camera further back when viewport height increases so objects stay the same size 
                let scale = 0.15;
                let fieldOfView = camera.fov * (Math.PI / 180); // convert fov to radians
                let targetZ = canvasRect.height / (2 * Math.tan(fieldOfView / 2));
                camera.position.set(0, 0, targetZ * scale);
            },
            
            /**
             * Window scroll event handler.
             */
            onWindowScroll = function() {
                canvasRect = renderer.domElement.getBoundingClientRect();
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
             * Select the object under the mouse.
             * Start dragging the object.
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
                    outerObject.dispatchEvent({
                        type: 'touchstart'
                    });
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
                    // create a new processor
                    ns.pubSub.fire('create.processor', {
                        type: 'epg',
                        position3d: intersection.toArray()
                    });
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
                    }
                    return;
                }
                
                // when not dragging
                var intersects = raycaster.intersectObjects(objects, true);
                if (intersects.length > 0) {
                    if (intersected != intersects[0].object) {
                        intersected = intersects[0].object;
                    }
                    containerEl.style.cursor = 'pointer';
                } else {
                    intersected = null;
                    containerEl.style.cursor = 'auto';
                }
            },
            
            dragEnd = function(e) {
                e.preventDefault();
                if (dragObject) {
                    dragObject.dispatchEvent({
                        type: 'dragend'
                    });
                }
                dragObject = null;
                containerEl.style.cursor = 'auto';
            },
            
            /**
             * Initialise the WebGL 3D world.
             */
            initWorld = function() {
                var light,
                    lineMaterial;
                
                renderer = new THREE.WebGLRenderer({antialias: true});
                renderer.setClearColor(0xf9f9f9);
                containerEl.appendChild(renderer.domElement);
                
                scene = new THREE.Scene();
                
                camera = new THREE.PerspectiveCamera(45, 1, 1, 500);
                scene.add(camera);
                
                light = new THREE.DirectionalLight(0xffffff, 1.5);
                light.position.set(0, 0, 1);
                scene.add(light);
                
                plane = new THREE.Plane();
                plane.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(plane.normal), 
                    new THREE.Vector3(0,0,0));
                    
                lineMaterial = new THREE.LineBasicMaterial({
                    color: defaultColor,
                    linewidth: 3
                });
                    
                templates.epg = ns.createWorldEPGTemplate(lineMaterial, defaultColor);
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
             * Create world object if it exists for the type.
             * @param  {Object} processor MIDI processor for which the 3D object will be a view.
             */
            createObject = function(processor) {
                var type = processor.getType();
                if (templates[type]) {
                    // create 3D object
                    var object3d = templates[type].clone();
                    objects.push(object3d);
                    scene.add(object3d);
                    // create view for the 3D object
                    switch (type) {
                        case 'epg':
                            var view = ns.createWorldEPGView({
                                processor: processor,
                                object3d: object3d
                            });
                            break;
                    }
                    views.push(view);
                }
            },
            
            /**
             * Delete world object when processor is deleted.
             * @param  {Object} processor MIDI processor for which the 3D object will be a view.
             */
            deleteObject = function(processor) {
                var n = views.length;
                while (--n >= 0) {
                    if (views[n].hasProcessor(processor)) {
                        var object3d = views[n].getObject3d();
                        objects.splice(objects.indexOf(object3d), 1);
                        scene.remove(object3d);
                        views[n].terminate();
                        views.splice(n, 1);
                        return false;
                    }
                }
            },
            
            /**
             * Update and render the 3D world.
             * @param {array} patternData Array of pattern data objects.
             */
            draw = function(patternData) {
                TWEEN.update();
                renderer.render(scene, camera);
            };
        
        that = specs.that;
        
        that.setup = setup;
        that.createObject = createObject;
        that.deleteObject = deleteObject;
        that.draw = draw;
        return that;
    }

    ns.createWorld = createWorld;

})(WH);
