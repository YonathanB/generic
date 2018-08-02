/***********************************************
 * File Name: kBrowse.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  12:45
 * Last Modified: 15/04/2015
 * Modified by: Fassous
 ***********************************************/
(function ()
    {


        angular.module('components.widgets').directive("kBrowse", ['$q', '$timeout', function ($q, $timeout)
            {
                return {
                    restrict: 'E',
                    transclude: true,// Only works for type=content (use kContentButton)
                    scope: {
                        enabled: '=',
                        active: '=', // Only works for type=content (use kContentButton)
                        type: '@',   // button [default] - content
                        browseid: '@',
                        buttonText: '@',
                        controlClass: '@',
                        fileText: '=',
                        fileName: '=',
                        fileReadType: '@', // text (Default) and buffer
                        fileData: '=',
                        onFileDataReady: '&',
                        accept: '@',
                        title:'@'
                    },
                    template: "<k-button ng-if='type == \"button\"' control-class='{{controlClass}}' text='{{buttonText}}' visible='true' enabled='enabled' click='browseButtonClick()' title='{{title}}'></k-button>\
                        <k-content-button ng-if='type == \"content\"' enabled='enabled' control-class='{{controlClass}}' enabled='enabled' click='browseButtonClick()' active='active' title='{{title}}'>\
                        <div ng-transclude></div>\
                        </k-content-button>\
                        <input id='hidenfileInput_{{browseid}}' accept='{{accept}}' style='display: none;' type='file' fileread='fileText' file-read-type='{{fileReadType}}' onchange='angular.element(this).scope().setFile(this);'>",
                    compile: function (element, attrs)
                        {
                            if (!attrs.browseid)
                                { attrs.browseid = _.uniqueId(); }
                            if (!attrs.enabled)
                                { attrs.enabled = "true"; }
                            if (!attrs.buttonText)
                                { attrs.buttonText = "Browse..."; }
                            if (!attrs.fileText)
                                { attrs.fileText = ""; }
                            if (!attrs.fileName)
                                { attrs.fileName = ""; }
                            if (!attrs.controlClass)
                                { attrs.controlClass = ""; }
                            if (!attrs.fileReadType)
                                { attrs.fileReadType = "text"; }
                            if (!attrs.type)
                                { attrs.type = "button"; }

                            return this.link;
                        },
                    link: function (scope, element, attrs)
                        {

                            var el2 = element;

                            //scope.$watch('browseid', function (val)
                            //{
                            //    //$("#browseButton_" + scope.browseid).on('click', browseButtonClick);
                            //    $("#hidenfileInput_" + scope.browseid).on('change', getFileName);
                            //});

                            var obj = element[0].getElementsByTagName('input')[0];

                            obj.addEventListener("change", function (eventObject)
                            {

                                var file_name = obj.value;
//                                var test = obj;
                                //var file_name = $("#hidenfileInput_" + scope.browseid).val();
                                var filename = file_name.replace(/^.*[\\\/]/, '');

                                var re = /(?:\.([^.]+))?$/;
                                var extention = re.exec(filename)[0];   //example: ".txt"
                                var indexOfExtention = filename.indexOf(extention);

                                if (indexOfExtention > 35)
                                    {
                                        var CutetPath = "";
                                        CutetPath = filename.substring(0, 20);
                                        CutetPath += "... " + filename.substring(indexOfExtention - 3, indexOfExtention);
                                        CutetPath += extention;
                                        filename = CutetPath;
                                    }

                                scope.$applyAsync(function ()
                                {
                                    // scope.$apply(function ()
                                    // {
                                        scope.fileName = filename;
                                    // });
                                })

                            });

                            scope.setFile = function (el)
                                {
                                    // scope.$apply(function (scope)
                                    // {
                                    scope.$applyAsync(function ()
                                    {
                                        scope.fileData = el.files[0];
                                        scope.onFileDataReady({insideVal: scope.fileData});
                                    });
                                    // $timeout(function ()
                                    // {
                                    //     scope.fileData = el.files[0];
                                    //     scope.onFileDataReady({insideVal: scope.fileData});
                                    // });
                                    // });
                                };


                            scope.browseButtonClick = function ()
                                {
                                    if (scope.enabled)
                                        {
                                            obj.value = "";

                                            $timeout(function()
                                            {
                                                obj.click();
                                            });

                                            //$("#hidenfileInput_" + scope.browseid).val("");
                                            //$("#hidenfileInput_" + scope.browseid).click();
                                        }
                                };

                            var getFileName = function ()
                                {
                                    //obj = element[0].getElementsByTagName('input')[0];
                                    //var file_name = obj.value;
                                    ////var file_name = $("#hidenfileInput_" + scope.browseid).val();
                                    //var filename = file_name.replace(/^.*[\\\/]/, '');
                                    //
                                    //var re = /(?:\.([^.]+))?$/;
                                    //var extention = re.exec(filename)[0];   //example: ".txt"
                                    //var indexOfExtention = filename.indexOf(extention);
                                    //
                                    //if (indexOfExtention > 35)
                                    //    {
                                    //        var CutetPath = "";
                                    //        CutetPath = filename.substring(0, 20);
                                    //        CutetPath += "... " + filename.substring(indexOfExtention - 3, indexOfExtention);
                                    //        CutetPath += extention;
                                    //        filename = CutetPath;
                                    //    }
                                    //
                                    //$timeout(function ()
                                    //{
                                    //    scope.$apply(function ()
                                    //    {
                                    //        scope.fileName = filename;
                                    //    });
                                    //}, 0)
                                }
                        }
                };
            }]);
    })();