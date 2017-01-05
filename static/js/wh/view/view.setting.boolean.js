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
                 checkEl = my.el.getElementsByClassName('settings__check')[0];
                 checkEl.value = my.param.getValue();
                 checkEl.addEventListener('change', onChange);
                 
                 my.param.addChangedCallback(changedCallback);
             },
             
             onChange = function(e) {
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
