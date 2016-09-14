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
    
    function createEPGSettings(specs) {
        var that,
            epgModel = specs.epgModel,
            settingsEl = document.getElementById('settings')
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
                },
                name: {
                    type: 'text',
                    input: document.getElementById('name-text')
                }
            },
            
            init = function() {
                initSetting('steps', 64);
                initSetting('pulses', 64);
                initSetting('rotation', 64);
                settings.name.input.dataset.prop = 'name';
                settings.name.input.addEventListener('change', onChange);
                document.getElementById('delete-button').addEventListener('click', function(e) {
                    // show a confirmation dialog first
                    epgModel.deleteSelectedPattern();
                });
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
                if (ptrn) {
                    updateSetting('steps', ptrn.steps);
                    updateSetting('pulses', ptrn.pulses);
                    updateSetting('rotation', ptrn.rotation);
                    updateSetting('name', ptrn.name);
                }
                setEnabled(ptrn !== null && ptrn !== undefined);
            },
            
            /**
             * Enable or disable all the settings panel inputs.
             * @param {Boolean} isEnabled True to enable the inputs.
             */
            setEnabled = function(isEnabled) {
                var inputs = settingsEl.getElementsByTagName('input'),
                    i;
                for (i = 0; i < inputs.length; i++) {
                    inputs[i].disabled = !isEnabled;
                }
            },
            
            updateSetting = function(name, value) {
                var setting = settings[name];
                switch (setting.type) {
                    case 'slider':
                        setting.range.value = value;
                        setting.number.value = value;
                        break;
                    case 'text':
                        setting.input.value = value;
                };
            },
            
            onChange = function(e) {
                epgModel.setPatternProperty(e.target.dataset.prop, e.target.value);
            };
            
        that = specs.that;
        
        init();
        
        that.setPattern = setPattern;
        that.updateSetting = updateSetting;
        return that;
    }

    ns.createEPGSettings = createEPGSettings;

})(WH.epg);
