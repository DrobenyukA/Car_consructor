var HtmlCc = HtmlCc || {};
if (HtmlCc.Financial === undefined) {
    HtmlCc.Financial = {};
}
if (HtmlCc.Financial.Ui === undefined) {
    HtmlCc.Financial.Ui = {};
}

if(HtmlCc.Financial.Ui.SettingsForm === undefined){ 
    HtmlCc.Financial.Ui.SettingsForm = {};
}

/// <signature>
/// The class represents the financing setting form
/// </signature>
HtmlCc.Financial.Ui.SettingsForm = function ($cc, $ccRoot, cfgManager) {
    var $_cc = $cc;
    var $_ccRoot = $ccRoot;
    var _cfgManager = cfgManager;

    this.createFinancingForm = function (variant, settings) {
        /// <signature>
        /// <param name='variant' type='String'>"financing" | "insurance"</param>
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
        /// </signature>
        if (this.isLeasing(variant)) {
            if (settings.viewstate.displayFinancingDialog !== true) {
                $ccRoot.find('div.financing-dialog.variant-financing').remove();
                return;
            }
        } else if (this.isInsurance(variant)) {
            if (settings.viewstate.displayInsuranceDialog !== true) {
                $ccRoot.find('div.financing-dialog.variant-insurance').remove();
                return;
            }
        } else {
            throw new Error('Unknown variant.');
        }

        var $dialog = $ccRoot.find('div.dialog.financing-dialog');

        if ($dialog == null || $dialog.length == 0) {
            $ccRoot.append('<div class="dialog financing-dialog waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="tabbed-area"><div class="tab-headers"></div><div class="product-help"></div><div class="terminator"></div></div><div class="dialog-waiting"></div></div></div>');
        }

        var $dialog = $ccRoot.find('div.dialog.financing-dialog');
        var $dialogInner = $dialog.find('div.dialog-inner');
        var $dialogHeaderText = $dialogInner.find('div.dialog-header div.header-text');
        var $dialogClose = $dialogInner.find('div.dialog-header a.close');      
        var $dialogSubmitBar = $dialogInner.find('div.submit-bar');
        var $tabArea = $dialogInner.find('div.tabbed-area');

        $dialogClose.attr('title', 'FinancingDialogCloseIco'.resx());

        var closeSetting = new HtmlCc.Workflow.SettingsType(settings);
        var financing;

        if (this.isLeasing(variant)) {
            financing = cfgManager.getConfigurator().getFinancing();

            $dialog.addClass('variant-financing');
            $dialogHeaderText.text('FinancingDialogHeader'.resx());
            closeSetting.viewstate.displayFinancingDialog = undefined;
        } else if (this.isInsurance(variant)) {
            financing = cfgManager.getConfigurator().getInsurance();

            $dialog.addClass('variant-insurance');
            $dialogHeaderText.text('InsuranceDialogHeader'.resx());
            closeSetting.viewstate.displayInsuranceDialog = undefined;

        } else {
            throw new Error('Unknown variant.');
        }

        $dialogClose.attr('href', cfgManager.getUrlOfSettings(closeSetting));
        $dialogClose.bind('click.htmlcc', function () {
            if (this.isLeasing(variant)) {
                financing.setProductId(closeSetting.viewstate.productId);
            }
            else if (this.isInsurance(variant)) {
                financing.selectedProduct(closeSetting.viewstate.insurance);
            }
        });

        var that = this;

        cfgManager.getMotorAsync(settings, function (motor) {
            financing.getProductsAsync(motor, function (productsData) {

                if (HtmlCc.Financial.Ui.Helper.hasError(productsData)) {
                    HtmlCc.Financial.Ui.Helper.appendErrorBox($dialogInner, productsData);
                    $dialog.removeClass("waiting");
                    return;
                }

                if (that.isLeasing(variant)) {
                    // set selected insurance id
                    if (productsData.Products != null && productsData.Products.Products != null && $.isArray(productsData.Products.Products)) {
                        $.each(productsData, function () {
                            var product = this;
                            if (product.ID == settings.viewstate.insurance) {
                                financing.setProductId(product.ID);
                            }
                        });
                    }
                }

                if (productsData == null
                    || productsData.Products == null
                    || productsData.Products.Products == null
                    || productsData.Products.Products.length == 0) {
                    $dialog.removeClass("waiting");
                    $tabArea.text('FinancingDialogFailedNoProduct'.resx());
                    return;
                }

                var products = [];
               
                $.each(productsData.Products.Products, function (i, product) {
                    if (that.isLeasing(variant)) {
                        if (product.Type == 'lease' || product.Type == 'credit' || product.Type == 'cash') {
                            products.push(product);
                        }
                    } else if (that.isInsurance(variant)) {
                        if (product.Type == 'insurance') {
                            products.push(product);
                        }
                    } else {
                        throw new Error('Unknown variant.');
                    }
                });

                if (products.length == 0) {
                    $dialog.removeClass("waiting");
                    $tabArea.text('FinancingDialogFailedNoProduct'.resx());
                    return;
                }

                var tabContainer = new HtmlCc.Financial.Ui.TabContainer($cc, $dialog, products, cfgManager, financing, motor, settings, variant);

            }, function () {
                $dialog.removeClass("waiting");
                $tabArea.text('FinancingDialogFailedGetProducts'.resx());
            });
        }, function () {
            $dialog.removeClass("waiting");
            $tabArea.text('FinancingDialogFailedMotor'.resx())
        });
    }

    this.isLeasing = function (variant) {
        return variant == 'financing';
    }

    this.isInsurance = function (variant) {
        return variant == 'insurance';
    }
}

HtmlCc.Financial.Ui.TabContainer = function ($cc, $dialogRoot, products, cfgManager, financing, motor, settings, variant) {
    var $_cc = $cc;
    var $_dialog = $dialogRoot;
    var _financing = financing;
    var _cfgManager = cfgManager;
    var _products = products;
    var _motor = motor;
    var _tabItems = [];
    var _settings = settings;
    var _variant = variant;
    var $tabHeaders = [];
    var $tabBodies = [];
    var $tabArea = null;
    var _currentTab = null;
    var _tabs = {};

    this.initContainer = function () {
        var $dialogInner = $dialogRoot.find('div.dialog-inner');
        $tabArea = $dialogInner.find("div.tabbed-area");
        $tabHeaders = $tabArea.find("div.tab-headers");
        
        var that = this;
        // pick the selected product
        $.each(products, function (i, product) {
            $tabHeaders.append('<a class="tab-header product-header-id-{0}"></a>'.format(product.ID));
            $tabHeader = $tabHeaders.find('a.product-header-id-{0}'.format(product.ID));
            $tabHeader.text(product.Label.Value);
            $tabHeader.bind(
                'click.htmlcc',
                function () {
                    that.activeTabItem(product.ID);
                });

            $tabArea.append('<div class="tab-body product-body-id-{0}">'.format(product.ID))
        });

        if (_settings.viewstate.productId !== undefined && _settings.viewstate.displayFinancingDialog === true) {
            this.activeTabItem(_settings.viewstate.productId);
        }
        else if (_settings.viewstate.insurance !== undefined && _settings.viewstate.displayInsuranceDialog === true) {
            this.activeTabItem(_settings.viewstate.insurance);
        }
        else {
            this.activeTabItem(this.getDefautProductId());
        }
    }

    this.getProductById = function (productId) {
        var product = null;
        $.each(products, function (i, item) {
            if (item.ID == productId) {
                product = item;
                return false;
            }
        });

        return product;
    }

    this.getDefautProductId = function () {
        var product = null;
        $.each(products, function (i, item) {
            if (item.Default == 'yes') {
                product = item;
                return false;
            }
        });

        if (product == null) {
            product = products[0];
        }

        return product.ID;
    }

    this.activeTabItem = function (productId) {
        var product = this.getProductById(productId);
        var $tabBodyContainer = $tabArea.find('div.product-body-id-{0}'.format(product.ID));
        var $tabHeader = $tabHeaders.find('a.product-header-id-{0}'.format(product.ID));
        var $productHelp = $tabArea.find('div.product-help');

        if (product.Description != null) {
            HtmlCc.Financial.Ui.Helper.showPopup(
                $_cc,
                $dialogRoot,
                $productHelp,
                product.Description,
                product.ImageUrl);
        }

        $tabHeaders.find('a').removeClass('active');
        $tabArea.find('div.tab-body').removeClass('active');

        $tabHeader.addClass('active');
        $tabBodyContainer.addClass('active');

        _financing.setProductId(productId);

        if (productId in _tabs) {
            _currentTab = _tabs[productId];
        }
        else {
            _currentTab = new HtmlCc.Financial.Ui.TabItem(this, $tabBodyContainer, product, _cfgManager, _financing, _motor, _settings, $_cc, $dialogRoot);
            _tabs[productId] = _currentTab;
        }
    }

    this.enableWaiting = function () {
        $dialogRoot.addClass('waiting');
    }

    this.disableWaiting = function () {
        $dialogRoot.removeClass('waiting');
    }

    this.getVariant = function () {
        return _variant;
    }

    this.initContainer();  
}

HtmlCc.Financial.Ui.TabItem = function (parent, $tabItemContainer, selectedProduct, cfgManager, financing, motor, settings, $cc, $dialogRoot) {
    var $_tabItemContainer = $tabItemContainer;
    var _selectedProduct = selectedProduct;
    var _financing = financing;
    var _isActive = false;
    var _motor = motor;
    var _parent = parent;
    var _settings = settings;
    var _cfgManager = cfgManager;
    var _lastScrollbarOffset = 0;
    
    this.getSelectedProduct = function () {
        return _selectedProduct;
    }

    this.RenderForm = function (financingParameters) {        
        var that = this;
        _parent.enableWaiting();

        var getParametersAsync = function (motor, successcallback, errorCallback) {
            if (financingParameters == null  && financingParameters == undefined ) {
                _financing.getSavedParamsAsync(motor, function (savedParams) {
                    var updatedParameters = _financing.applyCalculateRateParameters(_selectedProduct.ID, motor, savedParams)
                    successcallback(updatedParameters);
                }, errorCallback);
            }
            else {
                successcallback(financingParameters);
            }
        };

        getParametersAsync(motor, function (savedParams) {
            _financing.getDefaultsAsync(motor, _selectedProduct.ID, savedParams, function (defaultsData) {
                _parent.disableWaiting();

                // clear dialog
                $_tabItemContainer.html('');
                $_tabItemContainer.html('<div class="dialog-content"><form><div class="input-dialog"></div></form></div><div class="dialog-disclaimer-content"></div><div class="button-box"></div>');

                var $dialogDisclaimerContent = $_tabItemContainer.find('div.dialog-disclaimer-content');
                var $form = $_tabItemContainer.find('form');

                $form.submit(function () {
                    return false;
                });
                
                var $parametersContent = $_tabItemContainer.find('div.dialog-content');
                var $inputDialog = $parametersContent.find('div.input-dialog');

                // display an error if present
                if (defaultsData.Error != null && (defaultsData.Error.Source != null || defaultsData.Error.Code != null || defaultsData.Error.Description != null)) {
                    HtmlCc.Financial.Ui.Helper.appendErrorBox($inputDialog, defaultsData);
                }

                if (defaultsData.Parameters != null && $.isArray(defaultsData.Parameters)) {
                    $.each(defaultsData.Parameters, function () {
                        var dataParameter = this

                        if (dataParameter.Groups != null && $.isArray(dataParameter.Groups)) {
                            $.each(dataParameter.Groups, function () {
                                var groupData = this;

                                var groupId = HtmlCc.Libs.randomString(8);
                                $inputDialog.append('<fieldset id="{0}"><legend></legend></fieldset>'.format(groupId));

                                var $fieldset = $inputDialog.find('#' + groupId);
                                var $legend = $fieldset.find('legend');

                                if (groupData.Label != undefined && groupData.Label != null) {
                                    $legend.text(groupData.Label);
                                }

                                if (groupData.Disclaimer != null && groupData.Disclaimer != '') {
                                    $fieldset.append('<div class="group-disclaimer"></div>');
                                    var $groupDisclaimer = $fieldset.find('div.group-disclaimer');
                                    $groupDisclaimer.html(groupData.Disclaimer);
                                }

                                if (groupData.Parameters != null && $.isArray(groupData.Parameters)) {
                                    $.each(groupData.Parameters, function () {
                                        var groupParams = this;
                                        var groupParamId = HtmlCc.Libs.randomString(8);
                                        var inputId = HtmlCc.Libs.randomString(8);

                                        switch (groupParams.Control.Type) {
                                            case 'select':
                                                $fieldset.append('<div class="dialog-raw" id="{0}"><div class="raw-label"><label for="{1}"></label></div><div class="raw-input"><select id="{1}"></select></div><span class="unit"></span><div class="raw-info"></div><div class="terminator"></div></div>'.format(groupParamId, inputId));
                                                var $select = $fieldset.find('#' + inputId);
                                                var $unit = $fieldset.find('#' + groupParamId + ' span.unit');
                                                var $help = $fieldset.find('#' + groupParamId + ' div.raw-info');
                                                if (groupParams.Help != null && groupParams.Help != '') {
                                                    //$help.attr('title', groupParams.Help);
                                                    HtmlCc.Financial.Ui.Helper.showPopup(
                                                           $cc,
                                                           $dialogRoot,
                                                           $help,
                                                           groupParams.Help,
                                                           null);
                                                } else {
                                                    $help.remove();
                                                }

                                                $select.attr('data-relevant', groupParams.Relevant);
                                                $select.attr('name', groupParams.ID);

                                                if (groupParams.Data != null && $.isArray(groupParams.Data)) {
                                                    $.each(groupParams.Data, function () {
                                                        var selectOption = this;
                                                        var optionId = HtmlCc.Libs.randomString(8);
                                                        $select.append('<option id="{0}"></option>'.format(optionId));
                                                        var $option = $select.find('#' + optionId);
                                                        if (selectOption.FormattedValue != null) {
                                                            $option.text(selectOption.FormattedValue);
                                                        } else {
                                                            $option.text(selectOption.Value);
                                                        }
                                                        if (selectOption.TransferValue != null && selectOption.TransferValue != '') {
                                                            $option.attr('value', selectOption.TransferValue);
                                                        } else {
                                                            $option.attr('value', selectOption.Value);
                                                        }
                                                        if (selectOption.Default == 'yes') {
                                                            $option.attr('selected', 'selected');
                                                        }
                                                    });

                                                    // ugly hack for bad IE8 rendering mode  
                                                    $select.append('<option class="ie-8hack-item" value="test"></option>');
                                                    $select.find("option.ie-8hack-item").remove();

                                                    if (groupParams.Units.Symbol != null && groupParams.Units.Symbol != '') {
                                                        $unit.text(groupParams.Units.Symbol);
                                                        if (groupParams.Units.Value != null && groupParams.Units.Value != '') {
                                                            $unit.attr('title', groupParams.Units.Value);
                                                        }
                                                    } else if (groupParams.Units.Value != null && groupParams.Units.Value != '') {
                                                        $unit.text(groupParams.Units.Value);
                                                    } else {
                                                        $unit.text('');
                                                    }
                                                } else {
                                                    HtmlCc.Libs.Log.error('Select "{0}" has no options.'.format(groupParams.ID));
                                                }

                                                if (groupParams.Control.AutoPostback == 'yes') {
                                                    $select.bind('change.htmlcc', function () {
                                                        that.doPostback($form.find('div.dialog-raw.input-products select[name=productId]').val(), false);
                                                    });
                                                }
                                                if (groupParams.Control.Emphasize == 'yes') {
                                                    $unit.addClass('emphasize');
                                                }
                                                break;
                                            case 'edit':
                                                that.renderInputElement($fieldset, inputId, groupParamId, groupParams, "text", $cc, $dialogRoot);
                                                break;
                                            case 'hidden':
                                                that.renderInputElement($fieldset, inputId, groupParamId, groupParams, "hidden");
                                                break;
                                            case 'label':
                                                $fieldset.append('<div class="dialog-raw" id="{0}"><div class="raw-label"><label for="{1}"></label></div><div class="raw-input"><span class="label" id="{1}"></span></div><div class="raw-info"></div><span class="unit"></span><div class="terminator"></div></div>'.format(groupParamId, inputId));
                                                var $text = $fieldset.find('#' + inputId);
                                                var $unit = $fieldset.find('#' + groupParamId + ' span.unit');
                                                var $help = $fieldset.find('#' + groupParamId + ' div.raw-info');
                                                if (groupParams.Help != null && groupParams.Help != '') {
                                                    //$help.attr('title', groupParams.Help);
                                                    HtmlCc.Financial.Ui.Helper.showPopup(
                                                         $cc,
                                                         $dialogRoot,
                                                         $help,
                                                         groupParams.Help,
                                                         null);
                                                } else {
                                                    $help.remove();
                                                }
                                                $text.attr('data-id', groupParams.ID);
                                                if (groupParams.Data != null && $.isArray(groupParams.Data)) {
                                                    if (groupParams.Data.length == 1) {
                                                        var inputData = groupParams.Data[0];
                                                        if (inputData.FormattedValue != null) {
                                                            $text.text(inputData.FormattedValue);
                                                        } else {
                                                            $text.text(inputData.Value);
                                                        }
                                                        if (groupParams.Units.Symbol != null && groupParams.Units.Symbol != '') {
                                                            $unit.text(groupParams.Units.Symbol);
                                                            if (groupParams.Units.Value != null && groupParams.Units.Value != '') {
                                                                $unit.attr('title', groupParams.Units.Value);
                                                            }
                                                        } else if (groupParams.Units.Value != null && groupParams.Units.Value != '') {
                                                            $unit.text(groupParams.Units.Value);
                                                        } else {
                                                            $unit.text('');
                                                        }
                                                    } else {
                                                        HtmlCc.Libs.Log.error('No input value for "{0}" has {1} values. There must be just one!'.format(groupParams.ID, groupParams.Data.length));
                                                    }

                                                } else {
                                                    HtmlCc.Libs.Log.error('No input value for "{0}".'.format(groupParams.ID));
                                                }
                                                if (groupParams.Control.Emphasize == 'yes') {
                                                    $text.addClass('emphasize');
                                                    $unit.addClass('emphasize');
                                                }
                                                break;
                                        }

                                        var $label = $fieldset.find('#' + groupParamId + ' label');
                                        if (groupParams.Label != null && groupParams.Label != '') {
                                            $label.text(groupParams.Label);
                                            $label.attr('data-param-id', groupParams.ID);
                                        } else {
                                            $label.text(groupParams.ID);
                                        }
                                        if (groupParams.Note != null && groupParams.Note != '') {
                                            $label.append('<span class="note-text"></span>');
                                            $label.find('span.note-text').text('{0}'.format(groupParams.Note));
                                        }
                                        if (groupParams.Control.Emphasize == 'yes') {
                                            $label.addClass('emphasize');
                                        }
                                    });
                                } else {
                                    HtmlCc.Libs.Log.error('Get defaults doesn\'t contains any parameters in group.');
                                }

                            });
                        } else {
                            HtmlCc.Libs.Log.error('Get defaults doesn\'t contains any groups.');
                        }
                    });
                } else {
                    HtmlCc.Libs.Log.error('Get defaults doesn\'t contains any parameters.');
                }

                $_tabItemContainer.find('div.dialog-content').scrollTop(_lastScrollbarOffset);

                $dialogDisclaimerContent.html('');
                // display product disclaimer
                if (defaultsData.Result != null && defaultsData.Result.ProductDisclaimer) {
                    var productDisclaimerId = HtmlCc.Libs.randomString(8);
                    $dialogDisclaimerContent.append('<div id="{0}" class="product-disclaimer-box external-html"><div class="label"></div><div class="text"></div></div>'.format(productDisclaimerId));
                    var $productDisclaimerBox = $dialogDisclaimerContent.find('#' + productDisclaimerId);
                    $productDisclaimerBox.find('div.label').text('FinancingDialogProductDisclaimer'.resx());
                    $productDisclaimerBox.find('div.text').html(defaultsData.Result.ProductDisclaimer);
                }

                // display global disclaimer
                if (defaultsData.Result != null && defaultsData.Result.GlobalDisclaimer) {
                    var globalDisclaimerId = HtmlCc.Libs.randomString(8);
                    $dialogDisclaimerContent.append('<div id="{0}" class="global-disclaimer-box external-html"><div class="label"></div><div class="text"></div></div>'.format(globalDisclaimerId));
                    var $globalDisclaimerBox = $dialogDisclaimerContent.find('#' + globalDisclaimerId);
                    $globalDisclaimerBox.find('div.label').text('FinancingDialogGlobalDisclaimer'.resx());
                    $globalDisclaimerBox.find('div.text').html(defaultsData.Result.GlobalDisclaimer);
                }

                //buttons under dialog form
                var buttonRecountId = HtmlCc.Libs.randomString(8);
                var buttonResetId = HtmlCc.Libs.randomString(8);
                var buttonApplyId = HtmlCc.Libs.randomString(8);

                var $buttonBox = $_tabItemContainer.find('div.button-box');

                $buttonBox.html('<input type="button" id="{0}" class="skoda-grey-button arrow-left" /><input type="button" id="{1}" class="skoda-green-button arrow-right" /><input class="skoda-green-button arrow-right" type="button" id="{2}" />'.format(buttonResetId, buttonRecountId, buttonApplyId));
                var $resetButton = $buttonBox.find('#' + buttonResetId);
                var $recountButton = $buttonBox.find('#' + buttonRecountId);

                $recountButton.attr('value', 'FinancingDialogButtonRecount'.resx());
                $recountButton.bind('click.htmlcc', function () {
                    that.doPostback(that.getSelectedProduct().ID, false);
                });

                $resetButton.attr('value', 'FinancingDialogButtonReset'.resx());
                $resetButton.bind('click.htmlcc', function () {
                    var prodId = that.getSelectedProduct().ID;
                    _parent.enableWaiting();
                    financing.getDefaultParamsAsync(motor, prodId, function (defParams) {
                                financing.removeUserFinancingApply(_motor);
                                that.RenderForm(defParams);
                    }, function () {
                        _parent.disableWaiting();
                        $dialogContent.text('FinancingDialogFailedPostback'.resx());
                    });
                });

                // status bar with apply button           
                var $buttonApply = $buttonBox.find('#' + buttonApplyId);
                $buttonApply.attr('value', 'FinancingDialogButtonApply'.resx());
                $buttonApply.bind('click.htmlcc', function () {
                    // apply current settings
                    var newSettings = new HtmlCc.Workflow.SettingsType(_settings);

                    if (_parent.getVariant() == 'financing') {
                        newSettings.viewstate.displayFinancingDialog = false;
                        financing.addUserFinancingApply(_motor);
                        newSettings.viewstate.productId = _selectedProduct.ID;
                    } else if (_parent.getVariant() == 'insurance') {
                        newSettings.viewstate.displayInsuranceDialog = false;
                        newSettings.viewstate.insurance = _selectedProduct.ID;
                        newSettings.viewstate.insuranceDefaultsGuid = financing.getLastGetDefaultsTransactionId();
                        newSettings.viewstate.insuranceRateGuid = financing.getLastGetRateTransactionId();
                        financing.addUserFinancingApply(_motor);
                    } else {
                        throw new Error('Unknown variant.');
                    }
                    _parent.enableWaiting();

                    var objectValues = that.getFormParameters($_tabItemContainer.find('form'));

                    _financing.setSavedParamsAsync(motor, _selectedProduct.ID, objectValues, function () {
                        location.href = cfgManager.getUrlOfSettings(newSettings);

                    }, function () {
                        _parent.disableWaiting();
                        $dialogContent.text('FinancingDialogFailedPostback'.resx());
                    });

                    SkodaAuto.Event.publish(
                        "event.financingApplyClick",
                        new SkodaAuto.Event.Model.FinancingApplyClickEvntParams(
                                _cfgManager.getConfigurator().getInstanceName(),
                                _cfgManager.getConfigurator().getSalesProgramName(),
                                _cfgManager.getConfigurator().getCulture(),
                                _cfgManager.getConfigurator().getModelCode(),
                                _cfgManager.getConfigurator().getCarlineCode(),
                                _settings.view,
                                _selectedProduct.ID));
                });

                // recalculate disclaimer content
                var disclaimerAvailableHeight =
                    $_tabItemContainer.height() - $parametersContent.outerHeight() - $buttonBox.outerHeight() - $dialogDisclaimerContent.css("margin-top").replace("px", "");
                if (cfgManager.getConfigurator().getSalesProgramSetting("emphasizeStyle") != null){
                    $_tabItemContainer.find('.emphasize').each(function () {

                        $(this).attr('style', cfgManager.getConfigurator().getSalesProgramSetting("emphasizeStyle"));
                    });
                }
                $dialogDisclaimerContent.height(disclaimerAvailableHeight);

            }, function () {
                _parent.disableWaiting();
                $_tabItemContainer.text('FinancingDialogFailedDefaults'.resx());
            });
        }, function () {
            _parent.disableWaiting();
            $_tabItemContainer.text('FinancingDialogFailedSavedParams'.resx());
        });
    }

    this.renderInputElement = function ($elementContainer, inputId, groupParamId, groupParams, inputType) {
        var that = this;       
     
        if (inputType == 'hidden') {
            $elementContainer
                .append('<div class="dialog-raw" id="{0}"><div class="raw-input hidden"><input type="{2}" id="{1}"/></div><div class="terminator"></div></div>'.format(groupParamId, inputId, inputType));
        } else {
            $elementContainer
                .append('<div class="dialog-raw" id="{0}"><div class="raw-label"><label for="{1}"></label></div><div class="raw-input"><input type="{2}" id="{1}"/></div><span class="unit"></span><div class="raw-info"></div><div class="terminator"></div></div>'.format(groupParamId, inputId, inputType));
        }

        var $input = $elementContainer.find('#' + inputId);
        var $unit = $elementContainer.find('#' + groupParamId + ' span.unit');
        var $help = $elementContainer.find('#' + groupParamId + ' div.raw-info');
        if (inputType != 'hidden' && groupParams.Help != null && groupParams.Help != '') {
            //$help.attr('title', groupParams.Help);
            HtmlCc.Financial.Ui.Helper.showPopup(
                $cc,
                $dialogRoot,
                $help,
                groupParams.Help,
                null);
        } else {
            $help.remove();
        }

        $input.attr('name', groupParams.ID);
        $input.attr('data-relevant', groupParams.Relevant);

        if (groupParams.Data != null && $.isArray(groupParams.Data)) {
            var inputData = groupParams.Data[0];
            if (groupParams.Data.length == 1) {
                inputData = groupParams.Data[0];
            } else {
                $.each(groupParams.Data, function (i, item) {
                    if (item.Default == 'yes') {
                        inputData = item;
                        return true;
                    }
                });
            }
                      
            $input.val(inputData.FormattedValue);
            if (groupParams.Control.Datatype == 'decimal') {
                $input.attr('type', 'number');
            }
            if (groupParams.Units.Symbol != null && groupParams.Units.Symbol != '') {
                $unit.text(groupParams.Units.Symbol);
                if (groupParams.Units.Value != null && groupParams.Units.Value != '') {
                    $unit.attr('title', groupParams.Units.Value);
                }
            } else if (groupParams.Units.Value != null && groupParams.Units.Value != '') {
                $unit.text(groupParams.Units.Value);
            } else {
                $unit.text('');
            }
        } else {
            HtmlCc.Libs.Log.error('No input value for "{0}".'.format(groupParams.ID));
        }
        if (groupParams.Control.AutopPostback == 'yes') {
            $input.bind('change.htmlcc', function () {
                that.doPostback($form.find('div.dialog-raw.input-products select[name=productId]').val(), false);
            });
        }
        if (groupParams.Control.Emphasize == 'yes') {
            $unit.addClass('emphasize');
        }
    }

    this.doPostback = function (productId, useDefaultParams) {
        var that = this;
        _parent.enableWaiting();

        var objectValues = null;

        if (!useDefaultParams) {
            objectValues = this.getFormParameters();
        }

        _lastScrollbarOffset = $_tabItemContainer.find("div.dialog-content").scrollTop();

        that.RenderForm(objectValues);            
    };


    this.getFormParameters = function () {
        var $form = $_tabItemContainer.find('form');

        var rawValues = $form.serializeArray();
        var objectValues = {};

        $.each(rawValues, function () {
            var val = this;
            var $formElement = $form.find(':input[name={0}]'.format(val.name));
            var isRelevant = $formElement.data("relevant");

            //skip irelevant parameters
            if (isRelevant == 'no') {
                return true;
            }

            var param = new HtmlCc.Financial.DataParameterType();
            param.setValue(val.value);

            objectValues[val.name] = param;
        });

        return objectValues;
    }

    this.RenderForm();
}

/* Helpers methods */

HtmlCc.Financial.Ui.Helper = HtmlCc.Financial.Ui.Helper || {};

HtmlCc.Financial.Ui.Helper.hasError = function (sourceData) {
    return (sourceData.Error != null &&
        (sourceData.Error.Source != null || sourceData.Error.Code != null || sourceData.Error.Description != null));
}

HtmlCc.Financial.Ui.Helper.appendErrorBox = function ($targetElement, sourceData) {
    if (HtmlCc.Financial.Ui.Helper.hasError(sourceData)) {
        // just dataerror
        if (sourceData.Error.Class == 'dataerror') {
            var errorId = HtmlCc.Libs.randomString(8);
            $targetElement.append('<div id="{0}" class="error-box"><div class="error-description"></div></div>'.format(errorId));
            var $errorBox = $targetElement.find('#' + errorId);
            $errorBox.find('div.error-description').text('{0}: {1}'.format(sourceData.Error.Code, sourceData.Error.Description));
            //$errorBox.find('div.error-source').text('Source: ' + defaultsData.Error.Source);
            //$errorBox.find('div.error-class').text('Class: ' + defaultsData.Error.Class);
        } else {
            // not just dataerror
            var errorId = HtmlCc.Libs.randomString(8);
            $targetElement.append('<div id="{0}" class="error-box"><div class="error-description"></div><div class="error-source"></div><div class="error-class"></div></div>'.format(errorId));
            var $errorBox = $targetElement.find('#' + errorId);
            $errorBox.find('div.error-description').text('{0}'.format(sourceData.Error.Description));
            //$errorBox.find('div.error-source').text('Source: ' + sourceData.Error.Source);
            //$errorBox.find('div.error-class').text('Class: ' + sourceData.Error.Class);
        }
    }
}

HtmlCc.Financial.Ui.Helper.showPopup = function ($cc, $dialogContainer, $hoverItem, bodyText, imageUrl) {
    HtmlCc.Gui.Web.SetHoverBehavior(
        $cc,
        $hoverItem,
        function (positionX, positionY) {
            $dialogContainer.find('div.hover-box').remove();
            $dialogContainer.append('<div class="hover-box"></div>');
            var $hoverBox = $dialogContainer.find('div.hover-box');
            $hoverBox.css({ left: positionX, top: positionY });

            var reposition = function () {
                var overflow = $dialogContainer.outerHeight() - positionY - $hoverBox.outerHeight();
                if (overflow < 0) {
                    $hoverBox.css({ top: positionY + overflow - 20 });
                }
                overflow = $dialogContainer.outerWidth() - positionX - $hoverBox.outerWidth();
                if (overflow < 0) {
                    $hoverBox.css({ left: positionX + overflow - 20 });
                }
            };
       
            if (imageUrl != null && imageUrl != '') {
                $hoverBox.append('<img class="hover-image" />');
                $hoverImage = $hoverBox.find('img.hover-image');
                $hoverImage.bind('load.htmlcc', function () {
                    reposition();
                });
                $hoverImage.attr('src', imageUrl);
                //$hoverImage.attr('alt', 'Image: {0}'.format(headerText));
            }

            // append text - if exists
            var $hoverText = null;
            if (bodyText != null && bodyText != '') {
                $hoverBox.append('<div class="hover-text external-html"></div>');
                $hoverText = $hoverBox.find('div.hover-text');
                $hoverText.html(bodyText);
            }

            reposition();
            return $hoverBox;
        });
}