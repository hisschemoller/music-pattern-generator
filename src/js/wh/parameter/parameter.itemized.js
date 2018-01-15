/**
 * Parameter for integer values between an minimum and maximum.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createItemizedParameter(specs, my) {
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
        
        that = ns.createBaseParameter(specs, my);
        
        that.getModel = getModel;
        return that;
    };

    ns.createItemizedParameter = createItemizedParameter;

})(WH);
