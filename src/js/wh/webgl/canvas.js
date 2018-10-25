import { WebGLRenderer } from '../../lib/three.module.js';
import addWindowResize from '../view/windowresize.js';

export default function createCanvas3d(specs, my) {
  let that,
    store = specs.store,
    rootEl,
    renderer,

    init = function() {
      initWorld();
    },

    /**
     * Set up the 3D world.
     */
    initWorld = function() {
      renderer = new WebGLRenderer({antialias: true});
      renderer.setClearColor(0xf9f9f9);

      rootEl = document.querySelector('#canvas-container');
      rootEl.appendChild(renderer.domElement);
    },
    
    draw = function() {

    };

  my = my || {};
  
  that = addWindowResize(specs, my);

  init();
    
  that.draw = draw;
  return that;
}