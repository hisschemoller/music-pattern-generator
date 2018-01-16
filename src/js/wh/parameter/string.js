import createBaseParameter from './base'

/**
 * Parameter for String values.
 */
export default function createStringParameter(specs, my) {
    var that,
        
        normalize = function(value) {
            return value ? 1 : 0;
        },
        
        deNormalize = function(normalizedValue) {
            return value;
        };
    
    my = my || {};
    my.normalize = normalize;
    my.deNormalize = deNormalize;
    
    that = createBaseParameter(specs, my);
    
    return that;
}
