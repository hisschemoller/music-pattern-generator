import createBaseParameter from './base'

/**
 * Parameter for integer values between an minimum and maximum.
 */
export default function createItemizedParameter(specs, my) {
    var that,
        
        normalize = function(value) {
            return (value - my.min) / (my.max - my.min);
        },
        
        deNormalize = function(normalizedValue) {
            if (normalizedValue == 1) {
                return values[my.model[my.model.length - 1].value];
            }
            return my.model[Math.floor(normalizedValue * my.model.length)].value;
        },
        
        getModel = function() {
            return my.model;
        };
    
    my = my || {};
    my.model = specs.model;
    my.normalize = normalize;
    my.deNormalize = deNormalize;
    
    that = createBaseParameter(specs, my);
    
    that.getModel = getModel;
    return that;
}
