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
    mousePoint = new Vector2(),
    intersection = new Vector3(),
    offset = new Vector3(),
    raycaster = new Raycaster(),
    intersectedObject,
    lineMaterial,
    dragObject,
    allObjects = [],
    views = [],
    doubleClickCounter = 0,
    doubleClickDelay = 300,
    doubleClickTimer,

    init = function() {
      my.addWindowResizeCallback(onWindowResize);
      initWorld();
      initDOMEvents();
      onWindowResize();
      draw();

      document.addEventListener(store.STATE_CHANGE, (e) => {
        switch (e.detail.action.type) {       
          case e.detail.actions.ADD_PROCESSOR:
            createProcessorViews(e.detail.state);
            break;

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
      renderer.domElement.addEventListener(util.eventType.move, dragMove);
      renderer.domElement.addEventListener(util.eventType.end, dragEnd);

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
        dragStart(outerObject, mousePoint);
      }
    },
            
    /**
     * Initialise object dragging.
     * @param {object} object3d The Object3D to be dragged.
     */
    dragStart = function(object3d, mousePoint) {
        dragObject = object3d;
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mousePoint, camera);
        // if ray intersects plane, store point in vector 'intersection'
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            // offset is the intersection point minus object position,
            // so distance from object to mouse
            offset.copy(intersection).sub(object3d.position);
            rootEl.style.cursor = 'move';
        }
    },
            
    /**
     * Drag a 3D object.
     * @param  {Object} e Event.
     */
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
        var intersects = raycaster.intersectObjects(allObjects, true);
        if (intersects.length > 0) {
            if (intersectedObject != intersects[0].object) {
              intersectedObject = intersects[0].object;
            }
            rootEl.style.cursor = 'pointer';
        } else {
            intersectedObject = null;
            rootEl.style.cursor = 'auto';
        }
    },
            
    /**
     * Dragging 3D object ended.
     * @param  {Object} e Event.
     */
    dragEnd = function(e) {
        e.preventDefault();
        if (dragObject) {
            dragObject.dispatchEvent({
                type: 'dragend'
            });
        }
        dragObject = null;
        rootEl.style.cursor = 'auto';
    },

    /**
     * Set up the 3D world.
     */
    initWorld = function() {

      renderer = new WebGLRenderer({antialias: true});
      renderer.setClearColor(new Color( getThemeColors().colorBackground || '#cccccc' ));

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
      lineMaterial = new LineBasicMaterial({
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
     * Create canvas 2D object if it exists for the type.
     * @param  {Array} data Array of current processors' state.
     */
    createProcessorViews = function(state) {
      state.processors.allIds.forEach((id, i) => {
        const processorData = state.processors.byId[id];
        if (!views[i] || (id !== views[i].getID())) {
          console.log('processorData', processorData);
          import(`../processors/${processorData.type}/object3d.js`)
            .then(module => {
              // const view = module.createGraphic({ 
              //   data: processorData,
              //   store: store,
              //   canvasDirtyCallback: my.markDirty,
              //   theme: getThemeColors()
              // });

              // create the processor 3d object
              const object3d = module.createObject3d(lineMaterial, getThemeColors().colorHigh);
              allObjects.push(object3d);
              scene.add(object3d);
              const view = null;
              views.splice(i, 0, view);

              // update the picking ray with the camera and mouse position
              const point = {
                x: (processorData.positionX / canvasRect.width ) * 2 - 1,
                y: - (processorData.positionY / canvasRect.height ) * 2 + 1,
              };
              raycaster.setFromCamera(point, camera);
              
              // position the new processor in the scene
              if (raycaster.ray.intersectPlane(plane, intersection)) {
                object3d.position.copy(intersection.sub(offset));
              }
            });
        }
      });
    },
            
    /**
     * Create world object if it exists for the type.
     * @param  {Object} processor MIDI processor for which the 3D object will be a view.
     */
    // createObject = function(processor) {
    //   var type = processor.getType();
    //   if (templates[type]) {
    //     // create 3D object
    //     const object3d = templates[type].clone();
    //     objects.push(object3d);
    //     scene.add(object3d);
    //     // create view for the 3D object
    //     switch (type) {
    //       case 'epg':
    //         var view = ns.createWorldEPGView({
    //           processor: processor,
    //           object3d: object3d
    //         });
    //         break;
    //     }
    //     views.push(view);
    //   }
    // },
        
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