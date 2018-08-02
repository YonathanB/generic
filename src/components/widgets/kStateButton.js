/***********************************************
* Directive Name: kstatebutton
* Created by: Leonardo Severini
* On: 01/09/2014
* Last Modified: 01/09/2014
* Modified by: Leonardo Severini
***********************************************/
(function ()
{
     angular.module('components.widgets').directive("kStateButton", function ()
    {
        return {
            restrict: 'E',
            scope: {
                state: '@',          // Index for the current state
                enabled: '=',        // Button Enabled / Disabled
                visible: '@',        // Button visible / hide
                width: '@',          // Width of the button
                height: '@',         // Height of the button
                stateControlClass: '@',
                //iconclass: '@',      // Current Icon class (The icon will be on the center of the button)

                onaction: '&',       // Function to run on click event

                // Styles for the diferent states
                states: '=',         // Array with the definitions of all the states
                disabledstate: '=',  // Definition of the Disabled state
                overstate: '@'     // Definition of the Mouse Over state
            },

            template: function (elem, attrs)
            {
                var str = "<div ng-show='visible' class='kStateButton StateButtonDiv {{actualstyle}} {{ actualdisabledstyle }}  {{stateControlClass}}' title='{{title}}'";

                str += "  style='width:{{width}}px; height:{{height}}px; '";

                str += " ng-mouseenter='hover = true' ";
                str += " ng-mouseleave='hover = false' ";
                str += " ng-click='onaction();' >";

                str += "<div class='StateButtonInnerDiv'>";
                str += "<div class='{{iconclass}}' ></div>";

                str += "</div>";
                str += "</div>";
                return str
            },
            compile: function (element, attrs)
            {
                // Set the default values
                if (!attrs.state) { attrs.state = 0; }
                if (!attrs.enabled) { attrs.enabled = "true"; }
                if (!attrs.visible) { attrs.visible = "true"; }
                if (!attrs.height) { attrs.height = 23; }
                if (!attrs.width) { attrs.width = 23; }
                // Internal
                if (!attrs.hover) { attrs.hover = false; }  // Mouse over
                if (!attrs.actualstyle) { attrs.actualstyle = ''; }
                if (!attrs.actualdisabledstyle) { attrs.actualdisabledstyle = ''; }
                if (!attrs.title) { attrs.title = ''; }
                if (!attrs.iconclass) { attrs.iconclass = ''; }
                if (!attrs.stateControlClass) { attrs.stateControlClass = 'horizontalCenter'; }

                return this.link;
            },
            link: function (scope, element, attrs)
            {
                // Watch for the STATE and change the style
                scope.$watch("state", function ()
                {
                    if (scope.enabled)
                    {
                        if (scope.states && scope.state)
                        {
                            if (scope.states[scope.state].style) scope.actualstyle = scope.states[scope.state].style;
                            if (scope.states[scope.state].iconClass) scope.iconclass = scope.states[scope.state].iconClass;
                            if (scope.states[scope.state].title) scope.title = scope.states[scope.state].title;
                        }
                    }
                });

                // Watch for the STATE and change the style
                scope.$watch("states", function ()
                {
                    if (scope.enabled)
                        {
                            if (scope.states && scope.state)
                                {
                                    if (scope.states[scope.state].style) scope.actualstyle = scope.states[scope.state].style;
                                    if (scope.states[scope.state].iconClass) scope.iconclass = scope.states[scope.state].iconClass;
                                    if (scope.states[scope.state].title) scope.title = scope.states[scope.state].title;
                                }
                        }
                });

                // Watch for the MOUSE OVER and change the style
                scope.$watch("hover", function ()
                {

                    if (scope.enabled)
                    {
                        if (scope.hover)
                        {
                            if (scope.overstate)
                            {
                                if (scope.overstate.iconClass) scope.iconclass = scope.overstate.iconClass;
                                if (scope.overstate.style) scope.actualstyle = scope.overstate.style;
                                if (scope.overstate.title) scope.actualstyle = scope.overstate.title;
                            } else
                            {
                                scope.actualstyle = "StateButtonDefaultOverStyle";
                            }
                        }
                        else
                        {
                            if (scope.iconClass) scope.iconclass = scope.states[scope.state].iconClass;
                            if (scope.states && scope.state)
                                scope.actualstyle = scope.states[scope.state].style;
                            else
                                scope.actualstyle = "StateButtonDefaultStyle";
                        }
                    }
                });

                // Watch for the ENABLED and change the style
                scope.$watch("enabled", function ()
                {
                    if (scope.enabled)
                    {
                        scope.actualdisabledstyle = "";
                        if (scope.states && scope.state)
                        {
                            if (scope.states[scope.state].style) scope.actualstyle = scope.states[scope.state].style;
                            if (scope.states[scope.state].iconClass) scope.iconclass = scope.states[scope.state].iconClass;
                            if (scope.states[scope.state].title) scope.title = scope.states[scope.state].title;
                        }
                    }
                    else
                    {
                        if (scope.disabledstate)
                        {
                            if (scope.disabledstate.style) scope.actualdisabledstyle = scope.disabledstate.style;
                            if (scope.disabledstate.iconClass) scope.iconclass = scope.disabledstate.iconClass;
                            if (scope.disabledstate.title) scope.title = scope.disabledstate.title;
                        }
                    }
                });
            }
        }
    });
})();