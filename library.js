window.browser = (()=>{
    return window.msBrowser ||
           window.browser ||
           window.chrome;
})();

const cloud_name = 'cld-media';
var transformationMap = {
    "a"     : "Angle",
    "ac"    : "Audio Codec",
    "af"    : "audio Frequency",
    "ar"    : "Aspect Ratio",
    "b"     : "Background",
    "br"    : "Bit Rate",
    "bo"    : "Border",
    "co"    : "Color",
    "cs"    : "Color Space",
    "c"     : "Crop",
    "d"     : "Default Image",
    "dl"    : "Delay",
    "dn"    : "Density",
    "dpr"   : "Device Pixel Ratio",
    "du"    : "Duration",
    "e"     : "Effect",
    "eo"    : "End Offset",
    "f"     : "Fetch Format",
    "fl"    : "Flags",
    "fn"    : "Custom Function",
    "g"     : "Gravity",
    "fps"   : "Frame Per Second",
    "h"     : "Height",
    "if"    : "If",
    "ki"    : "Keyframe Interval",
    "l"     : "Overlay",
    "o"     : "Opacity",
    "pg"    : "Page",
    "p"     : "Prefix",
    "q"     : "Quality",
    "r"     : "Radius",
    "so"    : "Start Offset",
    "sp"    : "Streaming Profile",
    "t"     : "Named Transformation",
    "u"     : "Underlay",
    "vc"    : "Video codec",
    "vs"    : "Video Sampling",
    "w"     : "Width",
    "x"     : "X",
    "y"     : "Y",
    "z"     : "Zoom",
};

// https://cloudinary.com/documentation/conditional_transformations#supported_operators
// https://cloudinary.com/documentation/user_defined_variables#supported_arithmetic_operators
var binaryOperatorMap = {
    "add"   : "+",
    "sub"   : "-",
    "mul"   : "*",
    "div"   : "/",
    "mod"   : "%",
    "pow"   : "^",
    "eq"    : "=",
    "ne"    : "!=",
    "lt"    : "<",
    "gt"    : ">",
    "lte"   : "<=",
    "gte"   : ">=",
    "in"    : "In",
    "nin"   : "Not In",
};

// https://cloudinary.com/documentation/conditional_transformations#supported_image_characteristics
var imageCharacteristicMap = {
    "ar"        : "Aspect Ratio",
    "cp"        : "Current Page",
    "ctx"       : "Context",
    "fc"        : "Face Count",
    "h"         : "Height",
    "iar"       : "Initial Aspect Ratio",
    "idn"       : "Initial Density",
    "ih"        : "Initial Height",
    "ils"       : "Illustration",
    "iw"        : "Initial Width",
    "md"        : "Metadata",
    "pc"        : "Page Count",
    "pgnames"   : "Page Name",
    "px"        : "Page X",
    "py"        : "Page Y",
    "tags"      : "Tags",
    "tar"       : "Trimmed Aspect Ratio",
    "w"         : "Width",
};

var colors = {
    "aliceblue"             : "f0f8ff", "antiquewhite"      : "faebd7", "aqua"              : "00ffff",
    "aquamarine"            : "7fffd4", "azure"             : "f0ffff", "beige"             : "f5f5dc",
    "bisque"                : "ffe4c4", "black"             : "000000", "blanchedalmond"    : "ffebcd",
    "blue"                  : "0000ff", "blueviolet"        : "8a2be2", "brown"             : "a52a2a",
    "burlywood"             : "deb887", "cadetblue"         : "5f9ea0", "chartreuse"        : "7fff00",
    "chocolate"             : "d2691e", "coral"             : "ff7f50", "cornflowerblue"    : "6495ed",
    "cornsilk"              : "fff8dc", "crimson"           : "dc143c", "cyan"              : "00ffff",
    "darkblue"              : "00008b", "darkcyan"          : "008b8b", "darkgoldenrod"     : "b8860b",
    "darkgray"              : "a9a9a9", "darkgreen"         : "006400", "darkkhaki"         : "bdb76b",
    "darkmagenta"           : "8b008b", "darkolivegreen"    : "556b2f", "darkorange"        : "ff8c00",
    "darkorchid"            : "9932cc", "darkred"           : "8b0000", "darksalmon"        : "e9967a",
    "darkseagreen"          : "8fbc8f", "darkslateblue"     : "483d8b", "darkslategray"     : "2f4f4f",
    "darkturquoise"         : "00ced1", "darkviolet"        : "9400d3", "deeppink"          : "ff1493",
    "deepskyblue"           : "00bfff", "dimgray"           : "696969", "dodgerblue"        : "1e90ff",
    "firebrick"             : "b22222", "floralwhite"       : "fffaf0", "forestgreen"       : "228b22",
    "fuchsia"               : "ff00ff", "gainsboro"         : "dcdcdc", "ghostwhite"        : "f8f8ff",
    "gold"                  : "ffd700", "goldenrod"         : "daa520", "gray"              : "808080",
    "green"                 : "008000", "greenyellow"       : "adff2f", "honeydew"          : "f0fff0",
    "hotpink"               : "ff69b4", "indianred "        : "cd5c5c", "indigo"            : "4b0082",
    "ivory"                 : "fffff0", "khaki"             : "f0e68c", "lavender"          : "e6e6fa",
    "lavenderblush"         : "fff0f5", "lawngreen"         : "7cfc00", "lemonchiffon"      : "fffacd",
    "lightblue"             : "add8e6", "lightcoral"        : "f08080", "lightcyan"         : "e0ffff",
    "lightgoldenrodyellow"  : "fafad2", "lightgrey"         : "d3d3d3", "lightgreen"        : "90ee90",
    "lightpink"             : "ffb6c1", "lightsalmon"       : "ffa07a", "lightseagreen"     : "20b2aa",
    "lightskyblue"          : "87cefa", "lightslategray"    : "778899", "lightsteelblue"    : "b0c4de",
    "lightyellow"           : "ffffe0", "lime"              : "00ff00", "limegreen"         : "32cd32",
    "linen"                 : "faf0e6", "magenta"           : "ff00ff", "maroon"            : "800000",
    "mediumaquamarine"      : "66cdaa", "mediumblue"        : "0000cd", "mediumorchid"      : "ba55d3",
    "mediumpurple"          : "9370d8", "mediumseagreen"    : "3cb371", "mediumslateblue"   : "7b68ee",
    "mediumspringgreen"     : "00fa9a", "mediumturquoise"   : "48d1cc", "mediumvioletred"   : "c71585",
    "midnightblue"          : "191970", "mintcream"         : "f5fffa", "mistyrose"         : "ffe4e1",
    "moccasin"              : "ffe4b5", "navajowhite"       : "ffdead", "navy"              : "000080",
    "oldlace"               : "fdf5e6", "olive"             : "808000", "olivedrab"         : "6b8e23",
    "orange"                : "ffa500", "orangered"         : "ff4500", "orchid"            : "da70d6",
    "palegoldenrod"         : "eee8aa", "palegreen"         : "98fb98", "paleturquoise"     : "afeeee",
    "palevioletred"         : "d87093", "papayawhip"        : "ffefd5", "peachpuff"         : "ffdab9",
    "peru"                  : "cd853f", "pink"              : "ffc0cb", "plum"              : "dda0dd",
    "powderblue"            : "b0e0e6", "purple"            : "800080", "rebeccapurple"     : "663399",
    "red"                   : "ff0000", "rosybrown"         : "bc8f8f", "royalblue"         : "4169e1",
    "saddlebrown"           : "8b4513", "salmon"            : "fa8072", "sandybrown"        : "f4a460",
    "seagreen"              : "2e8b57", "seashell"          : "fff5ee", "sienna"            : "a0522d",
    "silver"                : "c0c0c0", "skyblue"           : "87ceeb", "slateblue"         : "6a5acd",
    "slategray"             : "708090", "snow"              : "fffafa", "springgreen"       : "00ff7f",
    "steelblue"             : "4682b4", "tan"               : "d2b48c", "teal"              : "008080",
    "thistle"               : "d8bfd8", "tomato"            : "ff6347", "turquoise"         : "40e0d0",
    "violet"                : "ee82ee", "wheat"             : "f5deb3", "white"             : "ffffff",
    "whitesmoke"            : "f5f5f5", "yellow"            : "ffff00", "yellowgreen"       : "9acd32",
    "grey"                  : "808080", "slategrey"         : "708090", "darkgrey"          : "a9a9a9",
    "dimgrey"               : "696969", "lightslategrey"    : "778899", "darkslategrey"     : "2f4f4f",
};

var cloudinaryWidgets = {
    'widget.cloudinary.com/global/all.js'           : 'Cloudinary Upload Widget v1',
    'widget.cloudinary.com/v2.0/global/all.js'      : 'Cloudinary Upload Widget v2',
    'product-gallery.cloudinary.com/all.js'         : 'Cloudinary Product Gallery Widget',
    'media-library.cloudinary.com/global/all.js'    : 'Cloudinary Media Library Widget',
    'media-editor.cloudinary.com/all.js'            : 'Cloudinary Media Editor Widget',
};

var cloudinaryJs = {
    'cloudinary-jquery-file-upload'                 : 'Cloudinary jQuery SDK',
    'cloudinary-core'                               : 'Cloudinary Core JS SDK',
    'cld-video-player'                              : 'Cloudinary Video Player',
};

function gcd (a, b) {
    return (b == 0) ? a : gcd (b, a%b);
}

function readableTiming(duration) {
    var milliseconds = parseInt(duration % 1000),
        seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return (hours==0?'':hours+":") +
           (hours==0&&minutes==0?'':minutes+":") +
           (seconds==0?'':seconds+".") +
           milliseconds +
           (hours==0&&minutes==0?' s':'');
}

function readableFileSize(size,withOriginalSize=true) {
    if( isNaN(size) ) return size;
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = 0;
    size = parseInt(size);
    origSize = size;
    while(size >= 1024) {
        size /= 1024;
        ++i;
    }
    return (i==0?size:size.toFixed(2)) + ' ' + units[i] + (withOriginalSize?(i>0?` (${origSize} B)`:''):'');
}

function short2longHex(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	return hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});
}

function hex2rgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(short2longHex(hex));
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function rgb2hex(rgb) {
    var dec2hex = function (rgb) {
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) hex = "0" + hex;
        return hex;
    };

    return dec2hex(rgb[0])+
           dec2hex(rgb[1])+
           dec2hex(rgb[2]);
}

function getColorContrast(hex){
    return (parseInt(short2longHex(hex), 16) > 0xffffff/2) ? 'black':'white';
}

function titleFormat( str ) {
    return str.toLowerCase()
        .split('_')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
}

function isCldTrans( str ) {
    str = str.toLowerCase();
    if( str.match(/^\$[a-z].*_/) ) return true;
    if( str.match(/^[a-z]{1,3}_/) && transformationMap[str.split('_')[0]] ) return true;
    return false;
}

function parseCloudinaryURL( url ) {
    url = decodeURIComponent(url.split('?')[0]);
    var startTransformation = false;
    var startPublicId = false;
    var tmp1 = url.split('://');
    var result = {
        'url'           : url,
        'protocol'      : tmp1.shift(),
    };
    var tmp2 = tmp1.join('://').replace(/\/\//g, '/').split('/');
    result.hostname = tmp2.shift();

    var parseArithmeticOperations = function( arr ) {
        var mathEquationStr = '';
        for( var j=0; j<arr.length; j++ ) {
            // If Arithmetic Operator
            if( typeof binaryOperatorMap[arr[j]] !== 'undefined' ) {
                arr[j] = binaryOperatorMap[arr[j]];

            // Image Characteristic
            } else if( typeof imageCharacteristicMap[arr[j]] !== 'undefined' ) {
                arr[j] = imageCharacteristicMap[arr[j]];
            }
            mathEquationStr += ' '+arr[j];
        }
        //console.log('Var Aritmetic Operation',t, mathEquationValStr,mathEquationStr);
        return mathEquationStr.trim();
    }

    // Cloudname
    if( result.hostname === 'res.cloudinary.com' ) {
        result.cloud_name = tmp2.shift();
        result.cdnUrlType = 'component';
    } else if( result.hostname.match(/-res.cloudinary.com$/i) ) {
        result.cloud_name = result.hostname.split('-res.cloudinary.com')[0];
        result.cdnUrlType = 'privateCDN';
    } else {
        result.cloud_name = null;
        result.cdnUrlType = 'other';
    }

    // Going through each path
    for( var i=0; i<tmp2.length; i++ ) {
        // Non-SEO Resource Type
        if( typeof result.resource_type === 'undefined' &&
            typeof result.type === 'undefined' &&
            ['image','video','raw'].indexOf(tmp2[i]) >= 0
        ) {
            result.seo = false;
            result.resource_type = tmp2[i];
            result.type = tmp2[++i];
        }

        // SEO Resource Type
        else if( typeof result.resource_type === 'undefined'  &&
                   typeof result.type === 'undefined' &&
                   ['images','videos','files','private_images','authenticated_images'].indexOf(tmp2[i]) >= 0
        ) {
            result.seo = true;
            if( tmp2[i] === 'files' ) {
                result.resource_type = 'raw';
                result.type = 'upload';

            } else if( ['private_images','authenticated_images'].indexOf(tmp2[i]) >= 0 ) {
                var rtam = tmp2[i].split('_');
                result.resource_type = rtam[1];
                result.type = rtam[0];

            } else {
                result.resource_type = tmp2[i].substring(0,tmp2[i].length-1);
                result.type = 'upload';
            }
        }

        // Signature
        else if( tmp2[i].match(/^s--[a-zA-Z0-9_-]{8}--$/) ) {
            result.signature = tmp2[i];
            startTransformation = true; // Set to transformation next
        }

        // Start of Transformation without Signature
        /*
        else if( !startTransformation &&
                 !startPublicId &&
                 typeof result.resource_type !== 'undefined' &&
                 typeof result.type !== 'undefined'
        ) {
            startTransformation = true;
            i--;
        }
        */

        else if( !startTransformation && isCldTrans(tmp2[i]) ) {
            if( typeof result.resource_type === 'undefined' ) result.resource_type = 'image';
            if( typeof result.type === 'undefined' ) result.type = 'upload';
            startTransformation = true;
            i--;
        }

        // Version (Separator, beginning of public id next)
        else if( tmp2[i].match(/^v[0-9]*$/) ) {
            result.version = parseInt(tmp2[i].substr(1));
            startTransformation = false;
            startPublicId = true;
        }

        // If Resource Type & Type are already specified but no transformation, version, or Signature; assume public_id
        else if( typeof result.resource_type !== 'undefined' &&
                 typeof result.type !== 'undefined' &&
                 !startTransformation && !startPublicId
        ) {
            startPublicId = true;
            i--;
            continue;
        }

        // Transformation
        else if( startTransformation ) {
            if( typeof result.transformation === 'undefined' ) {
                result.transformation = [];
                result.transformationStr = [];
            }

            // If current section is not CLD Transformation, and assuming doesn't have version
            if( !isCldTrans(tmp2[i]) ) {
                startTransformation = false;
                startPublicId = true;
                i--;    // Go back to re-evaluate this section again
                continue;
            }

            result.transformationStr.push(tmp2[i]);
            var tmpTrans = tmp2[i].split(',');
            var trans = [];
            tmpTrans.forEach((el,itr,arr)=>{
                var t = el.split('_');
                var currentTrans = {
                    "name"  : transformationMap[t[0]],
                };

                // Variable
                if( el.match(/^\$/) ) {
                    varName = t[0]; //.substr(1);

                    // Arithmetic Operation
                    if( t.length > 2 ) {
                        newVal = parseArithmeticOperations(t.slice(1));

                    } else if( typeof imageCharacteristicMap[t[1]] !== 'undefined' ) {
                        newVal = imageCharacteristicMap[t[1]];

                    // Key = Val
                    } else {
                        newVal = t[1];
                    }
                    trans.push({
                        name    : varName,
                        value   : newVal,
                    });

                // Transformation
                } else {
                    // Effects
                    if( ['e'].indexOf(t[0]) >= 0 ) {
                        switch(true) {
                            // Distort effect
                            case /^distort:/.test(t[1]):
                                var distortTmpArr1 = t.slice(1).join('_').split(':');
                                newVal = {
                                    name    : distortTmpArr1[0],
                                    value   : [
                                        [distortTmpArr1[1],distortTmpArr1[2]],
                                        [distortTmpArr1[3],distortTmpArr1[4]],
                                        [distortTmpArr1[5],distortTmpArr1[6]],
                                        [distortTmpArr1[7],distortTmpArr1[8]],
                                    ],
                                };
                                break;

                            // Adobe Lightroom effect
                            case /^lightroom:/.test(t[1]):
                                let lightroomTmpArr1 = t.slice(1).join('_').split(/:(.+)/);
                                let lightroomTmpArr2 = lightroomTmpArr1[1].split(':');
                                let tmpAssocArr = {};
                                lightroomTmpArr2.forEach((e,i,a)=>{
                                    tmp=e.split('_');
                                    tmpAssocArr[tmp[0]] = tmp[1];
                                });
                                newVal = {
                                    name    : lightroomTmpArr1[0],
                                    value   : tmpAssocArr,
                                };
                                break;

                            default:
                                newVal = t.slice(1).join('_');
                                break;
                        }

                    // If Overlay or Underlay, convert : to /
                    } else if( ['l','u'].indexOf(t[0]) >= 0 ) {
                        // Text Layer
                        if( t[1].match(/^text:/) ) {
                            currentTrans.type = 'text';
                            var textStr = t.slice(1,t.length).join('_').replace(/^text:/g,'').split(/:(.+)/);
                            var formatStr = textStr[0];
                            newVal =  textStr[1];;

                            if( isNaN(parseInt(formatStr.split('_')[1])) ) {
                                currentTrans.format = formatStr;
                            } else {
                                currentTrans.format = {};
                                var formatArr = formatStr.split('_');
                                currentTrans.format = {
                                    font_family : formatArr[0],
                                    font_size : formatArr[1],
                                };

                                if( formatArr.length > 2 ) {
                                    formatArr = formatArr.slice(2);
                                    formatArr.forEach(e=>{
                                        switch(e) {
                                            case 'bold':
                                                currentTrans.format.font_weight = e;
                                                break;

                                            case 'italic':
                                                currentTrans.format.font_style = e;
                                                break;

                                            case 'underline':
                                            case 'strikethrough':
                                                currentTrans.format.text_decoration = e;
                                                break;

                                            case 'left':
                                            case 'center':
                                            case 'right':
                                            case 'end':
                                            case 'start':
                                            case 'justify':
                                                currentTrans.format.text_align = e;
                                                break;

                                            case 'stroke':
                                                currentTrans.format.stroke = e;
                                                break;

                                            default: break;
                                        }
                                    });

                                    // Letter Spacing
                                    var letterSpacing = formatStr.match(/letter_spacing_[0-9]*(_|$)/);
                                    if( letterSpacing ) currentTrans.format.letter_spacing = letterSpacing[0]
                                        .replace(/_$/,'').split('_').pop();

                                    // Line Spacing
                                    var lineSpacing = formatStr.match(/line_spacing_[0-9]*(_|$)/);
                                    if( lineSpacing ) currentTrans.format.line_spacing = lineSpacing[0]
                                        .replace(/_$/,'').split('_').pop();

                                    // Font Antialias
                                    var fontAntialias = formatStr.match(/font_antialias_[0-9]*(_|$)/);
                                    if( fontAntialias ) currentTrans.format.font_antialias = fontAntialias[0]
                                        .replace(/_$/,'').split('_').pop();

                                    // Font Hinting
                                    var fontHinting = formatStr.match(/font_hinting_[0-9]*(_|$)/);
                                    if( fontHinting ) currentTrans.format.font_hinting = fontHinting[0]
                                        .replace(/_$/,'').split('_').pop();
                                }
                            }

                        // Fetch Image
                        } else if( t[1].match(/^fetch:/) ) {
                            currentTrans.type = 'fetch';
                            newVal = atob(t.slice(1,t.length).join('_').split(':')[1]);

                        } else {
                            // Default: image
                            currentTrans.type = 'image';
                            newVal = t.slice(1,t.length).join('_').replace(/:/g,'/');
                        }
                    }

                    // If value may contains underscore and keep it as is
                    else if( ['t','fl'].indexOf(t[0]) >= 0 ) {
                        newVal = t.slice(1,t.length).join('_');
                        if( ['fl'].indexOf(t[0]) >= 0 ) {
                            newVal = newVal.split('.');
                        }
                    }

                    // If value may contains underscore and convert to space
                    else if( ['g'].indexOf(t[0]) >= 0 ) {
                        newVal = t.slice(1,t.length).join(' ');

                    // If Clause
                    } else if( t[0] === 'if' ) {
                        if( ['else','end'].indexOf(t[1]) < 0 ) {
                            newVal = parseArithmeticOperations(t.slice(1));
                        } else {
                            newVal = t[1];
                        }
                    }

                    // Arithmetic Operation
                    else if( t.length > 2 ) {
                        newVal = parseArithmeticOperations(t.slice(1));

                    }

                    //
                    else if( typeof imageCharacteristicMap[t[1]] !== 'undefined' ) {
                        newVal = imageCharacteristicMap[t[1]];

                    }

                    else newVal = t[1];

                    currentTrans.value = newVal;

                    // Add Transformation to Chain
                    trans.push(currentTrans);
                }
            });
            if( trans.length > 0 ) result.transformation.push(trans);
        }

        // Public ID
        else if( startPublicId ) {
            var filename = '';
            if( result.type === 'fetch' ) {
                result.public_id = tmp2.slice(i,tmp2.length).join('/').replace(':/','://');;
            }

            else if( result.seo ) {
                result.public_id = tmp2.slice(i,tmp2.length-1).join('/');
                result.url_suffix = tmp2[tmp2.length-1];

            }

            else {
                filename = tmp2.slice(i).join('/');

                if( result.resource_type !== 'raw' ) {
                    result.extension = (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
                    if( typeof result.extension !== 'undefined' ) result.public_id = filename.substring(0,filename.search('.'+result.extension));
                    else result.public_id = filename;
                } else result.public_id = filename;
            }

            break;
        }

        else {
            console.info('ignore',tmp2[i]);
        }
    }

    // If still no public id, must be /image/upload by default
    if( typeof result.public_id === 'undefined') {
        result.resource_type = 'image';
        result.type = 'upload';
        var filename = tmp2.join('/');

        if( result.resource_type !== 'raw' ) {
            result.extension = (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
            if( typeof result.extension !== undefined ) result.public_id = filename.substring(0,filename.search('.'+result.extension));
            else result.public_id = filename;
        }
    }

    return result;
}
