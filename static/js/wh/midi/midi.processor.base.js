/**
 * Base functionality for all MIDI processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorBase(specs, my) {
        var that,
            
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
                        case 'string':
                            my.params[key] = ns.createStringParameter(paramSpecs[key]);
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
            
            getParameters = function() {
                return my.params;
            },
            
            hasParameter = function(param) {
                for (var key in my.params) {
                    if (my.params.hasOwnProperty(key)) {
                        if (my.params[key] === param) {
                            return true;
                        }
                    }
                }
                return false;
            }
            
            setProperty = function(key, value) {
                if (my.props.hasOwnProperty(key)) {
                    my.props[key] = value;
                } else {
                    console.warn('Property "' + name + '" doesn\'t exist, unable to set value "' + value + '".');
                }
            },
            
            getProperty = function(key) {
                return my.props[key];
            },
            
            /**
             * Restore processor from data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
            }, 
            
            /**
             * Write processor settings to data object.
             */
            getData = function() {
            };
       
        my = my || {};
        my.params = my.param || {};
        my.props = my.props || {};
        my.props.id = specs.id;
        my.defineParams = defineParams;
        
        that = specs.that || {};
        
        that.getParamValue = getParamValue;
        that.getParameters = getParameters;
        that.hasParameter = hasParameter;
        that.setProperty = setProperty;
        that.getProperty = getProperty;
        that.setData = setData;
        that.getData = getData;
        return that;
    };
    
    ns.createMIDIProcessorBase = createMIDIProcessorBase;

})(WH);
