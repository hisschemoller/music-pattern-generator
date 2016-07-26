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
            // create the Three.js renderer, add it to our div
            var renderer = new THREE.WebGLRenderer();
            renderer.setSize(containerEl.offsetWidth, containerEl.offsetHeight);
            containerEl.appendChild(renderer.domElement);
            // Create a new Three.js scene
            var scene = new THREE.Scene();
            // Create a camera and add it to the scene
            var camera = new THREE.PerspectiveCamera(45, containerEl.offsetWidth / containerEl.offsetHeight, 1, 4000);
            camera.position.set(0, 0, 3.3333);
            scene.add(camera);
            // Now, create a rectangle and add it to the scene
            var geometry = new THREE.PlaneGeometry(1, 1);
            var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
            scene.add(mesh);
            // Render it
            renderer.render(scene, camera);
        };
       
   that = specs.that;
   
   init();
   
   return that;
}

ns.createPatternCanvas3d = createPatternCanvas3d;

})(WH.epg);
