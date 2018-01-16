import createBaseParameter from './base'

/**
 * Parameter for Boolean values.
 */
export default function createVector2DParameter(specs, my) {
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
