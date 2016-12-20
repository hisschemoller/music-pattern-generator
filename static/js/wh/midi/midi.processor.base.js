/**
 * Base functionality for all MIDI processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorBase(specs, my) {
        var that,
            
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
        my.props = my.props || {};
        my.props.id = specs.id;
        my.props.isSelected = specs.isSelected || false;
        
        that = specs.that || {};
        
        that.setProperty = setProperty;
        that.getProperty = getProperty;
        return that;
    };
    
    ns.createMIDIProcessorBase = createMIDIProcessorBase;

})(WH);
