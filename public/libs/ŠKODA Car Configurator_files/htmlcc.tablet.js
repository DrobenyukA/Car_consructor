if (HtmlCc === undefined) {
    var HtmlCc = {};
}

// presentation layer of htmlcc
if (HtmlCc.Gui === undefined) {
    HtmlCc.Gui = {};
}

// presentation layer of web specific version of htmlcc
if (HtmlCc.Gui.Web === undefined) {
    HtmlCc.Gui.Web = {};
}

//Vrací Url + dealer, pokud local.href obsahuje řetězec dealer
HtmlCc.Gui.Web.GetUrl = function (localUrl) {
    if (location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0) {
        return '/dealer{0}'.format(localUrl);
    }
    else {
        return localUrl;
    }
}


HtmlCc.Gui.Web.initNewTabletDesign = function ($cc, $ccRoot, cfgManager, settings) {

    if ($cc.hasClass('newtablet')) {     
        var $ccStepLabel = $cc.find('span.step-label');
        $ccStepLabel.text('Tbl_ChosenItems'.resx());
        
        switch (settings.view) {            
            case 'step1':
                HtmlCc.Gui.Web.setTabletTopMenu($cc, 'step1', cfgManager);
                HtmlCc.Gui.Web.setBottomProgressBar($cc, 1);
                HtmlCc.Gui.Web.setHeaderPrices($cc, cfgManager, 'step1');
                HtmlCc.Gui.Web.setCo2Box($cc, cfgManager, 'step1');
                             

                var $ccEquipmentBox = $cc.find('.cfg-content a.tile');
                $ccEquipmentBox.find('.equipment-label').css('top', '');
                if ($ccEquipmentBox.length > 0) {
                    if (!$ccEquipmentBox.find('.tile-container').length > 0) {                    
                    $ccEquipmentBox.each(function () {
                        $(this).append('<div class="tile-container"></div>');
                        var $tileContainer = $(this).find('.tile-container');
                        var $priceLabel = $(this).find('.price-label');
                        var $equipmentLabel = $(this).find('.equipment-label');
                        $tileContainer.append($equipmentLabel);
                        $tileContainer.append($priceLabel);                      
                    }); 
                    }                    
                }
                
                break;
            case 'step2':
                HtmlCc.Gui.Web.setTabletTopMenu($cc, settings.view, cfgManager);
                HtmlCc.Gui.Web.setBottomProgressBar($cc, 2);
                HtmlCc.Gui.Web.setHeaderPrices($cc, cfgManager, 'step2');
                HtmlCc.Gui.Web.setCo2Box($cc, cfgManager, 'step2');

                var $ccMotortBox = $cc.find('.cfg-content a.tile');
                $ccMotortBox.find('.equipment-label').css('top', '');
                if ($ccMotortBox.length > 0) {
                    if (!$ccMotortBox.find('.tile-container').length > 0) {
                        $ccMotortBox.each(function () {
                            $(this).append('<div class="tile-container"></div>');
                            var $tileContainer = $(this).find('.tile-container');
                            var $labels = $(this).find('.label');
                            $tileContainer.append($labels);
                        });
                    }
                }                 
      
                break;
            case 'step3':
                HtmlCc.Gui.Web.setTabletTopMenu($cc, settings.view, cfgManager);
                HtmlCc.Gui.Web.setBottomProgressBar($cc, 3);
                HtmlCc.Gui.Web.setHeaderPrices($cc, cfgManager, 'step3');
                
                var $cfgBox = $cc.find('.cfg-box');
                var $step3header = $cfgBox.find('.cfg-content-header');
                $step3header.empty();

                if ($cfgBox.hasClass('color')) {
                    
                    if (cfgManager.getConfigurator().getSalesProgramSetting("showCO2Box") == "True") {
                        $step3header.addClass('emission')
                }
                    $step3header.append('Step3SeparatedColorHeader'.resx() + " <span>" + cfgManager.getConfigurator().getConfiguredMotor().getSelectedColor().getName() + "</span>")
                }
                else {
                    if (cfgManager.getConfigurator().getSalesProgramSetting("showCO2Box") == "True") {
                        $step3header.addClass('emission')
                    }
                    var displayedName = cfgManager.getConfigurator().getConfiguredMotor().getSelectedWheel().getShortName()
                    if (displayedName == '') displayedName = cfgManager.getConfigurator().getConfiguredMotor().getSelectedWheel().getName()
                    $step3header.append('Step3SeparatedWheelHeader'.resx() + " <span>" + displayedName + "</span>")
                }

                //var $activeColor = $cc.find('.cfg-content .color-to-pick.active');
                //if ($activeColor.length > 0) {
                //    $colorHeader.empty();
                //    $colorHeader.append('BasicColorHeader'.resx() + ": <span>" + $activeColor.attr('title').split(" - ")[0] + "</span>")
                //}

                var $colorTab = $cc.find('.color-wheel-selector .color-tab')
                if ($colorTab.parent().find('.border-arrow').length == 0) {
                    $colorTab.after('<div class="border-arrow"></div>')
                }

                

                $cc.find('.cfg-content a.wheel-to-pick .info-ico').each(function () {
                    //$(this).parent().before($(this));
                    var $motorBox = $('<div class="wheel-box"></div>')

                    $(this).parent().before($motorBox);
                    $motorBox.append($(this).parent());
                    $motorBox.append($(this));
                });

                if ($cc.find('.wheel-notice').length == 0) {
                    var $ccWheelNotice = $('<div class="wheel-notice hidden"></div>');
                    $cc.append($ccWheelNotice);
                }

                HtmlCc.Gui.Web.setCo2Box($cc, cfgManager, 'step3');

                var $ccWheelBoxes = $cc.find('.cfg-content a.wheel-to-pick');
                var isInfoClick = false
                if ($ccWheelBoxes.length > 0) {
                    $ccWheelBoxes.each(function (index) {
                        var $ccWheelBox = $(this)
                        if (index % 3 == 0) { $ccWheelBox.addClass('first') }
                        if (index % 3 == 2) { $ccWheelBox.addClass('last') }
                        var $ccWheelImage = $('<div class="wheel-image"></div>');
                        var image = $ccWheelBox.css('background-image');
                        $ccWheelImage.css('background-image', image);
                        $ccWheelBox.append($ccWheelImage);
                        
                        $ccWheelBox.next('.info-ico').click(function (e) {
                            isInfoClick = true
                            var $ccWheelNotice = $cc.find('.wheel-notice');
                            var previousWheelInfo = $ccWheelNotice.attr('data-wheel-type-notice');
                            var newWheelInfo = $(this).prev('.wheel-to-pick').data('wheel-code')
                            $ccWheelNotice.attr('data-wheel-type-notice', newWheelInfo)
                            $ccWheelNotice.text($(this).attr('title'));
                            var topInfo = $(this).offset().top - 32
                            $ccWheelNotice.css('top', topInfo); 
                            if ($ccWheelBox.hasClass('last')) {
                                $ccWheelNotice.css('left', 146);
                            }
                            else if ($ccWheelBox.hasClass('first')) {
                                $ccWheelNotice.css('left', 6);
                            }
                            else {
                                $ccWheelNotice.css('left', 128);
                            }
                                              
                            if ($ccWheelNotice.hasClass('hidden')) {
                                isInfoIconClick = 0; 
                                $ccWheelNotice.removeClass('hidden');
                                $cc.bind('click', function (e) {
                                    isInfoIconClick += 1
                                    if (isInfoIconClick >= 2) {
                                        $cc.find('.wheel-notice').addClass('hidden');
                                        $cc.unbind('click');
                                        $cc.find('.cfg-content').unbind('touchmove');
                                        $cc.find('.cfg-content').unbind('scroll');
                                    }
                                });
                                $cc.find('.cfg-content').bind('scroll', function (e) {
                                    isInfoIconClick += 1
                                    if (isInfoIconClick >= 2) {
                                        $cc.find('.wheel-notice').addClass('hidden');
                                        $cc.find('.cfg-content').unbind('touchmove');
                                        $cc.find('.cfg-content').unbind('scroll');
                                        $cc.unbind('click');
                                    }
                                });
                                $cc.find('.cfg-content').bind('touchmove', function (e) {
                                    isInfoIconClick += 1
                                    if (isInfoIconClick >= 2) {
                                        $cc.find('.wheel-notice').addClass('hidden');
                                        $cc.find('.cfg-content').unbind('touchmove');
                                        $cc.find('.cfg-content').unbind('scroll');
                                        $cc.unbind('click');
                                    }
                                });
                            }
                            else {
                                isInfoIconClick = 0;
                            }
                            
                        });
                        

                        $ccWheelBox.css('background-image', 'none')
                        //$ccWheelBox.find('.wheel-image, .price-label').click(function () {
                        //    return false;
                        //});
                        //$ccWheelBox.append('<div class="tile-add"><div class="add-button"></div><span>{0}</span></div>'.format('Tbl_Add'.resx()));
                    });
                }
                
                break;
            case 'step4':
                HtmlCc.Gui.Web.setTabletTopMenu($cc, settings.view, cfgManager);
                HtmlCc.Gui.Web.setBottomProgressBar($cc, 4);
                HtmlCc.Gui.Web.setHeaderPrices($cc, cfgManager, 'step4');
                HtmlCc.Gui.Web.setCo2Box($cc, cfgManager, 'step4');
                

                var $ccInteriorBox = $cc.find('.cfg-content a.interior-to-pick');

                $ccInteriorBox.find('.equipment-label').css('top', '');
                if ($ccInteriorBox.length > 0) {
                    if (!$ccInteriorBox.find('.tile-container').length > 0) {
                        $ccInteriorBox.each(function () {
                            $(this).append('<div class="tile-container"></div>');
                            var $tileContainer = $(this).find('.tile-container');
                            var $labels = $(this).find('div.label');
                            $labels.css("top", '');
                            $tileContainer.append($labels);
                        });
                    }
                }


                //if (!$ccInteriorBox.find('interior-box').length > 0) {
                //    $ccInteriorBox.append('<div class="tile-add"><div class="add-button"></div><span>{0}</span></div>'.format('Tbl_Add'.resx()));
                //}

                if(cfgManager.getConfigurator().getSalesProgramSetting('hideInfoIcon') == 'true'){
                    $ccInteriorBox.find('.info-ico').remove();
                }
                else {
                    $ccInteriorBox.find('.info-ico').each(function () {
                        //$(this).parent().before($(this));
                        var $interiorBox = $('<div class="interior-box"></div>')
                        $(this).parent().before($interiorBox);
                        $interiorBox.append($(this).parent());
                        $interiorBox.append($(this));
                    });
                }
                //$ccInteriorBox.find('.interior-image, .label').click(function () { return false; });
                break;
            case 'step5':
                HtmlCc.Gui.Web.setTabletTopMenu($cc, settings.view, cfgManager);
                HtmlCc.Gui.Web.setBottomProgressBar($cc, 5);
                HtmlCc.Gui.Web.setHeaderPrices($cc, cfgManager, 'step5');
                HtmlCc.Gui.Web.setCo2Box($cc, cfgManager, 'step5');
                break;
            case 'step6':
                HtmlCc.Gui.Web.setTabletTopMenu($cc, settings.view, cfgManager);
                HtmlCc.Gui.Web.setBottomProgressBar($cc, 6);
                HtmlCc.Gui.Web.setHeaderPrices($cc, cfgManager, 'step6');
                HtmlCc.Gui.Web.setCo2Box($cc, cfgManager, 'step6');
                break;

            case 'step7':
                HtmlCc.Gui.Web.setTabletTopMenu($cc, settings.view, cfgManager);
                HtmlCc.Gui.Web.setBottomProgressBar($cc, 7);
                HtmlCc.Gui.Web.setHeaderPrices($cc, cfgManager, 'step7');
                HtmlCc.Gui.Web.setCo2Box($cc, cfgManager, 'step7');

                var $presentationBoxInfoFooter = $('.finish-presentation .info-box .info-footer')
                var $presentationBoxScroll = $('.finish-presentation .info-box .scroll')               
                $presentationBoxScroll.css('max-height', 407 - parseInt($presentationBoxInfoFooter.css('height'))); // height of info-footer + scroll must be 407px
                break;
        }

        //Chosen items
        $ccStepLabel.bind('click.htmlcc', function () {
            $ccStepLabel.addClass('hidden');            
            $cc.find('.choose-item-box a.close').bind('click.htmlcc', function () {
                $ccStepLabel.removeClass('hidden')
            });
        });
    }
}

HtmlCc.Gui.Web.followElementLink = function (element) {
    window.location = element.attr('href');
}

HtmlCc.Gui.Web.setHeaderPrices = function ($cc, cfgManager, currentStep) {
    var $priceTable = $cc.find('.price-table');
    var $topMenuArea = $cc.find('.top-menu-area');
    $priceTable.find("td.bottom-line[colspan='2']").removeAttr('colspan');

        if ($cc.hasClass('dealer') && $topMenuArea.find('.service-menu-settings').length == 0) {
            var $dealerServiceMenuSettings = $('<div class="service-menu-settings"></div>');
            $dealerServiceMenuSettings.append('<div class="service-menu-button"><span>{0}</span></div>'.format('Tbl_ServiceMenu'.resx()));
            $topMenuArea.children().each(function () {
                $dealerServiceMenuSettings.append($(this));
            })
            $topMenuArea.append($dealerServiceMenuSettings);
        }
        var $dealerServiceMenuSettingsButton = $topMenuArea.find('.service-menu-settings .service-menu-button')
        $dealerServiceMenuSettingsButton.unbind('click.htmlcc')
        $dealerServiceMenuSettingsButton.bind('click.htmlcc', function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).parent().css('left', 775);
            }
            else {
                $(this).addClass('active');
                $(this).parent().css('left', 0);
            }
        });

}

HtmlCc.Gui.Web.setTabletTopMenu = function ($cc, currentStep, cfgManager) {
    //top menu settings
    var $ccExterior;
    var $ccInterior;
    var $ccOverview;

    var $ccModelLabel = $cc.find('div.model-label');
    if ($ccModelLabel.find('.menu-box').length == 0) {
        var isDealer = $cc.hasClass('dealer');
        var $b2bImage;
        if (isDealer) {
            $b2bImage = $('<img id="b2b_image" src="" width="0" height="0"/>').appendTo($ccModelLabel);
        }
        if (isDealer) {
            $ccModelLabel.append('<ul class="menu-box">'
                + '<li><a class="log-out">{0}</a></li>'.format('GarageLogoutLink'.resx())
                + '<li class="save"><a>{0}</a></li>'.format('Tbl_Save'.resx())
                + '<li class="compare"><a>{0}</a></li>'.format('Tbl_Compare'.resx())
                + '<li class="sub-menu choose-view"><a class="sub">{0}</a></li>'.format('Tbl_ChooseView'.resx())
                + '<li class="sub-menu choose-background"><a class="sub">{0}</a></li>'.format('Tbl_ChooseBackground'.resx()));
            $ccModelLabel.find('a.log-out').attr('href', HtmlCc.Gui.Web.GetUrl('/account/logoff')).bind('click.htmlcc', function (evt) {
                evt.preventDefault();
                if (htmlcc.libs.LocalStorageProvider.hasStorage()) {
                    var loginRedirectCollection = JSON.parse(htmlcc.libs.LocalStorageProvider.getItem('loginRedirect'));
                    if (loginRedirectCollection == null) {
                        loginRedirectCollection = {};
                    }
                    var returnKey = HtmlCc.Libs.randomString(8);
                    loginRedirectCollection[returnKey] = {
                        returnUrl: location.href,
                        currentDate: (new Date()).toUTCString()
                    };
                    htmlcc.libs.LocalStorageProvider.setItem('loginRedirect', JSON.stringify(loginRedirectCollection));
                    // TODO Call B2B logout.
                    var logoutUrl = '{0}?returnKey={1}'.format($(this).attr('href'), returnKey);
                    if (isDealer) {
                        $b2bImage
                            .load(function () {
                                location.href = logoutUrl;
                            })
                            .error(function () {
                                location.href = logoutUrl;
                            })
                        ;
                        $b2bImage.attr("src", "https://portal.skoda-auto.com/pkmslogout");
                    } else {
                        location.href = logoutUrl;
                    }
                }
            });
        }
        else{
            $ccModelLabel.append('<ul class="menu-box">'
               + '<li class="home"><a>{0}</a></li>'.format('Tbl_Home'.resx())
                + '<li class="save"><a>{0}</a></li>'.format('Tbl_Save'.resx())
                + '<li class="compare"><a>{0}</a></li>'.format('Tbl_Compare'.resx())
                + '<li class="sub-menu choose-view"><a class="sub">{0}</a></li>'.format('Tbl_ChooseView'.resx())
                + '<li class="sub-menu choose-background"><a class="sub">{0}</a></li>'.format('Tbl_ChooseBackground'.resx()));
            $ccModelLabel.find('.home').click(function () { HtmlCc.Gui.Web.followElementLink($cc.find('.cfg-box .model-label a.home')) });
            


        }
        $ccModelLabel.find('.save').click(function () { HtmlCc.Gui.Web.followElementLink($cc.find('.presentation-box .save-car .save-car-a')) });
        $ccModelLabel.find('.compare').click(function () { HtmlCc.Gui.Web.followElementLink($cc.find('.presentation-box .car-storage .car-storage-a')) });

        var $ccChoseViewContent = $('<ul></ul>');

        $ccExterior = $('<li class="exterior"><a>{0}</a></li>'.format('Tbl_Exterior'.resx()));
        $ccInterior = $('<li class="interior"><a>{0}</a></li>'.format('Tbl_Interior'.resx()));
        $ccOverview = $('<li class="overreview"><a>{0}</a></li>'.format('Tbl_Overview'.resx()));

        $ccChoseViewContent.append($ccExterior);
        $ccChoseViewContent.append($ccInterior);
        $ccChoseViewContent.append($ccOverview);
        if ($cc.hasClass('dealer')) {
            var $ccChoseBackGround = $('<ul></ul>');
                               
                cfgManager.getConfigurator().getEnviroments(function (variantSetData) {
                // success
                if (variantSetData.Error && variantSetData.Error.Description) {
                    HtmlCc.Libs.Log.warn('Variant set collection of environments failed to load because "{0}".'.format(variantSetData.Error.Description));
                    $dialog.remove();
                    return;
                }
                    $.each(variantSetData, function () {
                        var thisValue = this;
                        var name = thisValue.Name == null ? thisValue.VariantSetCode : thisValue.Name;                        

                        var $viewpointBox = $('<li class="{0}"><a>{1}</a></li>'.format(thisValue.VariantSetCode, name))
                        $viewpointBox.find('div.viewpoint-name').text(thisValue.Name == null ? '-' + thisValue.VariantSetCode : thisValue.Name).attr('data-code', thisValue.VariantSetCode);

                        $viewpointBox.attr('data-code', thisValue.VariantSetCode)
                        $ccChoseBackGround.append($viewpointBox)
                        $viewpointBox.bind('click.htmlcc', function () {
                            $viewpointBox.siblings().removeClass('disabled');
                            $viewpointBox.addClass('disabled');
                            var viewpointCode = $viewpointBox.attr('data-code');
                            HtmlCc.Vred.selectVariantSet(viewpointCode);
                            $(this).parents('.sub-menu').removeClass('active');
                        });
                        
                });
                }, function () {
                    // error
                    HtmlCc.Libs.Log.warn('Variant set collection of viewpoints failed.');
                });
            
          
            
            $cc.find('.menu-box .choose-background').append($ccChoseBackGround)
        }
        else{
            var $ccChoseBackGround = $('<ul>'
             + '<li class="background-on"><a>{0}</a></li>'.format('Tbl_BackgroundOn'.resx())
            + '<li class="background-off"><a>{0}</a></li>'.format('Tbl_BackgroundOff'.resx())
            + '</ul>'
            );
            $ccChoseBackGround.find('li.background-off').click(function () { HtmlCc.Gui.Web.followElementLink($('.background-switcher .background-switcher-items a.no-background')) });
            $ccChoseBackGround.find('li.background-on').click(function () { HtmlCc.Gui.Web.followElementLink($('.background-switcher .background-switcher-items a.display-background')) });

            $cc.find('.menu-box .choose-background').append($ccChoseBackGround)
        }
        $cc.find('.menu-box .choose-view').append($ccChoseViewContent)
        
    }
    else {
        $ccExterior = $cc.find('.menu-box .choose-view .exterior');
        $ccInterior = $cc.find('.menu-box .choose-view .interior');
        $ccOverview = $cc.find('.menu-box .choose-view .overreview');

    }
    //define sub-menu contents

    //$ccChoseViewContent.find('li').each(function () { $(this).remove();});
    $cc.find('.menu-box .sub-menu').removeClass('active');

    switch (currentStep) {
        case 'step1':
            $ccExterior.unbind();
            $ccInterior.unbind();
            $ccOverview.unbind();
            $ccExterior.click(function () {
                HtmlCc.Gui.Web.followElementLink($('.chosen-view .chosen-view-items a.exterior-switch'));
                $cc.find('.menu-box .sub-menu').removeClass('active');
                if ($cc.hasClass('dealer')) {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        HtmlCc.Vred.selectViewPoint("rotationView");
                    }
                }
            });
            $ccInterior.click(function () {
                $('.chosen-view .chosen-view-items a.interior-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            if ($ccInterior.hasClass('disabled')) $ccInterior.removeClass('disabled');
            if (!$ccOverview.hasClass('disabled')) $ccOverview.addClass('disabled');
            if ($ccExterior.hasClass('disabled')) $ccExterior.removeClass('disabled');
            break;
        case 'step2':
            $ccExterior.unbind();
            $ccInterior.unbind();
            $ccOverview.unbind();
            $ccExterior.bind("click", function () {
                HtmlCc.Gui.Web.followElementLink($('.chosen-view .chosen-view-items a.exterior-switch'))
                $cc.find('.menu-box .sub-menu').removeClass('active');
                if ($cc.hasClass('dealer')) {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        HtmlCc.Vred.selectViewPoint("rotationView");
                    }
                }
            });
            $ccInterior.click(function () {
                $('.chosen-view .chosen-view-items a.interior-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            if ($ccInterior.hasClass('disabled')) $ccInterior.removeClass('disabled');
            $ccOverview.click(function () {
                $('.chosen-view .chosen-view-items a.engine-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            if ($ccOverview.hasClass('disabled')) $ccOverview.removeClass('disabled');
            if ($ccExterior.hasClass('disabled')) $ccExterior.removeClass('disabled');
            break;
        case 'step3':
            $ccExterior.unbind();
            $ccInterior.unbind();
            $ccOverview.unbind();
            $ccExterior.bind("click.htmlcc", function () {
                HtmlCc.Gui.Web.followElementLink($('.chosen-view .chosen-view-items a.exterior-switch'))
                $cc.find('.menu-box .sub-menu').removeClass('active');
                if ($cc.hasClass('dealer')) {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        HtmlCc.Vred.selectViewPoint("rotationView");
                    }
                }
            });
            $ccInterior.click(function () {
                $('.chosen-view .chosen-view-items a.interior-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            if ($ccInterior.hasClass('disabled')) $ccInterior.removeClass('disabled');
            if (!$ccOverview.hasClass('disabled')) $ccOverview.addClass('disabled');
            if ($ccExterior.hasClass('disabled')) $ccExterior.removeClass('disabled');
            break;
        case 'step4':
            $ccExterior.unbind();
            $ccInterior.unbind();
            $ccOverview.unbind();
            if ($ccExterior.hasClass('disabled')) $ccExterior.removeClass('disabled');
            if (!$ccOverview.hasClass('disabled')) $ccOverview.addClass('disabled');
            if ($ccInterior.hasClass('disabled')) $ccInterior.removeClass('disabled');
            $ccExterior.bind("click", function () {
                HtmlCc.Gui.Web.followElementLink($('.chosen-view .chosen-view-items a.exterior-switch'))
                $cc.find('.menu-box .sub-menu').removeClass('active');
                if ($cc.hasClass('dealer')) {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        HtmlCc.Vred.selectViewPoint("rotationView");
                    }
                }
            });
            $ccInterior.bind("click", function () {
                $cc.find('.chosen-view .chosen-view-items a.interior-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            break;
        case 'step5':
            $ccExterior.unbind();
            $ccInterior.unbind();
            $ccOverview.unbind();
            if ($ccOverview.hasClass('disabled')) $ccOverview.removeClass('disabled');
            if ($ccExterior.hasClass('disabled')) $ccExterior.removeClass('disabled');
            if ($ccInterior.hasClass('disabled')) $ccInterior.removeClass('disabled');
            $ccExterior.click(function () {
                $('.chosen-view .chosen-view-items a.exteriorViewPoints-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
                if ($cc.hasClass('dealer')) {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        HtmlCc.Vred.selectViewPoint("rotationView");
                    }
                }
            });
            $ccInterior.click(function () {
                $('.chosen-view .chosen-view-items a.interior-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            $ccOverview.click(function () {
                HtmlCc.Gui.Web.followElementLink($('.chosen-view .chosen-view-items a.extra-switch'))
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            break;
        case 'step6':
            $ccExterior.unbind();
            $ccInterior.unbind();
            $ccOverview.unbind();
            $ccExterior.click(function () {
                $('.chosen-view .chosen-view-items a.exteriorViewPoints-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
                if ($cc.hasClass('dealer')) {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        HtmlCc.Vred.selectViewPoint("rotationView");
                    }
                }
            });
            $ccInterior.click(function () {
                $('.chosen-view .chosen-view-items a.interior-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            $ccOverview.click(function () {
                HtmlCc.Gui.Web.followElementLink($('.chosen-view .chosen-view-items a.insurance-switch'))
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            if ($ccOverview.hasClass('disabled')) $ccOverview.removeClass('disabled');
            if ($ccExterior.hasClass('disabled')) $ccExterior.removeClass('disabled');
            if ($ccInterior.hasClass('disabled')) $ccInterior.removeClass('disabled');
            break;
        case 'step7':
            $ccExterior.unbind();
            $ccInterior.unbind();
            $ccOverview.unbind();
            $ccExterior.click(function () {
                $('.chosen-view .chosen-view-items a.exteriorViewPoints-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
                if ($cc.hasClass('dealer')) {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        HtmlCc.Vred.selectViewPoint("rotationView");
                    }
                }
            });
            $ccInterior.click(function () {
                $('.chosen-view .chosen-view-items a.interior-switch').click();
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            $ccOverview.click(function () {
                HtmlCc.Gui.Web.followElementLink($('.chosen-view .chosen-view-items a.finish-info-switch'))
                $cc.find('.menu-box .sub-menu').removeClass('active');
            });
            if ($ccOverview.hasClass('disabled')) $ccOverview.removeClass('disabled');
            if ($ccExterior.hasClass('disabled')) $ccExterior.removeClass('disabled');
            if ($ccInterior.hasClass('disabled')) $ccInterior.removeClass('disabled');
            break;
    }


    if ($cc.find('.background-switcher .background-switcher-items a.display-background').hasClass('active')) {
        $ccModelLabel.find('.menu-box .choose-background .background-on').addClass('disabled');
    }
    else {
        $ccModelLabel.find('.menu-box .choose-background .background-on').removeClass('disabled');
    }

    if ($cc.find('.background-switcher .background-switcher-items a.no-background').hasClass('active')) {
        $ccModelLabel.find('.menu-box .choose-background .background-off').addClass('disabled');
    }
    else {
        $ccModelLabel.find('.menu-box .choose-background .background-off').removeClass('disabled');
    }


    $ccModelLabel.find('.menu-box a.sub').unbind();
    $ccModelLabel.find('.menu-box a.sub').click(function () {
        if (!$(this).parent('.sub-menu').hasClass('active')) {
            $(this).parent('.sub-menu').addClass('active')
        }
        else {
            $(this).parent('.sub-menu').removeClass('active');
        }
    });
}

HtmlCc.Gui.Web.setCo2Box = function ($cc, cfgManager, step) {
    // fills the template
    var params = cfgManager.getParamsByStepName('step1');
    var motor = null;
    var motorId = params.motorId;

    if (motorId > 0) {
        // fill with simple motor
        motor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
    }
    if (motor == null || (step != 'step1')) {
        motor = cfgManager.getConfigurator().getConfiguredMotor();
    }

    if (cfgManager.getConfigurator().getSalesProgramSetting("showCO2Box") == "True") {
        var $ccContentHeader = $cc.find('.cfg-content-header');
        if (step == 'step2'){
            var $ccFuelSelector = $ccContentHeader.find('.fuel-selector');
            if($ccFuelSelector.length > 0) {
                $ccFuelSelector.addClass('left');
            }
        }

        
        var $emissionBox = $ccContentHeader.find('.emissions-box');
        
        if ($emissionBox.length == 0) {
            $emissionBox = $('<span class="emissions-box"></span>');
            $emissionBox.html("CO<sub>2</sub> {0} g/km".format(motor.getEmissionGasDouble() > 0 ? motor.getEmissionGasDouble() : motor.getEmissionDouble()));
            $ccContentHeader.append($emissionBox);
        }
        else {
            $emissionBox.html("CO<sub>2</sub> {0} g/km".format(motor.getEmissionGasDouble() > 0 ? motor.getEmissionGasDouble() : motor.getEmissionDouble()));
        }
    }
}

HtmlCc.Gui.Web.setBottomProgressBar = function ($cc, currentStep) {
    var $$ccSwitchBoxBottom = $cc.find('.bottom-switch-box');
    if ($$ccSwitchBoxBottom.find('.step-box').length == 0) {
        //var $$ccShowSelectedItemsInSteps = $('<div class="show-selected-step-items"><p>{0}</p></div>'.format('Tbl_ChosenItems'.resx()))
        var $$ccSwitchBoxBottomStep1 = $('<div class="step-box step1"><p>{0}</p></div>'.format('Tbl_Equipment'.resx()));
        var $$ccSwitchBoxBottomStep2 = $('<div class="step-box step2"><p>{0}</p></div>'.format('Tbl_Engine'.resx()));
        var $$ccSwitchBoxBottomStep3 = $('<div class="step-box step3"><p>{0}</p></div>'.format('Tbl_Colours'.resx()));// possible to insert <span>text for smaller text</span>
        var $$ccSwitchBoxBottomStep4 = $('<div class="step-box step4"><p>{0}</p></div>'.format('Tbl_Interior'.resx()));
        var $$ccSwitchBoxBottomStep5 = $('<div class="step-box step5"><p>{0}</p></div>'.format('Tbl_ExtraEquipment'.resx()));
        var $$ccSwitchBoxBottomStep6 = $('<div class="step-box step6"><p>{0}</p></div>'.format('Tbl_SkodaCare'.resx()));
        var $$ccSwitchBoxBottomStep7 = $('<div class="step-box step7 last"><p>{0}</p></div>'.format('Tbl_Summary'.resx()));


        //$$ccShowSelectedItemsInSteps.unbind('click.htmlcc').bind('click.htmlcc', HtmlCc.Gui.Web.OpenStepDialog);

        //$$ccSwitchBoxBottom.append($$ccShowSelectedItemsInSteps);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep1);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep2);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep3);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep4);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep4);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep5);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep6);
        $$ccSwitchBoxBottom.append($$ccSwitchBoxBottomStep7);
    }

    $$ccSwitchBoxBottom.find('.step-box').each(function (index) {
        if (!$(this).hasClass('active') && index + 1 <= currentStep) {
            $(this).click(function () { HtmlCc.Gui.Web.followElementLink($($cc.find('.progress-indicator a.step-bar')[index])) });
            $(this).addClass('active')
        }
        else if ($(this).hasClass('active') && index + 1 > currentStep) {
            $(this).removeClass('active')
            $(this).unbind();
        }
    });
};




HtmlCc.Gui.Web.redesignStepSummary = function($cc){
    var $ccStepSummarySectionHeader = $cc.find('.step-summary .step-hover-section-header')
    $ccStepSummarySectionHeader.css('display', 'none');
}

/*
params debug - for debuging tablet browsers - for production - false 
*/
function tablet_detect() {
    var istablet = (/ipad|android 3|sch-i800|playbook|kindle|gt-p1000|sgh-t849|shw-m180s|a510|a511|a100|dell streak|silk/i.test(navigator.userAgent.toLowerCase()))
     if (istablet == true || mobile_detect() == true) {
        return true
    }
}

function mobile_detect () {
    return /iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(navigator.userAgent.toLowerCase());
}



