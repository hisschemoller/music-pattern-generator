/**
 * @description File handling view.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
 window.WH = window.WH || {};

(function (ns) {
    
    function createFileView(specs) {
        var that,
            file = specs.file,
            fileEl,
            
            init = function() {
                fileEl = document.querySelector('.file');
                fileEl.querySelector('.file__new').addEventListener('click', function(e) {
                    file.createNew();
                });
            };
        
        that = specs.that;
        
        init();
        
        return that;
    }

    ns.createFileView = createFileView;

})(WH);
