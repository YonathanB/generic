/**
 * Created by Choyzer on 13/10/2014.
 */
/***********************************************
 * File Name: kIpSet.js
 * Created by: Chezi Hoyzer
 * On: 13/10/2014  12:15
 * Last Modified: 13/10/2014
 * Modified by: Choyzer
 ***********************************************/


(function ()
    {

//        IP and GW should exclude :
//        Local host address: 127.0.0.1
//        Subnet Mask 255.255.255.0 ; 255.255.0.0 ; 0.0.0.0 etc.
//        Multicast and reserved address: 224.0.0.0 - 255.255.255.254
//        Broadcast address: should be calculated based subnet + 255.255.255.255 (local broadcast)


        angular.module('components.widgets').directive("kIpSet", function ()
        {
            return {
                restrict: 'E',
                scope: {
                    type: '@',//Can be 'ip' 'gw' (gateWay) 'mask'
                    mask: '@',//if type == "gw" need to validate the broadcast address by mask
                    ip: '@',//if type == "gw" need to validate the broadcast address by mask
                    enabled: '=',
                    setClick: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                    controlInputClass: '@',
                    controlButtonClass: '@',
                    isWaitingForResponse: '@',
                    initVal: '@'
                },
                template2: "<div class='kIpSet'>\
                                <k-ip init-val='{{initVal}}' control-class='{{errorClass}}' control-input-class='{{controlInputClass}}' enabled='enabled' value='value' title='{{title}}'></k-ip>\
                                <k-button control-class='kButton-set {{controlButtonClass}}' visible='true' title='{{title}}' enabled=internalEnable  text='Set' click='InternalClick()' ></k-button>\
                           </div>",
                template: "<div class='kIpSet tableRow'>"+
                                "<div class='tableCell'>"+
                                     "<k-ip init-val='{{initVal}}' control-class='{{errorClass}}' control-input-class='{{controlInputClass}}' enabled='enabled' value='value' title='{{title}}'></k-ip>"+
                                "</div>"+
                                "<div class='tableCell'>"+
                                         "<div style='margin-left: 6px'>"+
                                           "<k-button control-class='kButton-set {{controlButtonClass}}' visible='true' title='{{title}}' enabled=internalEnable  text='Set' click='InternalClick()' ></k-button>"+
                                         "</div>"+
                                 "</div>"+
                           "</div>",
                template3: "<div class='kIpSet tableRow'>\
                                <div class='tableCell'>\
                                    <k-ip init-val='{{initVal}}' control-class='{{errorClass}}' control-input-class='{{controlInputClass}}' enabled='enabled' value='value' title='{{title}}'></k-ip>\
                                </div>\
                                <div class='tableCell'>\
                                    <k-button control-class='kButton-set {{controlButtonClass}}' visible='true' title='{{title}}' enabled=internalEnable  text='Set' click='InternalClick()' ></k-button>\
                                 </div>\
                           </div>",


                compile: function (element, attrs)
                    {
                        if (!attrs.type)
                            { attrs.type = "ip"; }
                        if (!attrs.value)
                            { attrs.value = ""; }
                        if (!attrs.enabled)
                            { attrs.enabled = "true"; }
                        if (!attrs.isWaitingForResponse)
                            { attrs.isWaitingForResponse = "true"; }
                        if (!attrs.mask)
                            { attrs.mask = "" }
                        if (!attrs.ip)
                            { attrs.ip = "" }
                        return this.link;
                    },
                link: function (scope, el, attrs)
                    {
                        scope.title = "";
                        scope.internalEnable = true;
                        var buttonEnable = false;
                        var lastValue = null;

                        if (!attrs.setClick)//default value for setClick
                            {
                                scope.setClick = function (val)
                                    {
                                        alert("val:" + val)
                                    };
                            }
                        scope.$watch('initVal', function (val)
                        {
                            if (scope.type == "number")
                                {
                                    if (!isNaN(val))
                                        {
                                            scope.value = val;
                                        }
                                }
                            else
                                {
                                    scope.value = val;
                                }

                            buttonEnable = false;
                            lastValue = scope.value;
                            scope.internalEnable = scope.enabled && buttonEnable;
                        });

                        scope.$watch('enabled', function (val)
                        {
                            scope.internalEnable = buttonEnable && val;
                        });

                        scope.$watch('mask', function (val)
                        {
                            scope.internalEnable = scope.enabled && validateValue() && buttonEnable;
                        });

                        scope.$watch('ip', function (val)
                        {
                            scope.internalEnable = scope.enabled && validateValue() && buttonEnable;
                        });

                        scope.$watch('value', function (val)
                        {
                            if (checkTheSameVal(lastValue, scope.value) || (checkTheSameVal(scope.initVal, scope.value) && !lastValue))
                                {
                                    buttonEnable = false;
                                }
                            else
                                {
                                    buttonEnable = true;
                                }
                            scope.internalEnable = scope.enabled && validateValue() && buttonEnable;
                        });

                        scope.InternalClick = function ()
                            {
                                scope.setClick({insideVal: scope.value});
                                if (scope.isWaitingForResponse == "false")
                                    {
                                        scope.initVal = scope.value;
                                    }
                            };

                        var checkTheSameVal = function (val1, val2)
                            {
                                var splitVal1 = val1.split(".");
                                var splitVal2 = val2.split(".");
                                for (var i = 0; i < splitVal1.length; i++)
                                    {
                                        if (parseInt(splitVal1[i], 10) != parseInt(splitVal2[i], 10))
                                            {
                                                return false;
                                            }
                                    }

                                return true;
                            };


                        //Validations

                        var validateIsLocalHost = function (address)
                            {
                                var splitAddress = address.split(".");
                                if (parseInt(splitAddress[0]) == 127 && parseInt(splitAddress[1]) == 0 && parseInt(splitAddress[2]) == 0 && parseInt(splitAddress[3]) == 1)
                                    {
                                        scope.title = "Address can't be a local host address"
                                        return true;
                                    }
                                else
                                    {
                                        return false;
                                    }
                            };

                        var validateIsMask = function (address)
                            {
                                var splitAddress = address.split(".");
                                var binaryString = "";
                                for (var i = 0; i < splitAddress.length; i++)
                                    {

                                        binaryString += convertToBinaryFixedLength(splitAddress[i], 8);
                                    }
                                var isMask = true;
                                var isZeroFlag = false;
                                var binarySplit = binaryString.split('');
                                for (var i = 0; i < binarySplit.length; i++)
                                    {
                                        if (binarySplit[i] == "1")
                                            {
                                                if (isZeroFlag)
                                                    {
                                                        isMask = false;
                                                        break;
                                                    }
                                            }
                                        else
                                            {
                                                isZeroFlag = true;
                                            }
                                    }

                                if (parseInt(binarySplit, 10) == 0)//all zero
                                    {
                                        isMask = false;
                                    }

                                if (isMask)
                                    {
                                        if (scope.type != "mask")
                                            {
                                                scope.title = "network address can't be a mask address";
                                            }
                                        return true;
                                    }
                                else
                                    {
                                        if (scope.type == "mask")
                                            {
                                                scope.title = "Invalid mask address";
                                            }
                                        return false;
                                    }

                            };

                        var validateIsAllZero = function (address)
                            {
                                var splitAddress = address.split(".");
                                if (parseInt(splitAddress[0]) == 0 && parseInt(splitAddress[1]) == 0 && parseInt(splitAddress[2]) == 0 && parseInt(splitAddress[3]) == 0)
                                    {
                                        scope.title = "Invalid network address"
                                        return true;
                                    }
                                else
                                    {
                                        return false;
                                    }
                            };

                        var validateIsMulticastReserved = function (address)
                            {
                                if (parseInt(address.split('.')[0]) > 223)
                                    {
                                        scope.title = "Invalid network address (reserved address)"
                                        return true;
                                    }
                                else
                                    {
                                        return false;
                                    }

                            };
                        var validateIsBroadcast = function (gw, mask, ip)
                            {
                                if (mask == "" || ip == "")
                                    {
                                        return false;
                                    }
                                var SplitByteMask = mask.split('.');
                                var SplitByteIP = ip.split('.');
                                var SplitByteGw = gw.split('.');
                                var isBroadcast = true;

                                for (var i = 0; i < SplitByteMask.length; i++)
                                    {
                                        if ((SplitByteIP[i] | (SplitByteMask[i] ^ 255)) != parseInt(SplitByteGw[i]))
                                            {
                                                isBroadcast = false;
                                            }
                                    }

                                if (isBroadcast)
                                    {
                                        scope.title = "Getway cannot be a broadcast address";
                                        return true;
                                    }
                                else
                                    {
                                        return false;
                                    }
                            };

                        var validateEmptyFields = function ()
                            {
                                var isValid = true;
                                var SplitVal = scope.value.split('.');
                                for (var i = 0; i < SplitVal.length; i++)
                                    {
                                        if (SplitVal[i] == "")
                                            {
                                                isValid = false;
                                            }
                                    }

                                if (!isValid)
                                    {
                                        scope.title = "Address field cannot be left empty";
                                    }

                                return isValid;
                            };

                        var validateValue = function ()
                            {
                                var isValid = null;
                                var isEmptyField = null;


                                switch (scope.type)
                                {
                                    case "ip":
                                        if (validateIsLocalHost(scope.value) || validateIsMask(scope.value) || validateIsAllZero(scope.value) || validateIsMulticastReserved(scope.value))
                                            {
                                                isValid = false;
                                            }
                                        else
                                            {
                                                isValid = true;
                                            }
                                        break;
                                    case "gw":
                                        if (validateIsLocalHost(scope.value) || validateIsMask(scope.value) || validateIsMulticastReserved(scope.value) || validateIsBroadcast(scope.value, scope.mask, scope.ip))
                                            {
                                                isValid = false;
                                            }
                                        else
                                            {
                                                isValid = true;
                                            }
                                        break;
                                    case "mask":
                                        if (validateIsMask(scope.value))
                                            {
                                                isValid = true;
                                            }
                                        else
                                            {
                                                isValid = false;

                                            }
                                        break;

                                }


                                if (validateEmptyFields())
                                    {
                                        isEmptyField = true;
                                    }
                                else
                                    {
                                        isEmptyField = false;
                                    }


                                if (isValid && isEmptyField)
                                    {
                                        scope.title = "";
                                        scope.errorClass = "";
                                    }
                                else
                                    {
                                        scope.errorClass = "error";
                                    }

                                return isValid && isEmptyField;
                            };

                        var convertToBinaryFixedLength = function (str, length)
                            {
                                var strToBinary = parseInt(str, 10).toString(2);
                                return Array(length - strToBinary.length + 1).join("0") + strToBinary;
                            }

                    }
            };
        });
    })();

