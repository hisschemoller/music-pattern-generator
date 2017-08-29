/**
 * Saves state to - or restores it from localstorage.
 * Saves state to file, opens external files.
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    const convertLegacyFile = function(xmlString) {
            const data = parseXML(xmlString);
            return data;
        },
        
        /**
         * Parse XML string to Javascript object.
         * @see https://stackoverflow.com/questions/4200913/xml-to-javascript-object
         * @param  {String} xmlString XML data as string.
         * @param  {[type]} arrayTags [description]
         * @return {Object} Javascript object created from XML.
         */
        parseXML = function(xml, arrayTags) {
            var dom = null;
            if (window.DOMParser) {
                dom = (new DOMParser()).parseFromString(xml, "text/xml");
            } else if (window.ActiveXObject) {
                dom = new ActiveXObject('Microsoft.XMLDOM');
                dom.async = false;
                if (!dom.loadXML(xml)) {
                    throw dom.parseError.reason + " " + dom.parseError.srcText;
                }
            } else {
                throw "cannot parse xml string!";
            }

            function isArray(o) {
                return Object.prototype.toString.apply(o) === '[object Array]';
            }

            function parseNode(xmlNode, result) {
                if (xmlNode.nodeName == "#text") {
                    var v = xmlNode.nodeValue;
                    if (v.trim()) {
                       result['#text'] = v;
                    }
                    return;
                }

                var jsonNode = {};
                var existing = result[xmlNode.nodeName];
                if(existing) {
                    if(!isArray(existing)) {
                        result[xmlNode.nodeName] = [existing, jsonNode];
                    } else {
                        result[xmlNode.nodeName].push(jsonNode);
                    }
                } else {
                    if(arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) {
                        result[xmlNode.nodeName] = [jsonNode];
                    } else {
                        result[xmlNode.nodeName] = jsonNode;
                    }
                }

                if(xmlNode.attributes) {
                    var length = xmlNode.attributes.length;
                    for(var i = 0; i < length; i++) {
                        var attribute = xmlNode.attributes[i];
                        jsonNode[attribute.nodeName] = attribute.nodeValue;
                    }
                }

                var length = xmlNode.childNodes.length;
                for(var i = 0; i < length; i++) {
                    parseNode(xmlNode.childNodes[i], jsonNode);
                }
            }

            var result = {};
            if(dom.childNodes.length) {
                parseNode(dom.childNodes[0], result);
            }

            return result;
        };

    function addXMLFileParser(specs, my) {
        let that;
        
        my = my || {};
        my.convertLegacyFile = convertLegacyFile;
        
        that = specs.that;
        
        return that;
    }

    ns.addXMLFileParser = addXMLFileParser;

})(WH);