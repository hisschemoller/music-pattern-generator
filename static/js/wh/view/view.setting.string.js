/**
 * Processor setting view for a Boolean type parameter,
 * which has a checkbox input.
 * @namespace WH
 */
 
 window.WH = window.WH || {};

 (function (ns) {
     
     function createStringSettingView(specs, my) {
         var that,
             textEl,
             
             init = function() {
                 textEl = my.el.getElementsByClassName('setting__text')[0];
                 textEl.value = my.param.getValue();
                 textEl.addEventListener('input', onChange);
                 
                 my.param.addChangedCallback(changedCallback);
             },
             
             onChange = function(e) {
                 e.preventDefault();
                 my.param.setValue(e.target.value);
             },
             
             changedCallback = function(parameter, oldValue, newValue) {
                 textEl.value = newValue;
             };
         
         my = my || {};
         
         that = ns.createBaseSettingView(specs, my);
         
         init();
         
         return that;
     };

     ns.createStringSettingView = createStringSettingView;

 })(WH);
