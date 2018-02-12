import { getProcessorByID } from '../state/selectors';

export default function createCanvasProcessorBaseView(specs, my) {
    var that,
        connectorGraphic,

        init = function() {
            document.addEventListener(my.store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.DRAG_SELECTED_PROCESSOR:
                    case e.detail.actions.DRAG_ALL_PROCESSORS:
                        const processor = getProcessorByID(my.data.id);
                        my.positionX = processor.positionX;
                        my.positionY = processor.positionY;
                        break;
                }
            });
        },

        /**
         * Base functionality for processor canvas views.
         */
        // getConnectorGraphic = function() {
        //     if (!connectorGraphic) {
        //         const canvas = document.createElement('canvas'),
        //             ctx = canvas.getContext('2d'),
        //             radius = 12,
        //             lineWidth = 2,
        //             resource = {
        //                 radius: radius,
        //                 lineWidth: lineWidth,
        //                 canvas: canvas,
        //                 ctx: ctx,
        //                 setTheme: function(theme) {
        //                     console.log(theme);
        //                     this.ctx.lineWidth = this.lineWidth;
        //                     this.ctx.strokeStyle = theme ? theme.colorHigh : '#333';
        //                     this.ctx.setLineDash([4, 4]);
        //                     this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        //                     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //                     this.ctx.moveTo(this.radius, 0);
        //                     this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
        //                     this.ctx.stroke();
        //                 }
        //             };
                    
        //         canvas.width = (radius + lineWidth) * 2;
        //         canvas.height = (radius + lineWidth) * 2;
        //         connectorGraphic = resource;
        //     }
        //     return connectorGraphic;
        // },
    
        // getProcessor = function() {
        //     return my.processor;
        // },
        
        getPosition2d = function() {
            return { 
                x: my.data.positionX,
                y: my.data.positionY
            };
        },
        
        getType = function() {
            return my.data.type;
        },
        
        getID = function() {
            return my.data.id;
        };
        
    my = my || {};
    my.data = specs.data;
    my.store = specs.store;
    // my.processor = specs.processor;
    my.positionX = 0;
    my.positionY = 0;
    // my.getConnectorGraphic = getConnectorGraphic;
    my.colorHigh = '#cccccc';
    my.colorMid = '#dddddd';
    my.colorLow = '#eeeeee';
    
    that = specs.that || {};

    init();
    
    // that.getProcessor = getProcessor;
    // that.setPosition2d = setPosition2d;
    that.getPosition2d = getPosition2d;
    that.getID = getID;
    that.getType = getType;
    return that;
}