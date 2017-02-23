/**
 * Parameter for String values.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createStringParameter(specs, my) {
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
        
        that = ns.createBaseParameter(specs, my);
        
        return that;
    };

    ns.createStringParameter = createStringParameter;

})(WH);
