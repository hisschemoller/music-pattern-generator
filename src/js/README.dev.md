
### Drag and drop from library

The library's `drop` event handler dispatches a `createProcessor()` action 
creator.

This loads the processor type's `config.json` and then dispatches the 
`ADD_PROCESSOR` and `SELECT_PROCESSOR` actions.

In response to `ADD_PROCESSOR` canvas3D's `createProcessorViews()` function 
creates and adds a WebGL 3D object for the processor.

`createProcessorViews()` uses `positionX` and `positionY` canvas 
coordinates to position the 3D object in the scene.