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
            canvasA = document.getElementById('canvas__animation'),
            canvasB = document.getElementById('canvas__background'),
            ctxA = canvasA.getContext('2d'),
            ctxB = canvasB.getContext('2d'),
            stepSize = 4,
           
            /**
             * Update while transport runs.
             * Passed on by patterns which adds pattern data.
             * @param {Array} patternData Data of all patterns.
             */
            drawA = function(patternData) {
                var i, 
                    numPatterns = patternData.length,
                    x, y,
                    data;
                    
                ctxA.clearRect(0, 0, 300, 200);
                
                for (i = 0; i < numPatterns; i++) {
                    ptrn = patternData[i];
                    x = 10 + ((ptrn.position / ptrn.duration) * ((ptrn.steps - 1) * stepSize));
                    y = 10 + (i * (10 + stepSize));
                    ctxA.save();
                    ctxA.translate(x, y);
                    ctxA.fillStyle = ptrn.isOn ? '#666' : '#999';
                    h = ptrn.isOn ? stepSize * 1.5 : stepSize;
                    ctxA.fillRect(0, 0, stepSize, h);
                    ctxA.restore();
                }
            },
            
            drawB = function(patternData) {
                var i, j, 
                    numPatterns = patternData.length,
                    numSteps,
                    x, y,
                    data;
                    
                ctxB.clearRect(10, 10, 300, 30);
                
                for (i = 0; i < numPatterns; i++) {
                    data = patternData[i];
                    y = 10 + (i * (10 + stepSize));
                    numSteps = data.steps;
                    for (j = 0; j < numSteps; j++) {
                        x = 10 + (j * stepSize);
                        ctxB.save();
                        ctxB.translate(x, y);
                        ctxB.fillStyle = (data.euclidPattern[j]) ? '#ccc' : '#eee';
                        ctxB.fillRect(0, 0, stepSize, stepSize);
                        ctxB.restore();
                    }
                }
            };
           
       that = specs.that;
       
       that.drawA = drawA;
       that.drawB = drawB;
       return that;
   }

   ns.createPatternCanvas = createPatternCanvas;

})(WH.epg);
