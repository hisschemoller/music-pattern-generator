import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import addWindowResizeCallback from '../view/windowresize.js';
import { getCablesGroup, } from './connections3d.js';
import { setLineMaterialResolution } from './draw3dHelper.js';
import { getTheme } from '../state/selectors.js';
import { getProcessorData } from '../core/processor-loader.js'

const {
  Color,
  PerspectiveCamera,
  Plane,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer 
} = THREE;

const
  doubleClickDelay = 300,
  dragOffset = new Vector3(),
  intersection = new Vector3(),
  mousePoint = new Vector2(),
  raycaster = new Raycaster();

let 
  allObjects = [],
  camera,
  canvasRect,
  controllers = [],
  doubleClickCounter = 0,
  doubleClickTimer,
  dragObject,
  dragObjectType,
  isConnectMode = false,
  mousePointPrevious = new Vector2(),
  plane,
  renderer,
  rootEl,
  scene;

/**
 * Update any tween animations that are going on and redraw the canvases if needed.
 * @param {Number} position Transport playback position in ticks.
 * @param {Array} processorEvents Array of processor generated events to displayin the view.
 */
export function draw(position, processorEvents) {
  controllers.forEach(controller => controller.draw(position, processorEvents));
  renderer.render(scene, camera);
}

/**
 * Provide cables3d with the scene so it can add and remove cables.
 */
export function getScene() {
  return scene;
}

export function setup() {
  addWindowResizeCallback(onWindowResize);
  createWorld();
  addEventListeners();
  onWindowResize();
  draw();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);

  renderer.domElement.addEventListener('touchend', onClick);
  renderer.domElement.addEventListener('click', onClick);
  renderer.domElement.addEventListener('touchstart', onTouchStart);
  renderer.domElement.addEventListener('mousedown', onTouchStart);
  renderer.domElement.addEventListener('touchmove', dragMove);
  renderer.domElement.addEventListener('mousemove', dragMove);
  renderer.domElement.addEventListener('touchend', dragEnd);
  renderer.domElement.addEventListener('mouseup', dragEnd);

  // prevent system doubleclick to interfere with the custom doubleclick
  renderer.domElement.addEventListener('dblclick', function(e) {e.preventDefault();});
}

/** 
 * Remove all processor objects from the scene
 * and delete all their controllers.
 */
function clearProcessorViews() {

  // remove all processor 3D objects
  allObjects = allObjects.reduce((accumulator, object3D) => {
    scene.remove(object3D);
    return accumulator;
  }, []);

  // remove all controllers
  controllers = controllers.reduce((accumulator, controller) => {
    controller.terminate();
    return accumulator;
  }, []);
}
        
/**
 * Create canvas 2D object if it exists for the type.
 * @param  {Array} data Array of current processors' state.
 */
function createProcessorViews(state) {
  const { connectModeActive, processors, selectedId, } = state;
  const isConnectMode = connectModeActive;
  for (let id of processors.allIds) {
    const processorData = processors.byId[id];
    const { inputs, outputs, positionX, positionY, positionZ, type } = processorData;
    const isExists = allObjects.find(obj3d => obj3d.userData.id === id);
    if (!isExists) {

      // create the processor 3d object
      const object3dModule = getProcessorData(type, 'object3d');
      const object3d = object3dModule.createObject3d(id, inputs, outputs);
      object3d.position.set(positionX, positionY, positionZ);
      allObjects.push(object3d);
      scene.add(object3d);

      // create controller for the object
      const controllerModule = getProcessorData(type, 'object3dController');
      const controller = controllerModule.createObject3dController(object3d, processorData, isConnectMode);
      controller.updateSelectCircle(selectedId);
      controllers.push(controller);
    }
  };
}

/**
 * Set up the 3D world.
 */
function createWorld() {
  renderer = new WebGLRenderer({antialias: true});
  renderer.setClearColor(new Color( getTheme().colorBackground || '#cccccc' ));

  rootEl = document.querySelector('#canvas-container');
  rootEl.appendChild(renderer.domElement);

  scene = new Scene();

  camera = new PerspectiveCamera(45, 1, 1, 500);
  scene.add(camera);

  plane = new Plane();
  plane.name = 'plane';
  plane.setFromNormalAndCoplanarPoint(
    camera.getWorldDirection(plane.normal),
    new Vector3(0,0,0));
}
        
/**
 * Delete canvas 2D object when the processor is deleted.
 * @param  {Object} processor MIDI processor for which the 3D object will be a view.
 */
function deleteProcessorView(id) {

  // remove 3D object from allObjects
  allObjects = allObjects.reduce((accumulator, object3D) => {
    if (object3D.userData.id === id) {

      // remove 3D object from scene
      scene.remove(object3D);
      return accumulator;
    }
    return [...accumulator, object3D];
  }, []);

  // remove controller
  controllers = controllers.reduce((accumulator, controller) => {
    if (controller.getID() === id) {
      controller.terminate();
      return accumulator;
    }
    return [...accumulator, controller];
  }, []);
}
            
/**
 * Dragging 3D object ended.
 * @param  {Object} e Event.
 */
function dragEnd(e) {
  e.preventDefault();
  updateMouseRay(e);

  switch (dragObjectType) {
    case 'connection':
      if (isConnectMode) {
        const intersects = raycaster.intersectObjects(allObjects, true);
        const intersect = intersects.find(intersect => intersect.object.name === 'input_hitarea');
        const outerObject = intersect ? getOuterParentObject(intersect.object) : null;
        const connectorId = intersect ? intersect.object.userData.id : null;
        const processorId = outerObject ? outerObject.userData.id : null;
        const { x = 0, y = 0, z = 0, } = outerObject ? outerObject.clone().position.add(intersect.object.position) : {};
        
        dispatch(getActions().cableDragEnd(connectorId, processorId, x, y, z));
        dispatch(getActions().createConnection());
      }
      break;
  }

  dragObject = null;
  dragObjectType = null;
  rootEl.style.cursor = 'auto';
}
            
/**
 * Drag a 3D object.
 * @param  {Object} e Event.
 */
function dragMove(e) {
  e.preventDefault();

  // update picking ray.
  updateMouseRay(e);
  switch (dragObjectType) {
    case 'processor':
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        // set position of dragObject to the mouse intersection minus the offset
        const position = intersection.sub(dragOffset);
        dispatch(getActions().dragSelectedProcessor(intersection.x, intersection.y, position.z));
      }
      break;

    case 'background':
      const x = (mousePointPrevious.x - mousePoint.x) * 50;
      const y = (mousePointPrevious.y - mousePoint.y) * 50;
      dispatch(getActions().setCameraPosition(x, y, 0, true));
      break;

    case 'connection':
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const { x, y, z, } = intersection;
        dispatch(getActions().cableDragMove(x, y, z));
      }
      break;

    // when not dragging
    default:
      const intersects = raycaster.intersectObjects(allObjects, true);
      if (intersects.length > 0) {
        const intersectHitarea = intersects.find(intersect => intersect.object.name === 'hitarea');
        if (intersectHitarea) {
          rootEl.style.cursor = 'pointer';
        } else {
          rootEl.style.cursor = 'auto';
        }
      }
  }
  mousePointPrevious = { ...mousePoint };
}

/**
 * Initialise object dragging.
 * @param {object} object3d The Object3D to be dragged.
 * @param {object} mousePoint Mouse location.
 */
function dragStart(object3d, mousePoint) {
  dragObject = object3d;
  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mousePoint, camera);
  // if ray intersects plane, store point in vector 'intersection'
  if (raycaster.ray.intersectPlane(plane, intersection)) {
    switch (dragObjectType) {

      case 'processor':
        // offset is the intersection point minus object position,
        // so distance from object to mouse
        dragOffset.copy(intersection).sub(dragObject.position);
        break;
      
      case 'connection':
        break;

      case 'background':
        dragOffset.copy(intersection).sub(dragObject.position);
        break;
    }
    rootEl.style.cursor = 'move';
  }
}
            
/**
 * Recursive function to get top level object of a group.
 * @param {object} object3d An Three.js Object3D.
 */
function getOuterParentObject(object3d) {
  if (object3d.object && object3d.object.parent && object3d.object.parent.type !== 'Scene') {
    return getOuterParentObject(object3d.object.parent);
  } else if (object3d.parent && object3d.parent.type !== 'Scene') {
    return getOuterParentObject(object3d.parent);
  }
  if (object3d.object) {
    return object3d.object;
  }
  return object3d;
}

/**
 * Handle single mouse click.
 */
function handleClick(e) {
  const cablesGroup = getCablesGroup();
  if (cablesGroup) {
    updateMouseRay(e);

    // look for click on connection cable delete button
    const cableIntersects = raycaster.intersectObjects(cablesGroup.children, true);
    const deleteIntersect = cableIntersects.find(intersect => intersect.object.name === 'delete');
    if (deleteIntersect) {
      dispatch(getActions().disconnectProcessors(deleteIntersect.object.userData.connectionId));
    }
  }
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
                    
    case actions.SELECT_PROCESSOR:
      selectProcessorView(state);
      break;

    case actions.ADD_PROCESSOR:
      createProcessorViews(state);
      break;
              
    case actions.DELETE_PROCESSOR:
      deleteProcessorView(e.detail.action.id);
      selectProcessorView(state);
      break;

    case actions.CREATE_PROJECT:
      setThemeOnWorld();
      updateCamera(state);
      clearProcessorViews();
      createProcessorViews(state);
      onWindowResize();
      toggleConnectMode(state);
      break;
    
    case actions.SET_THEME:
      setThemeOnWorld();
      break;
    
    case actions.SET_CAMERA_POSITION:
      updateCamera(state);
      break;
    
    case actions.LIBRARY_DROP:
      onDrop(state);
      break;

    case actions.TOGGLE_CONNECT_MODE:
      toggleConnectMode(state);
      break;
  }
}

/**
 * Separate click and doubleclick.
 * @see http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
 */
function onClick(e) {
  doubleClickCounter++;
  if (doubleClickCounter == 1) {
    doubleClickTimer = setTimeout(function() {
      doubleClickCounter = 0;
      // implement single click behaviour here
      handleClick(e);
    }, doubleClickDelay);
  } else {
    clearTimeout(doubleClickTimer);
    doubleClickCounter = 0;
    // implement double click behaviour here
  }
}

/**
 * Drop of object dragged from library.
 * Create a new processor.
 */
function onDrop(state) {
  const { type, x, y, } = state.libraryDropPosition;
  updateMouseRay({ clientX: x, clientY: y, });
  if (raycaster.ray.intersectPlane(plane, intersection)) {
    dispatch(getActions().createProcessor({
      type,
      positionX: intersection.x,
      positionY: intersection.y,
      positionZ: intersection.z,
    }));
  };
}
            
/**
 * Select the object under the mouse.
 * Start dragging the object.
 */
function onTouchStart(e) {

  // update picking ray
  updateMouseRay(e);
  mousePointPrevious = { ...mousePoint };

  // get intersected object3ds
  const intersects = raycaster.intersectObjects(allObjects, true);
  let outerObject = null;
  dragObjectType = 'background';
  if (intersects.length) {

    // test for processors
    let intersect = intersects.find(intersect => intersect.object.name === 'hitarea');
    if (intersect) {
      outerObject = getOuterParentObject(intersect.object);
      dispatch(getActions().selectProcessor(outerObject.userData.id));
      dragObjectType = 'processor';
    }

    // test for output connectors
    intersect = intersects.find(intersect => intersect.object.name === 'output_hitarea');
    if (intersect && isConnectMode) {

      // get outer parent of closest object
      outerObject = getOuterParentObject(intersect.object);
      const { x, y, z, } = outerObject.clone().position.add(intersect.object.position);
      dispatch(getActions().cableDragStart(
        intersect.object.userData.id,
        outerObject.userData.id, 
        x, y, z
      ));
      dragObjectType = 'connection';
    }
  }

  if (dragObjectType === 'background') {
    outerObject = camera;
  }

  dragStart(outerObject, mousePoint);
}

/**
 * Window resize event handler.
 */
function onWindowResize() {
  canvasRect = renderer.domElement.getBoundingClientRect();
  renderer.setSize(window.innerWidth, window.innerHeight - canvasRect.top);
  camera.aspect = window.innerWidth / (window.innerHeight - canvasRect.top);
  camera.updateProjectionMatrix();
  canvasRect = renderer.domElement.getBoundingClientRect();

  // move camera further back when viewport height increases so objects stay the same size 
  const scale = 0.15;
  const fieldOfView = camera.fov * (Math.PI / 180); // convert fov to radians
  const targetZ = canvasRect.height / (2 * Math.tan(fieldOfView / 2));

  setLineMaterialResolution();

  dispatch(getActions().setCameraPosition(camera.position.x, camera.position.y, targetZ * scale));
}

/** 
 * Show the selected state of the processors.
 */
function selectProcessorView(state) {
  const { selectedId } = state;
  controllers.forEach(controller => controller.updateSelectCircle(selectedId));
}

/**
 * Set the canvas background colour.
 */
function setThemeOnWorld() {
  renderer.setClearColor(new Color(getTheme().colorBackground));
}

/**
 * Enter or leave application connect mode.
 * @param {Boolean} isEnabled True to enable connect mode.
 */
function toggleConnectMode(state) {
  isConnectMode = state.connectModeActive;
}

/**
 * Update the camera position to what's stored in the state.
 */
function updateCamera(state) {
  camera.position.set(state.camera.x, state.camera.y, state.camera.z);
}

/**
 * Set a raycaster's ray to point from the camera to the mouse postion.
 * @param {event} mouseEvent Event rom which to get the mouse coordinates.
 */
function updateMouseRay(e) {
  const x = isNaN(e.clientX) ? e.changedTouches[0].clientX : e.clientX;
  const y = isNaN(e.clientY) ? e.changedTouches[0].clientY : e.clientY;
  
  // update mouse vector with mouse coordinated translated to viewport
  mousePoint.x = ((x - canvasRect.left) / canvasRect.width ) * 2 - 1;
  mousePoint.y = - ((y - canvasRect.top) / canvasRect.height ) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mousePoint, camera);
}
