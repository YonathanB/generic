(function () {

    var undesirableNameDescription = [
        'Name cannot start with a digit',
        'Name can not be empty',
        'Name can not contains whitespaces'
    ];
    var undesirableNameRegex = [/(^\d)+(.*)$/, /^$/, /\s/];
//TODO add warning for special characters (SRS)

    angular.module('components.widgets')
        .directive('deviceName', function () {
            return {
                link: function (scope, element, attrs) {
                    var $elem = element;
                    var deviceName = $elem.val();
                    // $elem.on(['change', 'keyup'] ,applyChanges);
                    // $elem.change(applyChanges);
                    // $elem.keyup(applyChanges);

                    scope.$watch(attrs.ngModel, function () {
                        deviceName = $elem.val();
                        applyChanges();
                    })

                    function applyChanges() {
                        for (var i = 0; i < undesirableNameRegex.length; i++) {
                            if (undesirableNameRegex[i].test(deviceName)) {
                                if ($elem.next().hasClass('description'))
                                    $elem.next().remove();
                                $elem.after("<div style=\"position: absolute; margin-top: 13px \" class=\"description fade-in \">\n" +
                                    "        <br/>\n" +
                                    "            <i class=\"icon-warning \" style=\"margin-right: 5px; color: #b71c1c; font-size: 15px\">\n" +
                                    "            </i><span>" + undesirableNameDescription[i] + "</span>\n" +
                                    "  </div>");
                                // $elem.addClass('ng-invalid');
                                // $elem.removeClass('ng-valid');
                                if(scope.$parent.hasOwnProperty('form'))
                                    scope.$parent.form[attrs.name].$setValidity(attrs.name, false);
                                break;
                            } else if ($elem.next().hasClass('description')) {
                                $elem.next().remove();
                                scope.$parent.form[attrs.name].$setValidity(attrs.name, true);
                                // $elem.removeClass('ng-invalid');
                                // $elem.removeClass('ng-invalid');
                            }
                        }
                    }

                }
            };
        })
})();