
export function createObject3dController(specs) {
  let that,
    object3d = specs.object3d,

    initialize = function() {

    },

    setSelected = function(id) {
      object3d.getObjectByName('select').visible = id === object3d.userData.id;
    },
    
    getID = function() {
      return object3d.userData.id;
    };

  that = specs.that || {};

  initialize();

  that.setSelected = setSelected;
  that.getID = getID;
  return that;
}