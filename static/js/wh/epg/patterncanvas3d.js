/**
 * @description Pattern canvas view.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
window.WH = window.WH || {};
window.WH.epg = window.WH.epg || {};

(function (ns) {
    
    function createPatternCanvas3d(specs) {
        
        var that = specs.that,
            containerEl = document.getElementById('container-webgl'),
            renderer,
            scene,
            camera,
            circle,
            doubleClickCounter = 0,
            doubleClickDelay = 300,
            doubleClickTimer,
            isTouchDevice = 'ontouchstart' in document.documentElement,
        
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
        
            init = function() {
                var light;
                
                renderer = new THREE.WebGLRenderer({
                    antialias: true
                });
                renderer.setClearColor(0xf9f9f9);
                renderer.setSize(containerEl.offsetWidth, containerEl.offsetHeight);
                containerEl.appendChild(renderer.domElement);
                
                scene = new THREE.Scene();
                
                camera = new THREE.PerspectiveCamera(45, containerEl.offsetWidth / containerEl.offsetHeight, 1, 500);
                camera.position.set(0, 0, 80);
                scene.add(camera);
                
                light = new THREE.DirectionalLight(0xffffff, 1.5);
                light.position.set(0, 0, 1);
                scene.add(light);
                
                circle = createCircle();
                
                var c1 = circle.clone();
                var c2 = circle.clone();
                c2.scale.y = 0.5;
                scene.add(c1);
                scene.add(c2);
                
                // render it
                renderer.render(scene, camera);
            },
            
            initDOMEvents = function() {
                renderer.domElement.addEventListener(eventType.click, onClick);
                renderer.domElement.addEventListener(eventType.start, onTouchStart);
                // prevent system doubleclick to interfere with the custom doubleclick
                renderer.domElement.addEventListener('dblclick', function(e) {e.preventDefault();});
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
                        // single click
                        doubleClickCounter = 0;
                        // not used yet
                    }, doubleClickDelay);
                } else {
                    // doubleclick
                    clearTimeout(doubleClickTimer);
                    doubleClickCounter = 0;
                    // create new pattern
                    console.log('double click');
                    // translate from mouse position to 3D world position at z == 0
                    // @see http://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
                    // patterns.createPattern({
                    //     canvasX: e.clientX - rect.left,
                    //     canvasY: e.clientY - rect.top
                    // });
                }
            },
            
            /**
             * Start dragging a pattern.
             */
            onTouchStart = function(e) {
                
            },
            
            /**
             * Create a line circle
             */
            createCircle = function() {
                var geometry,
                    vector,
                    material,
                    circle,
                    radius = 10,
                    numSegments = 120,
                    pointIndex,
                    i, x, y,
                    twoPi = Math.PI * 2;
                
                // create an empty geometry object to hold the line vertex data
                geometry = new THREE.Geometry();
                
                // create points along the circumference of a circle with radius
                for (i = 0; i <= numSegments; i++) {
                    pointIndex = i % numSegments;
                    x = radius * Math.cos((pointIndex / numSegments) * twoPi);
                    y = radius * Math.sin((pointIndex / numSegments) * twoPi);
                    vector = new THREE.Vector3(x, y, 0);
                    geometry.vertices.push(vector);
                }
                
                // create a line material
                material = new THREE.LineBasicMaterial({
                    color: 0xdddddd,
                    linewidth: 3
                });
                
                // create the line circle
                circle = new THREE.Line(geometry, material);
                
                return circle;
            },
            
            draw = function(patternData) {
                // circle.rotation.x += 0.017;
                // circle.rotation.y += 0.01;
                // circle.rotation.y += 0.023;
                // renderer.render(scene, camera);
            };
       
   that = specs.that;
   
   init();
   initDOMEvents();
   
   that.draw = draw;
   return that;
}

ns.createPatternCanvas3d = createPatternCanvas3d;

})(WH.epg);
