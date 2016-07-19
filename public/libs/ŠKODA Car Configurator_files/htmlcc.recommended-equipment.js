var HtmlCc = HtmlCc || {};
if (HtmlCc.RecommendedEq === undefined) {
    HtmlCc.RecommendedEq = {};
}
if (HtmlCc.RecommendedEq.Ui === undefined) {
    HtmlCc.RecommendedEq.Ui = {};
}

if (HtmlCc.RecommendedEq.Ui.PopupWindow === undefined) {
    HtmlCc.RecommendedEq.Ui.PopupWindow = {};
}

//Vrací Url + dealer, pokud local.href obsahuje řetězec dealer
HtmlCc.RecommendedEq.Ui.GetUrl = function (localUrl) {
    if (location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0) {
        return '/dealer{0}'.format(localUrl);
    }
    else {
        return localUrl;
    }
}

/// <signature>
/// The class represents the Popup window for recommended equipment
/// </signature>

HtmlCc.RecommendedEq.Ui.PopupWindow = function ($cc, $ccRoot, cfgManager) {
    var $_cc = $cc;
    var $_ccRoot = $ccRoot;
    var _cfgManager = cfgManager;

    var _topPackages = [];
    var _recommendedItems = [];

    
    this.getRecommendedItems = function (motor) {
        if (!(motor instanceof HtmlCc.Api.MotorType)) {
            throw new Error('Object motor is not an instance of HtmlCc.Api.MotorType.');
        }
        if (_recommendedItems.length > 0) {
            return _recommendedItems;
        }
        else{            
            var packageGroups = motor.getAvailablePackageGroups();
            var selectedPackages = motor.getPackages();
            for (var i = 0; i < packageGroups.length; i++) {
                var packageGroup = packageGroups[i];
                if (packageGroup.getName() == '-') {
                    // this is faked group that is hidden
                    continue;
                }
                var packages = packageGroup.getPackages();
                for (var j = 0; j < packages.length; j++) {
                    if (packages[j].isSuitable() || packages[j].isRecommended()) {
                        _recommendedItems.push(packages[j]);
                    }
                }
            }
            return _recommendedItems;
        }
    }

    this.getTopPackages = function (instanceName, motor, modelCode, successCallback, errorCallback) {
        if (!(motor instanceof HtmlCc.Api.MotorType)) {
            throw new Error('Object motor is not an instance of HtmlCc.Api.MotorType.');
        }
        if (typeof successCallback !== 'function') {
            throw new Error('Object successCallback is not a function.');
        }
        if (typeof errorCallback !== 'function') {
            throw new Error('Object errorCallback is not a function.');
        }

        if (_topPackages.length > 0) {
            successCallback(_topPackages);
        }

        var motorCode = motor.getCode()
        var equipmentCode = motor.getEquipment().getCode()

        $.ajax({
            url: HtmlCc.RecommendedEq.Ui.GetUrl('/configurerefactored/GetMotorTopPackages'),
            data: JSON.stringify({ instanceName: instanceName, motorCode: motorCode, equipmentCode: equipmentCode, modelCode: modelCode }),
            success: function (data) {
                var packageGroups = motor.getAvailablePackageGroups();
                var selectedPackages = motor.getPackages();
                for (var i = 0; i < packageGroups.length; i++) {
                    var packageGroup = packageGroups[i];
                    if (packageGroup.getName() == '-') {
                        // this is faked group that is hidden
                        continue;
                    }
                    var packages = packageGroup.getPackages();
                    for (var j = 0; j < packages.length; j++) {
                        $.each(data, function (index, eqCode) {
                            if (packages[j].getCode() == eqCode) {
                                _topPackages.push(packages[j]);
                                return;
                            }
                        });
                    }
                }
                successCallback(_topPackages);
            },
            error: errorCallback,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            timeout: 10000
        });
    }

    this.createRecommendedDialogWindow = function (settings) {
        /// <signature>
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
        /// </signature>

        if (settings.viewstate.recommendedPopupWindow !== true) {
            $ccRoot.find('div.dialog.recommended-dialog').remove();
            $ccRoot.find('div.dialog.recommended-dialog-no-item').remove();
            return;
        }

        var $dialog = $ccRoot.find('div.dialog.recommended-dialog');
        
        if ($dialog == null || $dialog.length == 0) {
            $ccRoot.append('<div class="dialog recommended-dialog waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div>');
        }

        var $dialog = $ccRoot.find('div.dialog.recommended-dialog');
        var $dialogInner = $dialog.find('div.dialog-inner');
        var $dialogHeaderText = $dialogInner.find('div.dialog-header div.header-text');
        var $dialogClose = $dialogInner.find('div.dialog-header a.close');
        
        var $dialogContent = $dialogInner.find('div.dialog-content');

        var $recommendedSliderContainer = $dialogContent.find('div.recommended-slider');        
        if ($recommendedSliderContainer.length > 0) {
            $recommendedSliderContainer.remove();
        }
        var $recommendedSliderContainer = $('<div class="recommended-slider"></div>');
        $dialogContent.append($recommendedSliderContainer);

        var $otherInterestsSliderContainer = $dialogContent.find('div.other-interests');
        if ($otherInterestsSliderContainer.length > 0) {
            $otherInterestsSliderContainer.remove();
        }
        var $otherInterestsSliderContainer = $('<div class="other-interests"></div>');
        $dialogContent.append($otherInterestsSliderContainer);
        
        

        var closeSetting = new HtmlCc.Workflow.SettingsType(settings);
        
        $dialogClose.attr('href', '#');
        $dialogClose.bind('click.htmlcc', function (evt) {
            evt.preventDefault();       
            closeSetting.view = 'step6';
            closeSetting.viewstate.recommendedPopupWindow = undefined;
            location.href = cfgManager.getUrlOfSettings(closeSetting);
        });

        $dialogHeaderText.text('RecommendedPopupWindowHeaderText'.resx());

        var motor = cfgManager.getConfigurator().getConfiguredMotor();
        var instanceName = cfgManager.getConfigurator().getInstanceName();
        var modelCode = cfgManager.getConfigurator().getModelCode();
        if (this.getRecommendedItems(motor).length > 0) {
            HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $recommendedSliderContainer, 100, this.getRecommendedItems(motor), motor);
            $recommendedSliderContainer.prepend('<div class="box-text recommended-items"><h2>{0}</h2><p>{1}</p></div>'.format('RecommendedPopupWindowRecommendedItemsHeader'.resx(), 'RecommendedPopupWindowRecommendedItemsText'.resx()));
            $recommendedSliderContainer.slick({
                speed: 200,
                slidesToShow: 5,
                infinite: false,
                variableWidth: true,
                draggable: false,
                prevArrow: '<button type="button" class="slick-prev"></button>',
                nextArrow: '<button type="button" class="slick-next"></button>'
            });
        }
        else {
            $dialog.removeClass('recommended-dialog');
            $dialog.addClass('recommended-dialog-no-item');
            $dialogContent.text('RecommendedPopupWindowNoItems'.resx());
        }
        this.getTopPackages(instanceName, motor, modelCode, function (data) {
            if (data.length > 0){
            var topPackages = data            
                HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $otherInterestsSliderContainer, 20, topPackages, motor);
                $otherInterestsSliderContainer.prepend('<div class="box-text other-interests"><h2>{0}</h2><p>{1}</p></div>'.format('RecommendedPopupWindowOtherInterestsHeader'.resx(), 'RecommendedPopupWindowOtherInterestsText'.resx()));
                $otherInterestsSliderContainer.slick({
                    speed: 200,
                    slidesToShow: 5,
                    infinite: false,
                    //centerMode: true,
                    variableWidth: true,
                    draggable: false,
                    prevArrow: '<button type="button" class="slick-prev"></button>',
                    nextArrow: '<button type="button" class="slick-next"></button>'
                });
            }
        }, function () {
            $dialogContent.text('RecommendedPopupWindowNoItems'.resx());
            $dialog.removeClass("waiting");
        });
        $dialog.removeClass("waiting");
    }

    this.getCfgManager = function () {
        return _cfgManager;
    }



}