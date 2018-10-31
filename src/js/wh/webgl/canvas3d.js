import {
  Color,
  DirectionalLight,
  LineBasicMaterial,
  PerspectiveCamera,
  Plane,
  Scene,
  Vector3,
  WebGLRenderer 
} from '../../lib/three.module.js';
import addWindowResize from '../view/windowresize.js';
import { getThemeColors } from '../state/selectors.js';

export default function createCanvas3d(specs, my) {
  let that,
    store = specs.store,
    rootEl,
    canvasRect,
    renderer,
    scene,
    camera,
    plane,

    init = function() {
      my.addWindowResizeCallback(onWindowResize);
      initWorld();
      onWindowResize();
      draw();

      document.addEventListener(store.STATE_CHANGE, (e) => {
        switch (e.detail.action.type) {
          case e.detail.actions.CREATE_PROJECT:
          case e.detail.actions.SET_THEME:
            setThemeOnWorld();
            break;
        }
      });
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
     * Set up the 3D world.
     */
    initWorld = function() {

      renderer = new WebGLRenderer({antialias: true});

      rootEl = document.querySelector('#canvas-container');
      rootEl.appendChild(renderer.domElement);

      scene = new Scene();

      camera = new PerspectiveCamera(45, 1, 1, 500);
      scene.add(camera);

      const light = new DirectionalLight(0xffffff, 1.5);
      light.position.set(0, 0, 1);
      scene.add(light);

      plane = new Plane();
      plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(plane.normal),
        new Vector3(0,0,0));
      
    },

    setThemeOnWorld = function() {
      const themeColors = getThemeColors();
      renderer.setClearColor(new Color( themeColors.colorBackground ));
      const lineMaterial = new LineBasicMaterial({
        color: new Color( themeColors.colorHigh ),
        linewidth: 3,
      });
    },
        
    /**
     * Update any tween animations that are going on and
     * redraw the canvases if needed.
     * @param {Number} position Transport playback position in ticks.
     * @param {Array} processorEvents Array to processor generated events to displayin the view.
     */
    draw = function(position, processorEvents) {
      renderer.render(scene, camera);
    };

  my = my || {};
  
  that = addWindowResize(specs, my);

  init();
    
  that.draw = draw;
  return that;
}