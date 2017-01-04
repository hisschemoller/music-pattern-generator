/**
 * MappingIntLinear interpolates(linear) a normalized value
 * into the given range(min/max): int
 *
 * @author Andre Michelle
 * @author Wouter Hisschemöller
 *
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMappingIntLinear(specs, my) {
        var that,
            min = specs.min,
            max = specs.max,
            
            normalize = function(value) {
                return (value - min) / (max - min);
            },
            
            deNormalize = function(normalizedValue) {
                return Math.round(min + normalizedValue * (max - min));
            },
            
            getMin = function() {
                return min;
            },
            
            getMax = function() {
                return max;
            };
        
        my.normalize = normalize;
        my.deNormalize = deNormalize;
        my.getMin = getMin;
        my.getMax = getMax;
        
        that = specs.that || {};
        
        return that;
    }

    ns.createMappingIntLinear = createMappingIntLinear;

})(WH);
