const utils = {
    getMousePos: function (canvas, evt) {
        if (canvas && evt) {
            var rect = canvas.getBoundingClientRect();
            if (evt.originalEvent && evt.originalEvent.changedTouches) {
                return {
                    x: evt.originalEvent.changedTouches[0].clientX - rect.left,
                    y: evt.originalEvent.changedTouches[0].clientY - rect.top
                };
            }
            else {
                return {
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                };
            }
        }
        else {
            return "error";
        }
    },

    isRightClick: function (e) {
        var isRightMB;
        e = e || window.event || window.Event;

        if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        {
            isRightMB = (e.which == 3 || e.which == 2);
        }
        else if ("button" in e)  // IE, Opera
        {
            isRightMB = (e.button == 2 || e.button == 4);
        }

        return isRightMB;
    },

    getClassProperty: function (prop, fromClass) {
        var $inspector = $("<div>").css('display', 'none').addClass(fromClass);
        $("body").append($inspector); // add to DOM, in order to read the CSS property
        try {
            return $inspector.css(prop);
        } finally {
            $inspector.remove(); // and remove from DOM
        }
    },

    isTrue: function (bool) {
        if (typeof bool == "string") {
            if (bool == "true") {
                return true;
            }
            else if (bool == "false") {
                return false
            }
            else {
                return undefined;
            }
        }
        else {
            return bool;
        }
    },
    isArray: function (arr) {
        if (Object.prototype.toString.call(arr) === '[object Array]') {
            return true
        }
        else {
            return false
        }
    },

    getKeyByValue: function (value) {
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (this[prop] === value) {
                    return prop;
                }
            }
        }
    },
    isMobile: (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),
    browserName:"Unknown",
    convertBase: function (num) {
        return {
            from: function (baseFrom) {
                return {
                    to: function (baseTo) {
                        return parseInt(num, baseFrom).toString(baseTo);
                    }
                };
            }
        };
    }

    ,
    bitWiseAnd: function (bit1, bit2) {
        return (bit1 & bit2);
    }
    ,
    bitWiseOr: function (bit1, bit2) {
        return (bit1 | bit2);
    },
    isObjectEmpty: function (obj) {
        return Object.keys(obj).length === 0;
    },
    checkEthernetParameters: function (ip, mask, gw) {

        var valueToReturn = {"success": true, "messages": []};
        // var isIpOrGateNotValid = false;
        // $scope.errorMessages = [];

        var isOnlyIP = !(mask || gw);
        //ip validations

        var validateIsLocalHost = function (address) {
            var splitAddress = address.split(".");
            return parseInt(splitAddress[0]) == 127;
        };

        var validateIsMask = function (address) {
            var splitAddress = address.split(".");
            var binaryString = "";
            for (var i = 0; i < splitAddress.length; i++) {

                binaryString += convertToBinaryFixedLength(splitAddress[i], 8);
            }
            var isMask = true;
            var isZeroFlag = false;
            var binarySplit = binaryString.split('');
            for (var i = 0; i < binarySplit.length; i++) {
                if (binarySplit[i] == "1") {
                    if (isZeroFlag) {
                        isMask = false;
                        break;
                    }
                }
                else {
                    isZeroFlag = true;
                }
            }

            if (parseInt(binarySplit, 10) == 0)//all zero
            {
                isMask = false;
            }

            return !!isMask;

        };

        var validateIsAllZero = function (address) {
            var splitAddress = address.split(".");
            return !!(parseInt(splitAddress[0]) == 0 && parseInt(splitAddress[1]) == 0 && parseInt(splitAddress[2]) == 0 && parseInt(splitAddress[3]) == 0);
        };

        var validateIsMulticastReserved = function (address) {
            return parseInt(address.split('.')[0]) > 223;

        };

        var validateEmptyFields = function (val) {
            var isValid = true;
            var SplitVal = val.split('.');
            for (var i = 0; i < SplitVal.length; i++) {
                if (SplitVal[i] == "") {
                    isValid = false;
                }
            }
            return isValid;
        };


        var validateSameHostAddress = function (ip, gate, mask) {
            var binaryIP = convertToBinary(ip);
            var binaryMask = convertToBinary(mask);
            var binaryGate = convertToBinary(gate);
            return ((binaryIP & binaryMask) != (binaryGate & binaryMask));
        };

        var convertToBinary = function (address) {
            var splitAddress = address.split(".");
            var binaryString = "";
            for (var i = 0; i < splitAddress.length; i++) {
                binaryString += convertToBinaryFixedLength(splitAddress[i], 8);
            }
            return parseInt(binaryString, 2);
        };

        var convertToBinaryFixedLength = function (str, length) {
            var strToBinary = parseInt(str, 10).toString(2);
            return Array(length - strToBinary.length + 1).join("0") + strToBinary;
        };

        var validateIsNetwork = function (mask, ip) {
            var binaryIP = convertToBinary(ip);
            var binaryMask = convertToBinary(mask);
            return (0 == ((~binaryMask) & binaryIP));
        };

        var validateIsBroadcast = function (mask, ip) {
            var binaryIP = convertToBinary(ip);
            var binaryMask = convertToBinary(mask);
            return ((~binaryMask) == ((~binaryMask) & binaryIP));
        };

//BEGIN
        if (isOnlyIP) {
            //IP
            if (validateIsAllZero(ip)) {
                valueToReturn.messages.push("Invalid IP address");
                valueToReturn.success = false;
            }
            else {
                if (!validateEmptyFields(ip)) {
                    valueToReturn.messages.push("IP field cannot be left empty");
                    valueToReturn.success = false;
                }
                else {
                    if (validateIsMulticastReserved(ip)) {
                        valueToReturn.messages.push("Invalid IP address (reserved address)");
                        valueToReturn.success = false;
                    }
                    else {
                        if (validateIsLocalHost(ip)) {
                            valueToReturn.messages.push("IP cannot be a localhost address range");
                        }
                        if (validateIsMask(ip)) {
                            valueToReturn.messages.push("IP cannot be a mask address");
                        }
                    }
                }
            }
            if (valueToReturn.messages.length > 0)
                valueToReturn.success = false;

            return valueToReturn;
        }
        //Mask
        if (!validateIsMask(mask)) {
            valueToReturn.messages.push("invalid Mask address");

        }
        else {
            //IP
            if (validateIsAllZero(ip)) {
                valueToReturn.messages.push("Invalid IP address");
                valueToReturn.success = false;
            }
            else {
                if (!validateEmptyFields(ip)) {
                    valueToReturn.messages.push("IP field cannot be left empty");
                    valueToReturn.success = false;
                }
                else {
                    if (validateIsMulticastReserved(ip)) {
                        valueToReturn.messages.push("Invalid IP address (reserved address)");
                        valueToReturn.success = false;
                    }
                    else {
                        if (validateIsLocalHost(ip)) {
                            valueToReturn.messages.push("IP cannot be a localhost address range");
                        }
                        if (validateIsMask(ip)) {
                            valueToReturn.messages.push("IP cannot be a mask address");
                        }
                        if (validateIsBroadcast(mask, ip)) {
                            valueToReturn.messages.push("IP cannot be broadcast address");
                        }
                        if (validateIsNetwork(mask, ip)) {
                            valueToReturn.messages.push("IP cannot be network address");
                        }

                    }
                }
            }

            //Gate

            if (!validateEmptyFields(gw)) {
                valueToReturn.messages.push("Gateway field cannot be left empty");
                valueToReturn.success = false;
            }
            else {
                if (validateIsMulticastReserved(gw)) {
                    valueToReturn.messages.push("Invalid Gateway address (reserved address)");
                    valueToReturn.success = false;
                }
                else {
                    if (validateIsLocalHost(gw)) {
                        valueToReturn.messages.push("Gateway cannot be a localhost address range");
                    }
                    if (validateIsMask(gw)) {
                        valueToReturn.messages.push("Gateway cannot be a mask address");
                    }

                    if (validateIsBroadcast(mask, gw)) {
                        valueToReturn.messages.push("Gateway cannot be broadcast address");
                    }
                    if (validateIsNetwork(mask, gw)) {
                        valueToReturn.messages.push("Gateway cannot be network address");
                    }
                }
            }

            //General
            if (valueToReturn.success) {
                if (ip == gw) {
                    valueToReturn.messages.push("IP cannot be a gateway address");
                    valueToReturn.success = false;
                }

                if (validateSameHostAddress(ip, gw, mask)) {
                    valueToReturn.messages.push("Gateway and IP must be in the same subnet");
                    valueToReturn.success = false;
                }
            }
        }
        if (valueToReturn.messages.length > 0)
            valueToReturn.success = false;

        return valueToReturn;
    },
    invertColor: function(hex, bw) {
        var padZero = function(str, len) {
            len = len || 2;
            var zeros = new Array(len).join('0');
            return (zeros + str).slice(-len);
        };

        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            // throw new Error('Invalid HEX color.');
            return "#000000";
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // http://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        return "#" + padZero(r) + padZero(g) + padZero(b);
    }
};
export default utils;

//Browser name

//Browser name:
if(navigator.userAgent.indexOf("MSIE")!=-1 || navigator.userAgent.indexOf("Trident")!=-1){
    utils.browserName = "IE";
}
else if(navigator.userAgent.indexOf("Edge")!=-1){
    utils.browserName = "Edge";
}
else if(navigator.userAgent.indexOf("Firefox")!=-1){
    utils.browserName = "Firefox";
}
else if(navigator.userAgent.indexOf("Opera")!=-1){
    utils.browserName = "Opera";
}
else if(navigator.userAgent.indexOf("Chrome") != -1){
    utils.browserName = "Chrome";
}
else if(navigator.userAgent.indexOf("Safari")!=-1){
    utils.browserName = "Safari";
}

//Object Extensions

String.prototype.contains = function () {
    return String.prototype.indexOf.apply(this, arguments) !== -1;
};


String.prototype.replaceAll = function (search, replace) {
    //if replace is null, return original string otherwise it will
    //replace search string with 'undefined'.
    if (!replace) {
        return this;
    }

    return this.replace(new RegExp(search, 'g'), replace);
};


String.prototype.trimRight = function (chars) {
    chars = chars || "\\s*";
    return this.replace(new RegExp("[" + chars + "]+$", "g"), "");
};

//Object.prototype.getKeyByValue = function( value ) {
//    for( var prop in this ) {
//        if( this.hasOwnProperty( prop ) ) {
//            if( this[ prop ] === value )
//                return prop;
//        }
//    }
//}
//


function findParentByClass(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.lineTo(x + w, y + h - r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.lineTo(x + r, y + h);
    this.arcTo(x, y + h, x, y, r);
    this.lineTo(x, y + r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};

window.mobilecheck = function () {
    var check = false;
    (function (a, b) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


var ErrorCodes = {
    EDID: {
        COLLECTOR_IS_IN_PROGRESS: {
            code: 1,
            text: "EDID collector: Can't collect EDID, EDID collection already in progress!!! - Abort"
        },
        TIME_OUT: {
            code: 2,
            text: "EDID collector: Can't collect EDID, command timeout"
        },
        DEVICE_NOT_CONNECTED: {
            code: 3,
            text: "EDID collector: Can't collect EDID when the device is not connected"
        }
    }
};

window.setDragImageIEPreload = function(image) {
    var bodyEl,
        preloadEl;

    bodyEl = document.body;

    // create the element that preloads the  image
    preloadEl = document.createElement('div');
    preloadEl.style.background = 'url("' + image.src + '")';
    preloadEl.style.position = 'absolute';
    preloadEl.style.opacity = 0.001;

    bodyEl.appendChild(preloadEl);

    // after it has been preloaded, just remove the element so it won't stay forever in the DOM
    setTimeout(function() {
        bodyEl.removeChild(preloadEl);
    }, 5000);
};

// if the setDragImage is not available, implement it
if ('function' !== typeof DataTransfer.prototype.setDragImage) {
    DataTransfer.prototype.setDragImage = function(image, offsetX, offsetY) {
        var randomDraggingClassName,
            dragStylesCSS,
            dragStylesEl,
            headEl,
            parentFn,
            eventTarget;

        // generate a random class name that will be added to the element
        randomDraggingClassName = 'setdragimage-ie-dragging-' + Math.round(Math.random() * Math.pow(10, 5)) + '-' + Date.now();

        // prepare the rules for the random class
        dragStylesCSS = [
            '.' + randomDraggingClassName,
            '{',
            'background: url("' + image.src + '") no-repeat #fff 0 0 !important;',
            'width: ' + image.width + 'px !important;',
            'height: ' + image.height + 'px !important;',
            'text-indent: -9999px !important;',
            'border: 0 !important;',
            'outline: 0 !important;',
            '}',
            '.' + randomDraggingClassName + ' * {',
            'display: none !important;',
            '}'
        ];
        // create the element and add it to the head of the page
        dragStylesEl = document.createElement('style');
        dragStylesEl.innerText = dragStylesCSS.join('');
        headEl = document.getElementsByTagName('head')[0];
        headEl.appendChild(dragStylesEl);

        /*
         since we can't get the target element over which the drag start event occurred
         (because the `this` represents the DataTransfer object and not the element),
         we will walk through the parents of the current functions until we find one
         whose first argument is a drag event
         */
        parentFn = DataTransfer.prototype.setDragImage.caller;
        while (!(parentFn.arguments[0] instanceof DragEvent)) {
            parentFn = parentFn.caller;
        }

        // then, we get the target element from the event (event.target)
        eventTarget = parentFn.arguments[0].target;
        // and add the class we prepared to it
        eventTarget.classList.add(randomDraggingClassName);

        /* immediately after adding the class, we remove it. in this way the browser will
         have time to make a snapshot and use it just so it looks like the drag element */
        setTimeout(function() {
            // remove the styles
            headEl.removeChild(dragStylesEl);
            // remove the class
            eventTarget.classList.remove(randomDraggingClassName);
        }, 0);
    };
}


