
window.WH = window.WH || {};

(function (ns) {
    
    function createEPGWorld(specs) {
        var that,
            renderer,
            scene,
            camera,
            plane,
            controls,
            circleOutline,
            circleFilled,
            dotFilled,
            wheel,
            
            containerEl,
            canvasRect,
        
        /**
         * Initialise the WebGL 3D world.
         */
        initWorld = function() {
            var light, lineMaterial;
            
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
         * Create a base filled circle to clone and reuse.
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
         * Create a base outline circle to clone and reuse.
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
         * Create a base pointer triangle to clone and reuse.
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
        };
        
    that = specs.that;
    
    initWorld();
    
    return that;
}

ns.createEPGCanvas = createEPGCanvas;

})(WH);
        
