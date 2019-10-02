/**
 * 
 */
export default function convertLegacyFile(xmlString) {
    try {
        const xmlData = parseXML(xmlString);
        const data = convertData(xmlData);
        return data;
    } catch (errorMessage) {
        // console.log('NO XML', errorMessage);
    }
}

/**
 * 
 */
function convertData(src) {
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
                    value: parseInt(pattern.midi_out.channel, 10) + 1,
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
                    value: (1 / parseInt(pattern.settings.quantization, 10)) * 4
                }
            },
            is_triplets: {
                props: {
                    value: false
                }
            },
            note_length: {
                props: {
                    // Old noteLength is in pulses where PPQN is 24, 
                    // so for example 6 is a sixteenth note length,
                    // 96 is one 4/4 measure.
                    value: convertNoteLength(parseInt(pattern.settings.notelength, 10))
                }
            },
            is_mute: {
                props: {
                    value: pattern.settings.mute == 'true'
                }
            },
            name: {
                props: {
                    value: pattern.name['#text']
                }
            },
            position2d: {
                props: {
                    value: {
                        x: parseInt(pattern.location.x, 10) + 100,
                        y: parseInt(pattern.location.y, 10) + 100
                    }
                }
            },
            destinations: []
        };
        dest.network.processors.push(processor);
    };
    return dest;
}

/**
 * Old noteLength is in pulses where PPQN is 24, 
 * so for example 6 is a sixteenth note length,
 * 96 is one 4/4 measure.
 * @param  {Number} oldLength Note length in pulses.
 * @return {Number} New note length in fraction of a beat.
 */
function convertNoteLength(oldLength) {
    let newNoteLength;
    if (oldLength == 96) {
        newNoteLength = 4;
    } else if (oldLength >= 48) {
        newNoteLength = 2;
    } else if (oldLength >= 24) {
        newNoteLength = 1;
    } else if (oldLength >= 12) {
        newNoteLength = 0.5;
    } else if (oldLength >= 6) {
        newNoteLength = 0.25;
    } else {
        newNoteLength = 0.125;
    }
    return newNoteLength;
}

/**
 * Parse XML string to Javascript object.
 * @see https://stackoverflow.com/questions/4200913/xml-to-javascript-object
 * @param  {String} xmlString XML data as string.
 * @param  {[type]} arrayTags [description]
 * @return {Object} Javascript object created from XML.
 */
function parseXML(xml, arrayTags) {
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
        if (xmlNode.nodeName == "#text" || xmlNode.nodeName == '#cdata-section') {
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
}
