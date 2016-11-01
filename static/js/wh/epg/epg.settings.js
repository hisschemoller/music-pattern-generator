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
                rate: {
                    type: 'radio',
                    inputs: settingsEl.elements['rate']
                },
                mute: {
                    type: 'checkbox',
                    input: document.getElementById('mute-check')
                },
                name: {
                    type: 'text',
                    input: document.getElementById('name-text')
                },
                delete: {
                    type: 'button',
                    input: document.getElementById('delete-button')
                }
            },
            
            init = function() {
                initSetting('steps', 64);
                initSetting('pulses', 64);
                initSetting('rotation', 64);
                settings.name.input.dataset.prop = 'name';
                settings.name.input.addEventListener('change', onChange);
                settings.mute.input.addEventListener('change', function(e) {
                    epgModel.setPatternProperty('isMute', e.target.checked);
                });
                settings.delete.input.addEventListener('click', function(e) {
                    // TODO: show a confirmation dialog first
                    epgModel.deleteSelectedPattern();
                });
                
                for (var i = 0; i < settings.rate.inputs.length; i++) {
                    settings.rate.inputs[i].addEventListener('click', function(e) {
                        epgModel.setPatternProperty('rate', e.target.value);
                    });
                }
            },
            
            initSetting = function(name, max) {
                var setting = settings[name];
                setting.range.setAttribute('max', 64);
                setting.number.setAttribute('max', 64);
                setting.range.dataset.prop = name;
                setting.number.dataset.prop = name;
                setting.range.addEventListener('input', onChange);
                setting.range.addEventListener('change', onChange);
                setting.number.addEventListener('change', onChange);
            },
            
            /**
             * 
             */
            setPattern = function(ptrn) {
                updateSetting('steps', ptrn ? ptrn.steps : '');
                updateSetting('pulses', ptrn ? ptrn.pulses : '');
                updateSetting('rotation', ptrn ? ptrn.rotation : '');
                updateSetting('rate', ptrn ? ptrn.rate : '');
                updateSetting('name', ptrn ? ptrn.name : '');
                updateSetting('mute', ptrn ? ptrn.isMute : false);
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
            
            updateSetting = function(name, value, attr) {
                // if attr is set, just update that attribute with the value,
                // without bothering what type the element is
                if (typeof attr !== 'undefined' && !!settingsEl.elements[name]) {
                    settingsEl.elements[name].setAttribute(attr, value);
                } else {
                    var setting = settings[name];
                    switch (setting.type) {
                        case 'slider':
                            setting.range.value = value;
                            setting.number.value = value;
                            break;
                        case 'text':
                            setting.input.value = value;
                            break;
                        case 'checkbox':
                            setting.input.checked = value;
                            break;
                        case 'radio':
                            for (i = 0; i < setting.inputs.length; i++) {
                                if (setting.inputs[i].value == value) {
                                    setting.inputs[i].checked = true;
                                }
                            }
                            break;
                    };
                }
            },
            
            onChange = function(e) {
                epgModel.setPatternProperty(e.target.dataset.prop, e.target.value);
            };
            
        that = specs.that;
        
        init();
        setEnabled(false);
        
        that.setPattern = setPattern;
        that.updateSetting = updateSetting;
        return that;
    }

    ns.createEPGSettings = createEPGSettings;

})(WH.epg);
