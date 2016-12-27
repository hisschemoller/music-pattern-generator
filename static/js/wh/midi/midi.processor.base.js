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
                    paramSpecs[key].callback = paramCallback;
                    my.params[key] = WH.createParameter(paramOptions[key]);
                }
                setPreset(my.defaultPreset);
            },
            
            /**
             * Called by the processor's parameters if their value is changed.
             */
            paramCallback = function(key, value, timestamp) {
                // call the plugin's handler for this parameter
                my['$' + key](value, timestamp);
                // update the plugin's view with the new parameter value
                pubSub.trigger(getId(), {
                    key: key,
                    param: params[key]
                });
            },
            
            setProperty = function(name, value) {
                if (my.props.hasOwnProperty(name)) {
                    my.props[name] = value;
                } else {
                    console.warn('Property "' + name + '" doesn\'t exist, unable to set value "' + value + '".');
                }
            },
            
            getProperty = function(name) {
                return my.props[name];
            };
       
        my = my || {};
        my.params = my.param || {};
        my.props = my.props || {};
        my.props.id = specs.id;
        my.props.isSelected = specs.isSelected || false;
        my.defineParams = defineParams;
        
        that = specs.that || {};
        
        that.setProperty = setProperty;
        that.getProperty = getProperty;
        return that;
    };
    
    ns.createMIDIProcessorBase = createMIDIProcessorBase;

})(WH);
