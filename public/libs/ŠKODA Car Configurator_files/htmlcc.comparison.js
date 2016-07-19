/// <reference path="../json2.js" /> 
/// <reference path="../jquery-1.7.2.js" /> 
/// <reference path="strings.libs.js" /> 
/// <reference path="htmlcc.libs.js" /> 
/*
 *  JavaScript API comparison display.
 *
 *  Requires: jquery; string.libs.js
 *
 *  Date: 4/20114
 *  Author: rklimt @ Trask solutions a.s.
 *  © ŠKODA AUTO a.s. 2014
 */

var HtmlCc = HtmlCc || {};
HtmlCc.Comparison = HtmlCc.Comparison || {};
HtmlCc.Comparison.VirtualTable = HtmlCc.Comparison.VirtualTable || {};
HtmlCc.Comparison.Virtual = HtmlCc.Comparison.Virtual || {};
HtmlCc.Comparison.Standard = HtmlCc.Comparison.Standard || {};


HtmlCc.Comparison.VirtualPDFTable = function ($rootElement, carsToComparison, translations, pdf, cfgManager, settings) {
    /// <signature>
    /// <param name='$rootElement' type='jQuery' />
    /// <param name='translations' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='carsToComparison' />
    /// </signature>


    $rootElement.append('<table class="comparison-table"></table>');
    var $comparisonTable = $rootElement.find('table.comparison-table');

    // display brief part

    // image line
    (function () {
        $comparisonTable.append('<tr class="image-line"><td class="line-header"></td></tr>');
        var $line = $comparisonTable.find('tr.image-line');

        $.each(carsToComparison, function () {
            var info = this;

            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}"><img class="car-image" src="{1}" alt={2} {3} {4} /></td>'.format(info.Id, info.ImageUrl, info.ModelName, info.EquipmentName, info.MotorName));
            if (pdf == false) {
                $line.find('car-image').after('<a class="close"></a>');
                var removeSettings = new HtmlCc.Workflow.SettingsType(settings);
                var allowedCars = [];
                $.each(removeSettings.viewstate.comparisonItems, function () {
                    if (this != info.Id) {
                        allowedCars.push(this);
                    }
                });
                var $value = $line.find('td.line-value-{0}'.format(info.Id));
                removeSettings.viewstate.comparisonItems = allowedCars;
                var $close = $value.find('a.close');
                $close.attr('href', cfgManager.getUrlOfSettings(removeSettings));
            }
        });
    })();

    // model name line
    (function () {
        $comparisonTable.append('<tr class="model-line model-line-name"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableModelName'.resx()));
        var $line = $comparisonTable.find('tr.model-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.ModelName));
        });
    })();

    // equipment name line
    (function () {
        $comparisonTable.append('<tr class="model-line equipment-name-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableEquipmentName'.resx()));
        var $line = $comparisonTable.find('tr.equipment-name-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.EquipmentName));
        });
    })();

    // motor name line
    (function () {
        $comparisonTable.append('<tr class="model-line motor-name-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableMotorName'.resx()));
        var $line = $comparisonTable.find('tr.motor-name-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.MotorName));
        });
    })();

    // price line
    (function () {
        $comparisonTable.append('<tr class="model-line price-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableTotalPrice'.resx()));
        var $line = $comparisonTable.find('tr.price-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.ClientFormatedPrice));
        });
    })();

    // note line
    (function () {
        $comparisonTable.append('<tr class="model-line note-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonNoteTitle'.resx()));
        var $line = $comparisonTable.find('tr.note-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.Note == null ? "" : info.Note));
        });
    })();

    // technical data part
    $comparisonTable.append('<tr class="technical-data-header"><td colspan="{0}" class="line-header">{1}</td></tr>'.format(carsToComparison.length + 1, 'GarageComparisonTableTechnicalDataHeader'.resx()));

    $.each(carsToComparison, function (infoIndex) {

        

        var info = this;

        $.each(info.GroupedTechnicalData, function () {

            var technicalDataGroup = this;

            var groupHash = technicalDataGroup.Code != null ? technicalDataGroup.Code.hashCode() : technicalDataGroup.Id;

            var $nestedPart = $comparisonTable.find('tr.group-{0}'.format(groupHash));
            if ($nestedPart.length == 0) {
                $comparisonTable.append('<tr class="nested-part group-{0}"><td class="part-header part-header-{0}" colspan="{1}">{2}</td></tr>'.format(groupHash, carsToComparison.length + 1, technicalDataGroup.Name));
                $nestedPart = $comparisonTable.find('tr.group-{0}'.format(groupHash));
            }

            $.each(technicalDataGroup.Items, function () {
                var technicalItem = this;

                var lineCode = technicalItem.EnglishCode || technicalItem.Code;
                var lineText = technicalItem.Code;
                var lineHash = lineCode.hashCode();

                var $line = $nestedPart.parent().find('tr.technical-part-line.line-{0}'.format(lineHash));
                if ($line.length == 0) {
                    $nestedPart.parent().append('<tr class="technical-part-line line-{0}" data-line-code="{1}"><td class="line-header">{2}</td></tr>'.format(lineHash, lineCode, lineText));
                    $line = $comparisonTable.find('tr.technical-part-line.line-{0}'.format(lineHash));
                }

                var cellCount = $line.find('td.line-value').length;
                for (var i = 0; i < infoIndex - cellCount; i++) {
                    $line.append('<td class="line-value empty"></td>');
                }

                $line.append('<td class="line-value line-value-{0}"></td>'.format(info.Id));
                var $lineValue = $line.find('td.line-value-{0}'.format(info.Id));
                $lineValue.text(technicalItem.Name);
            });
        });
        $comparisonTable.find('tr.technical-part-line').each(function () {
            var $thisLine = $(this);
            var $columns = $thisLine.find('td.line-value');
            var realCount = $columns.length;
            if (realCount < infoIndex + 1) {
                for (var i = 0; i < infoIndex + 1 - realCount; i++) {
                    $thisLine.append('<td class="line-value empty"></td>');
                }
            }
        });
    });



    // virtual equipment part

    $comparisonTable.append('<tr class="virtual-equipment-header"><td colspan="{0}" class="line-header">{1}</td></tr>'.format(carsToComparison.length + 1, 'GarageComparisonTableVirtualEquipmentHeader'.resx()));
    //display point types first
    $.each(carsToComparison, function (infoIndex, carToCompare) {
        $.each(carToCompare.VirtualEquipementItem, function (key, value) {
            value = value[0];

            if (value.DisplayType == HtmlCc.Api.ComparisonDisplayType.POINT.id) {
                var $itemPart = $comparisonTable.find('tr.nested-part.virtual-equipment-line.group-{0}'.format(key));
                if ($itemPart.length == 0) {
                    $comparisonTable.append('<tr class="nested-part group-{0} virtual-equipment-line" data-line-code="{0}"><td class="part-header part-header-{0}" colspan="{1}">{2}</td></tr>'.format(key, carsToComparison.length + 1, translations[key].Name));
                    $itemPart = $comparisonTable.find('tr.nested-part.virtual-equipment-line.group-{0}'.format(key))
                }

                var $line = $comparisonTable.find('tr.point.virtual-equipment-line.line-{0}'.format(value.VirtualItemCode));
                if ($line.length == 0) {
                    $itemPart.after('<tr class="virtual-equipment-line point line-{0}"></tr>'.format(value.VirtualItemCode));
                    $line = $comparisonTable.find('tr.point.virtual-equipment-line.line-{0}'.format(value.VirtualItemCode));
                    $line.append('<td class="line-header">{0}</td>'.format(translations[key].Items[value.VirtualItemCode]));
                    var cellCount = carsToComparison.length;
                    for (var i = 0; i < cellCount; i++) {
                        $line.append('<td class="line-value line-{0} empty"></td>'.format(carsToComparison[i].Id));
                    }
                    $line.attr('data-line-code', key);
                }

                var $lineCell = $comparisonTable.find('tr.point.virtual-equipment-line .line-value.line-{0}'.format(carToCompare.Id));
                if ($lineCell.length != 0) {
                    $lineCell.removeClass('empty');
                    $lineCell.text('•');
                }
            }
        });
    });
    // display text types
    $.each(carsToComparison, function (infoIndex, carToCompare) {
        $.each(carToCompare.VirtualEquipementItem, function (key, value) {
            value = value[0];
            if (value.DisplayType == HtmlCc.Api.ComparisonDisplayType.TEXT.id) {
                var $line = $comparisonTable.find('tr.virtual-equipment-line.text.line-{0}'.format(key));
                if ($line.length == 0) {
                    $comparisonTable.append('<tr class="virtual-equipment-line text line-{0}"></tr>'.format(key));
                    $line = $comparisonTable.find('tr.virtual-equipment-line.text.line-{0}'.format(key));
                    $line.append('<td class="line-header">{0}</td>'.format(translations[key].Name));
                    var cellCount = carsToComparison.length;
                    for (var i = 0; i < cellCount; i++) {
                        $line.append('<td class="line-value line-{0} empty"></td>'.format(carsToComparison[i].Id));
                    }
                    $line.attr('data-line-code', key);
                }

                var $lineCell = $line.find('td.line-value.line-{0}'.format(carToCompare.Id));
                if ($lineCell.length != 0) {
                    $lineCell.removeClass('empty');
                    $lineCell.text(translations[key].Items[value.VirtualItemCode]);
                }
            }
        });
    });
}


//// returns comparison table of cars in garage in a new form of virtual items
HtmlCc.Comparison.VirtualTable = function ($cc, $ccRoot, $comparisonTabContent, cfgManager, settings, carsToComparison, translations) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='carsToComparison' />
    /// </signature>

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType && cfgManager != null)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    if (!(settings instanceof HtmlCc.Workflow.SettingsType && settings != null)) {
        throw new Error('Object settings is not instance of HtmlCc.Workflow.SettingsType.');
    }

    if (cfgManager.getConfigurator().getSalesProgramSetting("enableComparisonPrint") == "true") {
        var $tabbedArea = $comparisonTabContent.parents('div.tabbed-area');

        var sanitizedCarIds = []
        if ($.isArray(carsToComparison)) {
            $.each(carsToComparison, function () {
                var sanitizedInt = this.Id;
                if (sanitizedInt > 0) {
                    sanitizedCarIds.push(sanitizedInt);
                }
            });
        } else {
            throw new Error('Object carIds is not an array.');
        }
        $tabbedArea.append('<div class="comparison-print-title"><a href="/{0}/{1}/{2}/Garage/GetPageForComparison?carsToCompareIds={3}&version={4}&pdfPrint=true" target="_blank">{5}</a></div>'.format(settings.instance, settings.salesprogram, settings.culture, sanitizedCarIds.join(","), cfgManager.getConfigurator().getComparisonTranslVersion(), 'ComparisonPrintTitle'.resx()));
    }
    $comparisonTabContent.append('<table class="comparison-table"></table>');
    var $comparisonTable = $comparisonTabContent.find('table.comparison-table');

    // display brief part

    // image line
    (function () {
        $comparisonTable.append('<tr class="image-line"><td class="line-header"></td></tr>');
        var $line = $comparisonTable.find('tr.image-line');

        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}"><img class="car-image" src="{1}" alt={2} {3} {4} /><a class="close"></a></td>'.format(info.Id, info.ImageUrl, info.ModelName, info.EquipmentName, info.MotorName));

            var removeSettings = new HtmlCc.Workflow.SettingsType(settings);
            var allowedCars = [];
            $.each(removeSettings.viewstate.comparisonItems, function () {
                if (this != info.Id) {
                    allowedCars.push(this);
                }
            });
            var $value = $line.find('td.line-value-{0}'.format(info.Id));
            removeSettings.viewstate.comparisonItems = allowedCars;
            var $close = $value.find('a.close');
            $close.attr('href', cfgManager.getUrlOfSettings(removeSettings));
        });
    })();

    // model name line
    (function () {
        $comparisonTable.append('<tr class="model-line model-line-name"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableModelName'.resx()));
        var $line = $comparisonTable.find('tr.model-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.ModelName));
        });
    })();

    // equipment name line
    (function () {
        $comparisonTable.append('<tr class="model-line equipment-name-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableEquipmentName'.resx()));
        var $line = $comparisonTable.find('tr.equipment-name-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.EquipmentName));
        });
    })();

    // motor name line
    (function () {
        $comparisonTable.append('<tr class="model-line motor-name-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableMotorName'.resx()));
        var $line = $comparisonTable.find('tr.motor-name-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.MotorName));
        });
    })();

    // price line
    (function () {
        $comparisonTable.append('<tr class="model-line price-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonTableTotalPrice'.resx()));
        var $line = $comparisonTable.find('tr.price-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.ClientFormatedPrice));
        });
    })();

    // note line
    (function () {
        $comparisonTable.append('<tr class="model-line note-line"><td class="line-header">{0}</td></tr>'.format('GarageComparisonNoteTitle'.resx()));
        var $line = $comparisonTable.find('tr.note-line');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<td class="line-value line-value-{0}" data-car-id="{0}">{1}</td>'.format(info.Id, info.Note == null ? "" : info.Note ));
        });
    })();

    // technical data part
    $comparisonTable.append('<tr class="technical-data-header"><td colspan="{0}" class="line-header">{1}</td></tr>'.format(carsToComparison.length + 1, 'GarageComparisonTableTechnicalDataHeader'.resx()));
    
   $.each(carsToComparison, function (infoIndex) {
        var info = this;

        $.each(info.GroupedTechnicalData, function () {
            var technicalDataGroup = this;

            var groupHash = technicalDataGroup.Code != null ? technicalDataGroup.Code.hashCode() : technicalDataGroup.Id;

            var $nestedPart = $comparisonTable.find('tr.group-{0}'.format(groupHash));
            if ($nestedPart.length == 0) {
                $comparisonTable.append('<tr class="nested-part group-{0}"><td class="part-header part-header-{0}" colspan="{1}">{2}</td></tr>'.format(groupHash, carsToComparison.length + 1, technicalDataGroup.Name));
                $nestedPart = $comparisonTable.find('tr.group-{0}'.format(groupHash));
            }

            $.each(technicalDataGroup.Items, function () {
                var technicalItem = this;

                var lineCode = technicalItem.EnglishCode || technicalItem.Code;
                var lineText = technicalItem.Code;
                var lineHash = lineCode.hashCode();

                var $line = $nestedPart.parent().find('tr.technical-part-line.line-{0}'.format(lineHash));
                if ($line.length == 0) {
                    $nestedPart.parent().append('<tr class="technical-part-line line-{0}" data-line-code="{1}"><td class="line-header">{2}</td></tr>'.format(lineHash, lineCode, lineText));
                    $line = $comparisonTable.find('tr.technical-part-line.line-{0}'.format(lineHash));
                }

                var cellCount = $line.find('td.line-value').length;
                for (var i = 0; i < infoIndex - cellCount; i++) {
                    $line.append('<td class="line-value empty"></td>');
                }

                $line.append('<td class="line-value line-value-{0}"></td>'.format(info.Id));
                var $lineValue = $line.find('td.line-value-{0}'.format(info.Id));
                $lineValue.text(technicalItem.Name);
            });
        });
        $comparisonTable.find('tr.technical-part-line').each(function () {
            var $thisLine = $(this);
            var $columns = $thisLine.find('td.line-value');
            var realCount = $columns.length;
            if (realCount < infoIndex + 1) {
                for (var i = 0; i < infoIndex + 1 - realCount; i++) {
                    $thisLine.append('<td class="line-value empty"></td>');
                }
            }
        });
   });

   

    // virtual equipment part

   $comparisonTable.append('<tr class="virtual-equipment-header"><td colspan="{0}" class="line-header">{1}</td></tr>'.format(carsToComparison.length + 1, 'GarageComparisonTableVirtualEquipmentHeader'.resx()));
   //display point types first
   $.each(carsToComparison, function (infoIndex, carToCompare) {
       $.each(carToCompare.VirtualEquipementItem, function (key, value) {
           value = value[0];
           if (value.DisplayType == HtmlCc.Api.ComparisonDisplayType.POINT.id) {
               var $itemPart = $comparisonTable.find('tr.nested-part.virtual-equipment-line.group-{0}'.format(key));
               if ($itemPart.length == 0) {
                   $comparisonTable.append('<tr class="nested-part group-{0} virtual-equipment-line" data-line-code="{0}"><td class="part-header part-header-{0}" colspan="{1}">{2}</td>"></tr>'.format(key, carsToComparison.length + 1, translations[key].Name));
                   $itemPart = $comparisonTable.find('tr.nested-part.virtual-equipment-line.group-{0}'.format(key))
               }

               var $line = $comparisonTable.find('tr.point.virtual-equipment-line.line-{0}'.format(value.VirtualItemCode));
               if ($line.length == 0) {
                   $itemPart.after('<tr class="virtual-equipment-line point line-{0}"></tr>'.format(value.VirtualItemCode));
                   $line = $comparisonTable.find('tr.point.virtual-equipment-line.line-{0}'.format(value.VirtualItemCode));
                   $line.append('<td class="line-header">{0}</td>'.format(translations[key].Items[value.VirtualItemCode]));
                   var cellCount = carsToComparison.length;
                   for (var i = 0; i < cellCount; i++) {
                       $line.append('<td class="line-value line-{0} empty"></td>'.format(carsToComparison[i].Id));
                   }
                   $line.attr('data-line-code', key);
               }

               var $lineCell = $comparisonTable.find('tr.point.virtual-equipment-line .line-value.line-{0}'.format(carToCompare.Id));
               if ($lineCell.length != 0) {
                   $lineCell.removeClass('empty');
                   $lineCell.text('•');
               }
           }               
       });
   });
        // display text types
       $.each(carsToComparison, function (infoIndex, carToCompare) {
           $.each(carToCompare.VirtualEquipementItem, function (key, value) {
               value = value[0];
               if (value.DisplayType == HtmlCc.Api.ComparisonDisplayType.TEXT.id) {
                   var $line = $comparisonTable.find('tr.virtual-equipment-line.text.line-{0}'.format(key));
                   if ($line.length == 0) {
                       $comparisonTable.append('<tr class="virtual-equipment-line text line-{0}"></tr>'.format(key));
                       $line = $comparisonTable.find('tr.virtual-equipment-line.text.line-{0}'.format(key));
                       $line.append('<td class="line-header">{0}</td>'.format(translations[key].Name));
                       var cellCount = carsToComparison.length;
                       for (var i = 0; i < cellCount; i++) {
                           $line.append('<td class="line-value line-{0} empty"></td>'.format(carsToComparison[i].Id));
                       }
                       $line.attr('data-line-code', key);
                   }

                   var $lineCell = $line.find('td.line-value.line-{0}'.format(carToCompare.Id));
                   if ($lineCell.length != 0) {
                       $lineCell.removeClass('empty');
                       $lineCell.text(translations[key].Items[value.VirtualItemCode]);
                   }
               }
           });
       });
}




HtmlCc.Comparison.Virtual = function ($cc, $ccRoot, $comparisonTabContent, cfgManager, settings, carsToComparison, translations) {
    
    $comparisonTabContent.append('<div class="comparison-table"></div>');
    var $comparisonTable = $comparisonTabContent.find('div.comparison-table');

    // display brief part
    $comparisonTable.append('<div class="part-line brief-part"></div>');
    var $briefPart = $comparisonTable.find('div.part-line');

    // image line
    (function () {
        $briefPart.append('<div class="part-line image-line"><div class="line-header"></div></div>');
        var $line = $briefPart.find('div.part-line.image-line');
        var $lineHeader = $line.find('div.line-header');
        $lineHeader.text('');
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"><img class="car-image" /><a class="close"></a></div>'.format(info.Id));
            var $value = $line.find('div.line-value-{0}'.format(info.Id));
            var $carImage = $value.find('img.car-image');
            $carImage.attr('src', info.ImageUrl);
            $carImage.attr('alt', '{0} {1} {2}'.format(info.ModelName, info.EquipmentName, info.MotorName));

            var removeSettings = new HtmlCc.Workflow.SettingsType(settings);
            var allowedCars = [];
            $.each(removeSettings.viewstate.comparisonItems, function () {
                if (this != info.Id) {
                    allowedCars.push(this);
                }
            });
            removeSettings.viewstate.comparisonItems = allowedCars;
            var $close = $value.find('a.close');
            $close.attr('href', cfgManager.getUrlOfSettings(removeSettings));
        });
        $line.append('<div class="terminator"></div>');
    })();

    // model name line
    (function () {
        $briefPart.append('<div class="part-line model-name-line"><div class="line-header"></div></div>');
        var $line = $briefPart.find('div.part-line.model-name-line');
        var $lineHeader = $line.find('div.line-header');
        $lineHeader.text('GarageComparisonTableModelName'.resx());
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
            var $value = $line.find('div.line-value-{0}'.format(info.Id));
            $value.text(info.ModelName);
        });
        $line.append('<div class="terminator"></div>');
    })();

    // equipment name line
    (function () {
        $briefPart.append('<div class="part-line equipment-name-line"><div class="line-header"></div></div>');
        var $line = $briefPart.find('div.part-line.equipment-name-line');
        var $lineHeader = $line.find('div.line-header');
        $lineHeader.text('GarageComparisonTableEquipmentName'.resx());
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
            var $value = $line.find('div.line-value-{0}'.format(info.Id));
            $value.text(info.EquipmentName);
        });
        $line.append('<div class="terminator"></div>');
    })();

    // motor name line
    (function () {
        $briefPart.append('<div class="part-line motor-name-line"><div class="line-header"></div></div>');
        var $line = $briefPart.find('div.part-line.motor-name-line');
        var $lineHeader = $line.find('div.line-header');
        $lineHeader.text('GarageComparisonTableMotorName'.resx());
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
            var $value = $line.find('div.line-value-{0}'.format(info.Id));
            $value.text(info.MotorName);
        });
        $line.append('<div class="terminator"></div>');
    })();

    // total price line
    (function () {
        $briefPart.append('<div class="part-line price-line"><div class="line-header"></div></div>');
        var $line = $briefPart.find('div.part-line.price-line');
        var $lineHeader = $line.find('div.line-header');
        $lineHeader.text('GarageComparisonTableTotalPrice'.resx());
        $.each(carsToComparison, function () {
            var info = this;
            $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
            var $value = $line.find('div.line-value-{0}'.format(info.Id));
            $value.text(info.ClientFormatedPrice);
        });
        $line.append('<div class="terminator"></div>');
    })();



    // technical data part
    $comparisonTable.append('<div class="part technical-data-part"><div class="part-header technical-data-header"></div></div>');

    var $technicalDataPart = $comparisonTable.find('div.technical-data-part');
    $technicalDataPart.find('div.technical-data-header').text('GarageComparisonTableTechnicalDataHeader'.resx());

    $.each(carsToComparison, function (infoIndex) {
        var info = this;

        $.each(info.GroupedTechnicalData, function () {
            var technicalDataGroup = this;

            var groupHash = technicalDataGroup.Code != null ? technicalDataGroup.Code.hashCode() : technicalDataGroup.Id;

            var $nestedPart = $technicalDataPart.find('div.group-{0}'.format(groupHash));
            if ($nestedPart.length == 0) {
                $technicalDataPart.append('<div class="part nested-part group-{0}"><div class="part-header part-header-{0}"></div></div>'.format(groupHash));
                $nestedPart = $technicalDataPart.find('div.group-{0}'.format(groupHash));

                $nestedPart.find('div.part-header-{0}'.format(groupHash)).text(technicalDataGroup.Name);
            }

            $.each(technicalDataGroup.Items, function () {
                var technicalItem = this;

                var lineCode = technicalItem.EnglishCode || technicalItem.Code;
                var lineText = technicalItem.Code;
                var lineHash = lineCode.hashCode();

                var $line = $nestedPart.find('div.part-line.line-{0}'.format(lineHash));
                if ($line.length == 0) {
                    $nestedPart.append('<div class="part-line line-{0}"><div class="line-header"></div></div>'.format(lineHash));

                    $line = $nestedPart.find('div.part-line.line-{0}'.format(lineHash));
                    $line.attr('data-line-code', lineCode);

                    $line.find('div.line-header').text(lineText);
                }

                var cellCount = $line.find('div.line-value').length;
                for (var i = 0; i < infoIndex - cellCount; i++) {
                    $line.append('<div class="line-value empty"></div>');
                }

                $line.append('<div class="line-value line-value-{0}"></div>'.format(info.Id));
                var $lineValue = $line.find('div.line-value-{0}'.format(info.Id));
                $lineValue.text(technicalItem.Name);
            });

        });

        // filling not completed lines
        $technicalDataPart.find('div.part-line').each(function () {
            var $thisLine = $(this);
            var $columns = $thisLine.find('div.line-value');
            var realCount = $columns.length;
            if (realCount < infoIndex + 1) {
                for (var i = 0; i < infoIndex + 1 - realCount; i++) {
                    $thisLine.append('<div class="line-value empty"></div>');
                }
            }
        });
    });

    $technicalDataPart.find('div.part-line').append('<div class="terminator"></div>');

    // virtual equipment part
    $comparisonTable.append('<div class="part standard-equipment-part"><div class="part-header standard-equipment-header"></div></div>');
    var $virtualEquipmentPart = $comparisonTable.find('div.standard-equipment-part');
    $virtualEquipmentPart.find('div.standard-equipment-header').text('GarageComparisonTableVirtualEquipmentHeader'.resx());
    
    $.each(carsToComparison, function (infoIndex, carToCompare) {
        $.each(carToCompare.VirtualEquipementItem, function (key, value) {
            value = value[0];            
            switch (value.DisplayType) {
                // DisplayType = "Point"
                case HtmlCc.Api.ComparisonDisplayType.POINT.id:
                    var $itemPart = $virtualEquipmentPart.find('div.item-compare.part.group-{0}'.format(key));
                    if ($itemPart.length == 0) {
                        $virtualEquipmentPart.append('<div class="part nested-part group-{0}"><div class="item-compare part group-{0}"><div class="part-header part-header-{0}">{1}</div></div></div>'.format(key, translations[key].Name));
                    }

                    $itemPart = $virtualEquipmentPart.find('div.item-compare.part.group-{0}'.format(key));
                    var $line = $itemPart.find('div.part-line.line-{0}'.format(value.VirtualItemCode));
                    if ($line.length == 0) {
                        $itemPart.append('<div class="part-line line-{0}"></div>'.format(value.VirtualItemCode));
                        $line = $itemPart.find('div.part-line.line-{0}'.format(value.VirtualItemCode));
                        $line.append('<div class="line-header">{0}</div>'.format(translations[key].Items[value.VirtualItemCode]));
                        var cellCount = carsToComparison.length;
                        for (var i = 0; i < cellCount; i++) {
                            $line.append('<div class="line-value line-value-{0} empty"></div>'.format(carsToComparison[i].Id));
                        }
                        $line.attr('data-line-code', key);
                    }

                    var $lineCell = $itemPart.find('.part-line.line-{0} .line-value.line-value-{1}'.format(value.VirtualItemCode, carToCompare.Id));
                    if ($lineCell.length != 0) {
                        $lineCell.removeClass('empty');
                        $lineCell.text('•');
                    }
                    break;
                    //// DisplayType = "Text"
                case HtmlCc.Api.ComparisonDisplayType.TEXT.id:
                    var $line = $virtualEquipmentPart.find('div.part-line.line-{0}'.format(key));
                    if ($line.length == 0) {
                        $virtualEquipmentPart.append('<div class="part-line line-{0}"></div>'.format(key));
                        $line = $virtualEquipmentPart.find('div.part-line.line-{0}'.format(key));
                        $line.append('<div class="line-header">{0}</div>'.format(translations[key].Name));

                        var cellCount = carsToComparison.length;
                        for (var i = 0; i < cellCount; i++) {
                            if (carsToComparison[i].VirtualEquipementItem.hasOwnProperty(key)) {
                                $line.append('<div class="line-value line-value-{0}"></div>'.format(carsToComparison[i].Id));
                            }
                            else {
                                $line.append('<div class="line-value line-value-{0} empty"></div>'.format(carsToComparison[i].Id));
                            }
                        }                                          
                        $line.attr('data-line-code', key);
                        $line.wrap('<div class="part nested-part"></div>')

                    }
                    
                    var $lineCell = $line.find('.line-value.line-value-{0}'.format(carToCompare.Id));                    
                    if ($lineCell.length != 0 && !$lineCell.hasClass('empty')){
                        $line.find('.line-value.line-value-{0}'.format(carToCompare.Id)).text(translations[key].Items[value.VirtualItemCode]);
                    }                    
                    break;
                default:
                    HtmlCc.Libs.Log.log("Bad displayType for virtual group item:  {0} ms".format(key));
            }
        });

       

        // filling not completed lines
        $virtualEquipmentPart.find('div.part-line').each(function () {
            var $thisLine = $(this);
            var $columns = $thisLine.find('div.line-value');
            var realCount = $columns.length;
            if (realCount < infoIndex + 1) {
                for (var i = 0; i < infoIndex + 1 - realCount; i++) {
                    $thisLine.append('<div class="line-value empty"></div>');
                }
            }
        });
    });

    $virtualEquipmentPart.find('div.part-line').append('<div class="terminator"></div>');

        
    var startTime = new Date().getTime();

    // make all cells in lines the same height
    $comparisonTable.find('div.part-line').each(function () {

        var $thisLine = $(this);

        var maxHeight = 1;

        var $header = $thisLine.find('div.line-header');
        if ($header.length > 0) {
            maxHeight = $header.height();
        }


        $thisLine.find('div.line-value').each(function () {
            var $thisCell = $(this);

            if (maxHeight < $thisCell.height()) {
                maxHeight = $thisCell.height();
            }
        });


        $header.height(maxHeight);
        $thisLine.find('div.line-value').each(function () {
            var $that = $(this);
            (function (maxH) {
                setTimeout(function () {
                    $that.height(maxH);
                }, 50);
            })(maxHeight);
        });

    });

    HtmlCc.Libs.Log.log("Resize lines took {0} ms".format(new Date().getTime() - startTime));
}

// returns old comparison table of cars - for cars with no virtual items settings
HtmlCc.Comparison.Standard = function ($cc, $ccRoot, $comparisonTabContent, cfgManager, settings, carsToComparison) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='carsToComparison' />
    /// </signature>

        $comparisonTabContent.append('<div class="comparison-table"></div>');
        var $comparisonTable = $comparisonTabContent.find('div.comparison-table');

        // display brief part
        $comparisonTable.append('<div class="part brief-part"></div>');
        var $briefPart = $comparisonTable.find('div.brief-part');

        if (cfgManager.getConfigurator().getSalesProgramSetting("enableComparisonPrint") == "true") {
            var $tabbedArea = $comparisonTabContent.parents('div.tabbed-area');

            var sanitizedCarIds = []
            if ($.isArray(carsToComparison)) {
                $.each(carsToComparison, function () {
                    var sanitizedInt = this.Id;
                    if (sanitizedInt > 0) {
                        sanitizedCarIds.push(sanitizedInt);
                    }
                });
            } else {
                throw new Error('Object carIds is not an array.');
            }

            $tabbedArea.append('<div class="comparison-print-title"><a href="/Garage/GetComparisonPage?carsToCompareIds={0}&pdfPrint=true" target="_blank">{1}</a></div>'.format(sanitizedCarIds.join(","), 'ComparisonPrintTitle'.resx()));
        }

        // image line
        (function () {
            $briefPart.append('<div class="part-line image-line"><div class="line-header"></div></div>');
            var $line = $briefPart.find('div.part-line.image-line');
            var $lineHeader = $line.find('div.line-header');
            $lineHeader.text('');
            $.each(carsToComparison, function () {
                var info = this;
                $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"><img class="car-image" /><a class="close"></a></div>'.format(info.Id));
                var $value = $line.find('div.line-value-{0}'.format(info.Id));
                var $carImage = $value.find('img.car-image');
                $carImage.attr('src', info.ImageUrl);
                $carImage.attr('alt', '{0} {1} {2}'.format(info.ModelName, info.EquipmentName, info.MotorName));

                var removeSettings = new HtmlCc.Workflow.SettingsType(settings);
                var allowedCars = [];
                $.each(removeSettings.viewstate.comparisonItems, function () {
                    if (this != info.Id) {
                        allowedCars.push(this);
                    }
                });
                removeSettings.viewstate.comparisonItems = allowedCars;
                var $close = $value.find('a.close');
                $close.attr('href', cfgManager.getUrlOfSettings(removeSettings));
            });
            $line.append('<div class="terminator"></div>');
        })();

        // model name line
        (function () {
            $briefPart.append('<div class="part-line model-name-line"><div class="line-header"></div></div>');
            var $line = $briefPart.find('div.part-line.model-name-line');
            var $lineHeader = $line.find('div.line-header');
            $lineHeader.text('GarageComparisonTableModelName'.resx());
            $.each(carsToComparison, function () {
                var info = this;
                $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
                var $value = $line.find('div.line-value-{0}'.format(info.Id));
                $value.text(info.ModelName);
            });
            $line.append('<div class="terminator"></div>');
        })();

        // equipment name line
        (function () {
            $briefPart.append('<div class="part-line equipment-name-line"><div class="line-header"></div></div>');
            var $line = $briefPart.find('div.part-line.equipment-name-line');
            var $lineHeader = $line.find('div.line-header');
            $lineHeader.text('GarageComparisonTableEquipmentName'.resx());
            $.each(carsToComparison, function () {
                var info = this;
                $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
                var $value = $line.find('div.line-value-{0}'.format(info.Id));
                $value.text(info.EquipmentName);
            });
            $line.append('<div class="terminator"></div>');
        })();

        // motor name line
        (function () {
            $briefPart.append('<div class="part-line motor-name-line"><div class="line-header"></div></div>');
            var $line = $briefPart.find('div.part-line.motor-name-line');
            var $lineHeader = $line.find('div.line-header');
            $lineHeader.text('GarageComparisonTableMotorName'.resx());
            $.each(carsToComparison, function () {
                var info = this;
                $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
                var $value = $line.find('div.line-value-{0}'.format(info.Id));
                $value.text(info.MotorName);
            });
            $line.append('<div class="terminator"></div>');
        })();

        // total price line
        (function () {
            $briefPart.append('<div class="part-line price-line"><div class="line-header"></div></div>');
            var $line = $briefPart.find('div.part-line.price-line');
            var $lineHeader = $line.find('div.line-header');
            $lineHeader.text('GarageComparisonTableTotalPrice'.resx());
            $.each(carsToComparison, function () {
                var info = this;
                $line.append('<div class="line-value line-value-{0}" data-car-id="{0}"></div>'.format(info.Id));
                var $value = $line.find('div.line-value-{0}'.format(info.Id));
                $value.text(info.ClientFormatedPrice);
            });
            $line.append('<div class="terminator"></div>');
        })();



        // technical data part
        $comparisonTable.append('<div class="part technical-data-part"><div class="part-header technical-data-header"></div></div>');

        var $technicalDataPart = $comparisonTable.find('div.technical-data-part');
        $technicalDataPart.find('div.technical-data-header').text('GarageComparisonTableTechnicalDataHeader'.resx());

        $.each(carsToComparison, function (infoIndex) {
            var info = this;

            $.each(info.GroupedTechnicalData, function () {
                var technicalDataGroup = this;

                var groupHash = technicalDataGroup.Code != null ? technicalDataGroup.Code.hashCode() : technicalDataGroup.Id;

                var $nestedPart = $technicalDataPart.find('div.group-{0}'.format(groupHash));
                if ($nestedPart.length == 0) {
                    $technicalDataPart.append('<div class="part nested-part group-{0}"><div class="part-header part-header-{0}"></div></div>'.format(groupHash));
                    $nestedPart = $technicalDataPart.find('div.group-{0}'.format(groupHash));

                    $nestedPart.find('div.part-header-{0}'.format(groupHash)).text(technicalDataGroup.Name);
                }

                $.each(technicalDataGroup.Items, function () {
                    var technicalItem = this;

                    var lineCode = technicalItem.EnglishCode || technicalItem.Code;
                    var lineText = technicalItem.Code;
                    var lineHash = lineCode.hashCode();

                    var $line = $nestedPart.find('div.part-line.line-{0}'.format(lineHash));
                    if ($line.length == 0) {
                        $nestedPart.append('<div class="part-line line-{0}"><div class="line-header"></div></div>'.format(lineHash));

                        $line = $nestedPart.find('div.part-line.line-{0}'.format(lineHash));
                        $line.attr('data-line-code', lineCode);

                        $line.find('div.line-header').text(lineText);
                    }

                    var cellCount = $line.find('div.line-value').length;
                    for (var i = 0; i < infoIndex - cellCount; i++) {
                        $line.append('<div class="line-value empty"></div>');
                    }

                    $line.append('<div class="line-value line-value-{0}"></div>'.format(info.Id));
                    var $lineValue = $line.find('div.line-value-{0}'.format(info.Id));
                    $lineValue.text(technicalItem.Name);
                });

            });

            // filling not completed lines
            $technicalDataPart.find('div.part-line').each(function () {
                var $thisLine = $(this);
                var $columns = $thisLine.find('div.line-value');
                var realCount = $columns.length;
                if (realCount < infoIndex + 1) {
                    for (var i = 0; i < infoIndex + 1 - realCount; i++) {
                        $thisLine.append('<div class="line-value empty"></div>');
                    }
                }
            });
        });

        $technicalDataPart.find('div.part-line').append('<div class="terminator"></div>');

        // standard equipment part
        $comparisonTable.append('<div class="part standard-equipment-part"><div class="part-header standard-equipment-header"></div></div>');
        var $standardEquipmentPart = $comparisonTable.find('div.standard-equipment-part');
        $standardEquipmentPart.find('div.standard-equipment-header').text('GarageComparisonTableStandardEquipmentHeader'.resx());

        $.each(carsToComparison, function (infoIndex) {
            var info = this;

            $.each(info.GroupedStandardEquipments, function () {
                var standardEquipmentGroup = this;

                var groupHash = standardEquipmentGroup.Code != null ? standardEquipmentGroup.Code.hashCode() : standardEquipmentGroup;

                var $nestedPart = $standardEquipmentPart.find('div.group-{0}'.format(groupHash));
                if ($nestedPart.length == 0) {
                    $standardEquipmentPart.append('<div class="part nested-part group-{0}"><div class="part-header part-header-{0}"></div></div>'.format(groupHash));
                    $nestedPart = $standardEquipmentPart.find('div.group-{0}'.format(groupHash));

                    $nestedPart.find('div.part-header-{0}'.format(groupHash)).text(standardEquipmentGroup.Name);
                }

                $.each(standardEquipmentGroup.Items, function () {
                    var standardItem = this;

                    var lineCode = standardItem.Code;
                    var lineHash = lineCode.hashCode();

                    var $line = $nestedPart.find('div.part-line.line-{0}'.format(lineCode));
                    if ($line.length == 0) {
                        $nestedPart.append('<div class="part-line line-{0}"><div class="line-header"></div></div>'.format(lineCode));

                        $line = $nestedPart.find('div.part-line.line-{0}'.format(lineCode));
                        $line.attr('data-line-code', lineCode);

                        $line.find('div.line-header').text(standardItem.Name);
                    }

                    var cellCount = $line.find('div.line-value').length;
                    for (var i = 0; i < infoIndex - cellCount; i++) {
                        $line.append('<div class="line-value empty"></div>');
                    }

                    $line.append('<div class="line-value line-value-{0}"></div>'.format(info.Id));
                    var $lineValue = $line.find('div.line-value-{0}'.format(info.Id));
                    $lineValue.text(standardItem.Name);
                });

            });

            // filling not completed lines
            $standardEquipmentPart.find('div.part-line').each(function () {
                var $thisLine = $(this);
                var $columns = $thisLine.find('div.line-value');
                var realCount = $columns.length;
                if (realCount < infoIndex + 1) {
                    for (var i = 0; i < infoIndex + 1 - realCount; i++) {
                        $thisLine.append('<div class="line-value empty"></div>');
                    }
                }
            });
        });

        $standardEquipmentPart.find('div.part-line').append('<div class="terminator"></div>');

        // extra equipment part
        $comparisonTable.append('<div class="part extra-equipment-part"><div class="part-header extra-equipment-header"></div></div>');
        var $extraEquipmentPart = $comparisonTable.find('div.extra-equipment-part');
        $extraEquipmentPart.find('div.extra-equipment-header').text('GarageComparisonTableExtraEquipmentHeader'.resx());

        $.each(carsToComparison, function (infoIndex) {
            var info = this;

            $.each(info.ExtraEquipments, function () {

                var extraItem = this;

                var lineCode = extraItem.Code;

                var $line = $extraEquipmentPart.find('div.part-line.line-{0}'.format(lineCode));
                if ($line.length == 0) {
                    $extraEquipmentPart.append('<div class="part-line line-{0}"><div class="line-header"></div></div>'.format(lineCode));

                    $line = $extraEquipmentPart.find('div.part-line.line-{0}'.format(lineCode));
                    $line.attr('data-line-code', lineCode);

                    $line.find('div.line-header').text(extraItem.Name);
                }

                var cellCount = $line.find('div.line-value').length;
                for (var i = 0; i < infoIndex - cellCount; i++) {
                    $line.append('<div class="line-value empty"></div>');
                }

                $line.append('<div class="line-value line-value-{0}"></div>'.format(info.Id));
                var $lineValue = $line.find('div.line-value-{0}'.format(info.Id));
                $lineValue.text(extraItem.Name);
            });


            // filling not completed lines
            $extraEquipmentPart.find('div.part-line').each(function () {
                var $thisLine = $(this);
                var $columns = $thisLine.find('div.line-value');
                var realCount = $columns.length;
                if (realCount < infoIndex + 1) {
                    for (var i = 0; i < infoIndex + 1 - realCount; i++) {
                        $thisLine.append('<div class="line-value empty"></div>');
                    }
                }
            });
        });

        $extraEquipmentPart.find('div.part-line').append('<div class="terminator"></div>');

        var startTime = new Date().getTime();

        // make all cells in lines the same height
        $comparisonTable.find('div.part-line').each(function () {

            var $thisLine = $(this);

            var maxHeight = 1;

            var $header = $thisLine.find('div.line-header');
            if ($header.length > 0) {
                maxHeight = $header.height();
            }


            $thisLine.find('div.line-value').each(function () {
                var $thisCell = $(this);

                if (maxHeight < $thisCell.height()) {
                    maxHeight = $thisCell.height();
                }
            });


            $header.height(maxHeight);
            $thisLine.find('div.line-value').each(function () {
                var $that = $(this);
                (function (maxH) {
                    setTimeout(function () {
                        $that.height(maxH);
                    }, 50);
                })(maxHeight);
            });

        });

        HtmlCc.Libs.Log.log("Resize lines took {0} ms".format(new Date().getTime() - startTime));
};



