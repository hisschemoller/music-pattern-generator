/**
 * Parameter for integer values between an minimum and maximum.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createIntegerParameter(specs, my) {
        var that,
            
            normalize = function(value) {
                return (value - my.min) / (my.max - my.min);
            },
            
            deNormalize = function(normalizedValue) {
                return Math.round(my.min + normalizedValue * (my.max - my.min));
            };
        
        my = my || {};
        my.min = specs.min;
        my.max = specs.max;
        my.normalize = normalize;
        my.deNormalize = deNormalize;
        
        that = ns.createBaseParameter(specs, my);
        
        return that;
    };

    ns.createIntegerParameter = createIntegerParameter;

})(WH);
