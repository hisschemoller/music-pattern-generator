/**
 * Parameter for Boolean values.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createVector3DParameter(specs, my) {
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

    ns.createVector3DParameter = createVector3DParameter;

})(WH);
