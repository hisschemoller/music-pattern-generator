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
        
            init = function() {
                var renderer,
                    scene,
                    camera,
                    light,
                    circle;
                
                renderer = new THREE.WebGLRenderer({
                    antialias: true
                });
                renderer.setClearColor(0xffffff);
                renderer.setSize(containerEl.offsetWidth, containerEl.offsetHeight);
                containerEl.appendChild(renderer.domElement);
                
                scene = new THREE.Scene();
                
                camera = new THREE.PerspectiveCamera(45, containerEl.offsetWidth / containerEl.offsetHeight, 1, 500);
                camera.position.set(0, 0, 80);
                scene.add(camera);
                
                light = new THREE.DirectionalLight(0xffffff, 1.5);
                light.position.set(0, 0, 1);
                scene.add(light);
                
                // Now, create a rectangle and add it to the scene
                // var geometry = new THREE.PlaneGeometry(1, 1);
                // var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
                // scene.add(mesh);
                
                circle = createCircle(scene);
                
                var c1 = circle.clone();
                scene.add(c1);
                
                // render it
                renderer.render(scene, camera);
            }
            
            /**
             * Create a line circle
             */
            createCircle = function(scene) {
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
                
            };
       
   that = specs.that;
   
   init();
   
   that.draw = draw;
   return that;
}

ns.createPatternCanvas3d = createPatternCanvas3d;

})(WH.epg);
