import { eventType } from '../core/util.js';

/**
 * Library for all processor types.
 */
export default function createLibraryView(specs, my) {
    var that,
        store = specs.store,
        listEl = document.querySelector('.library__list'),
        dragType = null,
        dragEl = null,

        init = function() {
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
                el.addEventListener(eventType.start, onTouchStart);
            });

            const draggerTemplate = document.querySelector('#template-library-dragger');
            dragEl = draggerTemplate.content.cloneNode(true).firstElementChild;
        },

        onTouchStart = e => {
            e.preventDefault();
            const el = e.currentTarget;
            dragType = el.dataset.type;
            document.addEventListener(eventType.move, onTouchMove);
            document.addEventListener(eventType.end, onTouchEnd);

            dragEl.querySelector('.library__dragger-label').textContent = el.textContent;
            document.body.appendChild(dragEl);
            setDragElPosition(e);
        },

        onTouchMove = e => {
            setDragElPosition(e);
        },

        onTouchEnd = e => {
            e.preventDefault();
            document.removeEventListener(eventType.move, onTouchMove);
            document.removeEventListener(eventType.end, onTouchEnd);
            document.body.removeChild(dragEl);
            const el = e.type === 'mouseup' ? e.currentTarget : e.changedTouches[0].target.parentNode;
            const x = e.type === 'mouseup' ? e.clientX : e.changedTouches[0].clientX;
            const y = e.type === 'mouseup' ? e.clientY : e.changedTouches[0].clientY;
            store.dispatch(store.getActions().libraryDrop(dragType, x, y));
            dragType = null;
        },
        
        setDragElPosition = e => {
            const x = e.type.indexOf('mouse') !== -1 ? e.clientX : e.touches[0].clientX;
            const y = e.type.indexOf('mouse') !== -1 ? e.clientY : e.touches[0].clientY;
            dragEl.setAttribute('style', `left: ${x - (dragEl.offsetWidth * 0.5)}px; top: ${y - (dragEl.offsetHeight * 0.9)}px;`);
        };
    
    that = specs.that || {};

    init();
    
    return that;
}
