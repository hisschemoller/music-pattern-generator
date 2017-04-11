/**
 * Processor setting view for a Boolean type parameter,
 * which has a checkbox input.
 * @namespace WH
 */
 
 window.WH = window.WH || {};

 (function (ns) {
     
     function createBooleanSettingView(specs, my) {
         var that,
             checkEl,
             
             init = function() {
                 let id = getTemporaryInputAndLabelId();
                 
                 checkEl = my.el.querySelector('.setting__check');
                 checkEl.value = my.param.getValue();
                 checkEl.setAttribute('id', id);
                 checkEl.addEventListener('change', onChange);
                 
                 let labelEl = my.el.querySelector('.toggle__label');
                 labelEl.setAttribute('for', id);
                 
                 my.param.addChangedCallback(changedCallback);
             },
             
             /**
              * A quick ID to tie label to input elements.
              * @return {Number} Unique ID.
              */
             getTemporaryInputAndLabelId = function() {
                 return 'id' + Math.random() + performance.now();
             },
             
             onChange = function(e) {
                 console.log(e.target);
                 my.param.setValue(e.target.checked);
             },
             
             changedCallback = function(parameter, oldValue, newValue) {
                 checkEl.value = newValue;
             };
         
         my = my || {};
         
         that = ns.createBaseSettingView(specs, my);
         
         init();
         
         return that;
     };

     ns.createBooleanSettingView = createBooleanSettingView;

 })(WH);
