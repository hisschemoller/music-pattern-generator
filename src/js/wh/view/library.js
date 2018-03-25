/**
 * Library for all processor types.
 */
export default function createLibraryView(specs, my) {
    var that,
        store = specs.store,
        listEl = document.querySelector('.library__list'),
        draggedType,

        init = function() {
            document.addEventListener('drop', onDrop);
            document.addEventListener('dragenter', onDragEnter);
            document.addEventListener('dragover', onDragOver);

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.RESCAN_TYPES:
                        populateLibrary(e.detail.state.types);
                        break;
                }
            });
        },
        
        /**
         * Populate the library with all available processor types.
         * Processor types are not shown in the libray 
         * if they have the flag excludedFromLibrary = true
         * in their config.json file.
         */
        populateLibrary = function(typesTable) {
            const template = document.querySelector('#template-library-item');

            typesTable.allIds.forEach(id => {
                const type = typesTable.byId[id];
                const clone = template.content.cloneNode(true);
                const el = clone.firstElementChild;
                listEl.appendChild(el);

                el.querySelector('.library__item-label').innerHTML = type.name;
                el.dataset.type = id;
                el.addEventListener('dragstart', onDragStart);
            });
        },
        
        /**
         * Store type of processor when drag starts.
         */
        onDragStart = function(e) {
            draggedType = e.target.dataset.type;
        },
        
        /**
         * Create a new processor when the type is dropped on the canvas.
         */
        onDrop = function(e) {
            e.preventDefault();
            
            const dynamicCanvas = document.querySelector('.canvas-dynamic');
            const connectorsCanvas = document.querySelector('.canvas-connect');
            const canvas = connectorsCanvas.offsetWidth > 0 ? connectorsCanvas : dynamicCanvas;

            if (e.target === canvas) {
                const canvasRect = canvas.getBoundingClientRect();
                
                // create a new processor
                store.dispatch(store.getActions().createProcessor({
                    type: draggedType,
                    positionX: e.clientX - canvasRect.left + window.scrollX,
                    positionY: e.clientY - canvasRect.top + window.scrollY
                }));
            }
            
            draggedType = null;
        },
        
        onDragEnter = function(e) {
            e.preventDefault();
        },
        
        onDragOver = function(e) {
            e.preventDefault();
        };
    
    that = specs.that || {};

    init();
    
    return that;
}
