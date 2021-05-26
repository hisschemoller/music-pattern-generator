import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import addWindowResizeCallback from '../view/windowresize.js';
import { setLineMaterialResolution } from './draw3dHelper.js';
import { getTheme } from '../state/selectors.js';
import { getProcessorData } from '../core/processor-loader.js'
import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer 
} from '../lib/threejs/build/three.module.js';

let allObjects = [],
  camera,
  canvasRect,
  controllers = [],
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
 * Provide interaction3d with allObjects to get rayCaster intersections.
 */
export function getAllObjects() {
  return allObjects;
}

/**
 * Provide interaction3d with the canvas so it can add event listeners.
 */
export function getCanvas() {
  return renderer.domElement;
}

/**
 * Provide connections3d with the scene so it can add and remove cables.
 * Provide interaction3d so it can find the camera.
 */
export function getScene() {
  return scene;
}

export function setup() {
  addWindowResizeCallback(onWindowResize);
  createWorld();
  addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
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
  camera.name = 'camera';
  scene.add(camera);
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
    if (controller.getId() === id) {
      controller.terminate();
      return accumulator;
    }
    return [...accumulator, controller];
  }, []);
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
      // toggleConnectMode(state);
      break;
    
    case actions.SET_THEME:
      setThemeOnWorld();
      break;
    
    case actions.SET_CAMERA_POSITION:
      updateCamera(state);
      break;
  }
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
 * Update the camera position to what's stored in the state.
 */
function updateCamera(state) {
  camera.position.set(state.camera.x, state.camera.y, state.camera.z);
}
