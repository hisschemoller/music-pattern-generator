/**
 * @description EPG pattern data object.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH
 */
 
 window.WH = window.WH || {};

(function (ns) {
    
    function createEPGPatternData(specs) {
        specs = specs || {};
        
        var that = {
            // euclidean settings
            steps: specs.steps || 16,
            pulses: specs.pulses || 4,
            rotation: specs.rotation || 0,
            euclidPattern: specs.euclidPattern || [],
            
            // midi settings
            outChannel: specs.outChannel || 10,
            outPitch: specs.outPitch || 60,
            outVelocity: specs.outVelocity || 10,
            inChannel: specs.inChannel || 1,
            inPitch: specs.inPitch || 60,
            
            // misc settings
            // rate in beats, quarter note multiplier
            rate: specs.rate || 0.25,
            // convert to triplets by multiplying rate with 2/3
            isTriplets: specs.isTriplets || false,
            // note length in beats, quarter note multiplier
            noteLength: specs.noteLength || 0.25,
            name: specs.name || '',
            isMute: specs.isMute || false,
            isSolo: specs.isSolo || false,
            isNotSolo: specs.isNotSolo || false,
            
            // position and duration in ticks
            position: specs.position || 0,
            duration: specs.duration || 0,
            
            isOn: false,
            isNoteOn: false,
            isSelected: false,
            
            offPosition: 0,
            lastPosition: 0,
            
            // delay in milliseconds before note start and stop
            noteStartDelay: 0,
            noteStopDelay: 0,
            // tween that indicates the ending of a note
            centreDotEndTween: null,
            
            // 
            pulseIndex: 0,
            
            // canvas position and size
            canvasX: specs.canvasX || 0,
            canvasY: specs.canvasY || 0,
            
            // 3D object properties
            object3d: specs.object3d || null,
            centreCircle3d: specs.centreCircle3d || null,
            select3d: specs.select3d || null,
            centreDot3d: specs.centreDot3d || null,
            pointer3d: specs.pointer3d || null,
            polygon3d: specs.polygon3d || null,
            dots3d: specs.dots3d || null,
            position3d: specs.position3d || null,
            hitarea3d: specs.hitarea3d || null,
            zeroMarker3d: specs.zeroMarker3d || null,
            zeroMarker3d: specs.rotatedMarker3d || null,
            radius3d: specs.radius3d || 1,
            
            getData: function() {
                return {
                    steps: that.steps,
                    pulses: that.pulses,
                    rotation: that.rotation,
                    euclidPattern: that.euclidPattern,
                    outChannel: that.outChannel,
                    outPitch: that.outPitch,
                    outVelocity: that.outVelocity,
                    inChannel: that.outChannel,
                    inPitch: that.outPitch,
                    rate: that.rate,
                    isTriplets: that.isTriplets,
                    noteLength: that.noteLength,
                    name: that.name,
                    isMute: that.isMute,
                    isSolo: that.isSolo,
                    isNotSolo: that.isNotSolo,
                    duration: that.duration,
                    canvasX: that.canvasX,
                    canvasY: that.canvasY,
                    position3d: that.position3d
                }
            }
        };
        
        return that;
    }

    ns.createEPGPatternData = createEPGPatternData;

})(WH);
