import {
  Color,
  DirectionalLight,
  LineBasicMaterial,
  PerspectiveCamera,
  Plane,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer 
} from '../../lib/three.module.js';
import addWindowResize from '../view/windowresize.js';
import { getThemeColors } from '../state/selectors.js';
import { util } from '../core/util.js';

export default function createCanvas3d(specs, my) {
  let that,
    store = specs.store,
    rootEl,
    canvasRect,
    renderer,
    scene,
    camera,
    plane,
    allObjects = [],
    doubleClickCounter = 0,
    doubleClickDelay = 300,
    doubleClickTimer,
    mousePoint = new Vector2(),
    raycaster = new Raycaster(),

    init = function() {
      my.addWindowResizeCallback(onWindowResize);
      initWorld();
      initDOMEvents();
      onWindowResize();
      draw();

      document.addEventListener(store.STATE_CHANGE, (e) => {
        switch (e.detail.action.type) {
          case e.detail.actions.CREATE_PROJECT:
            setThemeOnWorld();
            break;

          case e.detail.actions.SET_THEME:
            setThemeOnWorld();
            break;
        }
      });
    },
            
    /**
     * Initialise DOM events for click, drag etcetera.
     */
    initDOMEvents = function() {
      renderer.domElement.addEventListener(util.eventType.click, onClick);
      renderer.domElement.addEventListener(util.eventType.start, onTouchStart);
      // renderer.domElement.addEventListener(util.eventType.move, dragMove);
      // renderer.domElement.addEventListener(util.eventType.end, dragEnd);

      // prevent system doubleclick to interfere with the custom doubleclick
      renderer.domElement.addEventListener('dblclick', function(e) {e.preventDefault();});
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
        }
    },
            
    /**
     * Select the object under the mouse.
     * Start dragging the object.
     */
    onTouchStart = function(e) {
      // update picking ray
      updateMouseRay(e);
      // get intersected objects
      const intersects = raycaster.intersectObjects(allObjects, true);
      // select first wheel in the intersects
      if (intersects.length) {
        // get topmost parent of closest object
        const outerObject = getOuterParentObject(intersects[0]);
        outerObject.dispatchEvent({
          type: 'touchstart'
        });
        dragStart(outerObject, mouse);
      }
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
     * Set a raycaster's ray to point from the camera to the mouse postion.
     * @param {event} mouseEvent Event rom which to get the mouse coordinates.
     */
    updateMouseRay = function(mouseEvent) {
        // update mouse vector with mouse coordinated translated to viewport
        mousePoint.x = ((mouseEvent.clientX - canvasRect.left) / canvasRect.width ) * 2 - 1;
        mousePoint.y = - ((mouseEvent.clientY - canvasRect.top) / canvasRect.height ) * 2 + 1;
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mousePoint, camera);
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