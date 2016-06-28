/**
 * @description Pattern settings view.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
window.WH = window.WH || {};
window.WH.epg = window.WH.epg || {};

(function (ns) {
    
    function createPatternSettings(specs) {
        var that,
            patterns = specs.patterns,
            settings = {
                steps: {
                    type: 'slider',
                    range: document.getElementById('steps-range'),
                    number: document.getElementById('steps-number')
                },
                pulses: {
                    type: 'slider',
                    range: document.getElementById('pulses-range'),
                    number: document.getElementById('pulses-number')
                },
                rotation: {
                    type: 'slider',
                    range: document.getElementById('rotation-range'),
                    number: document.getElementById('rotation-number')
                }
            },
            
            init = function() {
                initSetting('steps', 64);
                initSetting('pulses', 64);
                initSetting('rotation', 64);
            },
            
            initSetting = function(name, max) {
                var setting = settings[name];
                setting.range.setAttribute('max', 64);
                setting.number.setAttribute('max', 64);
                setting.range.dataset.prop = name;
                setting.number.dataset.prop = name;
                setting.range.addEventListener('change', onChange);
                setting.number.addEventListener('change', onChange);
            },
            
            /**
             * 
             */
            setPattern = function(ptrn) {
                updateSetting('steps', ptrn.steps);
                updateSetting('pulses', ptrn.pulses);
                updateSetting('rotation', ptrn.rotation);
            },
            
            updateSetting = function(name, value) {
                var setting = settings[name];
                switch (setting.type) {
                    case 'slider':
                        setting.range.value = value;
                        setting.number.value = value;
                        break;
                };
            },
            
            onChange = function(e) {
                patterns.setPatternProperty(e.target.dataset.prop, e.target.value);
            };
            
        that = specs.that;
        
        init();
        
        that.setPattern = setPattern;
        that.updateSetting = updateSetting;
        return that;
    }

    ns.createPatternSettings = createPatternSettings;

})(WH.epg);
