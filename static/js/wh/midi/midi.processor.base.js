/**
 * Base functionality for all MIDI processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorBase(specs, my) {
        var that,
            settingsView = ns.createMidiProcessorSettingsView,
            
            /**
             * Create parameters from an object of parameter specifications.
             * @param  {Object} paramSpecs Definitions of all the processor's parameters. 
             */
            defineParams = function(paramSpecs) {
                for (var key in paramSpecs) {
                    paramSpecs[key].key = key;
                    switch(paramSpecs[key].type) {
                        case 'integer':
                            my.params[key] = ns.createIntegerParameter(paramSpecs[key]);
                            break;
                        case 'boolean':
                            my.params[key] = ns.createBooleanParameter(paramSpecs[key]);
                            break;
                        case 'itemized':
                            my.params[key] = ns.createItemizedParameter(paramSpecs[key]);
                            break;
                    }
                    my.params[key].addChangedCallback(paramChangedCallback);
                }
                // setPreset(my.defaultPreset);
            },
            
            /**
             * Called by the processor's parameters if their value is changed.
             */
            paramChangedCallback = function(parameter, oldValue, newValue) {
                // call the plugin's handler for this parameter
                my['$' + parameter.getProperty('key')](newValue);
            },
            
            getParamValue = function(key) {
                if (my.params.hasOwnProperty(key)) {
                    return my.params[key].getValue();
                }
            },
            
            setProperty = function(key, value) {
                if (my.props.hasOwnProperty(key)) {
                    my.props[key] = value;
                } else {
                    console.warn('Property "' + name + '" doesn\'t exist, unable to set value "' + value + '".');
                }
            },
            
            getParameters = function() {
                return my.params;
            },
            
            getProperty = function(key) {
                return my.props[key];
            };
       
        my = my || {};
        my.params = my.param || {};
        my.props = my.props || {};
        my.props.id = specs.id;
        my.props.isSelected = specs.isSelected || false;
        my.defineParams = defineParams;
        
        that = specs.that || {};
        
        that.getParamValue = getParamValue;
        that.setProperty = setProperty;
        that.getProperty = getProperty;
        that.getParameters = getParameters;
        return that;
    };
    
    ns.createMIDIProcessorBase = createMIDIProcessorBase;

})(WH);
