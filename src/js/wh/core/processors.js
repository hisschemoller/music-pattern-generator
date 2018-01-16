export default function createProcessors(specs, my) {
    const that = specs.that,
        store = specs.store,

        init = function() {
            const context = require.context('../processors', true, /\processor.js$/);
            context.keys().forEach(key => {
                // console.log('key', key, context(key), context(key).getType);
                if (typeof context(key).getType === 'function') {
                    console.log(`found processor ${context(key).getType()}`);
                }
            });
        };
    
    init();

    return that;
}