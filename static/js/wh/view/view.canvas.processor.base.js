/**
 * Base functionality for processor canvas views.
 */

window.WH = window.WH || {};

(function (WH) {
    
    var connectorGraphic,
        
        /**
         * Singleton canvas graphic for processor view connection point.
         * @return {Object} Connector graphic.
         */
        getConnectorGraphic = function() {
            if (!connectorGraphic) {
                const canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    radius = 12,
                    lineWidth = 2,
                    resource = {
                        radius: radius,
                        lineWidth: lineWidth,
                        canvas: canvas,
                        ctx: ctx,
                        setTheme: function(theme) {
                            console.log(theme);
                            this.ctx.lineWidth = this.lineWidth;
                            this.ctx.strokeStyle = theme ? theme.colorHigh : '#333';
                            this.ctx.setLineDash([4, 4]);
                            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                            this.ctx.moveTo(this.radius, 0);
                            this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
                            this.ctx.stroke();
                        }
                    };
                    
                canvas.width = (radius + lineWidth) * 2;
                canvas.height = (radius + lineWidth) * 2;
                connectorGraphic = resource;
            }
            return connectorGraphic;
        };
    
    // Create the connector graphic.
    getConnectorGraphic().setTheme();
    
    function createCanvasProcessorBaseView(specs, my) {
        var that,
        
            getProcessor = function() {
                return my.processor;
            },
            
            setPosition2d = function(position2d) {
                my.processor.setParamValue('position2d', position2d);
            },
            
            getPosition2d = function() {
                return my.processor.getParamValue('position2d');
            },
            
            getConnectorCanvas = function() {
                return getConnectorGraphic().canvas;
            };
        
        my = my || {};
        my.processor = specs.processor;
        my.getConnectorGraphic = getConnectorGraphic;
        my.colorHigh = '#cccccc';
        my.colorMid = '#dddddd';
        my.colorLow = '#eeeeee';
        
        that = specs.that || {};
        
        that.getProcessor = getProcessor;
        that.setPosition2d = setPosition2d;
        that.getPosition2d = getPosition2d;
        that.getConnectorCanvas = getConnectorCanvas;
        return that;
    }
    
    WH.createCanvasProcessorBaseView = createCanvasProcessorBaseView;

})(WH);