/**
 * Base object for all processor WebGL object controllers.
 *
 * @export
 * @param {Object} specs
 * @param {Object} my Shared properties.
 */
export default function createObject3dControllerBase(specs, my) {
  let that;
  
  my.store = specs.store,
  my.id = specs.object3d.userData.id;
  my.object3d = specs.object3d;

  that = specs.that || {};

  return that;
}