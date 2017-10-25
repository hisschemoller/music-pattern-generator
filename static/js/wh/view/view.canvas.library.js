/**
 * Reusable canvas graphics.
 */

window.WH = window.WH || {};

(function (WH) {
    
    function createCanvasLibrary(specs, my) {
        var that,
            resources = {},
            
            init = function() {
                resources['connectionPoint'] = createConnectionPoint();
            },
            
            /**
             * Connection input or output circle.
             * @return {Object} Resource object.
             */
            createConnectionPoint = function() {
                const canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    radius = 10,
                    lineWidth = 2
                    resource = {
                        radius: radius,
                        lineWidth: lineWidth,
                        canvas: canvas,
                        ctx: ctx,
                        setTheme: function(theme) {
                            this.ctx.lineWidth = this.lineWidth;
                            this.ctx.strokeStyle = theme.colorHigh;
                            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                            this.ctx.moveTo(this.radius, 0);
                            this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
                            this.ctx.stroke();
                        }
                    };
                    
                canvas.width = (radius + lineWidth) * 2;
                canvas.height = (radius + lineWidth) * 2;
                
                return resource;
            },
            
            /**
             * Update all resources with the new theme.
             * @param {Object} theme Theme settings object.
             */
            setThemeOnLibrary = function(theme) {
                for (let key in resources) {
                    if (resources.hasOwnProperty(key) && typeof resources[key].setTheme == 'function') {
                        resources[key].setTheme(theme);
                    }
                }
            },
            
            /**
             * Get a resource from the library by key.
             * @param  {String} key Resource key.
             * @return {Object} Canvas element.
             */
            getResource = function(key) {
                let resource = null;
                if (resources.hasOwnProperty(key)) {
                    resource = resources[key].canvas;
                }
                return resource;
            };
        
        my = my || {};
        my.setThemeOnLibrary = setThemeOnLibrary;
        my.getResource = getResource;
        
        that = specs.that || {};
        
        init();
        
        return that;
    };


    WH.createCanvasLibrary = createCanvasLibrary;

})(WH);