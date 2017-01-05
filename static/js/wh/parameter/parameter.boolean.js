/**
 * Parameter for Boolean values.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createBooleanParameter(specs, my) {
        var that,
            
            normalize = function(value) {
                return value ? 1 : 0;
            },
            
            deNormalize = function(normalizedValue) {
                return normalizedValue > .5;
            };
        
        my = my || {};
        my.normalize = normalize;
        my.deNormalize = deNormalize;
        
        that = ns.createBaseParameter(specs, my);
        
        return that;
    };

    ns.createBooleanParameter = createBooleanParameter;

})(WH);
