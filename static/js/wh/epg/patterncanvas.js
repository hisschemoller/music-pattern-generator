/**
 * @description Pattern canvas view.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
window.WH = window.WH || {};
window.WH.epg = window.WH.epg || {};

(function (ns) {
    
    function createPatternCanvas(specs) {
        
        var that = specs.that,
            canvas = document.getElementById('canvas'),
            ctx = canvas.getContext('2d'),
           
            /**
             * Update while transport runs.
             * Passed on by patterns which adds pattern data.
             * @param {Array} patternData Data of all patterns.
             */
            draw = function(patternData) {
                var i, 
                    n = patternData.length,
                    x, y,
                    data;
                    
                ctx.fillStyle = '#ccc';
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 2;
                ctx.clearRect(10, 10, 300, 30);
                
                for (i = 0; i < n; i++) {
                    data = patternData[i];
                    x = 10 + (data.position / 20);
                    y = 10 + (i * 10);
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.fillRect(0, 0, 4, 4);
                    ctx.restore();
                }
            };
           
       that = specs.that;
       
       that.draw = draw;
       return that;
   }

   ns.createPatternCanvas = createPatternCanvas;

})(WH.epg);
