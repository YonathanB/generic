/***********************************************
 * File Name: kDragAndDrop.js
 * Created by: fassous
 * On: 04/06/2015 11:23
 * Last Modified:
 * Modified by:
 ***********************************************/

(function () {

    angular.module('components.widgets').directive("kDragAndDrop", ['$parse', '$timeout', '$log', function ($parse, $timeout, $log) {
        return {
            restrict: "A",
            replace: false,
            link: function (scope, element, attrs, ctlr) {

                var obj;
                var dragLeaveCounter = 0;
                var emptyImage = new Image();


                if (!attrs.dadOnDragStart) {
                    scope.onDragStart = function () {
                        // $log.debug("onDragStart Not implement", scope.$root.debugLogEnable);
                    };
                }
                if (!attrs.dadOnDragEnter) {
                    scope.onDragEnter = function () {
                        // $log.debug("onDragEnter Not implement", scope.$root.debugLogEnable);
                    };
                }
                if (!attrs.dadOnDragMove) {
                    scope.dadOnDragMove = function () {
                        // $log.debug("dadOnDragMove Not implement", scope.$root.debugLogEnable);
                    };
                }
                if (!attrs.dadOnDragLeave) {
                    scope.onDragLeave = function () {
                        // $log.debug("onDragLeave Not implement", scope.$root.debugLogEnable);
                    };
                }
                if (!attrs.dadOnDrop) {
                    scope.onDrop = function () {
                        // $log.debug("onDrop Not implement", scope.$root.debugLogEnable);
                    };
                }

                if (!attrs.dadOnOver) {
                    scope.onDrop = function () {
                        // $log.debug("onOver Not implement", scope.$root.debugLogEnable);
                    };
                }

                var isIE = function (userAgent) {
                    userAgent = userAgent || navigator.userAgent;
                    return userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1 || userAgent.indexOf("Edge/") > -1;
                };
                // scope.$watch('dadIsDraggable', function (val)
                // {
                //     if(val!= undefined)
                //         obj.setAttribute("draggable", val);
                // });

                var init = function () {
                    if (attrs.dadIsDraggable === true || attrs.dadIsDraggable === "true") {
                        obj.setAttribute("draggable", true);
                        obj.addEventListener("dragstart", dragstart, false);
                        obj.addEventListener("dragend", dragend, false);
                        // obj.addEventListener("mousemove", mousemove(eventObject), false);
                    }
                    else {
                        obj.setAttribute("draggable", false);
                        obj.removeEventListener("dragstart", dragstart);
                        obj.removeEventListener("dragend", dragend);
                        // obj.removeEventListener("mousemove", mousemove);
                    }

                    if (attrs.dadIsDropTarget === true || attrs.dadIsDropTarget === "true") {
                        obj.addEventListener("dragover", dragover, false);
                        obj.addEventListener("dragenter", dragenter, false);
                        obj.addEventListener("dragleave", dragleave, false);
                        obj.addEventListener("drop", drop, false);
                    }
                    else {
                        obj.removeEventListener("dragover", dragover);
                        obj.removeEventListener("dragenter", dragenter);
                        obj.removeEventListener("dragleave", dragleave);
                        obj.removeEventListener("drop", drop);
                    }
                };


///////////////////////////////////////SOURCE////////////////////////////////////////////////
                var dragstart = function (eventObject) {
                    eventObject = eventObject.originalEvent || eventObject;
                    eventObject.stopPropagation();

                    if (typeof attrs.enabled !== "undefined" && !scope.$eval(attrs.enabled)) {
                        eventObject.preventDefault();
                        return;
                    }
                    var dataJson = {};
                    var dataText = "";

                    if (attrs.dadHideDragImage) {
                        // if(eventObject.dataTransfer.setDragImage)
                        eventObject.dataTransfer.setDragImage(emptyImage, 0, 0);

                    }


//TODO                        eventObject.originalEvent.dataTransfer.setData("text", attributes.itemid);
                    if (attrs.dadDataTransfer)
                        eventObject.dataTransfer.setData("text", attrs.dadDataTransfer);

                    if (attrs.dadFamily)
                        dataJson.family = attrs.dadFamily;
                    else
                        dataJson.family = "";

                    dataText = JSON.stringify(dataJson);
                    if (!isIE())
                    //    eventObject.dataTransfer.setData("text", dataText);
                    //else
                    {
                        eventObject.dataTransfer.setData(attrs.dadFamily, dataText);
                    }
                    if (typeof attrs.dadHideOnDrag !== "undefined" && scope.$eval(attrs.dadHideOnDrag)) {
                        $timeout(function () {
                            eventObject.target.classList.add("hide")
                        }, 0);
                    }
                    //  eventObject.dataTransfer.effectAllowed = "copyMove";

                    //   var target = eventObject.getCurrentTarget(eventObject);
                    //    target.style.cursor = 'move';
                    //scope.onDragStart({insideVal: eventObject});
                    var expressionHandler = $parse(attrs.dadOnDragStart);
                    expressionHandler(scope, {"eventObject": eventObject});

                };
                var dragend = function (eventObject) {
                    eventObject = eventObject.originalEvent || eventObject;

                    if (typeof attrs.dadHideOnDrag !== "undefined" && scope.$eval(attrs.dadHideOnDrag) && eventObject.dataTransfer.dropEffect == "none") {
                        //$timeout(function(){
                        eventObject.srcElement.classList.remove("hide");
//                                eventObject.target.classList.remove("hide");
//                                console.log("leave");
                        //},0);
                    }

                };
                // var mousemove = function(){
                //console.log(event.type);
                // };

/////////////////////////////////////TARGET////////////////////////////////////////////////////
                var dragover = function (eventObject) {
                    if (isIE() || isInFamilies(attrs.dadFamilyAccepted, eventObject.dataTransfer.types))
                        eventObject.preventDefault();
                    var expressionHandler = $parse(attrs.dadOnDragOver);
                    expressionHandler(scope, {"eventObject": eventObject});

                };

                var dragenter = function (eventObject) {
                    eventObject.preventDefault();
                    eventObject.stopPropagation();
                    if (!isIE() && !isInFamilies(attrs.dadFamilyAccepted, eventObject.dataTransfer.types)) {
                        eventObject.dataTransfer.effectAllowed = "none";
                        return;
                    }
                    dragLeaveCounter++;
                    if (dragLeaveCounter < 1)
                        dragLeaveCounter = 1;
                    // $log.debug('dragEnter ' + scope.$id + ' : ' + dragLeaveCounter, scope.$root.debugLogEnable);
                    // if (dragLeaveCounter === 1) {
                    if (attrs.dadHoverClass && attrs.dadHoverClass != "")
                        obj.classList.add(attrs.dadHoverClass);

                    var expressionHandler = $parse(attrs.dadOnDragEnter);
                    scope.$apply(function () {
                        expressionHandler(scope, {"eventObject": eventObject});
                    });

                    // }
                };


                var dragleave = function (eventObject) {
                    eventObject.preventDefault();
                    eventObject.stopPropagation();
                    if (!isIE() && !isInFamilies(attrs.dadFamilyAccepted, eventObject.dataTransfer.types)) {
                        eventObject.dataTransfer.effectAllowed = "none";
                        return;
                    }
                    dragLeaveCounter--;
                    // $log.debug('dragLeave ' + scope.$id + ' : ' + dragLeaveCounter, scope.$root.debugLogEnable);
                    if (dragLeaveCounter <= 0) {
                        if (attrs.dadHoverClass && attrs.dadHoverClass != "")
                            obj.classList.remove(attrs.dadHoverClass);

                        var expressionHandler = $parse(attrs.dadOnDragLeave);
                        scope.$apply(function () {
                            expressionHandler(scope, {"eventObject": eventObject});
                        });
                    }
                };

                var drop = function (eventObject) {
                    // cancel actual UI element from dropping, since the angular will recreate a the UI element

                    if (isIE()) {
                        var jsonText = eventObject.dataTransfer.getData('text');
                        if (jsonText === "")//Test for Edge that returns "" instead of null if empty
                            jsonText = null;
                        var jsonData = JSON.parse(jsonText);
                        if (jsonData != null && typeof jsonData.family === "string") {
                            var types = [jsonData.family];
                            if (!isInFamilies(attrs.dadFamilyAccepted, types)) {
                                return;
                            }

                        }
                        else {
                            //return;
                        }
                    }
                    else {//Test needed if drag-target object on another drag-target object
                        if (!isInFamilies(attrs.dadFamilyAccepted, eventObject.dataTransfer.types)) {
                            return;
                        }
                    }

                    eventObject.preventDefault();
                    eventObject.stopPropagation();
                    dragLeaveCounter = 0;
                    if (attrs.dadHoverClass && attrs.dadHoverClass != "")
                        obj.classList.remove(attrs.dadHoverClass);


                    eventObject.dadTarget = obj;
                    var expressionHandler = $parse(attrs.dadOnDrop);
                    expressionHandler(scope, {"eventObject": eventObject});
                };


//////////////////////////// OTHER FUNCTIONS /////////////////////////////////////////////////////////
                var isInFamilies = function (families, types) {
                    if (families == null || families == "")
                        return true;
                    aFamily = families.toLowerCase().split(';');


                    //if (aFamily.indexOf('ksmsource') >= 0) {
                    //    console.log(families);
                    //    console.log(types);
                    //}
                    //
                    //

                    //if(attrs.dadFamilyAccepted && eventObject.dataTransfer.types.indexOf(attrs.dadFamilyAccepted)<0 )
                    for (var i = 0; i < types.length; i++)
                        if (aFamily.indexOf(types[i].toLowerCase()) >= 0)
                            return true;
                    return false;
                };

/////////////////////////////////////////////////////////////////////////////////////////////////

                $timeout(function () {

//debugger;
                    if (element[0].classList.contains('dad-element'))
                        obj = element[0];
                    else
                        obj = element[0].getElementsByClassName('dad-element')[0];
                    if (obj === undefined)
                        obj = element[0].children[0];
                    if (obj === undefined)
                        obj = element[0];

                    init();

                    attrs.$observe('dadIsDraggable', function (val) {
                        init()
                    });
                    attrs.$observe('dadIsDropTarget', function (val) {
                        init()
                    });

                });

            }
        };
    }]);

    //angular.module('components.widgets').directive("kDropTarget", function () {
    //    return {
    //        restrict: "A",
    //        link: function (scope, element, attributes, ctlr) {
    //
    //            if (attributes.kDropTarget==true) {
    //                element.bind("dragover", function (eventObject) {
    //                    eventObject.preventDefault();
    //                    this.style.borderStyle = "dashed"
    //                });
    //
    //                element.bind("drop", function (eventObject) {
    //
    //                    // invoke controller/scope move method
    //                    scope.moveToBox(parseInt(eventObject.originalEvent.dataTransfer.getData("text")));
    //
    //                    // cancel actual UI element from dropping, since the angular will recreate a the UI element
    //                    eventObject.preventDefault();
    //                });
    //            }
    //        }
    //    };
    //});

})
();
