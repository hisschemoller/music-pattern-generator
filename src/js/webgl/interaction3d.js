import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import { getCablesGroup, } from './connections3d.js';
import { getAllObjects, getCanvas, getScene } from './canvas3d.js';
import {
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from '../lib/threejs/build/three.module.js';

const
  doubleClickDelay = 300,
  dragOffset = new Vector3(),
  intersection = new Vector3(),
  mousePoint = new Vector2(),
  raycaster = new Raycaster();

let canvas,
  camera,
  doubleClickCounter = 0,
  doubleClickTimer,
  dragObject,
  dragObjectType,
  isConnectMode = false,
  mousePointPrevious = new Vector2(),
  plane;

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);

  canvas.addEventListener('touchend', onClick);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchstart', onTouchStart);
  canvas.addEventListener('mousedown', onTouchStart);
  canvas.addEventListener('touchmove', dragMove);
  canvas.addEventListener('mousemove', dragMove);
  canvas.addEventListener('touchend', dragEnd);
  canvas.addEventListener('mouseup', dragEnd);

  // prevent system doubleclick to interfere with the custom doubleclick
  canvas.addEventListener('dblclick', function(e) {e.preventDefault()});
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
        const intersects = raycaster.intersectObjects(getAllObjects(), true);
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
  canvas.style.cursor = 'auto';
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
      
    case 'parameter': {
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const { x, y, z, } = intersection;
        dispatch(getActions().parameterDragMove(x, y, z));
      }
      break;
    }

    // when not dragging
    default:
      const intersects = raycaster.intersectObjects(getAllObjects(), true);
      if (intersects.length > 0) {
        const intersectHitarea = intersects.find(intersect => intersect.object.name === 'hitarea');
        if (intersectHitarea) {
          canvas.style.cursor = 'pointer';
        } else {
          canvas.style.cursor = 'auto';
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
      
      case 'parameter':
        const { x, y, z, } = intersection;
        dispatch(getActions().parameterDragStart(x, y, z));
        break;
    }
    canvas.style.cursor = 'move';
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

    case actions.CREATE_PROJECT:
      toggleConnectMode(state);
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
  const intersects = raycaster.intersectObjects(getAllObjects(), true);
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
      outerObject = getOuterParentObject(intersect.object);
      const { x, y, z, } = outerObject.clone().position.add(intersect.object.position);
      dispatch(getActions().cableDragStart(
        intersect.object.userData.id,
        outerObject.userData.id, 
        x, y, z
      ));
      dragObjectType = 'connection';
    }

    // test for processor interactive objects
    intersect = intersects.find(intersect => intersect.object.name.startsWith('processor'));
    if (intersect) {
      dragObjectType = 'parameter';
      outerObject = intersect.object;
      dispatch(getActions().parameterTouchStart(intersect.object.name));
    }
  }

  if (dragObjectType === 'background') {
    outerObject = camera;
  }

  dragStart(outerObject, mousePoint);
}

export function setup() {
  canvas = getCanvas();
  camera = getScene().getObjectByName('camera');
  
  plane = new Plane();
  plane.name = 'plane';
  plane.setFromNormalAndCoplanarPoint(
    camera.getWorldDirection(plane.normal),
    new Vector3(0,0,0));

  addEventListeners();
}

/**
 * Enter or leave application connect mode.
 * @param {Boolean} isEnabled True to enable connect mode.
 */
function toggleConnectMode(state) {
  isConnectMode = state.connectModeActive;
}

/**
 * Set a raycaster's ray to point from the camera to the mouse postion.
 * @param {event} mouseEvent Event rom which to get the mouse coordinates.
 */
function updateMouseRay(e) {
  const x = isNaN(e.clientX) ? e.changedTouches[0].clientX : e.clientX;
  const y = isNaN(e.clientY) ? e.changedTouches[0].clientY : e.clientY;
  
  // update mouse vector with mouse coordinated translated to viewport
  const canvasRect = canvas.getBoundingClientRect();
  mousePoint.x = ((x - canvasRect.left) / canvasRect.width ) * 2 - 1;
  mousePoint.y = - ((y - canvasRect.top) / canvasRect.height ) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mousePoint, camera);
}
