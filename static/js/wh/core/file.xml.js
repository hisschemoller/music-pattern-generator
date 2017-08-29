/**
 * Saves state to - or restores it from localstorage.
 * Saves state to file, opens external files.
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    const convertLegacyFile = function(xmlString) {
            const xmlData = parseXML(xmlString),
                data = convertData(xmlData);
            return data;
        },
        
        convertData = function(src) {
            const dest = {
                bpm: src.project.tempo,
                midi: {
                    inputs: [],
                    outputs: []
                },
                network: {
                    processors: []
                },
                remote: []
            };
            for (let i = 0, n = src.project.patterns.pattern.length; i < n; i++) {
                const pattern = src.project.patterns.pattern[i];
                const processor = {
                    type: 'epg',
                    id: pattern.id,
                    steps: {
                        props: {
                            value: parseInt(pattern.events.steps, 10),
                            min: 0,
                            max: 64
                        }
                    },
                    pulses: {
                        props: {
                            value: parseInt(pattern.events.notes, 10),
                            min: 0,
                            max: parseInt(pattern.events.steps, 10)
                        }
                    },
                    rotation: {
                        props: {
                            value: parseInt(pattern.events.rotation, 10),
                            min: 0,
                            max: parseInt(pattern.events.steps, 10) - 1
                        }
                    },
                    channel_out: {
                        props: {
                            value: parseInt(pattern.midi_out.channel, 10),
                            min: 1,
                            max: 16
                        }
                    },
                    pitch_out: {
                        props: {
                            value: parseInt(pattern.midi_out.pitch, 10),
                            min: 0,
                            max: 127
                        }
                    },
                    velocity_out: {
                        props: {
                            value: parseInt(pattern.midi_out.velocity, 10),
                            min: 0,
                            max: 127
                        }
                    },
                    rate: {
                        props: {
                            value: parseInt(pattern.settings.quantization, 10) / 64
                        }
                    },
                    is_triplets: {
                        props: {
                            value: false
                        }
                    },
                    note_length: {
                        props: {
                            value: parseInt(pattern.settings.notelength, 10) / 64
                        }
                    },
                    is_mute: {
                        props: {
                            value: pattern.settings.mute == 'true'
                        }
                    },
                    name: {
                        props: {
                            value: pattern.name
                        }
                    },
                    position2d: {
                        props: {
                            value: {
                                x: parseInt(pattern.location.x, 10),
                                y: parseInt(pattern.location.y, 10)
                            }
                        }
                    },
                    destinations: []
                };
                dest.network.processors.push(processor);
            };
            return dest;
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