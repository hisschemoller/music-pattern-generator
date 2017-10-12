/**
 * DialogView.
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {

    /**
     * @param {Object} specs
     */
    function createDialogView(specs) {

        // private variables
        var selectors = {
                header: '.dialog__header',
                body: '.dialog__body',
                primary: '.dialog__button--primary',
                secondary: '.dialog__button--secondary',
            },

            defaultSpecs = {
                that: {},
                type: 'confirm', // alert|confirm|prompt
                headerText: 'What?',
                bodyText: 'Please make a choice.',
                primaryLabel: 'OK',
                secondaryLabel: 'Cancel',
                primaryCallback: null,
                secondaryCallback: null
            },

            /**
             * HTML dialog element.
             * @type {Object}
             */
            rootEl,

            /**
             * Initialise the view, add DOM event handlers.
             */
            init = function() {
                let template = document.querySelector('#overlay-dialog');
                let clone = template.content.cloneNode(true);
                rootEl = clone.firstElementChild;
                document.querySelector('body').addChild(rootEl);
                
                rootEl.find(selectors.header).text(specs.headerText);
                rootEl.find(selectors.body).text(specs.bodyText);
                rootEl.find(selectors.primary).text(specs.primaryLabel)
                    .on(my.eventType.click, onButton);
                rootEl.find(selectors.secondary).text(specs.secondaryLabel)
                    .on(my.eventType.click, onButton);

                if (specs.type == 'alert') {
                    rootEl.find(selectors.secondary).hide();
                } else {
                    rootEl.find(selectors.secondary).show();
                }
            },

            /**
             * Click on primary or secondary button.
             */
            onButton = function(e) {
                rootEl.find(selectors.primary).off(my.eventType.click);
                rootEl.find(selectors.secondary).off(my.eventType.click);

                // primary callback
                if ($(e.currentTarget).hasClass(selectors.primary.substr(1)) &&
                    specs.primaryCallback) {
                    specs.primaryCallback();
                }

                // secondary callback
                if ($(e.currentTarget).hasClass(selectors.secondary.substr(1)) &&
                    specs.secondaryCallback) {
                    specs.secondaryCallback();
                }

                rootEl.hide();
                delete that;
            };
            
        var my = my || {};
        my.rootEl = rootEl;
        
        specs = Object.assign(defaultSpecs, specs);
        
        that = WH.createBaseView(specs, my);
        
        // initialise
        init();
        
        return that;
    }

    WH.createDialogView = createDialogView;
    
})(WH);
