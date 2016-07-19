var HtmlCc = HtmlCc || {};
if (HtmlCc.Accessories === undefined) {
    HtmlCc.Accessories = {};
}




if (HtmlCc.Accessories.Ui === undefined) {
    HtmlCc.Accessories.Ui = {};
}

if (HtmlCc.Accessories.Ui.PopupWindow === undefined) {
    HtmlCc.Accessories.Ui.PopupWindow = {};
}

/// <signature>
/// The class represents the Popup window for recommended equipment
/// </signature>

HtmlCc.Accessories.Ui.PopupWindow = function ($cc, $ccRoot, cfgManager) {
    var $_cc = $cc;
    var $_ccRoot = $ccRoot;
    var _cfgManager = cfgManager;

    this.showWindow = function (settings) {
        /// <signature>
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
        /// </signature>

        if (settings.viewstate.accessoriesPopupWindow !== true) {
            $ccRoot.find('div.dialog.accessories-dialog').remove();
            return;
        }

        var $dialog = $ccRoot.find('div.dialog.accessories-dialog');

        if ($dialog == null || $dialog.length == 0) {
            $ccRoot.append('<div class="dialog accessories-dialog waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div>');
        }

        var $dialog = $ccRoot.find('div.dialog.accessories-dialog');
        var $dialogInner = $dialog.find('div.dialog-inner');
        var $dialogHeaderText = $dialogInner.find('div.dialog-header div.header-text');
        var $dialogClose = $dialogInner.find('div.dialog-header a.close');

        var $dialogContent = $dialogInner.find('div.dialog-content');
       
        var closeSetting = new HtmlCc.Workflow.SettingsType(settings);

        $dialogClose.attr('href', '#');
        $dialogClose.bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            closeSetting.viewstate.accessoriesPopupWindow = undefined;
            closeSetting.viewstate.selectedAccessories = [];
            location.href = cfgManager.getUrlOfSettings(closeSetting);
        });

        $dialogHeaderText.text('AccessoriesPopupWindowHeaderText'.resx());

        

        $dialogContent.find('div.wheels-to-display').remove();
        $dialogContent.append('<div class="wheels-to-display"></div>');
        $wheelsToDisplay = $dialogContent.find('div.wheels-to-display');

        

        var motor = cfgManager.getConfigurator().getConfiguredMotor();
        var currentMotor = cfgManager.getConfigurator().getConfiguredMotor();

        var selectedWheel = currentMotor.getSelectedWheel()
        var className = settings.viewstate.selectedAccessories.length == 0 ? "active" : "non-active";

        var selectedAccessories = settings.viewstate.selectedAccessories
        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.viewstate.selectedAccessories = [];
        

        $selectedWheel = $('<a data-wheel-code="{0}" href="{3}" class="wheel-to-pick wheel-{0} {2}"><div class="title-label">{1}</div></a>'.format(selectedWheel.getCode(), selectedWheel.getName(), className, cfgManager.getUrlOfSettings(newSettings)));
        $selectedWheel.css('background-image', 'url({0})'.format(HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), newSettings, 'Wheel', 'Online_High')));
        $wheelsToDisplay.append($selectedWheel);

        $dialogContent.find('div.presenting-area').remove();
        $dialogContent.find('div.presenting-area-dialog').remove();
        $dialogContent.append('<div class="presenting-area"></div>');
        var $presentingArea = $dialogContent.find('div.presenting-area');

        $dialogContent.append('<div class="presenting-area-dialog"><h2>{0}</h2><p>{1}</p></div>'.format('AccessoriesPopupWindowDialogHeader'.resx(), 'AccessoriesPopupWindowDialogText'.resx()));
        var $selectedWheel = $dialogContent.find('.wheel-to-pick.active')

        this.showRenderedCar(cfgManager, settings, $presentingArea);

        var j = 0;

        for (var i = 0; i < settings.viewstate.accessoriesItems.length; i++) {
            var accessoryCode = settings.viewstate.accessoriesItems[i];
            var accessory = currentMotor.getExtraEquipmentByCode(accessoryCode);

            var accName = accessory.getShortName() == "" ? accessory.getName() : accessory.getShortName();

            var maxLength = 55 // maximum number of characters to extract from name
            accName = accName.substr(0, maxLength);
            accName = accName.substr(0, Math.min(accName.length, accName.lastIndexOf(" ")))


            className = selectedAccessories.indexOf(accessoryCode) == -1 ? "non-active" : "active";
            newSettings = new HtmlCc.Workflow.SettingsType(settings)
            newSettings.viewstate.selectedAccessories = [];
            newSettings.viewstate.selectedAccessories.push(accessoryCode);
           
            var $accesoryWheel = $('<a data-wheel-code="{0}" href="{2}" class="wheel-to-pick wheel-{0} {3}"><div class="title-label">{1}</div></a>'.format(accessoryCode, accName, cfgManager.getUrlOfSettings(newSettings), className));
            cfgManager.getConfigurator().checkAccessoriesSubstitution(motor, accessoryCode, function (accessory) {
                if (accessory.isInSubstitution) {
                    var $wheel = $dialogContent.find(".wheel-to-pick.wheel-{0}".format(accessory.code))
                    newSett = new HtmlCc.Workflow.SettingsType(settings)
                    newSett.viewstate.selectedAccessories = [];
                    newSett.viewstate.selectedAccessories.push(accessory.code);
                    $wheel.css('background-image', 'url({0})'.format(HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), newSett, 'Wheel', 'Online_High')));
                }
                else {
                    var $wheel = $dialogContent.find(".wheel-to-pick.wheel-{0}".format(accessory.code))
                    $wheel.css('background-image', 'url({0})'.format("/Content/Images/no-photo.jpg"));
                    if ($wheel.hasClass('active')) {
                        $dialogContent.find('.presenting-area-dialog').append("<p class='picture-not-available'>{0}</p>".format('AccessoriesPopupWindowNoImageText'.resx()))
                    }
                }
                if (i == settings.viewstate.accessoriesItems.length) {
                    $dialog.removeClass('waiting');
                }
            }, function () {
                $accesoryWheel.css('background-image', 'url({0})'.format("/Content/Images/no-photo.jpg"));
                HtmlCc.Libs.Log.warn('Error calling check accessory substitions due an error.');
            });

            //$accesoryWheel.css('background-image', 'url({0})'.format(HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), newSettings, 'Wheel', 'Online_High')));
            $wheelsToDisplay.append($accesoryWheel);
            j = i + 2;
        }

        if (settings.viewstate.accessoriesItems.length > 3) {
            $wheelsToDisplay.addClass('carousel');
            $wheelsToDisplay.slick({
                speed: 200,
                slidesToShow: 4,
                infinite: false,
                variableWidth: true,
                draggable: true,
                prevArrow: '<button type="button" class="slick-prev"></button>',
                nextArrow: '<button type="button" class="slick-next"></button>'
            });
        }
       
        

        //$wheelsToDisplay.find('.wheel-to-pick.non-active').click(function () {            
        //    $wheelsToDisplay.find('.wheel-to-pick').removeClass('active');
        //    var $activeWheel = $(this);
        //    var $presentingAreaDialog = $cc.find(".accessories-dialog .presenting-area-dialog");            
        //    if($activeWheel.data('image') == 'blank'){
        //        $presentingAreaDialog.append("<p class='picture-not-available'>{0}</p>".format('AccessoriesPopupWindowNoImageText'.resx()))
        //    }
        //    else{
        //        $presentingAreaDialog.find(".picture-not-available").remove();
        //    }
           
        //    $activeWheel.addClass('active');
        //})

        var boxMargin = 5;
        var boxWidth = 96;
        var width = 0;
        if (j > 4) {
            width = ((boxWidth + boxMargin) * 4) - boxMargin; // 4 boxes are shown
        }
        else {
            width = (boxWidth + boxMargin) * j;
        }

        $wheelsToDisplay.width(width);
        $wheelsToDisplay.append($('<div class="terminator"></div>'));

        
       //$dialog.removeClass('waiting');
       

       

    }

    this.showRenderedCar = function (cfgManager, settings, $presentingArea) {
        // Add default images  
        //var defaultViewPoint = $('<img />');
        //defaultViewPoint.addClass("presentation-image");
        //defaultViewPoint.attr(
        //    "src",
        //    $cc.data("last-angle-url-{0}0".format(getSelectedScene().replace(/^\D+/g, ''))));

        //if (defaultViewPoint.attr("src") != null) {
        //    $targetDisplay.find('img.presentation-image').remove();
        //    $targetDisplay.append(defaultViewPoint);
        //}

        var currentMotor = cfgManager.getConfigurator().getConfiguredMotor();

        $presentingArea.append('<div class="target-display"></div><div class="other-scenes"></div><div class="preload"></div><div class="waiting-box"></div>')


        var $targetDisplay = $presentingArea.find('div.target-display');
        var $otherScenes = $presentingArea.find('div.other-scenes');
        var $waitingBox = $presentingArea.find('div.waiting-box');
        var $preload = $presentingArea.find('div.preload');

        var scenes = currentMotor.getViewpointImages();

        var getSelectedScene = function () {
            var selectedScene = 'Rotation6';
            if ('selectedViewPoint' in settings.viewstate && settings.viewstate != null) {
                switch (settings.viewstate.selectedViewPoint) {
                    case 'Rotation6':
                    case 'Rotation24':
                        selectedScene = settings.viewstate.selectedViewPoint;
                }
            }

            return selectedScene;
        };


        var scenesToDisplay = ['Rotation6', 'Rotation24'];

        if (scenes == null || scenes.length == 0) {
            for (var i = 0; i < scenesToDisplay.length; i++) {
                var dummyImage = new HtmlCc.Api.ImageType();
                dummyImage.setViewpoint(scenesToDisplay[i]);
                scenes.push(dummyImage);
            }
        }

        $.each(scenesToDisplay, function (i, vp) {
            var scene = null;
            $.each(scenes, function () {
                var tmpScene = this;
                if (tmpScene.getViewpoint() == vp) {
                    scene = tmpScene;
                }
            });
            if (scene == null) {
                HtmlCc.Libs.Log.warn('Scene {0} is not found.'.format(vp));
                return;
            }

            var viewpointName = scene.getViewpoint();
            var viewpointLowUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Online_Low');
            var viewpointHighUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Online_High');

            //var viewpointPreviewUrl = scene.getPreviewUrl();
            //if (viewpointPreviewUrl == null) {
            viewpointPreviewUrl = viewpointLowUrl; //HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Online_Low');
            //}

            //var viewpointPreviewUrl = scene.getPreviewUrl(); // HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Offline_Preview');

            var $scene = $otherScenes.find('a.scene.viewpoint-{0}'.format(viewpointName));
            if ($scene.length == 0) {
                $otherScenes.append('<a class="scene viewpoint-{0}"><img class="scene-img" /></a>'.format(viewpointName));
                $scene = $otherScenes.find('a.scene.viewpoint-{0}'.format(viewpointName));
                $scene.attr('data-scene', viewpointName);
            }
            var $sceneImg = $scene.find('img.scene-img');

            var selectedScene = getSelectedScene();

            $sceneImg.attr('src', viewpointPreviewUrl);

            var newSettings = new HtmlCc.Workflow.SettingsType(settings);
            newSettings.viewstate.selectedViewPoint = viewpointName;

            $scene.attr('href', cfgManager.getUrlOfSettings(newSettings));

            if (selectedScene == viewpointName) {
                $scene.addClass('active');
                $waitingBox.addClass('loading');
                HtmlCc.Gui.VhqDisplayer($targetDisplay, $preload, viewpointLowUrl, viewpointHighUrl, function ($lqImage) {
                    //preLowLoad               
                    $targetDisplay.find('img.presentation-image').remove();
                    $lqImage.addClass('presentation-image');
                }, function ($lqImage, $hqImage) {
                    //postLowLoad
                    $presentingArea.removeClass("waiting");
                }, function ($lqImage, $hqImage) {
                    //preHighLoad   
                    $targetDisplay.find('img.presentation-image').remove();
                    $hqImage.addClass('presentation-image');
                }, function ($hqImage) {
                    //postHighLoad
                    //HtmlCc.Gui.Web.DisplayAnimationProgess($presentingArea, false, "ViewpointWaiting".resx());
                    $waitingBox.removeClass('loading');
                    // preload the second one
                    var nextViewpoint;
                    if (selectedScene == 'Rotation6') {
                        nextViewpoint = 'Rotation24';
                    } else {
                        nextViewpoint = 'Rotation6';
                    }
                    var nextLowUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, nextViewpoint, 'Online_Low');
                    var nextHighUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, nextViewpoint, 'Online_High');

                    HtmlCc.Gui.VhqDisplayer($targetDisplay, $preload, nextLowUrl, nextHighUrl, function ($lqImageNext) {
                        $lqImageNext.addClass('do-not-display');
                    }, function ($lqImageNext, $hqImageNext) {

                    }, function ($lqImageNext, $hqImageNext) {
                        $hqImageNext.addClass('do-not-display');
                    }, function ($hqImageNext) {
                        $hqImageNext.remove();
                    });

                    // update last viewpoint url
                    $cc.data("last-angle-url-{0}0".format(getSelectedScene().replace(/^\D+/g, '')), $hqImage.attr("src"));

                });

            } else {
                $scene.removeClass('active');
            }
        });
    }

    this.getAccessoryNameByCode = function (cfgManager, code){
        var motor = cfgManager.getConfigurator().getConfiguredMotor();
        var availablePackageGroups = motor.getAvailablePackageGroups();
        if (availablePackageGroups.Co == 0) {

        }
    }


}