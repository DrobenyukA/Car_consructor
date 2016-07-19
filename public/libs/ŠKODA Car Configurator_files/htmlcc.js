/// <reference path="../jquery-1.7.2.js" /> 
/// <reference path="../jquery.validate.js" /> 
/// <reference path="../jquery.ajax-cross-origin.min.js" /> 
/// <reference path="../hammer/hammer.js"/>
/// <reference path="../hammer/jquery.hammer.js"/>
/// <reference path="strings.libs.js" /> 
/// <reference path="htmlcc.libs.js" /> 
/// <reference path="htmlcc.api.js" />
/// <reference path="htmlcc.workflow.js" /> 
/// <reference path="htmlcc.financial.js" />
/// <reference path="htmlcc.garage.js" />
/// <reference path="htmlcc.vred.js"/>
/// <reference path="htmlcc.dlrccappclient.js"/>
/// <reference path="htmlcc.videoutils.js"/>
/*
 *  HTML Car Configurator.
 *
 *  Frontend of Html Car Configurator.
 *
 *  Requires: 
 *       * jquery-1.7.2.js
 *       * jgestures.js
 *       * htmlcc.lib.js
 *       * htmlcc.api.js
 *       * htmlcc.workflow.jsexteriorViewPoints-switch
 *       * htmlcc.financial.js
 *       * properly set base url at header of web page
 *
 *  Author: jobratil @ Trask solutions a.s.
 *  © ŠKODA AUTO a.s. 2012
 */

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
    if (localUrl != null && location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0) {
        return '/dealer{0}'.format(localUrl);
    }
    else {
        return localUrl;
    }
    }

var _gaq = _gaq || [];
(function ($) {
    // car configurator gui plugin
    $.fn.htmlcc = function (options) {
        // Create some defaults, extending them with any options that were provided
        var settings = $.extend({
            'prefix': 'cc-',       /* prefix of params in url */
            'instance': null,      /* mandatory */
            'salesprogram': null,  /* mandatory */
            'culture': null,      /* mandatory */
            'model': null,         /* mandatory */
            'carline': null,       /* mandatory */
            'color': null,         /* optional, default is known */
            'interior': null,      /* optional, default is known */
            'equipment': null,     /* optional, default is known from model */
            'motor': null,         /* optional, default is known from equipment */
            'packages': [],        /* default [], array of string of additional extra equipment */
            'view': 'step1',       /* 'step1'|'step2'|'step3'|'step4'|'step5' */
            'versionUrl': '/VersionA',
            'configureUrl': '/ConfigureA',
            'sessionGuid': HtmlCc.Libs.generateGuid(),
        }, options);

        return this.each(function () {
            var $thisCC = $(this);

            String.resourceCulture = settings.culture;

            HtmlCc.Libs.Log.log('Car configurator is starting.');

            var configurationManager = new HtmlCc.Workflow.ConfigurationStepManagerType(settings);

            // init vred & dlrCcApp
            if (HtmlCc.Vred && typeof HtmlCc.Vred.init === 'function' && $thisCC.hasClass('dealer')) {

                HtmlCc.Vred.init($thisCC, function () { });

                // switch model
                configurationManager.getConfigurator().setIsLoadingVredModel(true);

                //configurationManager.getDealerSettings(
                //    // success
                //    function (data) {
                //        if (data === null) {
                //            //TODO add alert and logging
                //            return;
                //        }

                //        var dlrccAppLocalIp = data["DlrCCAppIp"];
                //        var vredLocalIp = data["VredLocalIp"];
                //        var tvLocalIp = data["TvLocalIp"];

                //        HtmlCc.Dashboard.init(dlrccAppLocalIp, HtmlCc.Dashboard.getPort());

                //        HtmlCc.Gui.Web.SetUpIpSettings(
                //            $thisCC,
                //            vredLocalIp,
                //            HtmlCc.Vred.getPort(),
                //            dlrccAppLocalIp,
                //            HtmlCc.Dashboard.getPort(),
                //            tvLocalIp,
                //            HtmlCc.Dashboard.TV.getTVPort());

                //    },
                //    // error
                //    function () {
                //        //TODO add alert and logging
                //    }
                //);
                    }

            // setting the resource culture

            configurationManager.resetSteps(function (step, totalSteps, message, messageKey) {
                $thisCC.html(
                    '<div class="splashscreen">' +
                        '<div class="splashcenter">' +
                            '<div class="splashconfigurator">' +
                                'SplashScreenCarConfigurator'.resx() +
                            '</div>' +
                            '<div class="splashcustomize">' +
                                'SplashScreenCustomizeSkoda'.resx() +
                            '</div>' +
                        '</div>' +
                        '<div class="splashwatch">' +
                            '<div class="splashwatchint">' +
                                '<div class="splashwatchtext">' +
                                    'SplashScreenStep'.resx().format(step, totalSteps) +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>');

                HtmlCc.Libs.Log.log('This is step {0} of total {1} steps.'.format(step, totalSteps));
            },
            function () {
                //final success
                var entranceSettings = $.extend(settings, configurationManager.getSettingsFromUrl(settings.prefix));
                var sanitizedEntranceSettings = configurationManager.sanitizeSettings(entranceSettings);

                // remove previous session conflict solutions
                sanitizedEntranceSettings.removeConflictSolutions();
                // to notify change during long living and/or multiple requests at once
                var changeHash = '';

                // prepapre saved configuration
                if (sanitizedEntranceSettings.configurationId != null && sanitizedEntranceSettings.configurationId > 0) {
                    configurationManager.prepareSaveConfiguration(sanitizedEntranceSettings.configurationId, "undefined");
                }

                // bind change of configuration based on params change
                $(window).bind('hashchange.htmlcc', function () {
                    HtmlCc.Libs.Log.log('configuration params change detected');

                    $thisCC.addClass('configuring');

                    var currentStep = configurationManager.getCurrentStepName();
                    var newSettings = configurationManager.sanitizeSettings(configurationManager.getSettingsFromUrl(settings.prefix));
                    var nextStep = newSettings.view;
                    // prepapare a saved configuration if configuration Id is present
                    if (!configurationManager.isInitWithConfigurationId() && newSettings.configurationId != null && newSettings.configurationId > 0) {
                        configurationManager.prepareSaveConfiguration(
                            newSettings.configurationId,
                            "undefined",
                            function () {
                                return configurationManager.getCurrentConfigurationKeyFromSettings(newSettings, "undefined")
                            });
                    }


                    var configurator = configurationManager.getConfigurator();

                    // set current settings
                    configurationManager.setSettings(newSettings);

                    // fills the template
                    var params = configurationManager.getParamsByStepName('step1');
                    var currentMotor = null;
                    var motorId = params.motorId;

                    if (motorId > 0) {
                        // fill with simple motor
                        currentMotor = configurator.getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
                    }
                    if (currentMotor == null || (newSettings.view != 'step1')) {
                        currentMotor = configurator.getConfiguredMotor();
                    }

                    var wheelCode = currentMotor.getSelectedWheel() != null ? currentMotor.getSelectedWheel().getCode() : null;

                    var configurationHash =
                       "{0}_{1}_{2}_{3}_{4}".format(
                           currentMotor.getEquipment().getCode(),
                           currentMotor.getCode(),
                           currentMotor.getSelectedInterior().getCode(),
                           currentMotor.getSelectedColor().getCode(),
                           newSettings.packages
                           );

                    if (configurationHash != newSettings.viewstate.lastConfigurationHash) {
                        SkodaAuto.Event.publish(
                                   "event.configure",
                                   new SkodaAuto.Event.Model.ConfigureEvntParams(
                                        settings.instance,      // instanceName
                                        settings.salesprogram,  // salesProgramName
                                        settings.culture,       // culture
                                        settings.model,         // modelCode
                                        settings.carline,       // carlineCode
                                        newSettings.view,       // step
                                        configurator,           // configurator
                                        newSettings.packages,    // packages
                                        currentMotor            //currentMotor - in step 1 configurator.getConfiguredMotor() doesn´t refresh
                            ));
                        newSettings.viewstate.lastConfigurationHash = configurationHash;
                    }

                    var newParams = configurationManager.getParamsByStepName(newSettings.view);

                    var getMotorAtFirstSteps = function (localSettings, clbk) {
                        var motorId = null;
                        var equipmentId = null;
                        var model = configurationManager.getConfigurator().getConfiguredMotor().getEquipment().getModel();
                        if (localSettings.motor != null && localSettings.motor != '' && parseInt(localSettings.motor) != NaN) {
                            // i have motor id
                            motorId = parseInt(localSettings.motor);
                        } else if (localSettings.equipment != null && localSettings.equipment != '' && parseInt(localSettings.equipment) != NaN) {
                            // i have equipment id
                            equipmentId = parseInt(localSettings.equipment);
                            var tmpEq = model.getEquipment(equipmentId);
                            if (tmpEq != null) {
                                tmpEq.getDefaultMotorId();
                            } else {
                                tmpEq = model.getEquipment(model.getDefaultEquipmentId());
                            }
                            motorId = tmpEq.getDefaultMotorId();
                        } else {
                            // default
                            motorId = model.getEquipment(model.getDefaultEquipmentId()).getDefaultMotorId();
                        }

                        configurationManager.getConfigurator().prefetchMotor(new HtmlCc.Api.Configurator.ConfigurationParams(motorId, localSettings.color, localSettings.interior, localSettings.packages),
                            function (motor) {
                                clbk(motor);
                            }, function () {
                                HtmlCc.Libs.Log.error('Motor cannot be fetched. Sorry.');
                            }, 'simple');
                    };

                    // decide whether everything is prepaired just now or it is about to fetch needed data first
                    switch (nextStep) {
                        case 'step1':
                        case 'step2':
                            var makeStep = function (stepSettings, deep) {
                                var initDeep = 10;
                                deep = (deep === undefined) ? initDeep : deep;
                                if (deep == 0) {
                                    return;
                                }
                                getMotorAtFirstSteps(stepSettings, function (motor) {
                                    if (motor.getConflicts().getAdd().length > 0 || motor.getConflicts().getRemove().length > 0) {
                                        var resolved = false;
                                        var resolvedSettings = null;
                                        //if (stepSettings.viewstate.conflictSolutions == null || !$.isArray(stepSettings.viewstate.conflictSolutions)) {
                                        //    stepSettings.viewstate.conflictSolutions = [];
                                        //}

                                        var conflictSolutions = stepSettings.getConflictSolutions();

                                        for (var i = 0; i < conflictSolutions.length; i++) {
                                            var conflictSolution = conflictSolutions[i];
                                            if (HtmlCc.Workflow.ConflictSolutionTools.doMatch(motor, conflictSolution)) {
                                                HtmlCc.Libs.Log.log('Configurator is automaticaly solving conflict (step1 or 2). Items to add "{0}"; items to remove "{1}"; solution "{2}"; subject "{3}".'.format(conflictSolution.addCodes, conflictSolution.removeCodes, conflictSolution.solutionType, conflictSolution.solutionSubject));
                                                resolvedSettings = HtmlCc.Workflow.ConflictSolutionTools.applySolution(stepSettings, conflictSolution);
                                                resolved = true;

                                                break;
                                            }
                                        }

                                        if (resolved === true) {
                                            makeStep(resolvedSettings, deep - 1);
                                            var isClear = cfgManager.isClearNextSteps(settings.view);
                                            
                                            if (isClear) {
                                                SkodaAuto.Event.publish(
                                                "gtm.confClearedByApp",
                                                new SkodaAuto.Event.Model.GTMEventParams(
                                                   "LifeCC Configuration",
                                                   newSettings.view,
                                                   "Configuration Cleared by App",
                                                   {
                                                       context: configurationManager.getConfigurator().getCCContext(),
                                                       model: configurationManager.getConfigurator().getModelCodeShort(),
                                                       modelBody: configurationManager.getConfigurator().getModelCode(),
                                                       carlineCode: configurationManager.getConfigurator().getCarlineCode(),
                                                       configurationId: stepSettings.configurationId,
                                                       price: motor.getPriceString(),
                                                       //equipment: motor.getEquipment().getCode(),
                                                       extraEq: settings.packages
                                                   }));
                                            }
                                            configurationManager.clearNextSteps(stepSettings.view);

                                        }
                                            // autoresolve pokud je jen jedna polozka k pridani
                                        else if (HtmlCc.Gui.Web.CanAutoResolveConflict(motor)) {
                                            resolvedSettings = new HtmlCc.Workflow.SettingsType(stepSettings);
                                            location.href = HtmlCc.Gui.Web.AutoResolveConflict(configurationManager, resolvedSettings, motor);
                                        }
                                        else {

                                            // change location also
                                            if (initDeep != deep) {
                                                location.href = configurationManager.getUrlOfSettings(stepSettings);
                                            }
                                            else {
                                                HtmlCc.Gui.Web.Configurator($thisCC, configurationManager, stepSettings);
                                                HtmlCc.Gui.Web.PrecacheData($thisCC, configurationManager, stepSettings);
                                                $thisCC.removeClass('configuring');
                                            }
                                        }
                                    } else {
                                        // change location also
                                        if (initDeep != deep) {
                                            location.href = configurationManager.getUrlOfSettings(stepSettings);
                                        } else {
                                            HtmlCc.Gui.Web.Configurator($thisCC, configurationManager, stepSettings);
                                            HtmlCc.Gui.Web.PrecacheData($thisCC, configurationManager, stepSettings);
                                            $thisCC.removeClass('configuring');
                                        }
                                        configurationManager.setLastNonConflictState(stepSettings);
                                    }
                                });
                            };
                            makeStep(newSettings);

                            break;
                        case 'step3':
                        case 'step4':
                        case 'step5':
                        case 'step6':
                        case 'step7':
                            var makeStep = function (stepSettings, deep) {
                                var initDeep = 10;
                                deep = (deep === undefined) ? initDeep : deep;
                                if (deep == 0) {
                                    stepSettings.removeConflictSolutions();
                                        location.href = configurationManager.getUrlOfSettings(stepSettings);
                                    return;
                                }
                                configurationManager.configure(stepSettings, function () {
                                    var currentMotor = configurationManager.getConfigurator().getConfiguredMotor();
                                    if (currentMotor.getConflicts().getAdd().length > 0 || currentMotor.getConflicts().getRemove().length > 0) {
                                        var resolved = false;
                                        var resolvedSettings = null;
                                        //if (stepSettings.viewstate.conflictSolutions == null || !$.isArray(stepSettings.viewstate.conflictSolutions)) {
                                        //    stepSettings.viewstate.conflictSolutions = [];
                                        //}
                                        if (stepSettings.view != "step5" && stepSettings.view != "step6") {
                                        var conflictSolutions = stepSettings.getConflictSolutions();

                                        for (var i = 0; i < conflictSolutions.length; i++) {
                                            var conflictSolution = conflictSolutions[i];
                                            if (HtmlCc.Workflow.ConflictSolutionTools.doMatch(currentMotor, conflictSolution)) {
                                                HtmlCc.Libs.Log.log('Configurator is automaticaly solving conflict. Items to add "{0}"; items to remove "{1}"; solution "{2}"; subject "{3}".'.format(conflictSolution.addCodes, conflictSolution.removeCodes, conflictSolution.solutionType, conflictSolution.solutionSubject));
                                                resolvedSettings = HtmlCc.Workflow.ConflictSolutionTools.applySolution(stepSettings, conflictSolution);
                                                resolved = true;
                                                break;
                                            }
                                        }
                                        }

                                        if (resolved === true) {
                                            makeStep(resolvedSettings, deep - 1);
                                        }
                                            // autoresolve pokud je jen jedna polozka k pridani
                                        else if (HtmlCc.Gui.Web.CanAutoResolveConflict(currentMotor)) {
                                            resolvedSettings = new HtmlCc.Workflow.SettingsType(stepSettings);
                                            location.href = HtmlCc.Gui.Web.AutoResolveConflict(configurationManager, resolvedSettings, currentMotor);
                                        }
                                        else {
                                            $thisCC.removeClass('configuring');
                                            HtmlCc.Gui.Web.Configurator($thisCC, configurationManager, stepSettings);
                                            HtmlCc.Gui.Web.PrecacheData($thisCC, configurationManager, stepSettings);

                                            // change location also
                                            if (initDeep != deep) {
                                                location.href = configurationManager.getUrlOfSettings(stepSettings);
                                            }
                                        }
                                    } else {
                                        $thisCC.removeClass('configuring');
                                        HtmlCc.Gui.Web.Configurator($thisCC, configurationManager, stepSettings);
                                        HtmlCc.Gui.Web.PrecacheData($thisCC, configurationManager, stepSettings);

                                        // change location also
                                        if (initDeep != deep) {
                                            location.href = configurationManager.getUrlOfSettings(stepSettings);
                                        }

                                        configurationManager.setLastNonConflictState(stepSettings);
                                    }
                                }, function () {
                                    HtmlCc.Libs.Log.warn('configuration failed due some reason.');
                                });
                            };
                            makeStep(newSettings);
                            break;
                    }
                }

                );

                // register shift L for showing query strings
                $(document).keyup(function (event) {
                    if (event.which == 76 && event.shiftKey == true && $thisCC.find('.garage').length == 0 && $thisCC.find('.dialog.load-configuration').length == 0) {
                        HtmlCc.Gui.Web.ShowQueryStrings($thisCC, configurationManager);
                    }
                });

                // autoresolve pokud je jen jedna polozka k pridani
                if (HtmlCc.Gui.Web.CanAutoResolveConflict(configurationManager.getConfigurator().getConfiguredMotor())) {

                    var resolvedSettings = new HtmlCc.Workflow.SettingsType(sanitizedEntranceSettings);
                    location.href = HtmlCc.Gui.Web.AutoResolveConflict(configurationManager, resolvedSettings, configurationManager.getConfigurator().getConfiguredMotor());
                }
                else {
                    // display configurator
                    HtmlCc.Gui.Web.Configurator($thisCC, configurationManager, sanitizedEntranceSettings);
                    HtmlCc.Gui.Web.PrecacheData($thisCC, configurationManager, sanitizedEntranceSettings);

                    // fills the template
                    var params = configurationManager.getParamsByStepName('step1');
                    var currentMotor = null;
                    var configurator = configurationManager.getConfigurator();
                    var motorId = params.motorId;

                    if (motorId > 0) {
                        // fill with simple motor
                        currentMotor = configurator.getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
                    }
                    if (currentMotor == null || (settings.view != 'step1')) {
                        currentMotor = configurator.getConfiguredMotor();
                    }

                    var wheelCode = currentMotor.getSelectedWheel() != null ? currentMotor.getSelectedWheel().getCode() : null;
                    var color = settings.color != null ? settings.color : currentMotor.getDefaultColor().getCode();
                    var interior = settings.interior != null ? settings.interior : currentMotor.getDefaultInterior().getCode();

                    SkodaAuto.Event.publish(
                       "gtm.ccLoaded",
                       new SkodaAuto.Event.Model.GTMEventParams(
                          "pageview",
                          null,
                          null,
                          {
                              instanceName: settings.instance,
                              salesProgramName: settings.salesprogram,
                              culture: settings.culture,
                              groupName: configurationManager.getConfigurator().getPageGroupName(),
                              pageName: $(document).find("title").text(),
                              context: configurationManager.getConfigurator().getCCContext(),
                              model: configurationManager.getConfigurator().getModelCodeShort(),
                              modelBody: configurationManager.getConfigurator().getModelCode(),
                              carlineCode: configurationManager.getConfigurator().getCarlineCode(),
                              price: currentMotor.getPriceString(),
                              equipment: currentMotor.getEquipment().getCode(),
                              engine: currentMotor.getId(),
                              //gear: cfgManager.getConfigurator().getConfiguredMotor().getGearboxLabel(),
                              mbv: currentMotor.getMbvKey(),
                              color: color,
                              exterior: wheelCode,
                              interior: interior,
                              extraEq: settings.packages
                          }
                     ));
                    new HtmlCc.Gui.Web.EntryDialog($thisCC, $thisCC.find('div.cc-root'), configurationManager, sanitizedEntranceSettings);

                }
                // set the right location at skoda logo link
                $('div.header div.skoda-logo a.skoda-logo-href').attr('href', configurationManager.getConfigurator().getHomepageUrl());

                HtmlCc.Gui.Web.ValidatorCulturalize();

            },
            function () {
                // fail
                $thisCC.html('LoadingFailed'.resx());
            });
        }); // each end

    };

})(jQuery);

HtmlCc.Gui.Web.CanAutoResolveConflict = function (motor) {

    if (motor.getConflicts().getAdd().length === 1) {
        if (motor.getConflicts().getRemove().length === 0) {
            if (motor.getConflicts().getInteriorConflict() === false) {
                if (motor.getConflicts().getExteriorConflict() === false) {
                    return true;
                }
            }
        }
    }
    return false;
}

HtmlCc.Gui.Web.DlrCcAppErrorAlert = function (msg) {
    alert(msg);
};

HtmlCc.Gui.Web.AutoResolveConflict = function (configurationManager, settings, motor) {

    if (motor.getConflicts().getAdd().length == 1 && motor.getConflicts().getRemove().length == 0) {

        if (!('packageItem' in settings.viewstate)) {
            settings.viewstate.packageItem = true;
        }

        var conflicts = motor.getConflicts().getAdd();
        var codeToAdd = motor.getConflicts().getAdd()[0].getCode();

        settings.addPackage(codeToAdd);
        settings.addConflictSolution(
            new HtmlCc.Workflow.ConflictSolutionType(motor, 'add', codeToAdd));

        //configurationManager.clearNextSteps(settings.view);
    }

    return configurationManager.getUrlOfSettings(settings);
};

HtmlCc.Gui.Web.ValidatorCulturalize = function () {

    jQuery.extend(jQuery.validator.messages, {
        required: "JQueryValidationMessageRequired".resx(),
        remote: "JQueryValidationMessageRemote".resx(),
        email: "JQueryValidationMessageEmail".resx(),
        url: "JQueryValidationMessageUrl".resx(),
        date: "JQueryValidationMessageDate".resx(),
        dateISO: "JQueryValidationMessageDateIso".resx(),
        number: "JQueryValidationMessageNumber".resx(),
        digits: "JQueryValidationMessageDigits".resx(),
        creditcard: "JQueryValidationMessageCreditCard".resx(),
        equalTo: "JQueryValidationMessageEqualTo".resx(),
        accept: "JQueryValidationMessageAccept".resx(),
        maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
        minlength: jQuery.validator.format("Please enter at least {0} characters."),
        rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
        range: jQuery.validator.format("Please enter a value between {0} and {1}."),
        max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
        min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
    });

};

// displays configurator
HtmlCc.Gui.Web.Configurator = function ($cc, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    // the root of everything
    var $ccRoot = $cc.find('div.cc-root');
    var isConfiguratorLoaded = true;
    if ($ccRoot.length == 0) {
        isConfiguratorLoaded = false
        $cc.html('<div class="cc-root web-size"></div>');
        $ccRoot = $cc.find('div.cc-root');
        $ccRoot.attr('data-unique', HtmlCc.Libs.randomString(8));
    }

    $ccRoot.removeClass('view-step1');
    $ccRoot.removeClass('view-step2');
    $ccRoot.removeClass('view-step3');
    $ccRoot.removeClass('view-step4');
    $ccRoot.removeClass('view-step5');
    $ccRoot.removeClass('view-step6');
    $ccRoot.removeClass('view-step7');

    switch (settings.view) {
        case 'step1':
        case 'step2':
        case 'step3':
        case 'step4':
        case 'step5':
        case 'step6':
        case 'step7':
            $ccRoot.addClass('view-' + settings.view);
            break;
        default:
            HtmlCc.Libs.Log.warn('Unrecognized view name {0}.'.format(settings.view));
    }
    var itemClicked = settings.viewstate.itemClicked;

    settings.viewstate.itemClicked = undefined;
    cfgManager.setSettings(settings);
   
    
    HtmlCc.Gui.Web.ConfigurationBox($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.PresentationBox($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.CiTopBox($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.BottomBox($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.NewConflictBox($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.FinancingBox($cc, $ccRoot, cfgManager, settings, 'financing');
    HtmlCc.Gui.Web.FinancingBox($cc, $ccRoot, cfgManager, settings, 'insurance');
    //if ($cc.hasClass('dealer')) {        
    //    try {
    //        if (cfgManager.getConfigurator().getSalesProgramSetting("DlrccDefaultLogoutTime") == null) {
    //            HtmlCc.Dealer.startLoginChecker(settings,$cc, 5, 0);
    //        }
    //        else{
    //            var d  = cfgManager.getConfigurator().getSalesProgramSetting("DlrccDefaultLogoutTime").split(":");
    //            HtmlCc.Dealer.startLoginChecker(settings,$cc, d[0], d[1]);
    //        }
    //    }
    //    catch (ex) {
    //        //automatic logout not used
    //    }
    //}   

    HtmlCc.Gui.Web.CopyrightNoteContent($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.StandardEquipmentList($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.TechnicalDataList($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.ServiceCareDialog($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.MultiplicityDialog($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.ConfigurationFinishSlider($cc, $ccRoot, cfgManager, settings);

    var starTime = new Date().getTime();

    HtmlCc.Gui.Web.DisplayCarStorage($cc, $ccRoot, cfgManager, settings);

    var endTime = new Date().getTime();

    HtmlCc.Libs.Log.log("DisplayCarStorage took {0} ms".format(endTime - starTime));

    HtmlCc.Gui.Web.SendEmailBox($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.FacebookBox($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.ConfiguringOverlay($cc, $ccRoot, cfgManager, settings);

    HtmlCc.Gui.Web.RecommendedPopupWindow($cc, $ccRoot, cfgManager, settings);
    HtmlCc.Gui.Web.AccessoriesPopupWindow($cc, $ccRoot, cfgManager, settings);

    if (cfgManager.getConfigurator().isLoadingVredModel())
        HtmlCc.Gui.Web.SwitchVredModel($cc, cfgManager, settings);
    else
        HtmlCc.Gui.Web.CommunicateWithVred($cc, $ccRoot, cfgManager, settings);
    // new tablet design to show old tablet design - comment following line

    HtmlCc.Gui.Web.initNewTabletDesign($cc, $ccRoot, cfgManager, settings);

    if (!isConfiguratorLoaded) {
        //if (settings.view == "step1"){
        SkodaAuto.Event.publish(
                        "gtm.confStarted",
                        new SkodaAuto.Event.Model.GTMEventParams(
                           "LifeCC Configuration",
                           settings.view,
                           "Configuration Started",
                           {
                               context: cfgManager.getConfigurator().getCCContext(),
                               model: cfgManager.getConfigurator().getModelCodeShort(),
                               modelBody: cfgManager.getConfigurator().getModelCode(),
                               carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                   configurationStarted: 1,
                                   price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                           }
                      ));
        //}
        SkodaAuto.Event.publish(
                                     "event.configuratorLoaded",
                                      new SkodaAuto.Event.Model.ConfigureEvntParams(
                                           settings.instance,      // instanceName
                                           settings.salesprogram,  // salesProgramName
                                           settings.culture,       // culture
                                           settings.model,         // modelCode
                                           settings.carline,       // carlineCode
                                           settings.view,       // step
                                           cfgManager.getConfigurator(),           // configurator
                                           settings.packages,    // packages
                                           cfgManager.getConfigurator().getConfiguredMotor()            //currentMotor - in step 1 configurator.getConfiguredMotor() doesn´t refresh
        ));
    }
    else {
        if (itemClicked != null) {


            //var params = cfgManager.getParamsByStepName('step1');
            //var currentMotor = null;
            //var motorId = params.motorId;

            //if (motorId > 0) {
            //    // fill with simple motor
            //    currentMotor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
            //}
            //if (currentMotor == null || (settings.view != 'step1')) {
            //    currentMotor = cfgManager.getConfigurator().getConfiguredMotor();
            //}


            var itemClickedId = itemClicked.id;
            var itemPrice = itemClicked.price;

            var isItemClicked = true;
            var motorCode = null;
            var equipmentCode = null;
            var exterior = null;
            var interior = null;
            var extra = null;

            switch (itemClicked.type) {
                case 'equipment':
                    equipmentCode = itemClickedId;
                    break;
                case 'motor':
                    motorCode = itemClickedId;
                    break;
                case 'wheel':
                    var exterior = itemClickedId;
                    break;
                case 'color':
                    var color = itemClickedId;
                    break;
                case 'interior':
                    interior = itemClickedId;
                    break;
                case 'extra':
                    extra = itemClickedId;
                    break;
                default:
                    isItemClicked = false
            }
        }

        if (isItemClicked) {
            SkodaAuto.Event.publish(
                       "gtm.itemClicked",
                       new SkodaAuto.Event.Model.GTMEventParams(
                          "LifeCC Configuration",
                          settings.view,
                          "Item Clicked: " + itemClickedId,
                          {
                              context: cfgManager.getConfigurator().getCCContext(),
                              model: cfgManager.getConfigurator().getModelCodeShort(),
                              modelBody: cfgManager.getConfigurator().getModelCode(),
                              carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                              configurationId: settings.configurationId,
                              price: $cc.find('.entire-car-complete').text(),
                              engine: motorCode,
                              equipment: equipmentCode,
                              itemPrice: itemPrice,
                              extra: extra,
                              interior: interior,
                              color: color,
                              exterior: exterior
                          }));
        }
        
    }


};

HtmlCc.Gui.Web.ConfiguringOverlay = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var $configuringLayer = $ccRoot.find('div.configuring-layer:first');
    if ($configuringLayer.length == 0) {
        $ccRoot.append('<div class="configuring-layer"></div>');
    }
};

HtmlCc.Gui.Web.IsVredAvailable = function ($cc) {
    if (HtmlCc.Vred && typeof HtmlCc.Vred.init === 'function') {
        if ($cc.hasClass('local-vred') && HtmlCc.Vred.getIsInitialized()) {
            return true;
        } else {
            if ($cc.hasClass('dealer')) {
                HtmlCc.Vred.init($cc, function () { });
            }
            return $cc.hasClass('local-vred') && HtmlCc.Vred.getIsInitialized();
        }
    }
    else {
        return false;
    }

    return HtmlCc.Vred && typeof HtmlCc.Vred.init === 'function' && $cc.hasClass('local-vred') && HtmlCc.Vred.getIsInitialized() == true;
};

HtmlCc.Gui.Web.CommunicateWithVred = function ($cc, $ccRoot, cfgManager, settings, callback) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    if (!HtmlCc.Gui.Web.IsVredAvailable($cc)) {
        return;
    }

    var sendQueryStringToVred = function (selectedMotor) {
        var queryString = selectedMotor.getQueryString();
        if (queryString != null) {
            if (HtmlCc.Dashboard) {
                HtmlCc.Dashboard.selectVariantSets(cfgManager.getConfigurator().getModelCode(), queryString, cfgManager.getConfigurator().getSalesProgramSetting('renderDealerFleet') == 'true');
                }
            }
        else {
            HtmlCc.Libs.Log.warn('-- vred - Query string is null.');
            if (callback) {
                callback();
            }
        }
    };

    var params = cfgManager.getParamsByStepName('step1');
    var currentMotor = null;
    var motorId = params.motorId;

    if (motorId > 0) {
        // fill with simple motor
        currentMotor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
    }
    if (currentMotor == null || (settings.view != 'step1')) {
        currentMotor = cfgManager.getConfigurator().getConfiguredMotor();
    }

    sendQueryStringToVred(currentMotor);
};

HtmlCc.Gui.Web.BottomBox = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var $bottomBox = $ccRoot.find('div.bottom-switch-box');
    if ($bottomBox.length == 0) {
        $ccRoot.append('<div class="bottom-switch-box"></div>');
        $bottomBox = $ccRoot.find('div.bottom-switch-box');
    }
};

HtmlCc.Gui.Web.Init3DTVInternal = function ($cc) {
    if (HtmlCc.Dashboard.TV.withoutTV()) {
        return;
    }

    HtmlCc.Dashboard.TV.power(HtmlCc.Dashboard.TV.powerEnum.On, function (result) {
        if (result == 'error') {
            HtmlCc.Gui.Web.DlrCcAppErrorAlert("Switching TV power on failed.");
            return;
        }

        HtmlCc.Dashboard.TV.setMainPictureInput(HtmlCc.Dashboard.TV.mainPictureInputEnum.Slot, function (result) {
            if (result == 'error') {
                HtmlCc.Gui.Web.DlrCcAppErrorAlert("Setting main picture input failed.");
                return;
            }

            $cc.addClass('tv-on').removeClass('tv-off');
            $cc.addClass('tv-2d').removeClass('tv-3d');
            //HtmlCc.Dashboard.TV.set3dSystem(HtmlCc.Dashboard.TV.threeDSystemEnum.TwoD, function (result) {
            //    if (result == 'error') {
            //        HtmlCc.Gui.Web.DlrCcAppErrorAlert("Setting 3d system failed.");
            //        return;
            //    }

            //    $cc.addClass('tv-2d').removeClass('tv-3d');
            //});
        });
    });
};

HtmlCc.Gui.Web.Init3DTV = function ($cc, tvIp, tvPort) {
    HtmlCc.Dashboard.TV.setTvIp(tvIp, tvPort, function (result) {
        HtmlCc.Libs.Log.log(result);

        if (result == 'error') {
            HtmlCc.Gui.Web.DlrCcAppErrorAlert("Setting of TV address failed.");
            return;
        }

        HtmlCc.Gui.Web.Init3DTVInternal($cc);
    });
};

HtmlCc.Gui.Web.SetUpIpSettings = function ($cc, vredId, vredPort, appIp, appPort, tvIp, tvPort) {
    HtmlCc.Vred.setIp(vredId);
    HtmlCc.Vred.setPort(vredPort);
    HtmlCc.Vred.init($cc, function () { });

    HtmlCc.Dashboard.init(appIp, appPort);

    HtmlCc.Gui.Web.Init3DTV($cc, tvIp, tvPort);
}

HtmlCc.Gui.Web.CiTopBox = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $ciTopBox = $ccRoot.find('div.ci-top-header');
    if ($ciTopBox.length == 0) {
        $ccRoot.append('<div class="ci-top-header"><div class="skoda-logo"><a class="skoda-logo-href" target="_blank"><img src="/Content/Images/skoda-logo-landscape.png" alt="ŠKODA AUTO"></a></div><div class="connection-test"><div class="dashboard-connected connection-icon"><span class="label"></span></div><div class="vred-connected connection-icon"><span class="label"></span></div></div><div class="top-menu-area"><div class="vred-settings icon"><span class="label"></span></div><div class="tv-settings icon"><span class="label"></span></div><div class="load-configuration icon"><span class="label"></span></div><div class="vred-tv-reset icon"><span class="label"></span></div><div class="model-switcher icon"><span class="label"></span></div></div></div>');
        $ciTopBox = $ccRoot.find('div.ci-top-header');
    }

    var $presentationBox = $ccRoot.find('div.presentation-box');

    var $loadConfiguration = $ciTopBox.find('div.load-configuration');
    var $controls = $ciTopBox.find('div.tv-settings');
    var $ipSettings = $ciTopBox.find('div.vred-settings');
    var $vredTvReset = $ciTopBox.find('div.vred-tv-reset');
    var $modelSwitcher = $ciTopBox.find('div.model-switcher');
    var $dashboardConnected = $ciTopBox.find('div.dashboard-connected');
    var $vredConnected = $ciTopBox.find('div.vred-connected');

    if ($cc.hasClass('dealer')) {
        $dashboardConnected.find('span.label').text('Dashboard');
        $vredConnected.find('span.label').text('VRED');

        HtmlCc.Vred.init($cc, function () {
            if (HtmlCc.Vred.getIsInitialized()) {
                $vredConnected.addClass('connected');
            }
            if (cfgManager.getConfigurator().isLoadingVredModel())
                HtmlCc.Gui.Web.SwitchVredModel($cc, cfgManager, settings);
            else
                HtmlCc.Gui.Web.CommunicateWithVred($cc, $ccRoot, cfgManager, settings);
        });

        HtmlCc.Dashboard.isRunning(function (result) {
            if (result == "True") {
                $dashboardConnected.addClass('connected');
            }           
        });

        setInterval(function () {
            var callback = function () {
                var count = 0;
                if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                    if ($vredConnected.hasClass('connected')) {
                        $vredConnected.addClass('connected');
                    }
                    else {
                        $vredConnected.addClass('connected');
                        HtmlCc.Gui.Web.Configurator($cc, cfgManager, settings);
                        //HtmlCc.Gui.Web.NavigationLayer($cc, $presentationBox, cfgManager, settings);
                    }
                }
                else {
                    $vredConnected.removeClass('connected');
                }
            }
            HtmlCc.Vred.init($cc, callback);

            HtmlCc.Dashboard.isRunning(function (result) {
                if (result == "True") {
                    $dashboardConnected.addClass('connected');
                }
                else {
                    $dashboardConnected.removeClass('connected');
                }
            });
        }, 6000);// 6 seconds
    
    $loadConfiguration.find('span.label').text('CiMenuLoadConfigurationLabel'.resx());
    $controls.find('span.label').text('CiMenuTvSettingsLabel'.resx());
    $ipSettings.find('span.label').text('CiMenuVredSettingsLabel'.resx());
    $vredTvReset.find('span.label').text('CiMenuVredTvResetLabel'.resx());
    $modelSwitcher.find('span.label').text('CiMenuModelSwitcher'.resx());

    $ipSettings.unbind('click.htmlcc').bind('click.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        var $dialog = $ccRoot.find('div.dialog.vred-settings:first');

        if ($dialog.length == 0) {

            var $dialog = $ccRoot.find('div.dialog.vred-settings:first');

            $ccRoot.append('<div class="dialog middle-size vred-settings waiting settings-hidden"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

            var $dialog = $ccRoot.find('div.dialog.vred-settings:first');

            $dialog.find('div.header-text-inner').text('CiMenuVredSettingsHeader'.resx());

            $dialog.find('a.close').attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
                evt.preventDefault();
                $dialog.remove();
            });

            var $content = $dialog.find('div.dialog-content');

            var login = HtmlCc.Libs.randomString(8);
            $content.append('<div class="vred-setting-form"><form><div class="login-row"><label for="{0}">{1}</label></td><td><input id="{0}" name="login" type="text" /><input id="find-button" name="findButton" type="button" class="skoda-grey-button" /></div><div class="settings-detail-content disabled hidden" style="overflow:hidden; display:none;"><table class="form-table vred-setting-table"></table></form><div class="change-settings enabled">{2}</div></div></div>'.format(login, "CiMenuVredSettingsLogin".resx(), "CiMenuVredChangeSettings".resx()));

            var $changeSettings = $content.find('.change-settings.enabled');

            $changeSettings.bind('click.htmlcc', function () {
                $(this).removeClass('enabled')
            $formTable.find('td.input .input-dialog').removeAttr('disabled');
            });

            var $loginEl = $content.find('div.login-row input');

            $loginEl.val(htmlcc.libs.LocalStorageProvider.getItem('findLogin'));
            if ($loginEl.val().length > 0) {
                $('#find-button').removeClass('skoda-grey-button');
                $('#find-button').addClass('skoda-green-button');
            }
            $loginEl.bind("propertychange change keyup input paste", function (evt) {
                if ($loginEl.val().length > 0) {
                    $('#find-button').removeClass('skoda-grey-button');
                    $('#find-button').addClass('skoda-green-button');
                }
                else {
                    $('#find-button').removeClass('skoda-green-button');
                    $('#find-button').addClass('skoda-grey-button');
                }
            });

            var $findButton = $content.find('div.login-row #find-button');
            $findButton.attr('value', "CiMenuVredSettingsFindSettings".resx());

            var $formTable = $content.find('table.vred-setting-table');

            var vredAddressId = HtmlCc.Libs.randomString(8);
        $formTable.append('<tr class="vred-address-row"><td class="label"><label for="{0}"></label></td><td class="input"><input class="input-dialog" id="{0}" name="vredAddress" type="text" disabled /></td></tr>'.format(vredAddressId));
            $formTable.find('tr.vred-address-row label').text('CiMenuVredSettingsVredAddressLabel'.resx());

            var vredPortId = HtmlCc.Libs.randomString(8);
        $formTable.append('<tr class="vred-port-row"><td class="label"><label for="{0}"></label></td><td class="input"><input class="input-dialog" id="{0}" name="vredPort" type="text" disabled /></td></tr>'.format(vredPortId));
            $formTable.find('tr.vred-port-row label').text('CiMenuVredSettingsVredPortLabel'.resx());

            var dlrccAppAddressId = HtmlCc.Libs.randomString(8);
        $formTable.append('<tr class="dlrccapp-address-row"><td class="label"><label for="{0}"></label></td><td class="input"><input class="input-dialog" id="{0}" name="dlrccAppAddress" type="text" disabled /></td></tr>'.format(dlrccAppAddressId));
            $formTable.find('tr.dlrccapp-address-row label').text('CiMenuVredSettingsDlrccAppAddressLabel'.resx());

            var dlrccAppPortId = HtmlCc.Libs.randomString(8);
        $formTable.append('<tr class="dlrccapp-port-row"><td class="label"><label for="{0}"></label></td><td class="input"><input class="input-dialog" id="{0}" name="dlrccAppPort" type="text" disabled /></td></tr>'.format(dlrccAppPortId));
            $formTable.find('tr.dlrccapp-port-row label').text('CiMenuVredSettingsDlrccAppPortLabel'.resx());

            var tvAddressId = HtmlCc.Libs.randomString(8);
        $formTable.append('<tr class="tv-address-row"><td class="label"><label for="{0}"></label></td><td class="input"><input class="input-dialog" id="{0}" name="tvAddress" type="text" disabled /></td></tr>'.format(tvAddressId));
            $formTable.find('tr.tv-address-row label').text('CiMenuVredSettingsTvAddressLabel'.resx());

            var tvPortId = HtmlCc.Libs.randomString(8);
            $formTable.append('<tr class="tv-port-row"><td class="label"><label for="{0}"></label></td><td class="input"><input id="{0}" name="tvPort" type="text" disabled /></td></tr>'.format(tvPortId));
            $formTable.find('tr.tv-port-row label').text('CiMenuVredSettingsTvPortLabel'.resx());

            $findButton.bind('click.htmlcc', function () {
                if ($(this).hasClass('skoda-grey-button')) {
                    return;
                }

                var $login = $content.find("#" + login);
                if ($login.val() == "") {
                    alert("CiMenuVredSettingsNotFound".resx());
                    return;
                }
                htmlcc.libs.LocalStorageProvider.setItem('findLogin', $login.val());
                HtmlCc.Dealer.getDlrccSettings($login.val(), function (data) {
                    if (data != 'error') {
                        $formTable.find('tr.tv-address-row input').val(data.TvIp);
                        $formTable.find('tr.vred-address-row input').val(data.VredIp);
                        $formTable.find('tr.dlrccapp-address-row input').val(data.DashboardIp);

                        $formTable.find('#' + vredPortId).val(HtmlCc.Vred.getPort());
                        $formTable.find('#' + tvPortId).val(HtmlCc.Dashboard.TV.getTVPort());
                        $formTable.find('#' + dlrccAppPortId).val(HtmlCc.Dashboard.getPort());

                        $('#find-button').removeClass('skoda-green-button');
                        $('#find-button').addClass('skoda-grey-button');

                        if ($dialog.hasClass("settings-hidden")) {
                            $(".settings-detail-content").toggle("blind");
                            $dialog.removeClass('settings-hidden');
                        }
                        else {
                            alert("CiMenuVredSettingsFound".resx());
                        }

                    }
                    else {
                        alert("CiMenuVredSettingsNotFound".resx());
                        $('#find-button').removeClass('skoda-green-button');
                        $('#find-button').addClass('skoda-grey-button');
                        if ($dialog.hasClass("settings-hidden")) {
                            $(".settings-detail-content").toggle("blind");
                            $dialog.removeClass('settings-hidden');
                        }

                    }
                });
            });

            var vredSubmitId = HtmlCc.Libs.randomString(8);
            var vredCancelId = HtmlCc.Libs.randomString(8);
            $formTable.append('<tr class="vred-submit-row submit"><td colspan="2"><input id="{0}" name="vredCancel" type="button" class="skoda-grey-button arrow-left cancel-button" /><input id="{1}" name="vredSubmit" type="button" class="skoda-green-button arrow-right submit-button" /></td></tr>'.format(vredCancelId, vredSubmitId));
            $formTable.find('tr.vred-submit-row input.submit-button').attr('value', 'CiMenuVredSettingsVredSubmitLabel'.resx());
            $formTable.find('tr.vred-submit-row input.cancel-button').attr('value', 'CiMenuVredSettingsVredCancelLabel'.resx());

            var $cancelButton = $content.find('#' + vredCancelId);
            $cancelButton.bind('click.htmlcc', function () {
                $dialog.remove();
            });

            var $submitButton = $content.find('#' + vredSubmitId);
            $submitButton.bind('click.htmlcc', function () {
                // set the ip, port of vred client and reinit

               

                $dialog.addClass('waiting');

                HtmlCc.Vred.setIp($content.find("#" + vredAddressId).val());
                HtmlCc.Vred.setPort($content.find("#" + vredPortId).val());
                HtmlCc.Dashboard.init($content.find("#" + dlrccAppAddressId).val(), $content.find("#" + dlrccAppPortId).val());

                HtmlCc.Gui.Web.Init3DTV($cc, $content.find("#" + tvAddressId).val(), $content.find("#" + tvPortId).val());
                //HtmlCc.Vred.init($cc, function () { HtmlCc.Gui.Web.Configurator($cc, cfgManager, settings); });
                
                    HtmlCc.Vred.init($cc, function () {
                        if (HtmlCc.Vred.getIsInitialized()) {
                        $vredConnected.addClass('connected');
                            HtmlCc.Gui.Web.Configurator($cc, cfgManager, settings);
                            //HtmlCc.Gui.Web.NavigationLayer($cc, $presentationBox, cfgManager, settings);
                    }
                    });
                
                HtmlCc.Dashboard.isRunning(function (result) {
                    if (result == "True") {
                        $dashboardConnected.addClass('connected');
                    }
            $dialog.removeClass('waiting');
            $dialog.remove();
                });

                if ($content.find("#" + tvPortId).val() == '9999') { HtmlCc.Vred.setDebugMode(true) }

                // save dealerSettings
                //var saveParams = {
                //    DlrCCAppIp: $content.find("#" + dlrccAppAddressId).val(),
                //    VredLocalIp: $content.find("#" + vredAddressId).val(),
                //    TvLocalIp: $content.find("#" + tvAddressId).val()
                //};

                //cfgManager.saveDealerSettings(
                //    // success
                //    function () {
                //        $dialog.removeClass('waiting');
                //        $dialog.remove();
                //    },
                //    // error
                //    function () {
                //        $dialog.removeClass('waiting');

                //        // and some alert
                //    },
                //    HtmlCc.Financial.ObjectParams2ArrayParams(saveParams)
                //);

            //        // and some alert
            //    },
            //    HtmlCc.Financial.ObjectParams2ArrayParams(saveParams)
            //);

            });

            // set the values to form

            $formTable.find('#' + vredPortId).val(HtmlCc.Vred.getPort());
            $formTable.find('#' + tvPortId).val(HtmlCc.Dashboard.TV.getTVPort());
            $formTable.find('#' + dlrccAppPortId).val(HtmlCc.Dashboard.getPort());
            dlrccAppLocalIp = HtmlCc.Dashboard.getAddress();
            vredLocalIp = HtmlCc.Vred.getIp();
            tvLocalIp = HtmlCc.Dashboard.TV.getAddress();
            $formTable.find('#' + vredAddressId).val(vredLocalIp);
            $formTable.find('#' + tvAddressId).val(tvLocalIp);
            $formTable.find('#' + dlrccAppAddressId).val(dlrccAppLocalIp);

            $dialog.removeClass('waiting');
        }

    });

    if (htmlcc.libs.LocalStorageProvider.getItem('findLogin') == null || htmlcc.libs.LocalStorageProvider.getItem('findLogin') == "") {
        $ipSettings.click();
    }
    $controls.unbind('click.htmlcc').bind('click.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        $ccRoot.append('<div class="dialog middle-size tv-settings waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

        var $dialog = $ccRoot.find('div.dialog.tv-settings:first');
        $dialog.find('div.header-text-inner').text('CiMenuTvSettingsHeader'.resx());

        $dialog.find('a.close').attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            $dialog.remove();
        });

        var $content = $dialog.find('div.dialog-content');

        var showServiceAppSettings = function () {
            $dialog.find('div.header-text-inner').text('CiMenuVredSettingsHeader'.resx());

            $content.append('CiMenuTvSettingsInvalid'.resx());

            $dialog.removeClass('waiting');
        };

        var showTvSettings = function () {

            var tvOnId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-tvon"><img class="setting-image"><div class="setting-name"></div></div>'.format(tvOnId));
            var $tvOn = $content.find('#' + tvOnId);
            $tvOn.find('img.setting-image').attr('src', '/Content/images/control-icons/tv-on.png');
            $tvOn.find('div.setting-name').text('CiMenuTvSettingsTvOnLabel'.resx());
            $tvOn.bind('click.htmlcc', function () { HtmlCc.Gui.Web.Init3DTVInternal($cc); })

            var tvOffId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-tvoff"><img class="setting-image"><div class="setting-name"></div></div>'.format(tvOffId));
            var $tvOff = $content.find('#' + tvOffId);
            $tvOff.find('img.setting-image').attr('src', '/Content/images/control-icons/tv-off.png');
            $tvOff.find('div.setting-name').text('CiMenuTvSettingsTvOffLabel'.resx());
            $tvOff.bind('click.htmlcc', function () {
                // switch TV off
                HtmlCc.Dashboard.TV.power(HtmlCc.Dashboard.TV.powerEnum.Off, function (result) {
                    if (result == 'error') {
                        HtmlCc.Gui.Web.DlrCcAppErrorAlert("Switching TV power off failed.");
                        return;
                    }
                    $cc.addClass('tv-off').removeClass('tv-on');
                    $dialog.remove();
                });
            });

            //var tv2dId = HtmlCc.Libs.randomString(8);
            //$content.append('<div id="{0}" class="setting-box setting-tv2d"><img class="setting-image"><div class="setting-name"></div></div>'.format(tv2dId));
            //var $tv2d = $content.find('#' + tv2dId);
            //$tv2d.find('img.setting-image').attr('src', '/Content/images/control-icons/2d.png');
            //$tv2d.find('div.setting-name').text('CiMenuTvSettingsTv2dLabel'.resx());
            //$tv2d.bind('click.htmlcc', function () {
            //    // switch TV to 2D

            //    HtmlCc.Dashboard.TV.set3dSystem(HtmlCc.Dashboard.TV.threeDSystemEnum.TwoD, function (result) {
            //        if (result == 'error') {
            //            HtmlCc.Gui.Web.DlrCcAppErrorAlert("Setting 2d system failed.");
            //            return;
            //        }

            //        $cc.addClass('tv-2d').removeClass('tv-3d');
            //        $dialog.remove();
            //    });
            //});

            //var tv3dId = HtmlCc.Libs.randomString(8);
            //$content.append('<div id="{0}" class="setting-box setting-tv3d"><img class="setting-image"><div class="setting-name"></div></div>'.format(tv3dId));
            //var $tv3d = $content.find('#' + tv3dId);
            //$tv3d.find('img.setting-image').attr('src', '/Content/images/control-icons/3d.png');
            //$tv3d.find('div.setting-name').text('CiMenuTvSettingsTv3dLabel'.resx());
            //$tv3d.bind('click.htmlcc', function () {
            //    // switch TV to 3D
            //    HtmlCc.Dashboard.TV.set3dSystem(HtmlCc.Dashboard.TV.threeDSystemEnum.Simul, function (result) {
            //        if (result == 'error') {
            //            HtmlCc.Gui.Web.DlrCcAppErrorAlert("Setting 3d system failed.");
            //            return;
            //        }

            //        $cc.addClass('tv-3d').removeClass('tv-2d');
            //        $dialog.remove();
            //    });

            //    //HtmlCc.Dashboard.TV.setMainPictureInput(HtmlCc.Dashboard.TV.mainPictureInputEnum.Slot,
            //    //    function (msg) {
            //    //        if (msg.Type == 'Error') {
            //    //            tvErrorAlert(msg);
            //    //            return;
            //    //        }

            //    //    });
            //});

            if (!$cc.hasClass('tv-off') && !$cc.hasClass('tv-on')) {
                $cc.addClass('tv-on').removeClass('tv-off');

            }
            //if (!$cc.hasClass('tv-3d') && !$cc.hasClass('tv-2d')) {
            //    $cc.addClass('tv-3d').removeClass('tv-2d');
            //}
            // remove waiting dialog
            $dialog.removeClass('waiting');
        };

        var showVredSettings = function () {

            var vred2dId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-vred2d"><img class="setting-image" /><div class="setting-name"></div></div>'.format(vred2dId));
            var $vred2d = $content.find('#' + vred2dId);
            $vred2d.find('img.setting-image').attr('src', '/Content/images/control-icons/2d.png');
            $vred2d.find('div.setting-name').text('CiMenuVredSettingsVred2dLabel'.resx());
            $vred2d.bind('click.htmlcc', function () {
                // switch VRED to 2D

                HtmlCc.Vred.disableStereo();

                // dummy
                $cc.addClass('vred-2d').removeClass('vred-3d');
                //$dialog.remove();
            });

            var vred3dId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-vred3d"><img class="setting-image" /><div class="setting-name"></div></div>'.format(vred3dId));
            var $vred3d = $content.find('#' + vred3dId);
            $vred3d.find('img.setting-image').attr('src', '/Content/images/control-icons/3d.png');
            $vred3d.find('div.setting-name').text('CiMenuVredSettingsVred3dLabel'.resx());
            $vred3d.bind('click.htmlcc', function () {
                // switch VRED to 3D

                HtmlCc.Vred.enableStereo();

                // dummy
                $cc.addClass('vred-3d').removeClass('vred-2d');
                //$dialog.remove();
            });

            var enterFullscreenId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-enter-fullscreen"><img class="setting-image" /><div class="setting-name"></div></div>'.format(enterFullscreenId));
            var $enterFullscreen = $content.find('#' + enterFullscreenId);
            $enterFullscreen.find('img.setting-image').attr('src', '/Content/images/control-icons/fullscreen.png');
            $enterFullscreen.find('div.setting-name').text('CiMenuVredSettingsEnterFullscreenLabel'.resx());
            $enterFullscreen.bind('click.htmlcc', function () {
                // switch VRED to fullscreen

                HtmlCc.Vred.enterFullscreen();

                $cc.addClass('vred-fullscreen').removeClass('vred-windowed');
                //$dialog.remove();
            });

            var exitFullscreenId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-exit-fullscreen"><img class="setting-image" /><div class="setting-name"></div></div>'.format(exitFullscreenId));
            var $exitFullscreen = $content.find('#' + exitFullscreenId);
            $exitFullscreen.find('img.setting-image').attr('src', '/Content/images/control-icons/esc-fullscreen.png');
            $exitFullscreen.find('div.setting-name').text('CiMenuVredSettingsExitFullscreenLabel'.resx());
            $exitFullscreen.bind('click.htmlcc', function () {
                // switch VRED to windowed mode

                HtmlCc.Vred.exitFullscreen();

                $cc.addClass('vred-windowed').removeClass('vred-fullscreen');
                //$dialog.remove();
            });

            var openGlId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-opengl"><img class="setting-image" /><div class="setting-name"></div></div>'.format(openGlId));
            var $openGl = $content.find('#' + openGlId);
            $openGl.find('img.setting-image').attr('src', '/Content/images/control-icons/openGl.png');
            $openGl.find('div.setting-name').text('CiMenuVredSettingsOpenGlLabel'.resx());
            $openGl.bind('click.htmlcc', function () {
                // set opengl rendering mode

                HtmlCc.Vred.enableOpenGL();

                $cc.addClass('vred-opengl').removeClass('vred-raytrace');
                //$dialog.remove();
            });

            var raytraceId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-raytrace"><img class="setting-image" /><div class="setting-name"></div></div>'.format(raytraceId));
            var $raytrace = $content.find('#' + raytraceId);
            $raytrace.find('img.setting-image').attr('src', '/Content/images/control-icons/raytracing.png');
            $raytrace.find('div.setting-name').text('CiMenuVredSettingsRaytraceLabel'.resx());
            $raytrace.bind('click.htmlcc', function () {
                // set raytrace rendering mode

                HtmlCc.Vred.enableRaytrace();

                $cc.addClass('vred-raytrace').removeClass('vred-opengl');
                //$dialog.remove();
            });

            //var enableSsId = HtmlCc.Libs.randomString(8);
            //$content.append('<div id="{0}" class="setting-box setting-supersample-enable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(enableSsId));
            //var $enableSs = $content.find('#' + enableSsId);
            //$enableSs.find('img.setting-image').attr('src', '/Content/images/control-icons/ss.png');
            //$enableSs.find('div.setting-name').text('CiMenuVredSettingsSupersampleEnableLabel'.resx());
            //$enableSs.bind('click.htmlcc', function () {
            //    // enable supersampling

            //    HtmlCc.Vred.enableSuperSampling();

            //    $cc.addClass('vred-supersample-enabled').removeClass('vred-supersample-disabled');
            //    //$dialog.remove();
            //});

            //var disableSsId = HtmlCc.Libs.randomString(8);
            //$content.append('<div id="{0}" class="setting-box setting-supersample-disable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(disableSsId));
            //var $disableSs = $content.find('#' + disableSsId);
            //$disableSs.find('img.setting-image').attr('src', '/Content/images/control-icons/ss-off.png');
            //$disableSs.find('div.setting-name').text('CiMenuVredSettingsSupersampleDisableLabel'.resx());
            //$disableSs.bind('click.htmlcc', function () {
            //    // disable supersampling

            //    HtmlCc.Vred.disableSuperSampling();

            //    $cc.addClass('vred-supersample-disabled').removeClass('vred-supersample-enabled');
            //    //$dialog.remove();
            //});

            //var enableAaId = HtmlCc.Libs.randomString(8);
            //$content.append('<div id="{0}" class="setting-box setting-antialias-enable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(enableAaId));
            //var $enableAa = $content.find('#' + enableAaId);
            //$enableAa.find('img.setting-image').attr('src', '/Content/images/control-icons/antialiasing.png');
            //$enableAa.find('div.setting-name').text('CiMenuVredSettingsAntialiasEnableLabel'.resx());
            //$enableAa.bind('click.htmlcc', function () {
            //    // enable anti aliasing mode

            //   HtmlCc.Vred.enableAntiAliasing();

            //    $cc.addClass('vred-antialias-enabled').removeClass('vred-antialias-disabled');
            //    //$dialog.remove();
            //});

            //var disableAaId = HtmlCc.Libs.randomString(8);
            //$content.append('<div id="{0}" class="setting-box setting-antialias-disable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(disableAaId));
            //var $disableAa = $content.find('#' + disableAaId);
            //$disableAa.find('img.setting-image').attr('src', '/Content/images/control-icons/antialiasing-off.png');
            //$disableAa.find('div.setting-name').text('CiMenuVredSettingsAntialiasDisableLabel'.resx());
            //$disableAa.bind('click.htmlcc', function () {
            //    // disable antialias

            //    HtmlCc.Vred.disableAntiAliasing();

            //    $cc.addClass('vred-antialias-disabled').removeClass('vred-antialias-enabled');
            //    //$dialog.remove();
            //});

            //var enableHqAaId = HtmlCc.Libs.randomString(8);
            //$content.append('<div id="{0}" class="setting-box setting-hq-antialias-enable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(enableHqAaId));
            //var $enableHqAa = $content.find('#' + enableHqAaId);
            //$enableHqAa.find('img.setting-image').attr('src', '/Content/images/control-icons/antialiasing.png');
            //$enableHqAa.find('div.setting-name').text('CiMenuVredSettingsHqAntialiasEnableLabel'.resx());
            //$enableHqAa.bind('click.htmlcc', function () {
            //    // enable HQ anti aliasing mode

            //    HtmlCc.Vred.enableHighQualityAnitaliasing();

            //    $cc.addClass('vred-hq-antialias-enabled').removeClass('vred-hq-antialias-disabled');
            //    //$dialog.remove();
            //});

            var disableHqAaId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-hq-antialias-disable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(disableHqAaId));
            var $disableHqAa = $content.find('#' + disableHqAaId);
            $disableHqAa.find('img.setting-image').attr('src', '/Content/images/control-icons/antialiasing-off.png');
            $disableHqAa.find('div.setting-name').text('CiMenuVredSettingsHqAntialiasDisableLabel'.resx());
            $disableHqAa.bind('click.htmlcc', function () {
                // disable HQ anti aliasing mode

                HtmlCc.Vred.disableHighQualityAntialiasing();

                $cc.addClass('vred-hq-antialias-disabled').removeClass('vred-hq-antialias-enabled');
                //$dialog.remove();
            });
            $content.append('<div class="terminator"></div>');
            var enableStatsId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-stats-enable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(enableStatsId));
            var $enableStats = $content.find('#' + enableStatsId);
            $enableStats.find('img.setting-image').attr('src', '/Content/images/control-icons/antialiasing.png');
            $enableStats.find('div.setting-name').text('Statistics');
            $enableStats.bind('click.htmlcc', function () {
                // enable statistics

                HtmlCc.Vred.showStatistics();

                $cc.addClass('vred-stats-enabled').removeClass('vred-stats-disabled');
                //$dialog.remove();
            });

            var disableStatsId = HtmlCc.Libs.randomString(8);
            $content.append('<div id="{0}" class="setting-box setting-stats-disable"><img class="setting-image" /><div class="setting-name"></div></div>'.format(disableStatsId));
            var $disableStats = $content.find('#' + disableStatsId);
            $disableStats.find('img.setting-image').attr('src', '/Content/images/control-icons/antialiasing-off.png');
            $disableStats.find('div.setting-name').text('Statistics');
            $disableStats.bind('click.htmlcc', function () {
                // disable statistics

                HtmlCc.Vred.hideStatistics();

                $cc.addClass('vred-stats-disabled').removeClass('vred-stats-enabled');
                //$dialog.remove();
            });

            HtmlCc.Vred.settings.isStereo ? $cc.addClass('vred-3d').removeClass('vred-2d') : $cc.addClass('vred-2d').removeClass('vred-3d');
            HtmlCc.Vred.settings.isFullscreen ? $cc.addClass('vred-fullscreen').removeClass('vred-windowed') : $cc.addClass('vred-windowed').removeClass('vred-fullscreen');
            HtmlCc.Vred.settings.isOpenGL ? $cc.addClass('vred-opengl').removeClass('vred-raytrace') : $cc.addClass('vred-raytrace').removeClass('vred-opengl');
            HtmlCc.Vred.settings.isSuperSampling ? $cc.addClass('vred-supersample-enabled').removeClass('vred-supersample-disabled') : $cc.addClass('vred-supersample-disabled').removeClass('vred-supersample-enabled');
            HtmlCc.Vred.settings.isAntialiasing ? $cc.addClass('vred-antialias-enabled').removeClass('vred-antialias-disabled') : $cc.addClass('vred-antialias-disabled').removeClass('vred-antialias-enabled');
            HtmlCc.Vred.settings.isHighQualityAntialiasing ? $cc.addClass('vred-hq-antialias-enabled').removeClass('vred-hq-antialias-disabled') : $cc.addClass('vred-hq-antialias-disabled').removeClass('vred-hq-antialias-enabled');
            HtmlCc.Vred.settings.isShowStatistics ? $cc.addClass('vred-stats-enabled').removeClass('vred-stats-disabled') : $cc.addClass('vred-stats-disabled').removeClass('vred-stats-enabled');

        };

        HtmlCc.Dashboard.isRunning(function (result) {
            if (result == "True") {
                showTvSettings();
            }
            else {

                // websocket is not connected
                // show the ui for setup and for submit

                showServiceAppSettings();

            }

            showVredSettings();

        });
    });

    $loadConfiguration.unbind('click.htmlcc').bind('click.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        $ccRoot.append('<div class="dialog small-size load-configuration"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

        var $dialog = $ccRoot.find('div.dialog.load-configuration:first');
        $dialog.find('div.header-text-inner').text('CiMenuLoadConfigurationHeader'.resx());

        $dialog.find('a.close').attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            $dialog.remove();
        });

        var $content = $dialog.find('div.dialog-content');
        var labelId = HtmlCc.Libs.randomString(8);
        $content.html('<form class="load-configuration-form"><table class="form-table"><tr class="configuration-id-row"><td><label class="configurationId" for="{0}"></label></td><td><input type="text" id="{0}" name="configurationId" /></td></tr><tr class="submit"><td colspan="2"><input type="button" class="cancel-button skoda-grey-button arrow-left" /><input type="button" class="submit-button skoda-green-button arrow-right" /></td></tr></table></form>'.format(labelId));
        $content.find('form.load-configuration-form').attr('action', cfgManager.getUrlOfSettings(settings)).bind('submit', function (evt) {
            evt.preventDefault();
        });

        $content.find('label.configurationId').text('LoadConfigurationDialogLabel'.resx());
        $content.find('input[type=button].submit-button').attr('value', 'LoadConfigurationDialogSubmit'.resx()).bind('click.htmlcc', function () {
            var configId = $content.find('#' + labelId).val();
            if (configId == "") {
                $content.find('tr.configuration-id-row').addClass('error');
            } else {
                $.ajax({
                    url: '/dealer/loadCar/' + configId,
                    success: function (data) {
                        if (data.status == "error") {
                            alert(data.message);
                        }
                        else {
                            $content.find('tr.configuration-id-row').removeClass('error');
                            window.location.href = data.redirectToUrl;
                            $cc.find('.dialog.load-configuration').remove();
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert('HP_ConfigurationWasNotFound'.resx());
                    }
                    //location.href = 
                });
            }
        });
        $content.find('input[type=button].cancel-button').attr('value', 'LoadConfigurationDialogCancel'.resx()).bind('click.htmlcc', function () {
            $dialog.remove();
        });
    });

    $vredTvReset.unbind('click.htmlcc').bind('click.htmlcc', function () {

        HtmlCc.Dashboard.TV.setTvIpWithStoredValues(function (result) {
            HtmlCc.Libs.Log.log(result);

            if (result == 'error') {
                HtmlCc.Gui.Web.DlrCcAppErrorAlert("");
                return;
            }

            HtmlCc.Gui.Web.Init3DTVInternal($cc);

        });

        HtmlCc.Vred.init($cc, function () { HtmlCc.Gui.Web.Configurator($cc, cfgManager, settings); });

    });

    $modelSwitcher.unbind('click.htmlcc').bind('click.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');

        $ccRoot.append('<div class="dialog model-switcher waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

        var $dialog = $ccRoot.find('div.dialog.model-switcher:first');
        $dialog.find('div.header-text-inner').text('CiMenuModelSwitcherDialogHeader'.resx());

        $dialog.find('a.close').attr('href', cfgManager.getSettingsFromUrl(settings)).bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            $dialog.remove();
        });

        cfgManager.getConfigurator().loadModelGroups(
            // success
            function (data) {

                var $dialogContent = $dialog.find('div.dialog-content');

                $.each(data, function (modelGroupIndex, modelGroup) {

                    $dialogContent.append('<div class="model-group"><span>{0}</span></div>'.format(modelGroup.Name));

                    $.each(modelGroup.Models, function (modelIndex, model) {

                        var currentId = HtmlCc.Libs.randomString(8);

                        $dialogContent.append('<div id="{0}" class="model-box"><img class="modelPreview-image"></img><div class="setting-name"></div></div>'.format(currentId));

                        var $current = $dialogContent.find('#' + currentId);
                        $current.find('div.setting-name').text(model.Name);
                        $current.find('img.modelPreview-image').attr('src', model.MediumImageUri);

                        var carlineCode = model.CarlineCode;
                        var modelCode = model.Code;

                        $current.unbind('click.htmlcc').bind('click.htmlcc', function () {
                            $dialog.addClass('waiting');

                            var newUrl = document.URL.split('#')[0].substring(0, document.URL.split('#')[0].length - 9);
                            newUrl += modelCode;
                            newUrl += '/' + carlineCode;

                            $dialog.removeClass('waiting');

                            window.location = newUrl;
                        });

                    });

                    $dialogContent.append('<div class="hr"></div>');
                    //$dialogContent.append('<div class="terminator"></div>');
                });

                $dialog.removeClass('waiting');
            },
            // error
            function () {
                alert('Load model groups failed.');
                $dialog.removeClass('waiting');
            }
        );
    });
    }

};

HtmlCc.Gui.Web.DisplayCarStorage = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType && cfgManager != null)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    if (!(settings instanceof HtmlCc.Workflow.SettingsType && settings != null)) {
        throw new Error('Object settings is not instance of HtmlCc.Workflow.SettingsType.');
    }

    if (settings.viewstate.displayCarStorage == true) {

        var garage = cfgManager.getConfigurator().getGarage();
        var $garage = $ccRoot.find('div.garage');

        if ($garage.length === 0) {

            if (settings.viewstate.saveCar != true) {
                SkodaAuto.Event.publish(
                                       "event.displayCarStorage",
                                       new SkodaAuto.Event.Model.EventParams(
                                            cfgManager.getConfigurator().getInstanceName(),
                                            cfgManager.getConfigurator().getSalesProgramName(),
                                            cfgManager.getConfigurator().getCulture(),
                                            cfgManager.getConfigurator().getModelCode(),
                                            cfgManager.getConfigurator().getCarlineCode(),
                                            settings.view,
                                            cfgManager.getConfigurator(),
                                            cfgManager.getConfigurator().getVersion()
                                ));
                SkodaAuto.Event.publish(
                               "gtm.garageLoaded",
                               new SkodaAuto.Event.Model.GTMEventParams(
                                  "pageview",
                                  null,
                                  null,
                                  {
                                      instanceName: cfgManager.getConfigurator().getInstanceName(),
                                      salesProgramName: cfgManager.getConfigurator().getSalesProgramName(),
                                      culture: cfgManager.getConfigurator().getCulture(),
                                      groupName: cfgManager.getConfigurator().getPageGroupName(),
                                      pageName: cfgManager.getConfigurator().getPageName($(document).find("title").text(), "Garage"),
                                      context: cfgManager.getConfigurator().getCCContext(),
                                  }
                             ));
            }

            // garage is not created yet, create it now
            //var isDealer = (location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0);
            var isDealer = $cc.hasClass('dealer');
            $ccRoot.append('<div class="garage"><div class="garage-header"><div class="main-header"></div><a class="logout-link do-not-display"></a><a class="login-link do-not-display"></a></div><div class="garage-middle"><div class="middle-welcome"></div><a class="change-user-info do-not-display" target="_blank"></a><div class="tabbed-area"><div class="tab-headers"><a class="tab-header car-storage active" data-tab-id="car-storage"></a><a class="tab-header car-comparison" data-tab-id="car-comparison"></a></div><div class="terminator"></div><div class="tab car-storage active" data-tab-id="car-storage"><div class="tab-content"><div class="car-slider"></div></div></div><div class="tab car-comparison" data-tab-id="car-comparison"><div class="tab-content"></div></div></div></div><div class="garage-footer"><input type="button" class="skoda-grey-button arrow-left back-to-configurator" /></div><div class="waiting-layer"></div></div>');
            $garage = $ccRoot.find('div.garage');
            var $b2bImage;
            if (isDealer) {
                $b2bImage = $('<img id="b2b_image" src="" width="0" height="0"/>').appendTo($garage);
            }
            $garage.find('div.main-header').text('GarageMainHeader'.resx());
            $garage.find('a.logout-link').text('GarageLogoutLink'.resx()).attr('href', HtmlCc.Gui.Web.GetUrl('/account/logoff')).bind('click.htmlcc', function (evt) {
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

            $garage.find('a.login-link').text('GarageLoginLink'.resx()).attr('href', HtmlCc.Gui.Web.GetUrl('/AuthenticateHandler/Index')).bind('click.htmlcc', function (evt) {
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
                    location.href = '{0}?returnKey={1}'.format($(this).attr('href'), returnKey);
                }
            });

            $garage.find('a.change-user-info').text('GarageChangeUserInfo'.resx()).attr('href', HtmlCc.Gui.Web.GetUrl('/AuthenticateHandler/ChangeUserInfo')).bind('click.htmlcc', function (evt) {
                evt.preventDefault();
                if (htmlcc.libs.LocalStorageProvider.hasStorage()) {
                    var changeUserInfoRedirectCollection = JSON.parse(htmlcc.libs.LocalStorageProvider.getItem('changeUserInfoRedirect'));
                    if (changeUserInfoRedirectCollection == null) {
                        changeUserInfoRedirectCollection = {};
                    }
                    var returnKey = HtmlCc.Libs.randomString(8);
                    changeUserInfoRedirectCollection[returnKey] = {
                        returnUrl: location.href,
                        currentDate: (new Date()).toUTCString()
                    };

                    htmlcc.libs.LocalStorageProvider.setItem('changeUserInfoRedirect', JSON.stringify(changeUserInfoRedirectCollection));
                    window.open('{0}?returnKey={1}&fromUI={2}'.format($(this).attr('href'), returnKey, true), "_blank");
                }
            });

            $garage.find('a.tab-header.car-storage').text('GarageTabHeaderCarStorage'.resx());
            $garage.find('a.tab-header.car-comparison').text('GarageTabHeaderCarComparison'.resx());
        }

        $garage.addClass('waiting');

        var $backToConfiguratorButton = $garage.find('input.back-to-configurator');
        $backToConfiguratorButton.attr('value', 'GarageBackToConfiguratorButton'.resx());
        $backToConfiguratorButton.unbind('click.htmlcc').bind('click.htmlcc', function () {
            var newSettings = new HtmlCc.Workflow.SettingsType(settings);
            newSettings.viewstate.displayCarStorage = undefined;
            newSettings.viewstate.saveCar = undefined;
            location.href = cfgManager.getUrlOfSettings(newSettings);
            SkodaAuto.Event.publish(
                              "event.carStorageClosed",
                                new SkodaAuto.Event.Model.ConfigureEvntParams(
                                        settings.instance,      // instanceName
                                        settings.salesprogram,  // salesProgramName
                                        settings.culture,       // culture
                                        settings.model,         // modelCode
                                        settings.carline,       // carlineCode
                                        newSettings.view,       // step
                                        cfgManager.getConfigurator(),           // configurator
                                        newSettings.packages,    // packages
                                        cfgManager.getConfigurator().getConfiguredMotor()            //currentMotor - in step 1 configurator.getConfiguredMotor() doesn´t refresh
                            ));

            SkodaAuto.Event.publish(
            "gtm.backToConfiguration",
                new SkodaAuto.Event.Model.GTMEventParams(
                   "LifeCC Garage",
                   "Back to Configurator",
                   null,
                   {
                   }
          ));
                       //);
        });

        var $middleContent = $garage.find('div.garage-middle');
        var $middleWelcome = $garage.find('div.middle-welcome');

        var $tabbedArea = $middleContent.find('div.tabbed-area');


        var displayMiddleContent = function () {
            garage.addAfterInitCallback(function () {
                garage.getCarInfos($cc.hasClass('dealer'), function (infos) {

                    if (garage.isLogged()) {
                        $middleWelcome.text('GarageLoggedWelcome'.resx().format(garage.getUsername()));
                        $garage.find('a.logout-link').removeClass('do-not-display');
                        $garage.find('a.login-link').addClass('do-not-display');
                        $garage.find('a.change-user-info').removeClass('do-not-display');
                    } else {
                        $middleWelcome.text('GarageNotLoggedWelcome'.resx());
                        $garage.find('a.logout-link').addClass('do-not-display');
                        $garage.find('a.login-link').removeClass('do-not-display');
                        $garage.find('a.change-user-info').addClass('do-not-display');
                    }

                    var $storageTab = $middleContent.find('div.tab.car-storage');
                    var $storageTabContent = $storageTab.find('div.tab-content');

                    var $comparisonTab = $middleContent.find('div.tab.car-comparison');
                    var $comparisonTabContent = $comparisonTab.find('div.tab-content');

                    var $storageTabA = $tabbedArea.find('a.tab-header.car-storage');
                    var storageSettings = new HtmlCc.Workflow.SettingsType(settings);
                    storageSettings.viewstate.garageTab = 'storage';
                    $storageTabA.attr('href', cfgManager.getUrlOfSettings(storageSettings));

                    var $comparisonTabA = $tabbedArea.find('a.tab-header.car-comparison');
                    var comparisonSettings = new HtmlCc.Workflow.SettingsType(settings);
                    comparisonSettings.viewstate.garageTab = 'comparison';
                    $comparisonTabA.attr('href', cfgManager.getUrlOfSettings(comparisonSettings));

                    if (settings.viewstate.garageTab == 'comparison') {
                        $comparisonTab.addClass('active');
                        $comparisonTabA.addClass('active');
                        $storageTab.removeClass('active');
                        $storageTabA.removeClass('active');
                    } else {
                        $cc.find('div.comparison-print-title').remove();
                        $comparisonTab.removeClass('active');
                        $comparisonTabA.removeClass('active');
                        $storageTab.addClass('active');
                        $storageTabA.addClass('active');
                    }

                    $comparisonTabA.unbind('click.htmlcc').bind('click.htmlcc', function () {
                        if (!$comparisonTab.hasClass('active')) {
                            SkodaAuto.Event.publish(
                            "gtm.comparisonDisplayed",
                                new SkodaAuto.Event.Model.GTMEventParams(
                                   "LifeCC Garage",
                                   "Comparison Displayed",
                                   null,
                                   {
                                   }
                          ));
                        }
                    });

                    // display comparison
                    var isStandardComparisnon = false
                    var carsToComparison = [];
                    $.each(infos, function () {
                        if (carsToComparison.length >= 4) {
                            return;
                        }
                        if ($.isArray(settings.viewstate.comparisonItems) && $.inArray(this.Id, settings.viewstate.comparisonItems) !== -1) {
                            if (jQuery.isEmptyObject(this.VirtualEquipementItem)) {
                                if (!isStandardComparisnon) { isStandardComparisnon = true }
                            }
                            carsToComparison.unshift(this);
                        }
                    });
                    var $comparisonTabContent = $cc.find('.garage-middle .tab.car-comparison div.tab-content')

                    $comparisonTabContent.find('.comparison-table').remove();   // remove it first - I'm lazy

                    $comparisonTabContent.find('div.no-item-notice').remove();
                    $comparisonTabContent.removeClass('no-item');
                    if (settings.viewstate.garageTab == "comparison" && carsToComparison.length > 0) {
                        if (isStandardComparisnon || cfgManager.getConfigurator().getSalesProgramSetting("showVirtualComparison") != "true") {
                            HtmlCc.Comparison.Standard($cc, $ccRoot, $comparisonTabContent, cfgManager, settings, carsToComparison);
                        }
                        else {
                            if ($.isEmptyObject(garage.getTranslations())) {
                                $garage.addClass('loading');
                                garage.getCompareTranslations(settings, cfgManager.getConfigurator().getComparisonTranslVersion(),
                                    function (transl) {
                                        HtmlCc.Comparison.VirtualTable($cc, $ccRoot, $comparisonTabContent, cfgManager, settings, carsToComparison, garage.getTranslations());
                                        $garage.removeClass('loading');
                                    },
                                function () {
                                    HtmlCc.Libs.Log.error('Failed to load translations for virtual configuration.');
                                    $garage.removeClass('loading');
                                });
                            }
                            else {
                                HtmlCc.Comparison.VirtualTable($cc, $ccRoot, $comparisonTabContent, cfgManager, settings, carsToComparison, garage.getTranslations());
                            }

                        }
                    }
                    else {
                        $comparisonTabContent.append('<div class="no-item-notice"></div>');
                        $comparisonTabContent.find('div.no-item-notice').text('GarageNoComparisonText'.resx());
                        $comparisonTabContent.addClass('no-item');
                    }

                    // display storage 

                    $storageTabContent.find('div.no-item-notice').remove();
                    $storageTabContent.removeClass('no-item');
                    if (infos.length > 0) {
                        var $carSlider = $storageTabContent.find('div.car-slider');
                        $carSlider.find('div.car-box').remove();

                        $.each(infos.reverse(), function (index) {
                            var thisInfo = this;

                            $carSlider.append('<div class="car-box car-box-{0}"><div class="active-ico"></div><img class="car-image-preview" /><a class="close"></a><div class="model-name"></div><div class="motor-name"></div><div class="motor-price"></div><div class="button-area"><input type="button" class="skoda-green-button arrow-right car-card-and-print" /><input type="button" class="skoda-green-button arrow-right reconfigure" /><input type="button" class="skoda-green-button add add-to-comparison" /><input type="button" class="skoda-grey-button remove-from-comparison" /></div><div class="note-area"><textarea class="note-box"></textarea><input type="button" class="skoda-green-button arrow-right submit-note-box do-not-display" /></div></div>'.format(thisInfo.Id));

                            var $carBox = $carSlider.find('div.car-box-{0}'.format(thisInfo.Id));
                            var $close = $carBox.find('a.close');
                            var $carImagePreview = $carBox.find('img.car-image-preview');
                            var $modelName = $carBox.find('div.model-name');
                            var $motorName = $carBox.find('div.motor-name');
                            var $motorPrice = $carBox.find('div.motor-price');
                            var $activeIco = $carBox.find('div.active-ico');

                            $carBox.css('left', index * 263 + 4);

                            $close.attr('href', cfgManager.getUrlOfSettings(settings)); // the same url... I'll handle click event another way
                            $close.bind('click.htmlcc', function (evt) {
                                evt.preventDefault();
                                $garage.addClass('waiting');
                                garage.removeCarId(thisInfo.Id, function () {
                                    HtmlCc.Libs.Log.log('car id {0} removed from car storage'.format(thisInfo.Id));
                                    displayMiddleContent();
                                }, function () {
                                    HtmlCc.Libs.Log.log('car id {0} CANNOT be removed from car storage'.format(thisInfo.Id));
                                    displayMiddleContent();
                                });
                            });

                            $carImagePreview.attr('src', thisInfo.ImageUrl);

                            $modelName.text(thisInfo.ModelName);
                            $motorName.text(thisInfo.MotorName);
                            $motorPrice.text(thisInfo.ClientFormatedPrice);

                            var $buttonCarCard = $carBox.find('input.car-card-and-print');
                            var $buttonReconfigure = $carBox.find('input.reconfigure');
                            var $buttonAddToComparison = $carBox.find('input.add-to-comparison');
                            var $buttonRemoveFromComparison = $carBox.find('input.remove-from-comparison');

                            $buttonCarCard.attr('value', 'GarageButtonCarCardAndPrint'.resx());
                            $buttonCarCard.bind('click.htmlcc', function () {
                                SkodaAuto.Event.publish(
                                 "event.carCardClick",
                                 new SkodaAuto.Event.Model.CarCardEvntParams(
                                      cfgManager.getConfigurator().getInstanceName,
                                      cfgManager.getConfigurator().getSalesProgramName(),
                                      cfgManager.getConfigurator().getCulture(),
                                      cfgManager.getConfigurator().getModelCode(),
                                      cfgManager.getConfigurator().getCarlineCode(),
                                      settings.view, thisInfo.Id));

                                SkodaAuto.Event.publish(
                                     "gtm.carCardClick",
                                     new SkodaAuto.Event.Model.GTMEventParams(
                                          "LifeCC Garage",
                                          "Car Card",
                                          null,
                                          {
                                              context: cfgManager.getConfigurator().getCCContext(),
                                              model: thisInfo.ModelCode.substring(0, 2),
                                              modelBody: thisInfo.ModelCode,
                                              carlineCode: thisInfo.CarlineCode,
                                              configurationId: thisInfo.Id,
                                              price: thisInfo.FormattedTotalPrice.trim()
                                          }
                                    ));
                                window.open("/CarCard/{0}".format(thisInfo.Id));
                            });

                            $buttonReconfigure.attr('value', 'GarageButtonReconfigure'.resx());
                            $buttonReconfigure.bind('click.htmlcc', function () {
                             var str = thisInfo.ReconfigurationUrl.split('/');
                                //window.open(thisInfo.ReconfigurationUrl);
                                SkodaAuto.Event.publish(
                                     "gtm.reconfigure",
                                     new SkodaAuto.Event.Model.GTMEventParams(
                                          "LifeCC Garage",
                                          "Configuration Opened",
                                          null,
                                          {
                                              context: cfgManager.getConfigurator().getCCContext(),
                                              model: thisInfo.ModelCode.substring(0, 2),
                                              modelBody: thisInfo.ModelCode,
                                              carlineCode: thisInfo.CarlineCode,
                                              configurationId: thisInfo.Id,
                                              price: thisInfo.FormattedTotalPrice.trim()
                                          }
                                    ));
                             window.location.href = thisInfo.ReconfigurationUrl;
                            });

                            var alreadyCompared = false;
                            if ($.isArray(settings.viewstate.comparisonItems) && $.inArray(thisInfo.Id, settings.viewstate.comparisonItems) !== -1) {
                                alreadyCompared = true;
                            }

                            if (alreadyCompared) {
                                $buttonRemoveFromComparison.attr('value', 'GarageButtonRemoveFromComparison'.resx());
                                $buttonRemoveFromComparison.bind('click.htmlcc', function () {
                                    var removeFromComparisonSettings = new HtmlCc.Workflow.SettingsType(settings);
                                    var retultItems = [];
                                    $.each(settings.viewstate.comparisonItems || [], function () {
                                        if (this != thisInfo.Id) {
                                            retultItems.push(this);
                                        }
                                    });
                                    removeFromComparisonSettings.viewstate.comparisonItems = retultItems;
                                    location.href = cfgManager.getUrlOfSettings(removeFromComparisonSettings);
                                    $activeIco.removeClass("active");
                                });
                                $buttonRemoveFromComparison.removeClass('do-not-display');
                                $buttonAddToComparison.addClass('do-not-display');
                                $activeIco.addClass("active");
                            } else {
                                $buttonAddToComparison.attr('value', 'GarageButtonAddToComparison'.resx());
                                $buttonAddToComparison.bind('click.htmlcc', function () {
                                    var addToComparisonSettings = new HtmlCc.Workflow.SettingsType(settings);
                                    addToComparisonSettings.viewstate.comparisonItems = addToComparisonSettings.viewstate.comparisonItems || [];
                                    if (addToComparisonSettings.viewstate.comparisonItems.length < 4) {
                                        addToComparisonSettings.viewstate.comparisonItems.push(thisInfo.Id);
                                        location.href = cfgManager.getUrlOfSettings(addToComparisonSettings);
                                        $activeIco.addClass("active");
                                    } else {
                                        $ccRoot.append('<div class="dialog tiny-size alert-dialog"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');
                                        var $dialog = $ccRoot.find('div.dialog.alert-dialog');
                                        $dialog.find('div.header-text').text('GarageNoMoreThan4AlertHeader'.resx());
                                        $dialog.find('div.dialog-content').text('GarageNoMoreThan4AlertText'.resx()).append('<input type="button" class="skoda-green-button arrow-right ok-button" />');
                                        $dialog.find('a.close').each(function () {
                                            $(this).click(function (evt) {
                                                evt.preventDefault();
                                                $dialog.remove();
                                            }).attr('href', cfgManager.getUrlOfSettings(settings));
                                        });
                                        $dialog.find('input.ok-button').attr('value', 'GarageNoMoreThan4AlertOk'.resx()).click(function () {
                                            $dialog.remove();
                                        });
                                    }
                                    SkodaAuto.Event.publish(
                                     "gtm.addToComparison",
                                     new SkodaAuto.Event.Model.GTMEventParams(
                                          "LifeCC Garage",
                                          "Add to Comparison",
                                          null,
                                          {
                                              context: cfgManager.getConfigurator().getCCContext(),
                                              model: thisInfo.ModelCode.substring(0, 2),
                                              modelBody: thisInfo.ModelCode,
                                              carlineCode: thisInfo.CarlineCode,
                                              configurationId: thisInfo.Id,
                                              price: thisInfo.FormattedTotalPrice.trim()
                                          }
                                    ));
                                });
                                $buttonRemoveFromComparison.addClass('do-not-display');
                                $buttonAddToComparison.removeClass('do-not-display');
                                $activeIco.removeClass("active");
                            }

                            var $noteArea = $carBox.find('div.note-area');
                            var $noteBox = $noteArea.find('textarea.note-box');
                            var $noteSubmit = $noteArea.find('input.submit-note-box');

                            $noteBox.attr('placeholder', 'GarageNoteBoxPlaceholder'.resx());
                            $noteBox.val(thisInfo.Note || '');
                            $noteBox.attr('data-original-note', thisInfo.Note || '');
                            $noteBox.bind('change.htmlcc paste.htmlcc input.htmlcc propertychange.htmlcc', function () {
                                if ($noteBox.attr('data-original-note') == $noteBox.val()) {
                                    $noteSubmit.addClass('do-not-display');
                                } else {
                                    $noteSubmit.removeClass('do-not-display');
                                }
                            });

                            $noteSubmit.attr('value', 'GarageButtonSubmitNoteBox'.resx());
                            var noteSubmitEventHandler = function () {
                                var newNoteValue = $noteBox.val();
                                garage.saveNote(thisInfo.Id, newNoteValue, $cc.hasClass('dealer'), function () {
                                    HtmlCc.Libs.Log.log('Note has been saved.');
                                    $noteSubmit.bind('click.htmlcc', noteSubmitEventHandler);
                                    $noteSubmit.css('cursor', undefined);
                                    $noteSubmit.attr('value', 'GarageButtonSubmitNoteBox'.resx());
                                    $noteBox.val(newNoteValue);
                                    thisInfo.Note = newNoteValue;
                                    $noteBox.attr('data-original-note', thisInfo.Note || '');
                                    $noteBox.trigger('change.htmlcc');
                                    SkodaAuto.Event.publish(
                                     "gtm.noteSaved",
                                     new SkodaAuto.Event.Model.GTMEventParams(
                                          "LifeCC Garage",
                                          "Save Note",
                                          null,
                                          {
                                              context: cfgManager.getConfigurator().getCCContext(),
                                              model: thisInfo.ModelCode.substring(0, 2),
                                              modelBody: thisInfo.ModelCode,
                                              carlineCode: thisInfo.CarlineCode,
                                              configurationId: thisInfo.Id,
                                              price: thisInfo.FormattedTotalPrice.trim()
                                          }
                                    ));
                                }, function () {
                                    HtmlCc.Libs.Log.error('Note cannot be saved.');
                                    $noteSubmit.bind('click.htmlcc', noteSubmitEventHandler);
                                    $noteSubmit.css('cursor', undefined);
                                    $noteSubmit.attr('value', 'GarageButtonSubmitNoteBox'.resx());
                                    $noteBox.val($noteBox.attr('data-original-note'));
                                    $noteBox.trigger('change.htmlcc');
                                });
                                $noteSubmit.unbind('click.htmlcc');
                                $noteSubmit.css('cursor', 'progress');
                                $noteSubmit.attr('value', 'GarageButtonSubmitNoteBoxInProgress'.resx());
                            };
                            $noteSubmit.bind('click.htmlcc', noteSubmitEventHandler);
                        });
                    } else {
                        $storageTabContent.addClass('no-item');
                        $storageTabContent.text('GarageNoStoredCars'.resx());
                    }

                    $garage.removeClass('waiting');

                }, function () {
                    HtmlCc.Libs.Log.error('failed to fetch infor for display middle content of car storage.');
                    $garage.removeClass('waiting');
                });
            });
        };

        if (settings.viewstate.saveCar == true) {
            cfgManager.saveConfiguration(function (data, fromCache) {
                HtmlCc.Libs.Log.log('Car has been saved as {0} to be inserted into car storage.'.format(data.Id));
                garage.addAfterInitCallback(function () {
                    garage.addCarId(data.Id, function () {
                        HtmlCc.Libs.Log.log('Car {0} has been inserted into car storage.'.format(data.Id));

                        // reset saving of next click
                        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
                        newSettings.viewstate.saveCar = undefined;
                        newSettings.configurationId = data.Id;
                        location.href = cfgManager.getUrlOfSettings(newSettings);
                        displayMiddleContent();
                    }, function () {
                        HtmlCc.Libs.Log.error('Car {0} failed to be inserted into car storage.'.format(data.Id));

                        // reset saving of next click
                        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
                        newSettings.viewstate.saveCar = undefined;
                        location.href = cfgManager.getUrlOfSettings(newSettings);
                        displayMiddleContent();
                    });
                });
            }, function () {
                // fail
                HtmlCc.Libs.Log.error('Car configuration save failed si car cannot be saved into car storage.'.format(data.Id));

                displayMiddleContent();

            }, settings.configurationId, settings.viewstate.insurance, true);
        } else {
            // no save, just display car storage
            // need to be run asynchronously because of IE DOM rendering 
            setTimeout(function () {
                displayMiddleContent();
            }, 5);

        }
    } else {
        $ccRoot.find('div.garage').remove();
    }
};

HtmlCc.Gui.Web.ConfigurationFinishSlider = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType && cfgManager != null)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    if (!(settings instanceof HtmlCc.Workflow.SettingsType && settings != null)) {
        throw new Error('Object settings is not instance of HtmlCc.Workflow.SettingsType.');
    }

    if (settings.view == 'step7') {
        if ($cc.data('finish-slider-displayed') !== true) {
            // RQDE98 - popup timeout
            var finishUpperSliderContentTimeout =
                cfgManager
                    .getConfigurator()
                    .getSalesProgramSetting('finishUpperSliderContentTimeout');

            //var sliderTimeout = parseInt('FinishUpperSliderContentTimeout'.resx());
            var sliderTimeout = parseInt(finishUpperSliderContentTimeout);
            if (sliderTimeout == NaN || sliderTimeout < 0) {
                sliderTimeout = 10000;
            }

            if (sliderTimeout > 0) {
                var $presentationBox = $ccRoot.find('div.presentation-box');

                $presentationBox.find('div.finish-slider').remove();
                $presentationBox.append('<div class="upper-notification-slider finish-slider"><div class="slider-content"></div></div>');

                var $slider = $presentationBox.find('div.upper-notification-slider');
                var $sliderContent = $slider.find('div.slider-content');

                $sliderContent.text('FinishUpperSliderContent'.resx());

                var contentHeight = $sliderContent.outerHeight();

                $slider.animate({
                    height: contentHeight
                }, 400, function () {
                    setTimeout(function () {
                        $slider.animate({
                            height: 0
                        }, 400, function () {
                            $slider.remove();
                        });
                    }, sliderTimeout);
                });
            }

            $cc.data('finish-slider-displayed', true);
        }
    } else {
        $cc.data('finish-slider-displayed', false);
    }

};

HtmlCc.Gui.Web.MultiplicityDialog = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $dialog = $ccRoot.find('div.dialog.multiplicity-dialog');
    if (settings.viewstate.multiplicityDialog === true) {
        if ($dialog.length == 0) {
            $ccRoot.append('<div class="dialog multiplicity-dialog tiny-size"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"><div class="form-wrapper"><form class="multiplicity-form"><div class="multiple-input-row"><div class="plus"></div><div class="minus"></div><input type="text" name="multiplicity" value="1" readonly="readonly" class="multiplicity-input" /><div class="terminator"></div></div><div class="submit-row"><input type="button" class="cancel skoda-grey-button" /><input type="button" class="submit skoda-green-button arrow-right"/></div></form></div></div><div class="dialog-waiting"></div></div></div>');
            $dialog = $ccRoot.find('div.dialog.multiplicity-dialog');
        }

        var $header = $dialog.find('div.dialog-header div.header-text');

        $header.text('MultiplicityDialogSelectQuantity'.resx());

        var $close = $dialog.find('a.close');
        var closeSettings = new HtmlCc.Workflow.SettingsType(settings);
        closeSettings.viewstate.multiplicityDialog = undefined;
        closeSettings.viewstate.multiplicityItem = undefined;
        $close.attr('href', cfgManager.getUrlOfSettings(closeSettings));

        var $form = $dialog.find('form.multiplicity-form');

        var $minus = $form.find('div.minus');
        var $plus = $form.find('div.plus');
        var $multiplicityInput = $form.find('input.multiplicity-input');

        var $cancel = $form.find('input.cancel');
        var $submit = $form.find('input.submit');

        $minus.text('-');
        $plus.text('+');

        $minus.bind('click.htmlcc', function () {
            var value = $multiplicityInput.val();
            var intVal = parseInt(value);
            if (intVal < 1 || intVal > 9 || intVal == NaN) {
                intVal = 1;
            }
            var newVal = intVal - 1;
            if (newVal > 9) {
                newVal = 9;
            }
            if (newVal < 1) {
                newVal = 1;
            }
            $multiplicityInput.val(newVal);
        });
        $plus.bind('click.htmlcc', function () {
            var value = $multiplicityInput.val();
            var intVal = parseInt(value);
            if (intVal < 1 || intVal > 9 || intVal == NaN) {
                intVal = 1;
            }
            var newVal = intVal + 1;
            if (newVal > 9) {
                newVal = 9;
            }
            if (newVal < 1) {
                newVal = 1;
            }
            $multiplicityInput.val(newVal);
        });

        $cancel.attr('value', 'MultiplicityDialogButtonCancel'.resx());
        $submit.attr('value', 'MultiplicityDialogButtonSubmit'.resx());

        $cancel.bind('click.htmlcc', function () {
            location.href = cfgManager.getUrlOfSettings(closeSettings);
            $dialog.remove();
        });

        $submit.bind('click.htmlcc', function () {
            var submitSettings = new HtmlCc.Workflow.SettingsType(settings);

            var multiplicity = parseInt($multiplicityInput.val());
            if (multiplicity == NaN) {
                multiplicity = 1;
            }

            submitSettings.addPackage('{0}({1})'.format(settings.viewstate.multiplicityItem, multiplicity));

            submitSettings.viewstate.multiplicityDialog = undefined;
            submitSettings.viewstate.multiplicityItem = undefined;

            location.href = cfgManager.getUrlOfSettings(submitSettings);
            $dialog.addClass('waiting');
        });
    } else {
        $dialog.remove();
    }
};

HtmlCc.Gui.Web.ServiceCareDialog = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $dialog = $ccRoot.find('div.dialog.service-care');

    if (settings.viewstate.displayServiceCareDialog === true) {
        if ($dialog.length == 0) {
            $ccRoot.append('<div class="dialog service-care middle-size"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"><div class="service-care-choose-label"></div><div class="service-care-selection"><form class="service-care-selection-form"></form></div></div><div class="dialog-waiting"></div></div></div>');
            $dialog = $ccRoot.find('div.dialog.service-care');
        }

        var $header = $dialog.find('div.dialog-header div.header-text');

        var $close = $dialog.find('a.close');
        var closeSettings = new HtmlCc.Workflow.SettingsType(settings);
        closeSettings.viewstate.displayServiceCareDialog = undefined;
        closeSettings.viewstate.serviceCare = undefined;
        $close.attr('href', cfgManager.getUrlOfSettings(closeSettings));

        var $content = $dialog.find('div.dialog-content');

        var configurator = cfgManager.getConfigurator();

        var motor = configurator.getConfiguredMotor();

        var skodaCareGroups = motor.getAvailableSkodaCareGroups();
        var group = null;
        $.each(skodaCareGroups, function () {
            var careGroup = this;

            if (careGroup.getId() == settings.viewstate.serviceCare) {
                group = careGroup;
            }
        });

        $header.text(group.getName());
        $dialog.find('div.service-care-choose-label').text('ServiceCareDialogChooseLabel'.resx());

        var $form = $dialog.find('form.service-care-selection-form');

        $.each(group.getPackages(), function () {
            var servicePackage = this;
            var thisRowId = HtmlCc.Libs.randomString(8);
            $form.append('<div class="input-row input-row-{0}" ><div class="service-care-price"></div><input id="{1}" type="radio" name="servicecarepackage" value="{0}"/> <label for="{1}"></label></div>'.format(servicePackage.getCode(), thisRowId));
            var $inputRow = $dialog.find('div.input-row-{0}'.format(servicePackage.getCode()));
            var $label = $inputRow.find('label');
            var $price = $inputRow.find('div.service-care-price');
            $price.text(servicePackage.getPriceString());
            var $input = $inputRow.find('#' + thisRowId);
            $.each(motor.getPackages(), function () {
                var selectedPackage = this;
                if (selectedPackage == servicePackage.getCode()) {
                    $input.attr('selected', 'selected');
                } else {
                    $input.attr('selected', undefined);
                }
            });
            $label.text(servicePackage.getName());
        });

        $form.append('<div class="submit-row"><input type="button" class="cancel skoda-grey-button" /> <input type="button" class="submit skoda-green-button arrow-right" /></div>');

        var $submitButton = $form.find('input.submit');
        var $cancelButton = $form.find('input.cancel');

        $submitButton.attr('value', 'SkodaCareDialogSubmit'.resx());
        $cancelButton.attr('value', 'SkodaCareDialogCancel'.resx());

        $cancelButton.bind('click.htmlcc', function () {
            var newConfiguration = new HtmlCc.Workflow.SettingsType(settings);
            newConfiguration.viewstate.displayServiceCareDialog = undefined;
            newConfiguration.viewstate.serviceCare = undefined;
            location.href = cfgManager.getUrlOfSettings(newConfiguration);
        });

        $submitButton.bind('click.htmlcc', function () {
            var selectedCode = $form.find('input:radio[name=servicecarepackage]:checked').val();
            if (selectedCode == null || selectedCode == '') {
                //$cancelButton.trigger('click.htmlcc');
            } else {
                var newConfiguration = new HtmlCc.Workflow.SettingsType(settings);
                newConfiguration.viewstate.displayServiceCareDialog = undefined;
                newConfiguration.viewstate.serviceCare = undefined;
                newConfiguration.addPackage(selectedCode);
                location.href = cfgManager.getUrlOfSettings(newConfiguration);
            }
        });

    } else {
        $dialog.remove();
    }
};

HtmlCc.Gui.Web.TechnicalDataList = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $dialog = $ccRoot.find('div.dialog.technical-data');

    if (settings.viewstate.displayTechnicalData === true) {
        if ($dialog.length == 0) {
            $ccRoot.append('<div class="dialog technical-data waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');
            $dialog = $ccRoot.find('div.dialog.technical-data');
        }

        var $header = $dialog.find('div.dialog-header div.header-text');
        $header.text('TechnicalDataListHeader'.resx());

        var $close = $dialog.find('a.close');
        var closeSettings = new HtmlCc.Workflow.SettingsType(settings);
        closeSettings.viewstate.displayTechnicalData = undefined;
        closeSettings.viewstate.displayTechnicalDataMotorId = undefined;
        $close.attr('href', cfgManager.getUrlOfSettings(closeSettings));

        var $content = $dialog.find('div.dialog-content');

        var configurator = cfgManager.getConfigurator();

        $.ajax({
            url: HtmlCc.Gui.Web.GetUrl('/ConfigureRefactored/TechnicalData'),
            data: {
                version: configurator.getVersion(),
                motorId: settings.viewstate.displayTechnicalDataMotorId,
                instanceId: configurator.getInstanceId(),
                salesProgramId: configurator.getSalesProgramId(),
                language: configurator.getCulture()
            },
            success: function (data) {
                if (data != null && $.isArray(data)) {
                    $content.html('<div class="technical-disclaimer"></div>');
                    $content.find('div.technical-disclaimer').append('TechnicalDisclaimer'.resx());

                    $.each(data, function () {
                        var dataGroup = this;
                        $content.append('<div class="technical-group technical-group-{0}"><div class="technical-header"></div><table class="technical-data"></table></div>'.format(dataGroup.Id));
                        var $group = $content.find('div.technical-group-{0}'.format(dataGroup.Id));
                        var $stdEqHeader = $group.find('div.technical-header');
                        var $table = $group.find('table.technical-data');

                        $stdEqHeader.text(dataGroup.Name);

                        $.each(dataGroup.Items, function () {
                            var thisItem = this;
                            $table.append('<tr class="technical-data-{0}"><td class="label"></td><td class="value"></td></tr>'.format(thisItem.Id));
                            var $tr = $table.find('tr.technical-data-{0}'.format(thisItem.Id));
                            var $label = $tr.find('td.label');
                            var $value = $tr.find('td.value');
                            $label.text(thisItem.Label);
                            $value.text(thisItem.Value);
                        });
                    });
                    if ('TechnicalDisclaimerBottom'.resx() != null && 'TechnicalDisclaimerBottom'.resx() != "") {
                        $content.addClass('with-bottom');
                        var $dialogBottom = $('<div class="dialog-bottom technical-disclaimer-bottom"></div>');
                        $dialogBottom.append('TechnicalDisclaimerBottom'.resx());
                        $content.after($dialogBottom);
                    }
                    $dialog.removeClass('waiting');
                } else {
                    $content.text('TechnicalDataListFailed'.resx());
                    $dialog.removeClass('waiting');
                }
            },
            error: function () {
                $content.text('TechnicalDataListFailed'.resx());
                $dialog.removeClass('waiting');
            },
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            timeout: 10000
        });
    } else {
        $dialog.remove();
    }
};

HtmlCc.Gui.Web.StandardEquipmentList = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $dialog = $ccRoot.find('div.dialog.standard-equipment');

    if (settings.viewstate.displayMoreEquipment === true) {
        if ($dialog.length == 0) {
            $ccRoot.append('<div class="dialog standard-equipment waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');
            $dialog = $ccRoot.find('div.dialog.standard-equipment');
        }

        var $header = $dialog.find('div.dialog-header div.header-text');
        $header.text('StandardEquipmentListHeader'.resx());

        var $close = $dialog.find('a.close');
        var closeSettings = new HtmlCc.Workflow.SettingsType(settings);
        closeSettings.viewstate.displayMoreEquipment = undefined;
        closeSettings.viewstate.displayMoreEquipmentId = undefined;
        $close.attr('href', cfgManager.getUrlOfSettings(closeSettings));

        var $content = $dialog.find('div.dialog-content');

        var configurator = cfgManager.getConfigurator();

        var currentEquipment = configurator.getConfiguredMotor().getEquipment().getModel().getEquipment(settings.viewstate.displayMoreEquipmentId);
        if (currentEquipment != null) {
            $.ajax({
                url: HtmlCc.Gui.Web.GetUrl('/ConfigureRefactored/StandardEquipments'),
                data: {
                    version: configurator.getVersion(),
                    motorId: currentEquipment.getDefaultMotorId(),
                    instanceId: configurator.getInstanceId(),
                    salesProgramId: configurator.getSalesProgramId(),
                    language: configurator.getCulture()
                },
                success: function (data) {
                    if (data != null && $.isArray(data)) {
                        $content.html('');
                        $.each(data, function () {
                            var dataGroup = this;
                            $content.append('<div class="standard-equipment-group standard-equipment-group-{0}"><div class="standard-equipment-header"></div><ul></ul></div>'.format(dataGroup.Id));
                            var $group = $content.find('div.standard-equipment-group-{0}'.format(dataGroup.Id));
                            var $stdEqHeader = $group.find('div.standard-equipment-header');
                            var $ul = $group.find('ul');

                            $stdEqHeader.text(dataGroup.Name);

                            $.each(dataGroup.Items, function () {
                                var thisItem = this;
                                $ul.append('<li class="std-eq-{0}"></li>'.format(thisItem.Id));
                                var $li = $ul.find('li.std-eq-{0}'.format(thisItem.Id));
                                $li.text(thisItem.Name);
                            });
                        });
                        $dialog.removeClass('waiting');
                    } else {
                        $content.text('StandardEquipmentListFailed'.resx());
                        $dialog.removeClass('waiting');
                    }
                },
                error: function () {
                    $content.text('StandardEquipmentListFailed'.resx());
                    $dialog.removeClass('waiting');
                },
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                timeout: 10000
            });
        } else {
            $content.text('StandardEquipmentListFailed'.resx());
            $dialog.removeClass('waiting');
        }
    } else {
        $dialog.remove();
    }
};
// displays financing setting box if needed
HtmlCc.Gui.Web.CopyrightNoteContent = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $dialog = $ccRoot.find('div.dialog.copyright-dialog');

    if (settings.viewstate.displayCopyright === true) {
        if ($dialog.length == 0) {
            $ccRoot.append('<div class="dialog copyright-dialog"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content external-html"></div></div></div>');
            $dialog = $ccRoot.find('div.dialog.copyright-dialog');
        }

        var $header = $dialog.find('div.dialog-header div.header-text');
        $header.text('CopyrightDialogHeader'.resx());

        var $close = $dialog.find('a.close');
        var closeSettings = new HtmlCc.Workflow.SettingsType(settings);
        closeSettings.viewstate.displayCopyright = undefined;
        $close.attr('href', cfgManager.getUrlOfSettings(closeSettings));

        var $content = $dialog.find('div.dialog-content');
        $content.html('CopyrightContentInHtml'.resx());
    } else {
        $dialog.remove();
    }

};

HtmlCc.Gui.Web.SendEmailBox = function ($cc, $ccRoot, cfgManager, settings) {

    if (settings.viewstate.displaySendemailDialog !== true) {
        $ccRoot.find('div.sendemail-dialog').remove();
        return;
    }

    $ccRoot.append('<div class="sendemail-dialog"><div class="dialog middle-size"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content sendemail"></div><div class="submit-bar"></div><div class="dialog-waiting"></div></div></div></div>');

    var $dialog = $ccRoot.find('div.sendemail-dialog');
    var $dialogInner = $dialog.find('div.dialog-inner');
    var $dialogHeaderText = $dialogInner.find('div.dialog-header div.header-text');
    var $dialogClose = $dialogInner.find('div.dialog-header a.close');
    var $dialogContent = $dialogInner.find('div.dialog-content');
    var $dialogDisclaimerContent = $dialogInner.find('div.dialog-disclaimer-content');
    var $dialogSubmitBar = $dialogInner.find('div.submit-bar');

    $dialogHeaderText.text('SendemailDialogHeader'.resx());
    $dialogClose.attr('title', 'FinancingDialogCloseIco'.resx());

    var closeSetting = new HtmlCc.Workflow.SettingsType(settings);

    closeSetting.viewstate.displaySendemailDialog = undefined;

    $dialogClose.attr('href', cfgManager.getUrlOfSettings(closeSetting));

    // clear dialog
    $dialogContent.html('');

    // draw products to select
    $dialogContent.html('<form id="email"><fieldset><div class="input-dialog"></div></fieldset></form>');

    var $form = $dialogContent.find('form');
    $form.submit(function () {
        return false;
    });
    var $inputDialog = $form.find('div.input-dialog');

    var $senderEmailInput, $recipientEmailInput, $subjectInput, $messageInput, $messageConditionCheckBox;;

    var addRow = function (itemId, valueText, labelText, isMultiline, isEmail, required, isCheckBox) {
        $inputDialog.append('<div class="dialog-raw" id="{0}" ><div class="raw-label"></div><div class="raw-input"></div><div class="terminator"></div></div>'.format(itemId));
        var $raw = $inputDialog.find('#' + itemId);
        $raw.attr('id', itemId);

        var inputId = 'id' + HtmlCc.Libs.randomString(8);

        var $rawLabel = $raw.find('div.raw-label');
        $rawLabel.append('<label for="{0}"></label>'.format(inputId));

        //if (isRequired) {
        //    $rawLabel.append('<em>*</em>');
        //}

        var $label = $rawLabel.find('label');
        if (isCheckBox != true)
        $label.text(labelText);

        var $rawInput = $raw.find('div.raw-input');

        if (isMultiline === true) {
            $rawInput.append('<textarea id="{0}" name="{0}" class="multiline"></textarea>'.format(inputId));
            return $rawInput.find('textarea');
        }
        else {
            if (isEmail === true) {
                $rawInput.append('<input id="{0}" name="{0}" type="email" class="{1} email" value="{2}" required/>'.format(inputId, required, valueText));
            }
            else if (isCheckBox == true) {
                $rawInput.append('<input id="{0}" name="{0}" class="required" type="checkbox" value="accepted" checked {1} />'.format(inputId, required));
                $rawInput.append('<br/>{0}'.format(valueText));
            }
            else if (isCheckBox == true) {
                $rawInput.append('<input id="{0}" name="{0}" class="required" type="checkbox" value="accepted" checked {1} />'.format(inputId, required));
                $rawInput.append('<br/>{0}'.format(valueText));
            }
            else {
                $rawInput.append('<input id="{0}" name="{0}" value="{2}" class="required" type="text" {1} />'.format(inputId, required, valueText));
            }
            return $rawInput.find('input');
        }
    };

    $senderEmailInput = addRow('senderEmail' + HtmlCc.Libs.randomString(8), 'SendemailDialogSenderDefaultEmail'.resx(), 'SendemailDialogSenderEmail'.resx(), false, true, 'required', false);
    $recipientEmailInput = addRow('recipientEmail' + HtmlCc.Libs.randomString(8), '', 'SendemailDialogRecipientEmail'.resx(), false, true, 'required', false);
    $subjectInput = addRow('subject' + HtmlCc.Libs.randomString(8), '', 'SendemailDialogSubject'.resx(), false, false, 'required', false);
    $messageInput = addRow('message' + HtmlCc.Libs.randomString(8), '', 'SendemailDialogMessage'.resx(), true, false, '', false);

    // OfflineCC version
    //$senderEmailInput = addRow('senderEmail' +HtmlCc.Libs.randomString(8), 'info@skoda-auto.cz', 'SendemailDialogSenderEmail'.resx(), false, true, 'required', false);
    //$recipientEmailInput = addRow('recipientEmail' +HtmlCc.Libs.randomString(8), '', 'SendemailDialogRecipientEmail'.resx(), false, true, 'required', false);
    //$subjectInput = addRow('subject' +HtmlCc.Libs.randomString(8), 'EmailSubject'.resx(), 'SendemailDialogSubject'.resx(), false, false, 'required', false);
    //$messageInput = addRow('message' +HtmlCc.Libs.randomString(8), '', 'SendemailDialogMessage'.resx(), true, false, '', false);
    //$messageConditionCheckBox = addRow('condition' +HtmlCc.Libs.randomString(8), 'SendemailDialogCondition'.resx(), '', false, false, 'required', true);

    $dialogSubmitBar.html('<input class="skoda-green-button arrow-right" type="button" />');
    var $buttonApply = $dialogSubmitBar.find('input');
    $buttonApply.attr('value', 'SendemailDialogButtonSend'.resx());

    $(document).ready(function () {
        $form.validate();
    });

    $buttonApply.bind('click.htmlcc', function () {
        if ($form.validate().form() === false) {
            return;
        }

        var emailSlider = function (messageResxName) {

            var $presentationBox = $ccRoot.find('div.presentation-box');

            $presentationBox.find('div.finish-slider').remove();
            $presentationBox.append('<div class="upper-notification-slider finish-slider"><div class="slider-content"></div></div>');

            var $slider = $presentationBox.find('div.upper-notification-slider');
            var $sliderContent = $slider.find('div.slider-content');

            $sliderContent.text(messageResxName.resx());

            // RQDE98 - popup timeout
            var finishUpperSliderContentTimeout =
                cfgManager
                    .getConfigurator()
                    .getSalesProgramSetting('finishUpperSliderContentTimeout');

            //var sliderTimeout = parseInt(finishUpperSliderContentTimeout);
            var sliderTimeout = parseInt(finishUpperSliderContentTimeout);
            if (sliderTimeout == NaN || sliderTimeout <= 0) {
                sliderTimeout = 10000;
            }

            var contentHeight = $sliderContent.outerHeight();

            $slider.animate({
                height: contentHeight
            }, 400, function () {
                setTimeout(function () {
                    $slider.animate({
                        height: 0
                    }, 400, function () {
                        $slider.remove();
                    });
                }, sliderTimeout);
            });

        };

        // apply current settings
        var newSettings = new HtmlCc.Workflow.SettingsType(settings);

        newSettings.viewstate.displaySendemailDialog = false;
        location.href = cfgManager.getUrlOfSettings(newSettings);
        cfgManager.sendConfigurationEmail(function (data) {

            SkodaAuto.Event.publish(
             "gtm.sentEmail",
             new SkodaAuto.Event.Model.GTMEventParams(
                  "LifeCC Configuration",
                  settings.view,
                  "Shared: Email",
                  {
                      context: cfgManager.getConfigurator().getCCContext(),
                      model: cfgManager.getConfigurator().getModelCodeShort(),
                      modelBody: cfgManager.getConfigurator().getModelCode(),
                      carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                      configurationId: settings.configurationId,
                      price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                  }
            ));
            SkodaAuto.Event.publish(
                              "event.sentEmail",
                              new SkodaAuto.Event.Model.EmailSentEvntParams(
                                      newSettings.instance,
                                    newSettings.salesprogram,
                                    newSettings.culture,
                                    newSettings.model,
                                    newSettings.carline,
                                    newSettings.view,
                                    $recipientEmailInput.val(),
                                    $senderEmailInput.val()));

            emailSlider('EmailOkUpperSliderContent');
        }, function () {
            emailSlider('EmailErrorUpperSliderContent');
        }, $subjectInput.val(), $senderEmailInput.val(), $recipientEmailInput.val(), $messageInput.val(), settings.viewstate.insurance
        );
    });
};

HtmlCc.Gui.Web.FacebookBox = function ($cc, $ccRoot, cfgManager, settings) {

    if (settings.viewstate.displayFacebookBox !== true) {
        $ccRoot.find('div.facebook-dialog').addClass('do-not-display');
        return;
    }

    var $dialog = $ccRoot.find('div.facebook-dialog');
    if ($dialog.length == 0) {
        $ccRoot.append('<div class="facebook-dialog"><div class="dialog facebook"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content facebook"></div><div class="dialog-waiting"></div></div></div></div>');
        $dialog = $ccRoot.find('div.facebook-dialog');
    }

    $dialog.removeClass('do-not-display');

    var $dialogInner = $dialog.find('div.dialog-inner');
    var $dialogHeaderText = $dialogInner.find('div.dialog-header div.header-text');
    var $dialogClose = $dialogInner.find('div.dialog-header a.close');
    var $dialogContent = $dialogInner.find('div.dialog-content');
    var $dialogDisclaimerContent = $dialogInner.find('div.dialog-disclaimer-content');
    //var $dialogSubmitBar = $dialogInner.find('div.submit-bar');

    $dialogHeaderText.text('FacebookDialogHeader'.resx());
    $dialogClose.attr('title', 'FinancingDialogCloseIco'.resx());

    var closeSetting = new HtmlCc.Workflow.SettingsType(settings);

    closeSetting.viewstate.displayFacebookBox = undefined;

    $dialogClose.attr('href', cfgManager.getUrlOfSettings(closeSetting));

    var $inputDialog = $dialogContent.find('div.input-dialog');

    if ($inputDialog.length == 0) {
        $dialogContent.append('<div class="input-dialog"></div>');
        $inputDialog = $dialogContent.find('div.input-dialog');
    //}

    //var $fbRoot = $inputDialog.find('div.fb-root');
    //if ($fbRoot.length == 0) {

        // <div class="fb-like" data-href="http://skoda-car-configurator.cloudapp.net/CZE/CZE/cs-CZ" data-send="true" data-width="450" data-show-faces="true"></div>

        var carCardUrl = $cc.find('a.finish-item.item-carcard').attr('href');
        $inputDialog.append('<div id="fb-root"></div>')
        //$inputDialog.append('<div class="fb-send" data-href="{0}" data-colorscheme="light"></div></div>'.format(carCardUrl))
        $inputDialog.append('<div class="fb-like"  data-href="{0}" data-send="true" data-width="250" data-show-faces="false" data-share="false"></div>'.format(carCardUrl));
        $inputDialog.append('<div class="fb-custom-share"><img src="/Content/images/fb_share.jpg" /></div>')

        window.fbAsyncInit = function () {
            FB.init({
                appId: cfgManager.getConfigurator().getFacebookId(), // App ID
                status: true, // check login status
                cookie: true, // enable cookies to allow the server to access the session
                xfbml: true  // parse XFBML
            });

            // Additional initialization code here
            FB.Event.subscribe('edge.create', function (targetUrl, w) {
                SkodaAuto.Event.publish(
                             "event.fbLike",
                             new SkodaAuto.Event.Model.EventParams(
                                  cfgManager.getConfigurator().getInstanceName(),
                                  cfgManager.getConfigurator().getSalesProgramName(),
                                  cfgManager.getConfigurator().getCulture(),
                                  cfgManager.getConfigurator().getModelCode(),
                                  cfgManager.getConfigurator().getCarlineCode(),
                                  settings.view));

                SkodaAuto.Event.publish(
                 "gtm.fbShare",
                 new SkodaAuto.Event.Model.GTMEventParams(
                      "LifeCC Configuration",
                      settings.view,
                      "FB Like",
                      {
                          context: cfgManager.getConfigurator().getCCContext(),
                          model: cfgManager.getConfigurator().getModelCodeShort(),
                          modelBody: cfgManager.getConfigurator().getModelCode(),
                          carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                          configurationId: settings.configurationId,
                          price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                      }
             ));
            });

            $(".fb-custom-share").click(function () {
                FB.ui({
                    method: 'share',
                    href: '{0}{1}'.format(window.location.host, carCardUrl),
                }, function (r) {
                SkodaAuto.Event.publish(
                             "event.fbShare",
                             new SkodaAuto.Event.Model.EventParams(
                                  cfgManager.getConfigurator().getInstanceName(),
                                  cfgManager.getConfigurator().getSalesProgramName(),
                                  cfgManager.getConfigurator().getCulture(),
                                  cfgManager.getConfigurator().getModelCode(),
                                  cfgManager.getConfigurator().getCarlineCode(),
                                  settings.view));

                    SkodaAuto.Event.publish(
                 "gtm.fbShare",
                 new SkodaAuto.Event.Model.GTMEventParams(
                      "LifeCC Configuration",
                      settings.view,
                      "FB Share",
                      {
                          instanceName: settings.instance,
                          salesProgramName: settings.salesprogram,
                          culture: settings.culture,
                          context: cfgManager.getConfigurator().getCCContext(),
                          model: cfgManager.getConfigurator().getModelCodeShort(),
                          modelBody: cfgManager.getConfigurator().getModelCode(),
                          carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                          configurationId: settings.configurationId,
                          price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                          extraEq: settings.packages
                      }
                 ));

                });
                SkodaAuto.Event.publish(
                "gtm.fbShare",
                new SkodaAuto.Event.Model.GTMEventParams(
                  "LifeCC Configuration",
                  settings.view,
                  "FB Share",
                  {
                      context: cfgManager.getConfigurator().getCCContext(),
                      model: cfgManager.getConfigurator().getModelCodeShort(),
                      modelBody: cfgManager.getConfigurator().getModelCode(),
                      carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                      configurationId: settings.configurationId,
                      price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                  }
                ));
            });
        };

        var initFacebook = function (d) {
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            ref.parentNode.insertBefore(js, ref);
        };

        initFacebook(document);
    }
};

// displays financing setting box if needed
HtmlCc.Gui.Web.FinancingBox = function ($cc, $ccRoot, cfgManager, settings, variant) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='variant' type='String'>"financing" | "insurance"</param>
    /// </signature>
    var settingsForms = new HtmlCc.Financial.Ui.SettingsForm($cc, $ccRoot, cfgManager);
    settingsForms.createFinancingForm(variant, settings);

};

// displays accessories popoup window setting box if needed
HtmlCc.Gui.Web.AccessoriesPopupWindow = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='variant' type='String'>"financing" | "insurance"</param>
    /// </signature>
   
    if (cfgManager.getConfigurator().getSalesProgramSetting("showAccessoriesPopupWindow") == "true") {
        //var newsettings = new HtmlCc.Workflow.SettingsType(settings);
        //newsettings.viewstate.accessoriesPopupWindow = true;
        //newsettings.viewstate.accessoriesItems = [];
        //newsettings.viewstate.selectedAccessories = [];
        //newsettings.viewstate.accessoriesItems.push("GYD1YD1");
        //var $button = $('.acessories-button')
        //if ($button.length == 0) {
        //    $button = '<a href={0} class="acessories-button">show accesories window</a>'.format(cfgManager.getUrlOfSettings(newsettings));
        //    $ccRoot.after($button);
        //}
        //else {
        //    $button.attr("href", cfgManager.getUrlOfSettings(newsettings));
        //}

    var popupWindow = new HtmlCc.Accessories.Ui.PopupWindow($cc, $ccRoot, cfgManager);
    popupWindow.showWindow(settings);
    }
    
};

// displays recommended popoup window setting box if needed
HtmlCc.Gui.Web.RecommendedPopupWindow = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='variant' type='String'>"financing" | "insurance"</param>
    /// </signature>
    var popupWindow = new HtmlCc.RecommendedEq.Ui.PopupWindow($cc, $ccRoot, cfgManager);
    popupWindow.createRecommendedDialogWindow(settings);
};

// displays configuration box of configurator
HtmlCc.Gui.Web.ConfigurationBox = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $cfgBox = $ccRoot.find('div.cfg-box');
    if ($cfgBox.length == 0) {
        $ccRoot.append('<div class="cfg-box"></div>');
        $cfgBox = $ccRoot.find('div.cfg-box');
    }
    HtmlCc.Gui.Web.ModelLabel($cc, $cfgBox, cfgManager, settings);
    HtmlCc.Gui.Web.ConfigurationContentHeader($cc, $cfgBox, cfgManager, settings);
    HtmlCc.Gui.Web.ConfigurationContent($cc, $cfgBox, cfgManager, settings);
    HtmlCc.Gui.Web.ConfigurationFooter($cc, $cfgBox, cfgManager, settings);
};
// displays model label in configuration box
HtmlCc.Gui.Web.ModelLabel = function ($cc, $cfgBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $modelLabel = $cfgBox.find('div.model-label');
    if ($modelLabel.length == 0) {
        $cfgBox.append('<div class="model-label"><a class="home" ></a></div>');
        $modelLabel = $cfgBox.find('div.model-label');
        if ($cc.hasClass('dealer')) {
            if ($('body').hasClass('digitall')) {
                $cfgBox.find('a.home').attr('href', cfgManager.getConfigurator().getDealerConfiguratorHomepageUrl() + "?digitall=true");
            }
            else {
            $cfgBox.find('a.home').attr('href', cfgManager.getConfigurator().getDealerConfiguratorHomepageUrl());
        }
        }
        else {
            if ($('body').hasClass('digitall')) {
                $cfgBox.find('a.home').attr('href', cfgManager.getConfigurator().getConfiguratorHomepageUrl() + "?digitall=true");
            }
        else {
        $cfgBox.find('a.home').attr('href', cfgManager.getConfigurator().getConfiguratorHomepageUrl());
    }
    }

    }

    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    var model = motor.getEquipment().getModel();

    // RQDE99 - remove model info
    var removeModelInfo =
        (cfgManager
            .getConfigurator()
            .getSalesProgramSetting('removeModelInfo') === 'true');

    var $modelLabelPadding = $modelLabel.find('div.model-label-padding');
    if ($modelLabelPadding.length == 0) {
        $modelLabel.append('<div class="model-label-padding{0}"></div>'.format(removeModelInfo ? " hide" : ""));
        $modelLabelPadding = $modelLabel.find('div.model-label-padding');

        if (!removeModelInfo) {
            var hideModelImage =
                cfgManager
                    .getConfigurator()
                    .getSalesProgramSetting('hideModelPopupImage');

            HtmlCc.Gui.Web.HoverBoxWithTimeout(
                $cc,
                settings,
                cfgManager,

                $modelLabelPadding,
                model.getImage().getUrl(),
                model.getName(),
                model.getDescription() != null ? model.getDescription().replace('%#PRICE#%', model.getPriceFromString()) : '',
                null, null, null, null, hideModelImage === 'true');
        }
    }

    var correctModelNameLength = function () {
        var isNotSuitable = true;
        var modelName = model.getName();
        var i = 1;
        while (isNotSuitable && i < 360) {
            $modelLabelPadding.text(modelName);
            var $modelLabelPaddingWidth = $modelLabelPadding.width();
            if ($modelLabelPaddingWidth > 360) {
                modelName = model.getName().substring(0, model.getName().length - i - 3) + '...';
                $modelLabelPadding.text(modelName);
                i++;
                continue;
            }

            isNotSuitable = false;
        }
    }();
};
// displays configuration content in configuration box
HtmlCc.Gui.Web.ConfigurationContent = function ($cc, $cfgBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $cfgContent = $cfgBox.find('div.cfg-content');
    if ($cfgContent.length == 0) {
        $cfgBox.append('<div class="cfg-content"></div>');
        $cfgContent = $cfgBox.find('div.cfg-content');
    }

    var stepName = settings.view;
    switch (stepName) {
        case 'step1':
            HtmlCc.Gui.Web.ConfigurationContentEquipment($cc, $cfgContent, cfgManager, settings);
            break;
        case 'step2':
            HtmlCc.Gui.Web.ConfigurationContentMotor($cc, $cfgContent, cfgManager, settings);
            break;
        case 'step3':
            HtmlCc.Gui.Web.ConfigurationContentColor($cc, $cfgContent, cfgManager, settings);
            break;
        case 'step4':
            HtmlCc.Gui.Web.ConfigurationContentInterior($cc, $cfgContent, cfgManager, settings);
            break;
        case 'step5':
            HtmlCc.Gui.Web.ConfigurationContentExtra($cc, $cfgContent, cfgManager, settings);
            break;
        case 'step6':
            HtmlCc.Gui.Web.ConfigurationInsurance($cc, $cfgContent, cfgManager, settings);
            break;
        case 'step7':
            HtmlCc.Gui.Web.ConfigurationFinish($cc, $cfgContent, cfgManager, settings);
            break;
        default:
            $cfgContent.text('!FIXME!');
    }
};
HtmlCc.Gui.Web.ConfigurationContentEquipment = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var selectedEquipment = null;
    var selectedEquipmentId = null;
    var selectedMotor = null;
    var selectedMotorId = null;

    var model = cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getModel();
    var configurator = cfgManager.getConfigurator();
    var equipments = model.getEquipments();

    selectedMotorId = parseInt(settings.motor);
    if (!(selectedMotorId > 0)) {
        selectedMotorId = null;
    } else {
        for (var i = 0; i < equipments.length; i++) {
            selectedMotor = equipments[i].getMotorLookup(selectedMotorId);
            if (selectedMotor != null) {
                break;
            }
        }
    }

    if (selectedMotor != null) {
        selectedEquipment = selectedMotor.getEquipment();
        selectedEquipmentId = selectedEquipment.getId();
    } else {
        selectedEquipmentId = parseInt(settings.equipment);
        if (!(selectedEquipmentId > 0)) {
            // equipment is not defined at all, using the fedault one
            selectedEquipmentId = model.getDefaultEquipmentId();

        }
        selectedEquipment = model.getEquipment(selectedEquipmentId);
    }

    var $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-equipment');
    if ($cfgContentWrapper.length == 0) {
        $cfgContent.parent().removeClass('separated');
        $cfgContent.parent().find('.border-box').remove();
        $cfgContent.find('div.cfg-content-wrapper').remove(); // removes content that is not applicable for this step
        $cfgContent.append('<div class="cfg-content-wrapper cfg-content-wrapper-equipment"><div class="cfg-content-wrapper-terminator"></div></div>');
        $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-equipment');
    }
    var $cfgContentWrapperTerminator = $cfgContentWrapper.find('div.cfg-content-wrapper-terminator');

    // RQDE01
    var directShowEquipment =
        (cfgManager
            .getConfigurator()
            .getSalesProgramSetting('directShowEquipment') === 'true');

    for (var i = 0; i < equipments.length; i++) {
        var equipment = equipments[i];

        var $equipmentTile = $cfgContentWrapper.find('a.equipment-tile.equipment-{0}'.format(equipment.getId()));
        if ($equipmentTile.length == 0) {
            $cfgContentWrapperTerminator.before('<a class="tile equipment-tile equipment-{0}" data-default-motor-id="{1}" data-id="{2}"><div class="active-ico"></div><div class="info-ico"></div><div class="equipment-label tile-label middle-center"></div><div class="price-label"></div></a>'.format(equipment.getId(), equipment.getDefaultMotorId(), equipment.getCode()));
            $equipmentTile = $cfgContentWrapper.find('a.equipment-tile.equipment-{0}'.format(equipment.getId()));
            var $priceLabel = $equipmentTile.find('div.price-label');

            // bind an event that displays loading icon if it is clicked
            $equipmentTile.bind('click.htmlcc', function () {
                if (!$(this).hasClass('active')) {
                    $cfgContentWrapper.find('a.equipment-tile').removeClass('loading');
                    $(this).addClass('loading');
                }
            });

            // find the cheapest motor in that equipment
            var cheapestLookup = null;
            var lookups = equipment.getMotorLookups();
            $.each(lookups, function (k, lookup) {
                if (cheapestLookup == null || cheapestLookup.getPrice() > lookup.getPrice()) {
                    cheapestLookup = lookup;
                }
            });
            if (cheapestLookup != null) {

                var priceFrom = '{0}'.format("PriceFromMotor".resx());
                if (priceFrom != "PriceFromMotor" && priceFrom != "null" && cfgManager.getConfigurator().getSalesProgramSetting("showPriceFrom") == "true") {
                    $priceLabel.text(('{0} {1}'.format(priceFrom, cheapestLookup.getPriceString())));
                }
                else {
                $priceLabel.text(cheapestLookup.getPriceString());
            }
                $equipmentTile.attr("data-item-price", cheapestLookup.getPriceString());
        }
        }

        var $infoIco = $equipmentTile.find('div.info-ico');
        var newSettingsMoreEquipment = new HtmlCc.Workflow.SettingsType(settings);
        newSettingsMoreEquipment.viewstate.displayMoreEquipment = true;
        newSettingsMoreEquipment.viewstate.displayMoreEquipmentId = equipment.getId();

        var showBasicEquipment =
            cfgManager
                .getConfigurator()
                .getSalesProgramSetting('showBasicEquipment');

        // RQDE01
        if (directShowEquipment) {
            $infoIco.html("<a class='info-ico-anchor' href='" + cfgManager.getUrlOfSettings(newSettingsMoreEquipment) + "'></a>");
        } else {
            var params = cfgManager.getParamsByStepName('step1');
            var motor = null;
            var currentMotor = null;
            var motorId = params.motorId;

            if (motorId > 0) {
                // fill with simple motor
                currentMotor = configurator.getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
            }
            if (currentMotor == null || (settings.view != 'step1')) {
                currentMotor = configurator.getConfiguredMotor();
            }
            if ($cc.hasClass('tablet')) {
                $infoIco.bind('click.htmlcc', function (evt) {
                    var itemId = $(this).parent().data("id");
                    HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, currentMotor, settings.view, itemId,
                        {
                            equipment: itemId,
                            itemPrice: $(this).parent().find('.price-label').text()
                        });
                });
            }
            else {
                var timer;
                var delay = 1000;
                $infoIco.unbind();
                $infoIco.hover(function (el) {
                    var itemId = $(this).parent().data("id");
                    var itemPrice = $(this).parent().data("item-price");
                    timer = setTimeout(function () {                        
                        HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, currentMotor, settings.view, itemId,
                            {
                                equipment: itemId,
                                itemPrice: itemPrice
                            });
                    }, delay);
                }, function () {
                    // on mouse out, cancel the timer
                    clearTimeout(timer);
                });
                 
            }

          

            HtmlCc.Gui.Web.HoverBoxWithTimeout(
                $cc,
                settings,
                cfgManager,
                $infoIco,
                equipment.getImage().getUrl(),
                equipment.getName(),
                equipment.getDescription(),
                equipment.getMotorLookup(equipment.getDefaultMotorId()).getPriceString(),
                'BasicEquipmentLinkLabel'.resx(),
                showBasicEquipment === 'true' ? cfgManager.getUrlOfSettings(newSettingsMoreEquipment) : null);
        }

        // remove any loading icons
        $equipmentTile.removeClass('loading');

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.color = '';
        newSettings.equipment = equipment.getId();
        newSettings.interior = '';
        newSettings.motor = '';
        newSettings.packages = '';
        newSettings.view = 'step1';
        newSettings.viewstate.itemClicked = {};
        newSettings.viewstate.itemClicked.price = $equipmentTile.find('.price-label').text();
        newSettings.viewstate.itemClicked.id = equipment.getCode();
        newSettings.viewstate.itemClicked.type = 'equipment';
        newSettings = cfgManager.clearViewStateAccessories(newSettings);
        $equipmentTile.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $equipmentTile.unbind('click.htmlcc');
        $equipmentTile.bind('click.htmlcc', function () {
            var isClear = cfgManager.isClearNextSteps('step1');
            cfgManager.clearNextSteps('step1');
            
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: currentMotor.getPriceString(),
                           //equipment: currentMotor.getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
            }

        });

        if (equipment.getId() == selectedEquipmentId) {
            $equipmentTile.addClass('active');
        } else {
            $equipmentTile.removeClass('active');
        }
        var $label = $equipmentTile.find('div.equipment-label');
        $label.text(equipment.getName());
        if ($cc.hasClass('tablet')) {
            $label.css('top', ($equipmentTile.innerHeight() - 35 - ($label.innerHeight())) / 2);
        } else {
            $label.css('top', ($equipmentTile.innerHeight() - 50 - ($label.innerHeight())) / 2);
        }
    }
};
HtmlCc.Gui.Web.ConfigurationContentMotor = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var model = cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getModel();
    var motorId = settings.motor;
    var motor = null;
    var equipment = null;
    var equipments = model.getEquipments();

    if (motorId > 0) {
        for (var i = 0; i < equipments.length; i++) {
            motor = equipments[i].getMotorLookup(motorId);
            if (motor != null) {
                break;
            }
        }
    }

    if (motor == null) {
        var equipmentId = settings.equipment;
        if (equipmentId > 0) {
            equipment = model.getEquipment(equipmentId);
        }
        if (equipment == null) {
            equipment = model.getEquipment(model.getDefaultEquipmentId());
        }
        motor = equipment.getMotorLookup(equipment.getDefaultMotorId());
    }

    var motorLookups = motor.getEquipment().getMotorLookups();

    // fill fuel selector box
    var $fuelSelector = $cc.find('div.cfg-box div.cfg-content-header div.fuel-selector select.fuel-selector-select');

    if ($fuelSelector.length == 1) {
        var fuelToSelect = {};
        $.each(motorLookups, function () {
            var mot = this;

            fuelToSelect[mot.getFuelType().name] = mot.getFuelNameTranslated();
        });

        $fuelSelector.append('<option class="default" value="-1"></option>');
        $fuelSelector.find('option.default').text('FuelSelectorDefaultItem'.resx());

        $.each(fuelToSelect, function (fuelKey) {
            var fuel = this;
          
            $fuelSelector.append('<option class="fuel-{0}" value="-1"></option>'.format(fuelKey));

            var $thisFuelOption = $fuelSelector.find('option.fuel-{0}'.format(fuelKey));
            $thisFuelOption.attr('value', fuelKey);
            $thisFuelOption.text(fuel);

            if (settings.viewstate.fuelFilter == fuelKey) {
                $thisFuelOption.attr('selected', 'selected');
            }
        });

        // ugly hack for bad IE8 rendering mode  
        $fuelSelector.append('<option class="ie-8hack-item" value="test"></option>');
        $fuelSelector.find("option.ie-8hack-item").remove();

        $fuelSelector.bind('change.htmlcc', function () {
            var value = $(this).val();
            var newSettings = new HtmlCc.Workflow.SettingsType(settings);
            if (value == -1) {
                newSettings.viewstate.fuelFilter = undefined;
            } else {
                newSettings.viewstate.fuelFilter = value;
            }
            location.href = cfgManager.getUrlOfSettings(newSettings);
        });

        if ($fuelSelector.find('option').length <= 2) {
            // there is no need to display fuel option
            $fuelSelector.remove();
        }
    }

    var $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-motor');
    if ($cfgContentWrapper.length == 0) {
        $cfgContent.parent().removeClass('separated');
        $cfgContent.parent().find('.border-box').remove();
        $cfgContent.find('div.cfg-content-wrapper').remove(); // removes content that is not applicable for this step
        $cfgContent.append('<div class="cfg-content-wrapper cfg-content-wrapper-motor"><div class="cfg-content-wrapper-terminator"></div></div>');
        $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-motor');
    }
    var $cfgContentWrapperTerminator = $cfgContentWrapper.find('div.cfg-content-wrapper-terminator');

    // RQDE03
    var directShowTechData =
    (cfgManager
        .getConfigurator()
        .getSalesProgramSetting('directShowTechData') === 'true');

    // clear all content inside to have always clear and sorted view
    $cfgContentWrapper.find('a.motor-tile').remove();

    for (var i = 0; i < motorLookups.length; i++) {
        var motorLookup = motorLookups[i];

        if (settings.viewstate.fuelFilter != null && settings.viewstate.fuelFilter != motorLookup.getFuelType().name) {
            // skip this motor, it do not match fuel filter

            // remove motor tile, it it is already rendered
            $cfgContentWrapper.find('a.motor-tile.motor-{0}'.format(motorLookup.getId())).remove();
            continue;
        }

        var $motorTile = $cfgContentWrapper.find('a.motor-tile.motor-{0}'.format(motorLookup.getId()));
        if ($motorTile.length == 0) {
            $cfgContentWrapperTerminator.before('<a class="tile motor-tile motor-{0}" data-id="{0}"><div class="active-ico"></div><div class="motor-label label"></div><div class="power-label label"></div><div class="gearbox-label label"></div><div class="engine-type-label label"></div><div class="fuel-label label"></div><div class="price-label label"></div><div class="info-ico"></div></a>'.format(motorLookup.getId(motorLookup.getId())));
            $motorTile = $cfgContentWrapper.find('a.motor-tile.motor-{0}'.format(motorLookup.getId()));

            // bind an event that displays loading icon if it is clicked
            $motorTile.bind('click.htmlcc', function () {
                if (!$(this).hasClass('active')) {
                    $cfgContentWrapper.find('a.motor-tile').removeClass('loading');
                    $(this).addClass('loading');
                }
            });

            var $infoIco = $motorTile.find('div.info-ico');

            var newTechnicalDataLink = new HtmlCc.Workflow.SettingsType(settings);
            newTechnicalDataLink.viewstate.displayTechnicalData = true;
            newTechnicalDataLink.viewstate.displayTechnicalDataMotorId = motorLookup.getId();
            // RQDE03
            if (directShowTechData) {
                $infoIco.html("<a class='info-ico-anchor' href='" + cfgManager.getUrlOfSettings(newTechnicalDataLink) + "'></a>");
            }

            var simpleMotor = cfgManager.getConfigurator().getSimpleMotor(motorLookup.getId(), settings.color, settings.interior, settings.getPackagesArray());
            var hoverDescription = null;
            var hoverImage = null;
            if (simpleMotor != null) {
                hoverDescription = simpleMotor.getDescription();
                if (simpleMotor.getImage() != null) { // a bugfix of error somewhere
                    hoverImage = simpleMotor.getImage().getUrl();
                }

                // RQDE03
                if (!directShowTechData) {
                    var showTechData =
                      cfgManager
                          .getConfigurator()
                          .getSalesProgramSetting('showTechData');

                    HtmlCc.Gui.Web.HoverBoxWithTimeout(
                        $cc,
                        settings,
                        cfgManager,
                        $infoIco,
                        hoverImage,
                        motorLookup.getName(),
                        hoverDescription,
                        motorLookup.getPriceString(),
                        'TechnicalDataLinkLabel'.resx(),
                        showTechData === 'true' ? cfgManager.getUrlOfSettings(newTechnicalDataLink) : null);
                }
            } else {
                //HtmlCc.Libs.Log.log('Simple motor is not exists {0}'.format(motorLookup.getId()));
                // simple motor is not ready yet, but it is just prepairing... wait a few moment and try to bind the hover box later
                var tryItBindLater = function ($cc, cfgManager, $infoIco, motorId, colorCode, interiorCode, packageArray, priceString) {
                    // yes, it is very ugly solution but it works for now; the better solution is adding 
                    // a handler when simple motor is filled - the sound of future
                    var intervalHandler = setInterval(function () {
                        //HtmlCc.Libs.Log.log('Checking existence of simple motor {0}'.format(motorId));
                        var newSimpleMotor = cfgManager.getConfigurator().getSimpleMotor(motorId, colorCode, interiorCode, packageArray);
                        if (newSimpleMotor != null) {
                            HtmlCc.Gui.Web.HoverBoxWithTimeout($cc, settings, cfgManager, $infoIco, newSimpleMotor.getImage().getUrl(), newSimpleMotor.getName(), newSimpleMotor.getDescription(), priceString);
                            //HtmlCc.Libs.Log.log('I have found simple motor {0}'.format(motorId));
                            clearInterval(intervalHandler);
                        }
                    }, 300);
                };
                tryItBindLater($cc, cfgManager, $infoIco, motorLookup.getId(), settings.color, settings.interior, settings.getPackagesArray(), motorLookup.getPriceString());
            }
        }
        if ($cc.hasClass('tablet')) {
            $infoIco.bind('click.htmlcc', function (evt) {
                var itemId = $(this).parent().data("id");
                HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                    {
                        engine: itemId,
                        itemPrice: $(this).parent().find('.price-label').text()
                    });
            });
        }
        else {
            var timer;
            var delay = 1000;
            $infoIco.hover(function (el) {
               var itemId = $(this).parent().data("id");
               var itemPrice = $(this).parent().data('item-price');
                timer = setTimeout(function () {                   
                    HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                        {
                            engine: itemId,
                            itemPrice: itemPrice
                        });
                }, delay);
            }, function () {
                // on mouse out, cancel the timer
                clearTimeout(timer);
            });
        }

        // remove any loading icons
        $motorTile.removeClass('loading');

        //var nextParams = new HtmlCc.Api.Configurator.ConfigurationParams(motorLookup.getId(), settings.color, settings.interior, settings.packages);
        //$motorTile.attr('href', cfgManager.getUrlOfParams('step2', nextParams));

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        var extraPackages = newSettings.packages;
        newSettings.color = '';
        newSettings.equipment = '';
        newSettings.interior = '';
        newSettings.motor = motorLookup.getId();
        newSettings.packages = '';
        newSettings.view = 'step2';
        newSettings = cfgManager.clearViewStateAccessories(newSettings);

        newSettings.viewstate.itemClicked = {};
        newSettings.viewstate.itemClicked.price = motorLookup.getPriceString();
        newSettings.viewstate.itemClicked.id = motorLookup.getId();
        newSettings.viewstate.itemClicked.type = 'motor';

        $motorTile.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $motorTile.bind('click.htmlcc', function () {

            var isClear = cfgManager.isClearNextSteps('step2');
            cfgManager.clearNextSteps('step2');
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: extraPackages
                       }));
            }
            
        });

        if (motor.getId() == motorLookup.getId()) {
            $motorTile.addClass('active');
        } else {
            $motorTile.removeClass('active');
        }

        var $motorLabel = $motorTile.find('div.motor-label');
        var $powerLabel = $motorTile.find('div.power-label');
        var $gearboxLabel = $motorTile.find('div.gearbox-label');
        var $fuelLabel = $motorTile.find('div.fuel-label');
        var $priceLabel = $motorTile.find('div.price-label');
        var $engineType = $motorTile.find('div.engine-type-label');

        $motorLabel.text(motorLookup.getShortName());
        $powerLabel.text('{0} {1}'.format(motorLookup.getPower(), "MotorPowerUnit".resx()));
        $gearboxLabel.text(motorLookup.getGearboxLabel());
        $fuelLabel.text(motorLookup.getFuelNameTranslated());
        //$fuelLabel.prepend('<span class="bullet bullet-{0}">&#8226;</span>'.format(motorLookup.getFuelType().name));
        $fuelLabel.prepend('<span class="bullet bullet-{0}">&#8226;</span>'.format(motorLookup.getFuelType().name));
       
        var priceFrom = '{0}'.format("PriceFromMotor".resx());
        if (priceFrom != "PriceFromMotor" && priceFrom != "null") {
            $priceLabel.text(('{0} {1}'.format(priceFrom, motorLookup.getPriceString())));
       }
        else {
        $priceLabel.text(motorLookup.getPriceString());
       }
        $motorTile.attr("data-item-price", motorLookup.getPriceString());
        if (cfgManager.getConfigurator().getSalesProgramSetting("showEngineTypeOnStep2") == 'true') {
            $motorTile.parent().addClass('engine-type-displayed')
            var engineType = motorLookup.getEngineType() == null ? "" : motorLookup.getEngineType()
            $engineType.text(engineType);
        }
    }

    // ensure that motor is at displayed relation
    //if ($cfgContentWrapper.find('a.motor-tile.active').length == 0) {
    //    //location.href = $cfgContentWrapper.find('a.motor-tile:first').attr('href');
    //    var $firstMotor = $cfgContentWrapper.find('a.motor-tile:first');
    //    location.href = $firstMotor.attr('href');
    //    $firstMotor.trigger('click');
    //}

};
HtmlCc.Gui.Web.ConfigurationContentColor = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-exterior');
    if ($cfgContentWrapper.length == 0) {
        $cfgContent.find('div.cfg-content-wrapper').remove(); // removes content that is not applicable for this step
        $cfgContent.append('<div class="cfg-content-wrapper cfg-content-wrapper-exterior"></div>');
        $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-exterior');
    }
    HtmlCc.Gui.Web.ColorWheelSelecter($cc, $cfgContent, cfgManager, settings);
    HtmlCc.Gui.Web.ColorPicker($cc, $cfgContentWrapper, cfgManager, settings);
    HtmlCc.Gui.Web.WheelPicker($cc, $cfgContentWrapper, cfgManager, settings);

    if ($cc.hasClass('tablet')) {
        var height = 40;
        height += $cfgContentWrapper.find('.basic-color-picker').height();
        height += $cfgContentWrapper.find('.metalic-color-picker').height();
        height += $cfgContentWrapper.find('.roof-color-picker').height();
        height += $cfgContentWrapper.find('.fleet-color-picker').height();
        $cfgContentWrapper.css('height', height);
    }

};
HtmlCc.Gui.Web.WheelPicker = function ($cc, $cfgContentWrapper, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContentWrapper' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    $cfgContentWrapper.find('div.wheel-picker').remove();

    $cfgContentWrapper.append('<div class="wheel-picker"><div class="wheel-picker-header"></div><div class="wheels-to-pick"><div class="terminator"></div></div></div>');
    var $wheelPicker = $cfgContentWrapper.find('div.wheel-picker');

    $wheelPicker.find('div.wheel-picker-header').text('WheelHeader'.resx());

    var availableWheels = motor.getAvailableWheels();

    // build wheel picker
    var $terminator = $wheelPicker.find('div.wheels-to-pick div.terminator');
    for (var i = 0; i < availableWheels.length; i++) {
        var wheel = availableWheels[i];

        //if (wheel.isSelectable() === false) {
        //    continue;
        //}

        var $wheel = $wheelPicker.find('a.wheel-{0}'.format(wheel.getCode()));
        if ($wheel.length == 0) {
            $terminator.before('<a data-wheel-code="{0}" data-wheel-price="{1}" class="wheel-to-pick wheel-{0}"><div class="active-icon"></div><div class="disabled-layer"></div><div class="info-ico"></div><div class="price-label"></div></a>'.format(wheel.getCode(), wheel.getPriceString()));
            $wheel = $wheelPicker.find('a.wheel-{0}'.format(wheel.getCode()));

            // wheel disabling - temporary unused
            if (wheel.isSelectable() === false) {
                $wheel.addClass("non-selectable");
            }
            $wheel.find('div.disabled-layer').click(function (evt) {
                evt.preventDefault();
                return false;
            });

            // bind onclick event to display a loading icon
            $wheel.bind('click.htmlcc', function () {
                if (!$(this).hasClass('active')) {
                    $wheelPicker.find('a.wheel-to-pick').removeClass('loading');
                    $(this).addClass('loading');
                }
            });

            // bind hover event
            var wheelUrl = null;
            if (wheel.getImage() != null) {
                wheelUrl = wheel.getImage().getUrl();
            }

            $wheel.find('div.info-ico').attr('title', '{0} - {1}'.format(wheel.getName(), wheel.getPriceString()));
            
        }

        // remove any of loading icons
        $wheel.removeClass('loading');

        var $priceLabel = $wheel.find('div.price-label');

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        // remove all packages and let only the wheel
        if (wheel.isFromStandardEquipment() !== true) {
            newSettings.packages = wheel.getCode();
        } else {
            newSettings.packages = '';
        }
        newSettings = cfgManager.clearViewStateAccessories(newSettings);

        newSettings.viewstate.itemClicked = {};
        newSettings.viewstate.itemClicked.price = wheel.getPriceString();
        newSettings.viewstate.itemClicked.id = wheel.getCode();
        newSettings.viewstate.itemClicked.type = 'wheel';


        $wheel.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $wheel.bind('click.htmlcc', function () {
                       
            var isClear = cfgManager.isClearNextSteps('step3');
            
            
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
            }
            cfgManager.clearNextSteps('step3');
        });
        $priceLabel.text(wheel.getPriceString());

        newSettings.color = '9P9P';
        newSettings.equipment = '';
        //$wheel.css('background-image', 'url({0})'.format(HtmlCc.Gui.ImgSrcBuilder(cfgManager.getConfigurator(), newSettings, 'Wheel')));
        $wheel.css('background-image', 'url({0})'.format(HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), newSettings, 'Wheel', 'Online_High')));

        if ((motor.getSelectedWheel() == null && typeof settings.packages === 'string' && $.inArray(wheel.getCode(), settings.packages.split(',')) != -1) || (motor.getSelectedWheel() != null && wheel.getCode() == motor.getSelectedWheel().getCode())) {
            $wheel.addClass('active');
        } else {
            $wheel.removeClass('active');
        }
        var itemId;
        var wheelPrice;

        if ($cc.hasClass('tablet')) {
            $wheel.find('.info-ico').bind('click.htmlcc', function (evt) {
                itemId = $(this).parent().data("id");
                wheelPrice = $(this).parent().data("wheel-price");
                HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                    {
                        exterior: itemId,
                        itemPrice: wheelPrice
                    });
            });
        }
        else {
            var timer;
            var delay = 1000;
            $wheel.find('.info-ico').hover(function (el) {
                itemId = $(this).parent().data("wheel-code");
                wheelPrice = $(this).parent().data("wheel-price");
                timer = setTimeout(function () {
                    HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                        {
                            exterior: itemId,
                            itemPrice: wheelPrice
                        });
                }, delay);
            }, function () {
                // on mouse out, cancel the timer
                clearTimeout(timer);
            });

        }



    }

    if ($wheelPicker.find('a.wheel-to-pick.active').length == 0) {
        // no wheel is selected so I have to select the first one it is the default one
        $wheelPicker.find('a.wheel-to-pick:first').addClass('active');
    }

};

HtmlCc.Gui.Web.ColorWheelSelecter = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $cfgBox = $cfgContent.parent();
    var colorOrWheel;
    switch (settings.viewstate.colorOrWheel) {
        case 'wheel':
            $cfgBox.removeClass('color').addClass('wheel');
            colorOrWheel = 'wheel';
            break;
        case 'color':
        default:
            $cfgBox.removeClass('wheel').addClass('color');
            colorOrWheel = 'color';
    }

    var $colorWheelSelector = $cfgBox.find('div.color-wheel-selector');
    if ($colorWheelSelector.length == 0) {
        $cfgContent.before('<div class="color-wheel-selector"><a class="color-tab"></a><a class="wheel-tab"></a></div>');
        $colorWheelSelector = $cfgBox.find('div.color-wheel-selector');
    }

    var $colorTab = $colorWheelSelector.find('a.color-tab');
    var colorSettings = new HtmlCc.Workflow.SettingsType(settings);
    colorSettings.viewstate.colorOrWheel = 'color';
    $colorTab.attr('href', cfgManager.getUrlOfSettings(colorSettings));
    $colorTab.text('ColorTabHeader'.resx());
    $colorTab.unbind('click.htmlcc');
    $colorTab.bind('click.htmlcc', function () {
        var motor = cfgManager.getConfigurator().getConfiguredMotor();
        var itemPrice = motor.getSelectedWheel().getPrice();
        var priceDifference = itemPrice - motor.getAvailableWheels()[0].getPrice();
        var itemReplacement = null;
        var itemOrigianl = /* motor.getDefaultColor().getCode() + ";" + */ motor.getAvailableWheels()[0].getCode();
        defaultItem = /*  motor.getDefaultColor().getCode() == motor.getSelectedColor().getCode() && */motor.getAvailableWheels()[0].getCode() == motor.getSelectedWheel().getCode();
        var wheel = defaultItem;
        if (!defaultItem) {
            itemReplacement = /* motor.getSelectedColor().getCode() + ";" + */ motor.getSelectedWheel().getCode();
            wheel = itemReplacement;
        }
        SkodaAuto.Event.publish(
            "gtm.colorWheelSwitch",
            new SkodaAuto.Event.Model.GTMEventParams(
            "LifeCC Configuration",
            "Step 3",
            "Tab Selected: Color",
            {
                context: cfgManager.getConfigurator().getCCContext(),
                model: cfgManager.getConfigurator().getModelCodeShort(),
                modelBody: cfgManager.getConfigurator().getModelCode(),
                carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                itemPrice: itemPrice,
                exterior: wheel,
                defaultItem: defaultItem,
                priceDifference: priceDifference,
                itemReplacement: itemReplacement,
                itemOrigianl: defaultItem ? null : itemOrigianl
            }
            ));
    });

    var $wheelTab = $colorWheelSelector.find('a.wheel-tab');
    var wheelSettings = new HtmlCc.Workflow.SettingsType(settings);
    wheelSettings.viewstate.colorOrWheel = 'wheel';
    $wheelTab.attr('href', cfgManager.getUrlOfSettings(wheelSettings));
    $wheelTab.text('WheelTabHeader'.resx());
    $wheelTab.unbind('click.htmlcc');
    $wheelTab.bind('click.htmlcc', function () {
        var motor =  cfgManager.getConfigurator().getConfiguredMotor();
        var itemPrice = motor.getSelectedColor().getPrice();
        var itemReplacement = null;
        var priceDifference = itemPrice - motor.getDefaultColor().getPrice();
        var itemOrigianl = motor.getDefaultColor().getCode()// + ";" + motor.getAvailableWheels()[0].getCode();
        var color = itemOrigianl;
        defaultItem = motor.getDefaultColor().getCode() == motor.getSelectedColor().getCode()// && motor.getAvailableWheels()[0].getCode() == motor.getSelectedWheel().getCode();
        if (!defaultItem) {
            itemReplacement = motor.getSelectedColor().getCode()// + ";" + motor.getSelectedWheel().getCode();
            color = itemReplacement;
        }


        SkodaAuto.Event.publish(
            "gtm.colorWheelSwitch",
            new SkodaAuto.Event.Model.GTMEventParams(
            "LifeCC Configuration",
            "Step 3",
            "Tab Selected: Wheels",
            {
                context: cfgManager.getConfigurator().getCCContext(),
                model: cfgManager.getConfigurator().getModelCodeShort(),
                modelBody: cfgManager.getConfigurator().getModelCode(),
                carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                price: motor.getPriceString(),
                color: color,
                itemPrice: itemPrice,
                defaultItem: defaultItem,
                priceDifference: priceDifference,
                itemReplacement: itemReplacement,
                itemOrigianl: defaultItem ? null : itemOrigianl
                
            }
            ));
    });

    //var modelWheelHide = cfgManager.getConfigurator().getSalesProgramSetting("hideWheelsOnStep3");
    var wheelDisplaySettings = cfgManager.getConfigurator().getWheelDisplaySettings();

    var wheelIsHide = false
    if (wheelDisplaySettings.length > 0) {
        $.each(wheelDisplaySettings, function () {
            var modelWheelHide = this.Restrictions.split(',')
            $.each(modelWheelHide, function (index, value) {
                if (value == cfgManager.getConfigurator().getModelCode()) {
                    wheelIsHide = true
                    return false;
                }
            });
        });
    }

    if (cfgManager.getConfigurator().getSalesProgramSetting("showSeparatedExteriorSelector") == "true" && !$cc.hasClass('tablet')) {
            $cfgBox.addClass('separated');
            var $step3header = $cfgBox.find('.cfg-content-header');
            $step3header.empty();
            var $borderArrow = $cfgBox.find('.border-arrow')
            if ($borderArrow.length == 0) {
                $cfgBox.find('.color-tab').after('<div class="border-arrow"></div>')
            }
        }
    //else {
    //    if (wheelIsHide) {
    //        $cfgBox.find('.cfg-content-header').text('Step3WheelIsHideColorHeader'.resx());
    //        $cfgBox.addClass('wheel-is-hide');
    //    }
    //}
};

HtmlCc.Gui.Web.ColorPicker = function ($cc, $cfgContentWrapper, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContentWrapper' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var wheelDisplaySettings = cfgManager.getConfigurator().getWheelDisplaySettings();
    var colorTypeNameSettings = cfgManager.getConfigurator().getColorTypeNameSettings();
    var wheelIsHide = false;

    var wheelDisplaySetting = null;
    if (wheelDisplaySettings.length > 0) {
        $.each(wheelDisplaySettings, function (index, wheelSettings) {
            var modelWheelHide = wheelSettings.Restrictions.split(',')

            $.each(modelWheelHide, function (index, value) {
                if (value == cfgManager.getConfigurator().getModelCode()) {
                    wheelIsHide = true;
                    wheelDisplaySetting = wheelSettings;
                    return false;
                }
            });
        });
    }

    var colorTypeName = {};
    if (colorTypeNameSettings.length > 0) {
        $.each(colorTypeNameSettings, function (index, colorTypeNameSetting) {
            var colorSettings = colorTypeNameSetting.Restrictions.split(',')
            $.each(colorSettings, function (index, value) {
                if (value == cfgManager.getConfigurator().getModelCode()) {
                    switch (colorTypeNameSetting.Source) {
                        case HtmlCc.Api.SourceType.RESX.id:
                            colorTypeName[colorTypeNameSetting.Color] = colorTypeNameSetting.Param;
                            break;
                        case HtmlCc.Api.SourceType.TEXT.id:
                            colorTypeName[colorTypeNameSetting.Color] = colorTypeNameSetting.Param.resx();
                        break;
                    }                    
                    return false;
                }
            });
        });
    }

    var $basicColorPicker = $cfgContentWrapper.find('div.basic-color-picker');
    if ($basicColorPicker.length == 0) {
        $cfgContentWrapper.append('<div class="basic-color-picker"><div class="basic-color-picker-header"></div><div class="colors-to-pick"><div class="terminator"></div></div></div>');
        $basicColorPicker = $cfgContentWrapper.find('div.basic-color-picker');
        if (colorTypeName[HtmlCc.Api.ColorTypeEnum.STANDARD.value] == null) {
            $basicColorPicker.find('div.basic-color-picker-header').text('BasicColorHeader'.resx());
        }
        else {
            $basicColorPicker.find('div.basic-color-picker-header').text(colorTypeName[HtmlCc.Api.ColorTypeEnum.STANDARD.value]);
        }        
    }

    var $metalicColorPicker = $cfgContentWrapper.find('div.metalic-color-picker');
    if ($metalicColorPicker.length == 0) {
        $cfgContentWrapper.append('<div class="metalic-color-picker"><div class="metalic-color-picker-header"></div><div class="colors-to-pick"><div class="terminator"></div></div></div>');
        $metalicColorPicker = $cfgContentWrapper.find('div.metalic-color-picker');
        if (colorTypeName[HtmlCc.Api.ColorTypeEnum.METALIC.value] == null) {
            $metalicColorPicker.find('div.metalic-color-picker-header').text('MetalictColorHeader'.resx())
        }
        else {
            $metalicColorPicker.find('div.metalic-color-picker-header').text(colorTypeName[HtmlCc.Api.ColorTypeEnum.METALIC.value]);
        }
    }

    var $roofColorPicker = $cfgContentWrapper.find('div.roof-color-picker');
    if ($roofColorPicker.length == 0) {
        $cfgContentWrapper.append('<div class="roof-color-picker"><div class="roof-color-picker-header"></div><div class="colors-to-pick"><div class="terminator"></div></div></div>');
        $roofColorPicker = $cfgContentWrapper.find('div.roof-color-picker');
        if (colorTypeName[HtmlCc.Api.ColorTypeEnum.ROOF.value] == null) {
            $roofColorPicker.find('div.roof-color-picker-header').text('RoofColorHeader'.resx())
        }
        else {
            $roofColorPicker.find('div.roof-color-picker-header').text(colorTypeName[HtmlCc.Api.ColorTypeEnum.ROOF.value])
        }
    }

    var $fleetColorPicker = $cfgContentWrapper.find('div.fleet-color-picker');
    if ($fleetColorPicker.length == 0) {
        $cfgContentWrapper.append('<div class="fleet-color-picker"><div class="fleet-color-picker-header"></div><div class="colors-to-pick"><div class="terminator"></div></div></div>');
        $fleetColorPicker = $cfgContentWrapper.find('div.fleet-color-picker');
        if (colorTypeName[HtmlCc.Api.ColorTypeEnum.FLEET.value] == null) {
            $fleetColorPicker.find('div.fleet-color-picker-header').text('FleetColorHeader'.resx())
        }
        else {
            $fleetColorPicker.find('div.fleet-color-picker-header').text(colorTypeName[HtmlCc.Api.ColorTypeEnum.FLEET.value])
        }
    }

    var allColors = motor.getAvailableColors();

    var basicColors = [];
    var fleetColors = [];
    var roofColors = [];
    var metalicColors = [];

    // sort out the colors
    for (var i = 0; i < allColors.length; i++) {
        var color = allColors[i];
        var colorCode = color.getCode();
        if (color.getType().value == 0) {
            // value == 0 is standard color           
            if (colorCode.substring(0, 2) == colorCode.substring(2, 4)) {
                basicColors.push(color);
                roofColors.push(color);
            } else {
                // roof color
                roofColors.unshift(color);
            }
        } else {
            if (color.getType().value == 2) {
                if (colorCode.substring(0, 2) == colorCode.substring(2, 4)) {
                    metalicColors.push(color);
                    roofColors.push(color);
                } else {
                    // roof color
                    roofColors.unshift(color);
                }
            }
            else if (color.getType().value == 3) {
                // metalicRoof color
                roofColors.push(color);
            }
                //if (color.getType().value == 1)
            else {
                fleetColors.push(color);
            }
        }
    }
    // check whether all roof colors have its body color
    $.each(roofColors, function () {
        var roofColor = this;
        var found = false;
        for (var i = 0; i < basicColors.length; i++) {
            if (roofColor.getCode().substring(0, 2) == basicColors[i].getCode().substring(0, 2)) {
                // it is it
                found = true;
                break;
            }
        }
        for (var i = 0; i < metalicColors.length; i++) {
            if (roofColor.getCode().substring(0, 2) == metalicColors[i].getCode().substring(0, 2)) {
                // it is it
                found = true;
                break;
            }
        }
        if (found === false) {
            // basic color wasn't found, roof color has been selected
            if (roofColor.getType().value == 3) {
                metalicColors.push(roofColor);
            }
            else {
            basicColors.push(roofColor);
        }
        }
    });

    // build basic color picker
    var $terminator = $basicColorPicker.find('div.colors-to-pick div.terminator');
    for (var i = 0; i < basicColors.length; i++) {
        var color = basicColors[i];

        var $color = $color = $basicColorPicker.find('a.color-{0}'.format(color.getCode()));
        if ($color.length == 0) {
            $terminator.before('<a data-color-code="{0}" data-price="{1}" class="color-to-pick color-{0}" style="background-color: {2};"><div class="active-icon"></div></a>'.format(color.getCode(), color.getPriceString(), color.getCssColor()));
            $color = $basicColorPicker.find('a.color-{0}'.format(color.getCode()));

            // bind hover event
            // hover action is disabled
            //HtmlCc.Gui.Web.HoverBoxWithTimeout($cc, cfgManager, $color, null /* TODO */, color.getName(), null /*TODO*/, color.getPriceString());
        }

        // remove any of loading icons
        $color.removeClass('loading');

        //var currentParams = cfgManager.getCurrentParams();
        //currentParams.colorCode = color.getCode();
        //$color.attr('href', cfgManager.getUrlOfParams('step3', currentParams));

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.color = color.getCode();
        newSettings.interior = '';
        newSettings.view = 'step3';
        
        if (!wheelIsHide) {
            newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
        }
        else {
            newSettings.packages = '';
        }
        newSettings = cfgManager.clearViewStateAccessories(newSettings);

        newSettings.viewstate.itemClicked = {};
        newSettings.viewstate.itemClicked.price = color.getPriceString();
        newSettings.viewstate.itemClicked.id = color.getCode();
        newSettings.viewstate.itemClicked.type = 'color';


        $color.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $color.unbind('click.htmlcc');
        $color.bind('click.htmlcc', function () {
            if (!$(this).hasClass('active')) {
                $basicColorPicker.find('a.color-to-pick').removeClass('loading');
                $(this).addClass('loading');
            }

            var price = $(this).data("price");
            var code = $(this).data("color-code");
            HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, code,
                                 {
                     color: code,
                     itemPrice: price
           });

            
            var isClear = cfgManager.isClearNextSteps('step3');
           
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
            }
            cfgManager.clearNextSteps('step3');
        });

        $color.attr('title', '{0} - {1}'.format(color.getName(), color.getPriceString()));
        if (color.getCode().substring(0, 2) == motor.getSelectedColor().getCode().substring(0, 2)) {
            $color.addClass('active');
        } else {
            $color.removeClass('active');
        }
    }

    // build roof color picker
    $terminator = $roofColorPicker.find('div.colors-to-pick div.terminator');

    // get current body color
    var selectedBodyColor = motor.getSelectedColor().getCode().substring(0, 2);

    // remove all current roof colors
    $roofColorPicker.find('a.color-to-pick').remove();

    // add roof colors into roof color selection
    //for (var i = 0; i < roofColors.length; i++) {
    for (var i = roofColors.length - 1; i >= 0; i--) {
        var color = roofColors[i];

        if (selectedBodyColor == color.getCode().substring(0, 2)) {
            //var $color = $roofColorPicker.find('a.color-{0}'.format(color.getCode()));
            var $color = $color = $roofColorPicker.find('a.color-{0}'.format(color.getCode()));
            if ($color.length == 0) {
                $terminator.before('<a data-color-code="{0}" data-price="{1}" class="color-to-pick color-{0}" style="background-color: {2};"><div class="active-icon"></div></a>'.format(color.getCode(), color.getPriceString(), color.getCssRoofColor() || color.getCssColor()));
                $color = $roofColorPicker.find('a.color-{0}'.format(color.getCode()));

                // bind loading icon on click


                // bind hover event
                // hover action is disabled
                //HtmlCc.Gui.Web.HoverBoxWithTimeout($cc, cfgManager, $color, null /* TODO */, color.getName(), null /*TODO*/, color.getPriceString());
            }

            // remove any of loading icons
            $color.removeClass('loading');

            //var currentParams = cfgManager.getCurrentParams();
            //currentParams.colorCode = color.getCode();
            //$color.attr('href', cfgManager.getUrlOfParams('step3', currentParams));

            var newSettings = new HtmlCc.Workflow.SettingsType(settings);
            newSettings.color = color.getCode();
            newSettings.interior = '';
            newSettings.view = 'step3';
            //newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
            //newSettings.packages = '';
            if (!wheelIsHide) {
                newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
            }
            else {
                newSettings.packages = '';
            }
            newSettings = cfgManager.clearViewStateAccessories(newSettings);

            newSettings.viewstate.itemClicked = {};
            newSettings.viewstate.itemClicked.price = color.getPriceString();
            newSettings.viewstate.itemClicked.id = color.getCode();
            newSettings.viewstate.itemClicked.type = 'color';

            $color.attr('href', cfgManager.getUrlOfSettings(newSettings));
            $color.unbind('click.htmlcc');
            $color.bind('click.htmlcc', function () {
                if (!$(this).hasClass('active')) {
                    $roofColorPicker.find('a.color-to-pick').removeClass('loading');
                    $(this).addClass('loading');
                }
                var price = $(this).data("price");
                var code = $(this).data("color-code");
                HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, code,
                                                 {
                            color: code,
                            itemPrice: price
                        });

                var isClear = cfgManager.isClearNextSteps('step3');
                
                if (isClear) {
                    SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
                }
                cfgManager.clearNextSteps('step3');
            });
            $color.attr('title', '{0} - {1}'.format(color.getName(), color.getPriceString()));

            if ($color.attr('data-color-code') == motor.getSelectedColor().getCode()) {
                $color.addClass('active');
            } else {
                $color.removeClass('active');
            }
        }
    }

    // build metalic color picker
    $terminator = $metalicColorPicker.find('div.colors-to-pick div.terminator');
    for (var i = 0; i < metalicColors.length; i++) {
        var color = metalicColors[i];

        var $color = $color = $metalicColorPicker.find('a.color-{0}'.format(color.getCode()));
        if ($color.length == 0) {
            $terminator.before('<a data-color-code="{0}" data-price="{1}" class="color-to-pick color-{0}" style="background-color: {2};"><div class="active-icon"></div></a>'.format(color.getCode(), color.getPriceString(), color.getCssColor()));
            $color = $metalicColorPicker.find('a.color-{0}'.format(color.getCode()));

            // bind loading icon on click
            //$color.bind('click.htmlcc', function () {
            //    if (!$(this).hasClass('active')) {
            //        $metalicColorPicker.find('a.color-to-pick').removeClass('loading');
            //        $(this).addClass('loading');
            //    }
            //});

            // bind hover event
            // hover action is disabled
            //HtmlCc.Gui.Web.HoverBoxWithTimeout($cc, cfgManager, $color, null /* TODO */, color.getName(), null /*TODO*/, color.getPriceString());
        }

        // remove any of loading icons
        $color.removeClass('loading');

        //var currentParams = cfgManager.getCurrentParams();
        //currentParams.colorCode = color.getCode();
        //$color.attr('href', cfgManager.getUrlOfParams('step3', currentParams));

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.color = color.getCode();
        newSettings.interior = '';
        newSettings.view = 'step3';

        if (!wheelIsHide) {
        newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
        }
        else {
            newSettings.packages = '';
        }
        newSettings = cfgManager.clearViewStateAccessories(newSettings);

        newSettings.viewstate.itemClicked = {};
        newSettings.viewstate.itemClicked.price = color.getPriceString();
        newSettings.viewstate.itemClicked.id = color.getCode();
        newSettings.viewstate.itemClicked.type = 'color';

        //newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
        $color.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $color.unbind('click.htmlcc');
        $color.bind('click.htmlcc', function () {
            if (!$(this).hasClass('active')) {
                $metalicColorPicker.find('a.color-to-pick').removeClass('loading');
                $(this).addClass('loading');
            }
            var price = $(this).data("price");
            var code = $(this).data("color-code");
            HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, code,
                                 {
                        color: code,
                        itemPrice: price
                    });

            var isClear = cfgManager.isClearNextSteps('step3');

            
            
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
            }
            cfgManager.clearNextSteps('step3');
        });

        $color.attr('title', '{0} - {1}'.format(color.getName(), color.getPriceString()));
        if (color.getCode().substring(0, 2) == motor.getSelectedColor().getCode().substring(0, 2)) {
            $color.addClass('active');
        } else {
            $color.removeClass('active');
        }
    }

    // build fleet color picker
    $terminator = $fleetColorPicker.find('div.colors-to-pick div.terminator');
    for (var i = 0; i < fleetColors.length; i++) {
        var color = fleetColors[i];

        var $color = $color = $fleetColorPicker.find('a.color-{0}'.format(color.getCode()));
        if ($color.length == 0) {
            $terminator.before('<a data-color-code="{0}" data-price="{1}" class="color-to-pick color-{0}" style="background-color: {2};"><div class="active-icon"></div></a>'.format(color.getCode(), color.getPriceString(), color.getCssColor()));
            $color = $fleetColorPicker.find('a.color-{0}'.format(color.getCode()));

            //// bind loading icon on click
            //$color.bind('click.htmlcc', function () {
            //    if (!$(this).hasClass('active')) {
            //        $fleetColorPicker.find('a.color-to-pick').removeClass('loading');
            //        $(this).addClass('loading');
            //    }
            //});

            // bind hover event
            // hover action is disabled
            //HtmlCc.Gui.Web.HoverBoxWithTimeout($cc, cfgManager, $color, null /* TODO */, color.getName(), null /*TODO*/, color.getPriceString());
        }

        // remove any of loading icons
        $color.removeClass('loading');

        //var currentParams = cfgManager.getCurrentParams();
        //currentParams.colorCode = color.getCode();
        //$color.attr('href', cfgManager.getUrlOfParams('step3', currentParams));

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.color = color.getCode();
        newSettings.interior = '';
        newSettings.view = 'step3';

        if (!wheelIsHide) {
        newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
        }
        else {
            newSettings.packages = '';
        }
        newSettings = cfgManager.clearViewStateAccessories(newSettings);
        newSettings.viewstate.itemClicked = {};
        newSettings.viewstate.itemClicked.price = color.getPriceString();
        newSettings.viewstate.itemClicked.id = color.getCode();
        newSettings.viewstate.itemClicked.type = 'color';
        //newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
        $color.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $color.unbind('click.htmlcc')
        $color.bind('click.htmlcc', function () {
            if (!$(this).hasClass('active')) {
                $fleetColorPicker.find('a.color-to-pick').removeClass('loading');
                $(this).addClass('loading');
            }
            var price = $(this).data("price");
            var code = $(this).data("color-code");
            HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, code,
                                 {
                        color: code,
                        itemPrice: price
                    });

            var isClear = cfgManager.isClearNextSteps('step3');
            
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
            }
            cfgManager.clearNextSteps('step3');
        });

        $color.attr('title', '{0} - {1}'.format(color.getName(), color.getPriceString()));
        if (color.getCode() == motor.getSelectedColor().getCode()) {
            $color.addClass('active');
        } else {
            $color.removeClass('active');
        }
    }

    //var modelWheelHide = cfgManager.getConfigurator().getSalesProgramSetting("hideWheelsOnStep3");
    //wheelIsHide = false
    //if (modelWheelHide != 'undefined' && modelWheelHide != null) {
    //    modelWheelHide = cfgManager.getConfigkd yurator().getSalesProgramSetting("hideWheelsOnStep3").split(',')
    //    $.each(modelWheelHide, function (value) {
    //        if (value == cfgManager.getConfigurator().getModelCode()) {
    //            wheelIsHide = true
    //        }
    //    });
    //}
    if (cfgManager.getConfigurator().getSalesProgramSetting("showSeparatedExteriorSelector") == "true" && !$cc.hasClass("tablet")) {
        // show the same content for both tabs
        var $cfgBox = $cc.find('.cfg-box');
        var $step3header = $cfgBox.find('.cfg-content-header');
            $step3header.empty();
        if ($cfgBox.hasClass('color')) {
            $step3header.append('Step3SeparatedColorHeader'.resx() + " <span>" + cfgManager.getConfigurator().getConfiguredMotor().getSelectedColor().getName() + "</span>")
        }
        else {
            var displayedName = cfgManager.getConfigurator().getConfiguredMotor().getSelectedWheel().getShortName()
            if (displayedName == '') displayedName = cfgManager.getConfigurator().getConfiguredMotor().getSelectedWheel().getName()
                $step3header.append('Step3SeparatedWheelHeader'.resx() + " <span>" + displayedName + "</span>")
        }
    }

    // remove display of color types that are empty
    var $drawedRoofColors = $roofColorPicker.find('.color-to-pick');
    if (roofColors.length == 0 || $drawedRoofColors.length == 0 || ($drawedRoofColors.length == 1 && $drawedRoofColors.attr('data-color-code').substring(0, 2) == $drawedRoofColors.attr('data-color-code').substring(2, 4))) {
        $roofColorPicker.addClass('do-not-display');
    } else {
        $roofColorPicker.removeClass('do-not-display');
        
    }
    if (fleetColors.length == 0) {
        $fleetColorPicker.addClass('do-not-display');
    } else {
        $fleetColorPicker.removeClass('do-not-display');
       
    }
    if (metalicColors.length == 0) {
        $metalicColorPicker.addClass('do-not-display');
    } else {
        $metalicColorPicker.removeClass('do-not-display');        
    }
};
HtmlCc.Gui.Web.ConfigurationContentInterior = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-interior');
    if ($cfgContentWrapper.length == 0) {
        $cfgContent.parent().removeClass('separated');
        $cfgContent.parent().find('.border-box').remove();
        $cfgContent.find('div.cfg-content-wrapper').remove(); // removes content that is not applicable for this step
        $cfgContent.append('<div class="cfg-content-wrapper cfg-content-wrapper-interior"></div>');
        $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-interior');
    }

    HtmlCc.Gui.Web.InteriorPicker($cc, $cfgContentWrapper, cfgManager, settings);
    // HtmlCc.Gui.Web.SeatPicker($cc, $cfgContentWrapper, cfgManager, settings);
};
// removes package codes that are not a wheel package
HtmlCc.Libs.stripNonWheelPackages = function (motor, packagesAsString) {
    /// <signature>
    /// <param name='motor' type='MotorType' />
    /// <param name='packagesAsString' type='String'>Colon separated package codes.</param>
    /// <returns type='String' />
    /// </signature>
    var pkgsToCheck = packagesAsString.split(',');
    var pkgsToPass = [];    // packages to be passed to new request (only wheel packages should pass)
    $.each(motor.getAvailableWheels(), function () {
        var availableWheel = this;
        $.each(pkgsToCheck, function (pkgIndex, pkgToCheck) {
            if (pkgToCheck == availableWheel.getCode()) {
                // this is wheel; it is wanted package at this step
                pkgsToPass.push(pkgToCheck);
            }
        });
    });
    return pkgsToPass.join(',');
};
HtmlCc.Gui.Web.InteriorPicker = function ($cc, $cfgContentWrapper, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContentWrapper' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $interiorPicker = $cfgContentWrapper.find('div.interior-picker');
    if ($interiorPicker.length == 0) {
        $cfgContentWrapper.append('<div class="interior-picker"><div class="interiors-to-pick"><div class="terminator"></div></div></div>');
        $interiorPicker = $cfgContentWrapper.find('div.interior-picker');
    }

    var $interiorTerminator = $cfgContentWrapper.find('div.interiors-to-pick div.terminator');

    var availableInteriors = motor.getAvailableInteriors();

    // RQDE09
    var hideInfoIcon =
        (cfgManager
            .getConfigurator()
            .getSalesProgramSetting('hideInfoIcon') === 'true');
    var extendInfoIcoStyle = hideInfoIcon ? " hide" : "";

    for (var i = 0; i < availableInteriors.length; i++) {
        var interior = availableInteriors[i];

        var $interior = $interiorPicker.find('a.interior-{0}'.format(interior.getCode()));
        if ($interior.length == 0) {
            $interiorTerminator.before('<a class="interior-to-pick interior-{0}" data-price="{2}" data-id="{0}"><img class="interior-image" /><div class="disabled-layer"></div><div class="active-icon"></div><div class="label"><span class="label"></span></div><div class="info-ico{1}"></div></a>'.format(interior.getCode(), extendInfoIcoStyle, interior.getPriceString()));
        }
            $interior = $interiorPicker.find('a.interior-{0}'.format(interior.getCode()));

            var $interiorImage = $interior.find('img.interior-image');
            $interiorImage.attr('src', interior.getImage().getUrl());
            if (cfgManager.getConfigurator().getSalesProgramSetting("showMarketingImageWatermark") == "true") {
                $interiorImage.after("<p class='disclaimer-marketing-image'>{0}</p>".format('MarketingImageWatermark'.resx()));
            }

        //// interior disabling - temporary unused
        if (interior.getSelectable() === false) {
            $interior.addClass("non-selectable");
        }

        $interior.find('div.disabled-layer').click(function (evt) {
            evt.preventDefault();
            return false;
        });

            // bind displaying a loading icon on onlicik event
            $interior.bind('click.htmlcc', function () {
                if (!$(this).hasClass('active')) {
                    $interiorPicker.find('a.interior-to-pick').removeClass('loading');
                    $(this).addClass('loading');
                }
            });

            // RQDE09
            if (!hideInfoIcon) {

            $infoIco = $interior.find('div.info-ico');
            if ($cc.hasClass('tablet')) {
                $infoIco.bind('click.htmlcc', function (evt) {
                    var itemId = $(this).parent().data("id");
                    var itemPrice = $(this).parent().data("price");
                    HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                        {
                            interior: itemId,
                            itemPrice: 0
                        });
                });
            }
            else {
                var timer;
                var delay = 1000;
                $infoIco.hover(function (el) {
                    var itemId = $(this).parent().data("id");
                    var itemPrice = $(this).parent().data("price");
                    timer = setTimeout(function () {                        
                        HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                            {
                                interior: itemId,
                                itemPrice: itemPrice
                            });
                    }, delay);
                }, function () {
                    // on mouse out, cancel the timer
                    clearTimeout(timer);
                });
            }
                // bind hover event
            HtmlCc.Gui.Web.HoverBoxWithTimeout($cc, settings, cfgManager, $infoIco, interior.getImage().getUrl(), interior.getName(), null /*TODO*/, null);
            }
        //}

        // removes any of loading icons
        $interior.removeClass('loading');

        // var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        // newSettings.interior = interior.getCode();
        // $interior.attr('href', cfgManager.getUrlOfSettings(newSettings));
        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.interior = interior.getCode();
        newSettings.view = 'step4';
        newSettings.packages = HtmlCc.Libs.stripNonWheelPackages(motor, newSettings.packages);
        
        newSettings.viewstate.itemClicked = {};
        newSettings.viewstate.itemClicked.price = interior.getPriceString();
        newSettings.viewstate.itemClicked.id = interior.getCode();
        newSettings.viewstate.itemClicked.type = 'interior';

        newSettings = cfgManager.clearViewStateAccessories(newSettings);
        $interior.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $interior.bind('click.htmlcc', function () {
            var isClear = cfgManager.isClearNextSteps('step4');
            
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
            }
            cfgManager.clearNextSteps('step4');
        });

        var $divLabel = $interior.find('div.label');
        var $spanLabel = $divLabel.find('span.label');

        $spanLabel.text(interior.getName());

        if (motor.getSelectedInterior().getCode() == interior.getCode()) {
            $interior.addClass('active');
        } else {
            $interior.removeClass('active');
        }

        // centering
        $spanLabel.css('top', ($divLabel.innerHeight() - $spanLabel.innerHeight()) / 2);
    }
};
HtmlCc.Gui.Web.ConfigurationContentExtra = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-extra.cfg-content-extra');
    if ($cfgContentWrapper.length == 0) {
        $cfgContent.find('div.cfg-content-wrapper').remove(); // removes content that is not applicable for this step
        $cfgContent.append('<div class="cfg-content-wrapper cfg-content-wrapper-extra cfg-content-extra"></div>');
        $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-extra.cfg-content-extra');
    }

    var $extraEquipmentsCategoriesHeader = null;
    // render extra equipments categories
    var $extraEquipmentsCategories = $cfgContentWrapper.find('div.extra-items.extra-items-categories');
    if ($extraEquipmentsCategories.length == 0) {
        $cfgContentWrapper.append('<div class="extra-items extra-items-categories"><a class="extra-header"></a><div class="terminator"></div></div>');
        $extraEquipmentsCategories = $cfgContentWrapper.find('div.extra-items.extra-items-categories');

        $extraEquipmentsCategoriesHeader = $extraEquipmentsCategories.find('a.extra-header');
        $extraEquipmentsCategoriesHeader.text('AllExtraPossibilities'.resx());
    }

    if ($extraEquipmentsCategoriesHeader == null) {
        $extraEquipmentsCategoriesHeader = $extraEquipmentsCategories.find('a.extra-header');
    }

    var $terminator = $cfgContentWrapper.find('div.extra-items.extra-items-categories div.terminator');

    var availablePackageGroups = motor.getAvailablePackageGroups();

    var defaultGroup = motor.getDefaultPackageGroup();

    // selection of package groups; null means everything
    var selectedPackageGroup = null;
    if ('selectedPackageGroup' in settings.viewstate) {
        var tmp = parseInt(settings.viewstate.selectedPackageGroup);
        if (tmp > 0) {
            selectedPackageGroup = tmp;
        } else {
            selectedPackageGroup = null;
        }
    }
    else {
        if (defaultGroup != null) {
            selectedPackageGroup = defaultGroup.getId();
        }
    }

    for (var i = 0; i < availablePackageGroups.length; i++) {
        var packageGroup = availablePackageGroups[i];

        if (packageGroup.getName() == '-') {
            // do not display thos package group
            continue;
        }

        var $packageGroup = $extraEquipmentsCategories.find('a.extra-item.extra-item-{0}'.format(packageGroup.getId()));
        if ($packageGroup.length == 0) {
            $terminator.before('<a class="extra-item extra-item-{0}"></a>'.format(packageGroup.getId()));

            var $packageGroup = $extraEquipmentsCategories.find('a.extra-item.extra-item-{0}'.format(packageGroup.getId()));
            $packageGroup.text(packageGroup.getName());
            $packageGroup.attr('data-package-id', packageGroup.getId());

            $packageGroup.bind('click.htmlcc', function () {
                SkodaAuto.Event.publish(
                    "gtm.equipCategoryClick",
                    new SkodaAuto.Event.Model.GTMEventParams(
                     "LifeCC Configuration",
                     settings.view,
                     "Tab Selected: " + $(this).text(),
                     {
                         context: cfgManager.getConfigurator().getCCContext(),
                         model: cfgManager.getConfigurator().getModelCodeShort(),
                         modelBody: cfgManager.getConfigurator().getModelCode(),
                         carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                         price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                     }
                    ));
            });

        }
    }

    if ((settings.viewstate.toDisplay == 'groups' || settings.viewstate.toDisplay == null) && selectedPackageGroup == null) {
        $extraEquipmentsCategoriesHeader.addClass('active');
    } else {
        $extraEquipmentsCategoriesHeader.removeClass('active');
    }

    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.selectedPackageGroup = null;
    newSettings.viewstate.toDisplay = 'groups';
    newSettings.viewstate.packageItem = false;
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'extra';
    newSettings.viewstate['packagesScrollPosition'] = 0;
    $extraEquipmentsCategoriesHeader.attr('href', cfgManager.getUrlOfSettings(newSettings));

    $extraEquipmentsCategories.find('a.extra-item').each(function () {
        var $thisExtraItem = $(this);

        if (selectedPackageGroup != null && selectedPackageGroup == $thisExtraItem.attr('data-package-id') && (settings.viewstate.toDisplay == 'groups' || settings.viewstate.toDisplay == null)) {
            $thisExtraItem.addClass('active');
        } else {
            $thisExtraItem.removeClass('active');
        }
        newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.viewstate.selectedPackageGroup = $thisExtraItem.attr('data-package-id');
        newSettings.viewstate.toDisplay = 'groups';
        newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'extra';
        newSettings.viewstate.packageItem = false;
        newSettings.viewstate['packagesScrollPosition'] = 0;
        $thisExtraItem.attr('href', cfgManager.getUrlOfSettings(newSettings));
    });

    var $selectedHeader = null;
    // crete item of selected extra equipment
    var $selectedExtra = $cfgContentWrapper.find('div.extra-items.selected-extra');
    if ($selectedExtra.length == 0) {
        $cfgContentWrapper.append('<div class="extra-items selected-extra"><a class="selected-header"></a><div class="terminator"></div></div>');
        $selectedExtra = $cfgContentWrapper.find('div.extra-items.selected-extra');
    }

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.selectedPackageGroup = undefined;
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'extra';
    newSettings.viewstate.toDisplay = 'selected';
    newSettings.viewstate.packageItem = false;
    newSettings.viewstate['packagesScrollPosition'] = 0;

    $selectedHeader = $selectedExtra.find('a.selected-header');
    $selectedHeader.text('SelectedExtra'.resx());
    $selectedHeader.attr('href', cfgManager.getUrlOfSettings(newSettings));

    if (settings.viewstate.toDisplay == 'selected') {
        $selectedHeader.addClass('active');
    } else {
        $selectedHeader.removeClass('active');
    }

    var $recommendedExtra = $cfgContentWrapper.find('div.extra-items.recommended-extra');
    if ($recommendedExtra.length == 0) {
        $cfgContentWrapper.append('<div class="extra-items recommended-extra"><a class="recommended-header"></a><div class="terminator"></div></div>');
        $recommendedExtra = $cfgContentWrapper.find('div.extra-items.recommended-extra');
    }

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.selectedPackageGroup = undefined;
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'extra';
    newSettings.viewstate.toDisplay = 'recommended';
    newSettings.viewstate.packageItem = false;
    newSettings.viewstate['packagesScrollPosition'] = 0;

    var $recommendedHeader = $recommendedExtra.find('a.recommended-header');
    $recommendedHeader.text('RecommendedExtra'.resx());
    $recommendedHeader.attr('href', cfgManager.getUrlOfSettings(newSettings));

    if (settings.viewstate.toDisplay == 'recommended') {
        $recommendedHeader.addClass('active');
    } else {
        $recommendedHeader.removeClass('active');
    }
};
// 6th step
HtmlCc.Gui.Web.ConfigurationInsurance = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-extra.cfg-content-skoda-care');
    if ($cfgContentWrapper.length == 0) {
        $cfgContent.find('div.cfg-content-wrapper').remove(); // removes content that is not applicable for this step
        $cfgContent.append('<div class="cfg-content-wrapper cfg-content-wrapper-extra cfg-content-skoda-care"></div>');
        $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-extra.cfg-content-skoda-care');
    }

    var $extraEquipmentsCategoriesHeader = null;
    // render extra equipments categories
    var $extraEquipmentsCategories = $cfgContentWrapper.find('div.extra-items.extra-items-categories');
    if ($extraEquipmentsCategories.length == 0) {
        $cfgContentWrapper.append('<div class="extra-items extra-items-categories"><a class="extra-header"></a><div class="terminator"></div></div>');
        $extraEquipmentsCategories = $cfgContentWrapper.find('div.extra-items.extra-items-categories');
        
        $extraEquipmentsCategoriesHeader = $extraEquipmentsCategories.find('a.extra-header');
        $extraEquipmentsCategoriesHeader.text('AllCarePossibilities'.resx());
    }

    if ($extraEquipmentsCategoriesHeader == null) {
        $extraEquipmentsCategoriesHeader = $extraEquipmentsCategories.find('a.extra-header');
    }

    var $terminator = $cfgContentWrapper.find('div.extra-items.extra-items-categories div.terminator');

    var availableSkodaCareGroups = motor.getAvailableSkodaCareGroups();

    // selection of package groups; null means everything
    var selectedSkodaCareGroup = null;
    if ('selectedSkodaCareGroup' in settings.viewstate) {
        var tmp = parseInt(settings.viewstate.selectedSkodaCareGroup);
        if (tmp > 0 || tmp < 0) {
            selectedSkodaCareGroup = tmp;
        } else if (settings.viewstate.selectedSkodaCareGroup == 'service-care') {
            selectedSkodaCareGroup = 'service-care';
        } else {
            selectedSkodaCareGroup = null;
        }
    }

    for (var i = 0; i < availableSkodaCareGroups.length; i++) {
        var packageGroup = availableSkodaCareGroups[i];

        if (packageGroup.getGroupType() == 3) {
            // service care is IFed
            var $packageGroup = $extraEquipmentsCategories.find('a.extra-item.extra-item-{0}'.format('service-care'));
            if ($packageGroup.length == 0) {
                $terminator.before('<a class="extra-item extra-item-{0}"></a>'.format('service-care'));

                var $packageGroup = $extraEquipmentsCategories.find('a.extra-item.extra-item-{0}'.format('service-care'));
                $packageGroup.text('SkodaCareServiceCare'.resx());
                $packageGroup.attr('data-package-id', 'service-care');
            }

        } else {
            var $packageGroup = $extraEquipmentsCategories.find('a.extra-item.extra-item-{0}'.format(packageGroup.getId()));
            if ($packageGroup.length == 0) {
                $terminator.before('<a class="extra-item extra-item-{0}"></a>'.format(packageGroup.getId()));

                var $packageGroup = $extraEquipmentsCategories.find('a.extra-item.extra-item-{0}'.format(packageGroup.getId()));
                $packageGroup.text(packageGroup.getName());
                $packageGroup.attr('data-package-id', packageGroup.getId());
            }
        }

        $packageGroup.unbind('click.htmlcc').bind('click.htmlcc', function () {
            SkodaAuto.Event.publish(
                "gtm.serviceCategoryClick",
                new SkodaAuto.Event.Model.GTMEventParams(
                 "LifeCC Configuration",
                 settings.view,
                 "Tab Selected: " + $(this).text(),
                 {
                     context: cfgManager.getConfigurator().getCCContext(),
                     model: cfgManager.getConfigurator().getModelCodeShort(),
                     modelBody: cfgManager.getConfigurator().getModelCode(),
                     carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                     price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
        }
                ));
        });

        if (packageGroup.getGroupType() == 4) {
            $packageGroup.hide();
            var insurance = cfgManager.getConfigurator().getInsurance();
            if (insurance != null) {
                (function () {
                    var $insuranceGroup = $packageGroup;
                    insurance.isInsuraceAvailableAsync(
                        motor,
                        function (isAvailable) {
                            if (isAvailable) {
                                $insuranceGroup.show();
                            }
                        },
                        function () { });
                })();

            }
        }
    }

    if ((settings.viewstate.skodaCareToDisplay == 'groups' || settings.viewstate.skodaCareToDisplay == null) && selectedSkodaCareGroup == null) {
        $extraEquipmentsCategoriesHeader.addClass('active');
    } else {
        $extraEquipmentsCategoriesHeader.removeClass('active');
    }

    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.selectedSkodaCareGroup = null;
    newSettings.viewstate.skodaCareToDisplay = 'groups';
    newSettings.viewstate['selectedSkodaCarePresentation-{0}'.format(settings.view)] = 'care';
    $extraEquipmentsCategoriesHeader.attr('href', cfgManager.getUrlOfSettings(newSettings));

    $extraEquipmentsCategories.find('a.extra-item').each(function () {
        var $thisExtraItem = $(this);

        if (selectedSkodaCareGroup != null && selectedSkodaCareGroup == $thisExtraItem.attr('data-package-id') && (settings.viewstate.skodaCareToDisplay == 'groups' || settings.viewstate.skodaCareToDisplay == null)) {
            $thisExtraItem.addClass('active');
        } else {
            $thisExtraItem.removeClass('active');
        }
        newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.viewstate.selectedSkodaCareGroup = $thisExtraItem.attr('data-package-id');
        newSettings.viewstate.skodaCareToDisplay = 'groups';
        newSettings.viewstate['selectedSkodaCarePresentation-{0}'.format(settings.view)] = 'care';
        $thisExtraItem.attr('href', cfgManager.getUrlOfSettings(newSettings));
    });

    var $selectedHeader = null;
    // crete item of selected extra equipment
    var $selectedExtra = $cfgContentWrapper.find('div.extra-items.selected-extra');
    if ($selectedExtra.length == 0) {
        $cfgContentWrapper.append('<div class="extra-items selected-extra"><a class="selected-header"></a><div class="terminator"></div></div>');
        $selectedExtra = $cfgContentWrapper.find('div.extra-items.selected-extra');
    }

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.selectedSkodaCareGroup = null;
    newSettings.viewstate['selectedSkodaCarePresentation-{0}'.format(settings.view)] = 'care';
    newSettings.viewstate.skodaCareToDisplay = 'selected';

    $selectedHeader = $selectedExtra.find('a.selected-header');
    $selectedHeader.text('SelectedSkodaCare'.resx());
    $selectedHeader.attr('href', cfgManager.getUrlOfSettings(newSettings));

    if (settings.viewstate.skodaCareToDisplay == 'selected') {
        $selectedHeader.addClass('active');
    } else {
        $selectedHeader.removeClass('active');
    }
};

HtmlCc.Gui.Web.ConfigurationFinish = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-finish');
    if ($cfgContentWrapper.length == 0) {
        $cfgContent.find('div.cfg-content-wrapper').remove(); // removes content that is not applicable for this step
        $cfgContent.append('<div class="cfg-content-wrapper cfg-content-wrapper-finish"></div>');
        $cfgContentWrapper = $cfgContent.find('div.cfg-content-wrapper.cfg-content-wrapper-finish');
    }

    var finishDisplay = null;
    if (settings.viewstate.finishDisplay) {
        finishDisplay = settings.viewstate.finishDisplay;
    }

    if (finishDisplay == null || finishDisplay == '') {
        finishDisplay = 'info';
    }

    var $finishMenu = $cfgContentWrapper.find('div.finish-menu');
    var finishMenuCreation = false;
    if ($finishMenu.length == 0) {
        $cfgContentWrapper.html('<div class="finish-menu"><a class="finish-item item-info"></a><a class="finish-item item-show"></a><a class="finish-item item-financing"></a><a class="finish-item item-insurance"></a><a class="finish-item item-services"></a><a target="_blank" class="finish-item item-carcard"></a></a><a class="finish-item item-finddealer"></a><a class="finish-item item-wallpaper"></a><a class="finish-item item-sendemail"></a></div>');

        $finishMenu = $cfgContentWrapper.find('div.finish-menu');
        finishMenuCreation = true;
    }

    $finishMenu.find("a.finish-item").bind('click.htmlcc', function () {
        SkodaAuto.Event.publish(
                "gtm.menuItemClick",
                new SkodaAuto.Event.Model.GTMEventParams(
                 "LifeCC Configuration",
                 settings.view,
                 "Menu Clicked: " + $(this).text(),
                 {
                     context: cfgManager.getConfigurator().getCCContext(),
                     model: cfgManager.getConfigurator().getModelCodeShort(),
                     modelBody: cfgManager.getConfigurator().getModelCode(),
                     carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                     configurationId: settings.configurationId,
                     price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                 }
                ));

    });

    var $itemInfo = $finishMenu.find('a.item-info');
    var $itemShow = $finishMenu.find('a.item-show');
    var $itemFinancing = $finishMenu.find('a.item-financing');
    var $itemInsurance = $finishMenu.find('a.item-insurance');
    var $itemServices = $finishMenu.find('a.item-services');
    var $itemCarcard = $finishMenu.find('a.item-carcard');
    var $itemFinddealer = $finishMenu.find('a.item-finddealer');
    var $itemWallpaper = $finishMenu.find('a.item-wallpaper');
    var $itemSendemail = $finishMenu.find('a.item-sendemail');
    //var $savePdf = $finishMenu.find("a.item-savePdf");

    if (finishMenuCreation) {
        // i menu was not created befor, I have to continue with creation
        $itemInfo.text('FinishItemInfo'.resx());
        $itemShow.text('FinishItemShow'.resx());
        $itemFinancing.text('FinishItemFinancing'.resx());
        $itemInsurance.text('FinishItemInsurance'.resx());
        $itemServices.text('FinishItemServices'.resx());
        $itemCarcard.text('FinishItemCarcard'.resx());
        $itemFinddealer.text('FinishItemFinddealer'.resx());
        $itemWallpaper.text('FinishItemWallpaper'.resx());
        $itemSendemail.text('FinishItemSendemail'.resx());

        $itemInfo.append('<div class="next-arrow"></div>');
        $itemShow.append('<div class="next-arrow"></div>');
        $itemFinancing.append('<div class="next-arrow"></div>');
        $itemInsurance.append('<div class="next-arrow"></div>');
        $itemServices.append('<div class="next-arrow"></div>');
        $itemCarcard.append('<div class="next-arrow"></div>');
        $itemFinddealer.append('<div class="next-arrow"></div>');
        $itemWallpaper.append('<div class="next-arrow"></div>');
        $itemSendemail.append('<div class="next-arrow"></div>');

        if (cfgManager.getConfigurator().getSalesProgramSetting("showCarCard") != "true")
            $itemCarcard.hide();
        if (cfgManager.getConfigurator().getSalesProgramSetting("showWallpaper") != "true")
            $itemWallpaper.hide();
        if (cfgManager.getConfigurator().getSalesProgramSetting("showEmail") != "true")
            $itemSendemail.hide();
        if (cfgManager.getConfigurator().getSalesProgramSetting("showSummaryViewCarLink") != "true")
            $itemShow.hide();
    }

    // make item active
    $cfgContentWrapper.find('a.finish-item').removeClass('active');
    switch (finishDisplay) {
        case 'show':
            $itemShow.addClass('active');
            break;
        case 'financing':
            $itemFinancing.addClass('active');
            break;
        case 'insurance':
            $itemInsurance.addClass('active');
            break;
        case 'services':
            $itemServices.addClass('active');
            break;
        case 'carcard':
            $itemCarcard.addClass('active');
            break;
        case 'finddealer':
            $itemFinddealer.addClass('active');
            break;
        case 'wallpaper':
            $itemWallpaper.addClass('active');
            break;
        case 'sendemail':
            $itemSendemail.addClass('active');
            break;
        case 'info':
        default:
            $itemInfo.addClass('active');
    }

    // set the correct hrefs
    var newSettings;
    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.finishDisplay = 'info';
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
    $itemInfo.attr('href', cfgManager.getUrlOfSettings(newSettings));

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.finishDisplay = 'show';
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'exterior';
    $itemShow.attr('href', cfgManager.getUrlOfSettings(newSettings));

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.finishDisplay = 'financing';
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
    $itemFinancing.attr('href', cfgManager.getUrlOfSettings(newSettings));

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.finishDisplay = 'insurance';
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
    $itemInsurance.attr('href', cfgManager.getUrlOfSettings(newSettings));

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.finishDisplay = 'services';
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
    $itemServices.attr('href', cfgManager.getUrlOfSettings(newSettings));

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.finishDisplay = 'finddealer';
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
    $itemFinddealer.attr('href', cfgManager.getUrlOfSettings(newSettings));

    newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.finishDisplay = 'wallpaper';
    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
    $itemWallpaper.attr('href', motor.getWallpaperUrl());
    $itemWallpaper.attr('target', '_blank');
    $itemWallpaper
        .unbind('click')
        .bind('click', function () {
            var animationAngle = $cc.find("div.exterior-presentation").attr("data-angle");
            if (animationAngle == null) {
                animationAngle = 60;
            }

            var configurator = cfgManager.getConfigurator();
            var wallpaperRequest =
                '/Wallpaper/{0}?wallpaperUrl={1}'
                    .format(
                        configurator.getCulture(),
                        encodeURIComponent(decodeURIComponent(motor.getWallpaperUrl()).format(animationAngle / 10)));

            $(this).attr('href', wallpaperRequest);

            SkodaAuto.Event.publish(
                              "event.saveWallpaper",
                              new SkodaAuto.Event.Model.WallpaperEvntParams(
                                   cfgManager.getConfigurator().getInstanceName(),
                                   cfgManager.getConfigurator().getSalesProgramName(),
                                   cfgManager.getConfigurator().getCulture(),
                                   cfgManager.getConfigurator().getModelCode(),
                                   cfgManager.getConfigurator().getCarlineCode(),
                                   settings.view, animationAngle));
        });

    //newSettings = new HtmlCc.Workflow.SettingsType(settings);
    //newSettings.viewstate.displaySendemailDialog = true;
    //newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
    //$itemSendemail.attr('href', cfgManager.getUrlOfSettings(newSettings));
};
HtmlCc.Gui.Web.ConfigurationContentHeader = function ($cc, $cfgContent, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgContent' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $cfgContentHeader = $cfgContent.find('div.cfg-content-header');
    if ($cfgContentHeader.length == 0) {
        $cfgContent.append('<div class="cfg-content-header"></div>');
        $cfgContentHeader = $cfgContent.find('div.cfg-content-header');
    }

    var stepName = settings.view;
    switch (stepName) {
        case 'step1':
            $cfgContentHeader.text('StepEquipmentHeader'.resx());
            break;
        case 'step2':
            $cfgContentHeader.text('StepMotorHeader'.resx());

            // draw motor fuel type selector
            var $fuelSelector = $cfgContentHeader.find('div.fuel-selector');
            if ($fuelSelector.length == 0) {
                $cfgContentHeader.append('<div class="fuel-selector"><select class="fuel-selector-select" name="selected-fuel"></select></div>');

                $fuelSelector = $cfgContentHeader.find('div.fuel-selector');
            }

            // fuel selector is filled later in motor selector
            var $fuelSelect = $fuelSelector.find('select.fuel-selector-select');
            $fuelSelect.find('option').remove();
            break;
        case 'step3':
            $cfgContentHeader.text('StepColorHeader'.resx());
            break;
        case 'step4':
            $cfgContentHeader.text('StepInteriorHeader'.resx());
            break;
        case 'step5':
            $cfgContentHeader.text('StepExtraEquipmentHeader'.resx());
            break;
        case 'step6':
            $cfgContentHeader.text('StepSkodaCareHeader'.resx());
            break;
        case 'step7':
            $cfgContentHeader.text('StepFinishHeader'.resx());
            break;
        default:
            $cfgContentHeader.text('!FIXME!');
    }
};

HtmlCc.Gui.Web.ConfigurationFooter = function ($cc, $cfgBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $cfgFooter = $cfgBox.find('div.cfg-footer');
    if ($cfgFooter.length == 0) {
        $cfgBox.append('<div class="cfg-footer"></div>');
        $cfgFooter = $cfgBox.find('div.cfg-footer');
    }

    HtmlCc.Gui.Web.PriceTable($cc, $cfgFooter, cfgManager, settings);
    HtmlCc.Gui.Web.StepIndicator($cc, $cfgFooter, cfgManager, settings);
};
// displays price table in the footer of configuration box
HtmlCc.Gui.Web.PriceTable = function ($cc, $cfgFooter, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgFooter' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var configuredMotor = cfgManager.getConfigurator().getConfiguredMotor();
    var configuredEquipment = configuredMotor.getEquipment();
    var model = configuredEquipment.getModel();
    var motorId = settings.motor;
    var motor = null;
    var equipment = null;
    var equipments = model.getEquipments();

    var params = cfgManager.getParamsByStepNameWithoutSet('step7');
    motorId = params.motorId;

    if (motorId > 0) {

        // fill with simple motor
        if (motor == null) {
            motor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
        }

        if (motor == null) {

            // check whether motorId matches with configuredMotor; if not, it is reset to null to be filled with lookup
            if (configuredMotor.getId() == motorId) {
                motor = configuredMotor;
            }
        }

        // fill with motor lookup
        if (motor == null) {
            for (var i = 0; i < equipments.length; i++) {
                motor = equipments[i].getMotorLookup(motorId);
                if (motor != null) {
                    break;
                }
            }
        }
    }

    if (motor == null) {
        var equipmentId = settings.equipment;
        if (equipmentId > 0) {
            equipment = model.getEquipment(equipmentId);
        }
        if (equipment == null) {
            equipment = model.getEquipment(model.getDefaultEquipmentId());
        }
        motor = equipment.getMotorLookup(equipment.getDefaultMotorId());
    }

    var firstCreation = false;
    var $priceTable = $cfgFooter.find('table.price-table');
    if ($priceTable.length == 0) {
        $cfgFooter.append('<table class="price-table" cellspacing="0" cellpadding="0"><tr><td class="bottom-line empty-cell">&#160;</td><td class="bottom-line right-line item-column" colspan="2"><div class="item-header"></div></td><td width="30%" class="bottom-line"><div class="entire-car-header"></div></td></tr><tr class="finance-row"><td class="bottom-line"><div class="monthly-rate-header"><a class="monthly-rate-a"></a></div></td><td class="bottom-line right-line item-column"><div class="item-monthly"></div></td><td class="bottom-line"><div class="entire-car-monthly"></div></td></tr><tr><td><div class="total-price-header"></div></td><td class="right-line item-column"><div class="item-complete"></div></td><td><div class="entire-car-extraprice-ico"></div><div class="entire-car-complete"></div></td></tr></table>');
        $priceTable = $cfgFooter.find('table.price-table');
        firstCreation = true;
    }

    var $itemHeader = $priceTable.find('div.item-header');
    var $entireCarHeader = $priceTable.find('div.entire-car-header');
    var $monthlyRateHeader = $priceTable.find('div.monthly-rate-header a.monthly-rate-a');
    var $itemMonthly = $cc.find('div.item-monthly');
    var $entireCarMonthly = $cc.find('div.entire-car-monthly');
    //var $entireCarMonthly = $priceTable.find('div.entire-car-monthly');
    var $totalPriceHeader = $priceTable.find('div.total-price-header');
    var $itemComplete = $priceTable.find('div.item-complete');
    var $entireCarComplete = $priceTable.find('div.entire-car-complete');
    var $extraPrices = $priceTable.find('div.entire-car-extraprice-ico');

    var financing = cfgManager.getConfigurator().getFinancing();

    $entireCarHeader.text('PriceTableEntireCarHeader'.resx());

    var setMonthlyRateHeader = function () {
        if (financing != null) {
            $monthlyRateHeader
                .text(
                    financing.getHasFinancingDefaults(motor) ? 'TentativeFinancingSettingsHeader'.resx() : 'YourFinancingSettingsHeader'.resx());
            if (settings.view == 'step7') {
                $monthlyRateHeader.addClass('disabled');
                $monthlyRateHeader.bind('click.step7', function (e) {
                    e.preventDefault();
                });
            } else {
                $monthlyRateHeader.removeClass('disabled');
                $monthlyRateHeader.unbind("click.step7");
            }
        }
    };

    setMonthlyRateHeader();

    $totalPriceHeader.text('PriceTableTotalPriceHeader'.resx());
    $entireCarComplete.text(motor.getPriceString());

    var newMonthlyRateSettings = new HtmlCc.Workflow.SettingsType(settings);
    newMonthlyRateSettings.viewstate.displayFinancingDialog = true;
    $monthlyRateHeader.attr('href', cfgManager.getUrlOfSettings(newMonthlyRateSettings));
    $monthlyRateHeader
        .unbind('click.htmlcc')
        .bind('click.htmlcc',
               function () {
                   SkodaAuto.Event.publish(
                              "event.setFinancingParamsClick",
                              new SkodaAuto.Event.Model.EventParams(
                                   cfgManager.getConfigurator().getInstanceName(),
                                   cfgManager.getConfigurator().getSalesProgramName(),
                                   cfgManager.getConfigurator().getCulture(),
                                   cfgManager.getConfigurator().getModelCode(),
                                   cfgManager.getConfigurator().getCarlineCode(),
                                   settings.view));
               });

    if (cfgManager.getConfigurator().hasExtraPrices()) {
        $extraPrices.parent().addClass('extra-prices-ico-shown')
        $extraPrices.addClass("show");
        $extraPrices.unbind('mouseenter mouseleave')
        $extraPrices.hover(
            function (evt) {
                var $ccRoot = $cc.find('div.cc-root:first');
                var $extraPriceHover = $("<div class='extra-price-hover' style='position:absolute'><table class='extra-prices-table'></table></div>");
                var ccPos = $cc.offset();

                if ($cc.hasClass('newtablet')) {
                    var offX = 877;
                    var offY = 55;
                }
                else if ($cc.hasClass('tablet')) {
                    var offX = 777;
                    var offY = 620;
                }
                else {
                    var offX = evt.pageX - ccPos.left;
                    var offY = evt.pageY - ccPos.top;
                }
                $extraPriceHover.css({ left: offX, top: offY });

                var $extraPricesTable = $extraPriceHover.find("table.extra-prices-table");

                $.each(motor.getTotalExtraPrices(), function (index, value) {
                    $that = value;
                    var $row = $('<tr>');
                    var $labelCell = $('<th>').html("{0}:".format($that.getLabel()));
                    var $valueCell = $('<td>').html(($that.getValue()));

                    $row.append($labelCell);
                    $row.append($valueCell);

                    $extraPricesTable.append($row);
                });

                $extraPriceHover.append($extraPricesTable);
                $ccRoot.append($extraPriceHover);
            },
            function () {
                if ($cc.find('div.extra-price-hover').length != 0) {
                    $cc.find('div.extra-price-hover').remove();
                }
            });
    }

    var vehicle = HtmlCc.Financial.Motor2Vehicle(motor);
    if (motor.getType() == 'lookup') {
        vehicle.setPriceModel(motor.getPrice());
        vehicle.setPriceTotal(motor.getPrice());
    } else {
        // simple or full
        vehicle.setPriceTotal(motor.getPrice());
        vehicle.setPriceModel(motor.getPriceFrom());
    }

    switch (settings.view) {
        case 'step1':
        case 'step2':
            // no item price to display
            $priceTable.addClass('no-item');
            break;
        case 'step3':
            // display item price at this step
            $itemHeader.text('PriceTableItemExteriorHeader'.resx());
            $priceTable.removeClass('no-item');
            $itemMonthly.text('...');
            $itemComplete.text(motor.getPriceExteriorString());
            motor.getExteriorMonthlyStringAsync(function (monthlyString) {
                $itemMonthly.text(monthlyString);
            });
            break;
        case 'step4':
            // display item price at this step
            $itemHeader.text('PriceTableItemInteriorHeader'.resx());
            $priceTable.addClass('no-item');
            $itemMonthly.text('...');
            $itemComplete.text(motor.getPriceInteriorString());
            motor.getInteriorMonthlyStringAsync(function (monthlyString) {
                $itemMonthly.text(monthlyString);
            });
            break;
        case 'step5':
            $itemHeader.text('PriceTableItemPackagesHeader'.resx().format(motor.getPackages().length));
            $priceTable.removeClass('no-item');
            $itemMonthly.text('...');
            $itemComplete.text(motor.getPricePackagesString());
            motor.getPackagesMonthlyStringAsync(function (monthlyString) {
                $itemMonthly.text(monthlyString);
            });
            break;
        case 'step6':
            // display item price at this step
            $itemHeader.text('PriceTableItemPackagesHeader'.resx().format(motor.getPackages().length));
            $priceTable.removeClass('no-item');
            $itemMonthly.text('...');
            $itemComplete.text(motor.getPricePackagesString());
            motor.getPackagesMonthlyStringAsync(function (monthlyString) {
                $itemMonthly.text(monthlyString);
            });
            break;
        case 'step7':
            $priceTable.addClass('no-item');
            break;
    }

    // monthly rate calculation
    $entireCarMonthly.text('...');
    $entireCarMonthly.addClass('loading');
    if (financing != null) {
        $cc.removeClass('no-finance');
        if ((motor.getType() == 'full' || motor.getType() == 'simple') && settings.view != 'step7') {
           
            motor.executeFinancing(financing, function (data) {

                SkodaAuto.Event.publish(
                                   "event.financingChanged",
                                   new SkodaAuto.Event.Model.ConfigureEvntParams(
                                        settings.instance,      // instanceName
                                        settings.salesprogram,  // salesProgramName
                                        settings.culture,       // culture
                                        settings.model,         // modelCode
                                        settings.carline,       // carlineCode
                                        settings.view,       // step
                                        cfgManager.getConfigurator(),           // configurator
                                        settings.packages,    // packages
                                        motor,            //currentMotor
                                        data

                            ));

                if (settings.view == 'step5' || settings.view == 'step6') {
                    $cc.find('div.extra-content').children().each(function () {
                        $(this).trigger('htmlcc.getMonthlyPrice');
                    });

                    motor.getPackagesMonthlyStringAsync(
                     function (m) {
                         $itemMonthly.text(m);
                         setMonthlyRateHeader();
                     });
                }

                HtmlCc.Libs.Log.log('financing request returned with success');
            }, function () {
                HtmlCc.Libs.Log.warn('financing request failed');
                $entireCarMonthly.text('FinancingFailed'.resx());
            });
        } else if (settings.view != 'step7') {
            cfgManager.configureFromUrl(function () {
                HtmlCc.Libs.Log.log('previous motor has price {0}; price from {1}'.format(motor.getPriceString(), motor.getPriceFromString()));
                motor = cfgManager.getConfigurator().getConfiguredMotor();
                HtmlCc.Libs.Log.log('current motor has price {0}; price from {1}'.format(motor.getPriceString(), motor.getPriceFromString()));
                motor.getMonthlyStringAsync(function (value) {
                    if (settings.configurationEquals(cfgManager.getSettingsFromUrl(cfgManager.getPrefix()))) {
                        $entireCarMonthly.text(value);
                    }
                });
                motor.executeFinancing(financing, function () {
                    HtmlCc.Libs.Log.log('financing request returned with success (2)');
                }, function () {
                    HtmlCc.Libs.Log.warn('financing request failed (2)');
                    $entireCarMonthly.text('FinancingFailed'.resx());
                });
            }, function () {
                HtmlCc.Libs.Log.warn('financing request failed due disability to retrieve simple motor');
            });
        }

        if (settings.view == 'step7') {
            financing.getRateFromDefaults(motor, function (value) {
                $entireCarMonthly.text(value);
                setMonthlyRateHeader();
            }, function () {
                HtmlCc.Libs.Log.warn('financing request failed (2)');
                $entireCarMonthly.text('FinancingFailed'.resx());
            });
            motor.executeFinancing(financing, function (data) {

                SkodaAuto.Event.publish(
                                   "event.financingChanged",
                                   new SkodaAuto.Event.Model.ConfigureEvntParams(
                                        settings.instance,      // instanceName
                                        settings.salesprogram,  // salesProgramName
                                        settings.culture,       // culture
                                        settings.model,         // modelCode
                                        settings.carline,       // carlineCode
                                        settings.view,       // step
                                        cfgManager.getConfigurator(),           // configurator
                                        settings.packages,    // packages
                                        motor,            //currentMotor
                                        data

                            ));

                HtmlCc.Libs.Log.log('financing request returned with success');
            }, function () {
                HtmlCc.Libs.Log.warn('financing request failed');
                $entireCarMonthly.text('FinancingFailed'.resx());
            });
        }
        else {
            motor.getMonthlyStringAsync(function (value) {
                //if (settings.configurationEquals(cfgManager.getSettingsFromUrl(cfgManager.getPrefix()))) {
                $entireCarMonthly.text(value);
                setMonthlyRateHeader();
                //}
                //}
            });
        }
    } else {
        $cc.addClass('no-finance');
    }
};

// displays step indicator
HtmlCc.Gui.Web.StepIndicator = function ($cc, $cfgFooter, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$cfgFooter' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $stepPanel = $cfgFooter.find('div.step-panel');
    if ($stepPanel.length == 0) {
        $cfgFooter.append('<div class="step-panel"><a class="next-button"></a><div class="progress-indicator"><a data-step="step1" class="step-bar"></a><a data-step="step2" class="step-bar"></a><a data-step="step3" class="step-bar"></a><a data-step="step4" class="step-bar"></a><a data-step="step5" class="step-bar"></a><a data-step="step6" class="step-bar"></a><a data-step="step7" class="step-bar"></a><br /><span class="step-label"></span><span class="step-label-header"></span></div><a class="previous-button"></a></div>');
        $stepPanel = $cfgFooter.find('div.step-panel');
    }

    var $nextButton = $stepPanel.find('a.next-button');
    var $previousButton = $stepPanel.find('a.previous-button');
    var $progressIndicator = $stepPanel.find('div.progress-indicator');

    var currentStep = settings.view;

    var nextStep = null;
    var previousStep = null;
    var stepNumber = 0;
    var totalStepNumer = 7;
    switch (currentStep) {
        case 'step1':
            nextStep = 'step2';
            previousStep = 'stepHome'; // ByPS
            stepNumber = 1;
            break;
        case 'step2':
            nextStep = 'step3';
            previousStep = 'step1';
            stepNumber = 2;
            break;
        case 'step3':
            nextStep = 'step4';
            previousStep = 'step2';
            stepNumber = 3;
            break;
        case 'step4':
            nextStep = 'step5';
            previousStep = 'step3';
            stepNumber = 4;
            break;
        case 'step5':
            nextStep = 'step6';
            previousStep = 'step4';
            stepNumber = 5;
            break;
        case 'step6':
            nextStep = 'step7';
            previousStep = 'step5';
            stepNumber = 6;
            break;
        case 'step7':
            previousStep = 'step6';
            stepNumber = 7;
            break;
    }

    $nextButton.text('StepForward'.resx());
    $nextButton.prepend('<div class="forward-arrow"></div>');

    // this could reset view to info view. issue #2525
    var resetCarViewFromSettings = function (settingsToCorrection) {
        switch (currentStep) {
            case 'step5':
                settingsToCorrection.viewstate['selectedPresentation-step6'] = undefined;
                settingsToCorrection.viewstate['selectedPresentation-step7'] = undefined;
                break;
            case 'step6':
                settingsToCorrection.viewstate['selectedPresentation-step5'] = undefined;
                settingsToCorrection.viewstate['selectedPresentation-step7'] = undefined;
                break;
            case 'step7':
                settingsToCorrection.viewstate['selectedPresentation-step5'] = undefined;
                settingsToCorrection.viewstate['selectedPresentation-step6'] = undefined;
                break;
            default:
                settingsToCorrection.viewstate['selectedPresentation-step5'] = undefined;
                settingsToCorrection.viewstate['selectedPresentation-step6'] = undefined;
                settingsToCorrection.viewstate['selectedPresentation-step7'] = undefined;

        }
    };

    if (nextStep != null) {
        var nextSettings = HtmlCc.Workflow.Params2Settings(cfgManager, settings, cfgManager.getParamsByStepNameWithoutSet(nextStep), nextStep);
        if (settings.view == 'step5' && cfgManager.getConfigurator().getSalesProgramSetting("showRecommendedEquipmentAfterStep5") == "true") {
            nextSettings.view = 'step5';
            nextSettings.viewstate.recommendedPopupWindow = true;
        }
        resetCarViewFromSettings(nextSettings);
        $nextButton.attr('href', cfgManager.getUrlOfSettings(nextSettings));
        $nextButton
            .unbind('click.htmlcc')
            .bind('click.htmlcc',
                function () {
                    var configurator = cfgManager.getConfigurator();
                    var params = cfgManager.getParamsByStepName('step1');
                    var motor = null;
                    //var currentMotor = null;
                    var motorId = params.motorId;

                    if (motorId > 0) {
                        // fill with simple motor
                        motor = configurator.getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
                    }
                    if (motor == null || (settings.view != 'step1')) {
                        motor = configurator.getConfiguredMotor();
                    }

                    var financingChanged = null;
                    if (cfgManager.getConfigurator().getFinancing() != null) {
                        financingChanged = cfgManager.getConfigurator().getFinancing().getHasFinancingDefaults(motor) ? 0 : 1;
                    }


                    var equipment = null;
                    var engine = null;
                    var color = null;
                    var exterior = null;
                    var interior = null;
                    var extraEq = null;
                   

                    var wheelCode = motor.getSelectedWheel() != null ? motor.getSelectedWheel().getCode() : null;
                    var color = motor.getSelectedColor() != null ? motor.getSelectedColor().getCode() : motor.getDefaultColor().getCode();
                    var interior = motor.getSelectedInterior() != null ? motor.getSelectedInterior().getCode() : motor.getDefaultInterior().getCode();


                    var itemPrice = 0;
                    var defaultItem = undefined;
                    var itemReplacement = undefined;
                    var itemOrigianl = undefined;
                    switch (settings.view) {
                        case "step1":
                            //itemPrice = 0;
                            // find the cheapest motor in that equipment
                            //var cheapestLookup = null;
                            //var lookups = motor.getEquipment().getMotorLookups();
                            //$.each(lookups, function (k, lookup) {
                            //    if (cheapestLookup == null || cheapestLookup.getPrice() > lookup.getPrice()) {
                            //        cheapestLookup = lookup;
                            //    }
                            //});
                            //if (cheapestLookup != null) {
                            //    itemPrice = cheapestLookup.getPrice();
                            //}
                            itemOrigianl = motor.getEquipment().getModel().getDefaultEquipmentId();
                            defaultItem = motor.getEquipment().getModel().getDefaultEquipmentId() == motor.getEquipment().getId();
                            if (!defaultItem) {
                                itemReplacement = motor.getEquipment().getId();
                            }

                            equipment = motor.getEquipment().getCode();
                            engine = motor.getId();
                            extraEq = settings.packages;

                            break;
                        case "step2":
                            var simpleMotor = cfgManager.getConfigurator().getSimpleMotor(motor.getId(), settings.color, settings.interior, settings.getPackagesArray());
                           // itemPrice = simpleMotor.getPriceFrom();
                            itemOrigianl = motor.getEquipment().getDefaultMotorId();
                            defaultItem = motor.getEquipment().getDefaultMotorId() == motor.getId();
                            if (!defaultItem) {
                                itemReplacement = motor.getId();
                            }
                            equipment = motor.getEquipment().getCode();
                            engine = motor.getId();
                            extraEq = settings.packages;

                            break;
                        case "step3":
                            //itemPrice = motor.getPriceExterior();
                            itemOrigianl = motor.getDefaultColor().getCode() + ";" + motor.getAvailableWheels()[0].getCode();
                            defaultItem = motor.getDefaultColor().getCode() == motor.getSelectedColor().getCode() && motor.getAvailableWheels()[0].getCode() == motor.getSelectedWheel().getCode();
                            if (!defaultItem) {
                                itemReplacement = motor.getSelectedColor().getCode() + ";" + motor.getSelectedWheel().getCode();
                            }
                            equipment = motor.getEquipment().getCode();
                            engine = motor.getId();
                            extraEq = settings.packages;
                            break;
                        case "step4":
                            //itemPrice = motor.getSelectedInterior().getPrice();
                            itemOrigianl = motor.getDefaultInterior().getCode();
                            defaultItem = motor.getDefaultInterior().getCode() == motor.getSelectedInterior().getCode();
                            if (!defaultItem) {
                                itemReplacement = motor.getSelectedInterior().getCode();
                            }
                            equipment = motor.getEquipment().getCode();
                            engine = motor.getId();
                            extraEq = settings.packages;
                            break;
                        case "step5":
                            //itemPrice = motor.getPricePackages();
                            equipment = motor.getEquipment().getCode();
                            engine = motor.getId();
                            extraEq = settings.packages;
                            break;
                        case "step6":
                            //itemPrice = motor.getPricePackages();
                            equipment = motor.getEquipment().getCode();
                            engine = motor.getId();

                            extraEq = settings.packages;
                            break;
                        case "step7":
                            //itemPrice = null;
                            equipment = motor.getEquipment().getCode();
                            engine = motor.getId();
                           
                            extraEq = settings.packages;
                            break;

                    }


                    SkodaAuto.Event.publish(
                        "gtm.funnel",
                        new SkodaAuto.Event.Model.GTMEventParams(
                              "LifeCC Configuration",
                              settings.view,
                              "Funnel: Next",
                                             {
                                                 context: cfgManager.getConfigurator().getCCContext(),
                                                 model: cfgManager.getConfigurator().getModelCodeShort(),
                                                 modelBody: cfgManager.getConfigurator().getModelCode(),
                                                 carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                                 configurationId: settings.configurationId,
                                                 price: motor.getPriceString(),
                                                 equipment: motor.getEquipment().getCode(),
                                                 engine: motor.getId(),
                                                 //gear: cfgManager.getConfigurator().getConfiguredMotor().getGearboxLabel(),
                                                 mbv: motor.getMbvKey(),
                                                 color: color,
                                                 exterior: wheelCode,
                                                 interior: interior,
                                                 extraEq: settings.packages,
                                                 //itemPrice: itemPrice,
                                                 defaultItem: defaultItem,
                                                 itemReplacement: itemReplacement,
                                                 itemOrigianl: defaultItem ? null : itemOrigianl
                                             }
                                            ));

                    SkodaAuto.Event.publish(
                               "event.nextStep",
                               new SkodaAuto.Event.Model.NextStepEvntParams(
                                    cfgManager.getConfigurator().getInstanceName(),
                                    cfgManager.getConfigurator().getSalesProgramName(),
                                    cfgManager.getConfigurator().getCulture(),
                                    cfgManager.getConfigurator().getModelCode(),
                                    cfgManager.getConfigurator().getCarlineCode(),
                                    settings.view,
                                    financingChanged,
                                    cfgManager.getConfigurator()
                        ));



                        SkodaAuto.Event.publish(
                          "gtm.ccLoaded",
                          new SkodaAuto.Event.Model.GTMEventParams(
                             "pageview",
                             null,
                             null,
                             {
                                 instanceName: settings.instance,
                                 salesProgramName: settings.salesprogram,
                                 culture: settings.culture,
                                 groupName: cfgManager.getConfigurator().getPageGroupName(),
                                 pageName: $(document).find("title").text(),
                                 context: cfgManager.getConfigurator().getCCContext(),
                                 model: cfgManager.getConfigurator().getModelCodeShort(),
                                 modelBody: cfgManager.getConfigurator().getModelCode(),
                                 carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                 price: motor.getPriceString(),
                                 equipment: equipment,
                                 engine: engine,
                                 mbv: motor.getMbvKey(),
                                 color: color,
                                 exterior: exterior,
                                 interior: interior,
                                 extraEq: extraEq
                             }
                        ));
                  // SkodaAuto.Event.publish(
                  //      "gtm.pageView",
                  //      new SkodaAuto.Event.Model.GTMEventParams(
                  //     "pageview",
                  //     null,
                  //     null,
                  //     {
                  //         instanceName: settings.instance,
                  //         salesProgramName: settings.salesprogram,
                  //         culture: settings.culture,
                  //         groupName: cfgManager.getConfigurator().getPageGroupName(),
                  //         pageName: $(document).find("title").text(),
                  //         context: cfgManager.getConfigurator().getCCContext(),
                  //         price: motor.getPriceString(),
                  //         equipment: equipment,
                  //         engine: engine,
                  //         mbv: motor.getMbvKey(),
                  //         color: color,
                  //         exterior: exterior,
                  //         interior: interior,
                  //         extraEq: extraEq
                  //     }
                  //));


                });
    }

    $previousButton.text('StepBack'.resx());
    // ByPS START
    if (stepNumber == 1) {
        $previousButton.text('StepHome'.resx());
    }
    // ByPS KOENC
    $previousButton.prepend('<div class="previous-arrow"></div>');

    if (previousStep != null) {
        // ByPS START
        if (stepNumber == 1 && $cc.hasClass('dealer')) {
            if ($('body').hasClass('digitall')) {
                $previousButton.attr('href', cfgManager.getConfigurator().getDealerConfiguratorHomepageUrl() + "?carline=" + cfgManager.getConfigurator().getCarlineCode() + "&digitall=true");
            }
            else {
            $previousButton.attr('href', cfgManager.getConfigurator().getDealerConfiguratorHomepageUrl() + "?carline=" + cfgManager.getConfigurator().getCarlineCode());
            }
            $previousButton.unbind('click.htmlcc');
            //$previousButton.addClass('disabled');
            //$previousButton.unbind('click.htmlcc');
        }
        else if (stepNumber == 1 && !$cc.hasClass('dealer')) {
            if ($('body').hasClass('digitall')) {
                $previousButton.attr('href', cfgManager.getConfigurator().getConfiguratorHomepageUrl() + "?carline=" + cfgManager.getConfigurator().getCarlineCode() + "&digitall=true");
            }
            else {
            $previousButton.attr('href', cfgManager.getConfigurator().getConfiguratorHomepageUrl() + "?carline=" + cfgManager.getConfigurator().getCarlineCode());
            }
            $previousButton.unbind('click.htmlcc');
        }
        else
            // ByPS KONEC
        {
            var previousSettings = HtmlCc.Workflow.Params2Settings(cfgManager, settings, cfgManager.getParamsByStepName(previousStep), previousStep);
            resetCarViewFromSettings(previousSettings);
            $previousButton.attr('href', cfgManager.getUrlOfSettings(previousSettings));
            $previousButton
             .unbind('click.htmlcc')
             .bind('click.htmlcc',
                 function () {
                     var motor = cfgManager.getConfigurator().getConfiguredMotor();
                     var itemPrice = 0;
                     var defaultItem = undefined;
                     var itemReplacement = undefined;
                     var itemOrigianl = undefined;
                     switch(settings.view){
                         case "step1":
                             itemPrice = 0;
                             // find the cheapest motor in that equipment
                             var cheapestLookup = null;
                             var lookups = motor.getEquipment().getMotorLookups();
                             $.each(lookups, function (k, lookup) {
                                 if (cheapestLookup == null || cheapestLookup.getPrice() > lookup.getPrice()) {
                                     cheapestLookup = lookup;
                                 }
                             });
                             if (cheapestLookup != null) {
                                 itemPrice = cheapestLookup.getPrice();
                             }
                             itemOrigianl = motor.getEquipment().getModel().getDefaultEquipmentId();                             
                             defaultItem = motor.getEquipment().getModel().getDefaultEquipmentId() == motor.getEquipment().getId();
                             if (!defaultItem) {
                                 itemReplacement = motor.getEquipment().getId();
                             }
                             break;
                         case "step2":
                             var simpleMotor = cfgManager.getConfigurator().getSimpleMotor(motor.getId(), settings.color, settings.interior, settings.getPackagesArray());
                             //itemPrice = simpleMotor.getPriceFrom();
                             itemOrigianl = motor.getEquipment().getDefaultMotorId();
                             defaultItem = motor.getEquipment().getDefaultMotorId() == motor.getId();
                             if (!defaultItem) {
                                 itemReplacement = motor.getId();
                             }
                             break;
                        case "step3":
                             //itemPrice = motor.getPriceExterior();
                             itemOrigianl = motor.getDefaultColor().getCode() + ";" + motor.getAvailableWheels()[0].getCode();
                             defaultItem = motor.getDefaultColor().getCode() == motor.getSelectedColor().getCode() && motor.getAvailableWheels()[0].getCode() == motor.getSelectedWheel().getCode();
                             if (!defaultItem) {
                                 itemReplacement = motor.getSelectedColor().getCode() + ";" + motor.getSelectedWheel().getCode();
                             }                             
                             break;
                         case "step4":
                             //itemPrice = 0;
                             itemOrigianl = motor.getDefaultInterior().getCode();
                             defaultItem = motor.getDefaultInterior().getCode() == motor.getSelectedInterior().getCode();
                             if (!defaultItem) {
                                 itemReplacement = motor.getSelectedInterior().getCode();
                             }
                             break;
                         case "step5":
                             //itemPrice = motor.getPricePackages();
                             break;
                         case "step6":
                             //itemPrice = motor.getPricePackages();
                             break;
                         case "step7":
                             //itemPrice = 0;
                             break;

                 }

                     var interior = motor.getSelectedInterior() != null ? motor.getSelectedInterior().getCode() : motor.getDefaultInterior().getCode();
                     var color = motor.getSelectedColor() != null ? motor.getSelectedColor().getCode() : motor.getDefaultColor().getCode();
                     var wheelCode = motor.getSelectedWheel() != null ? motor.getSelectedWheel().getCode() : motor.getAvailableWheels()[0].getCode();

                     SkodaAuto.Event.publish(
                         "gtm.funnel",
                         new SkodaAuto.Event.Model.GTMEventParams(
                               "LifeCC Configuration",
                               settings.view,
                               "Funnel: Previous",
                                              {
                                                  context: cfgManager.getConfigurator().getCCContext(),
                                                  model: cfgManager.getConfigurator().getModelCodeShort(),
                                                  modelBody: cfgManager.getConfigurator().getModelCode(),
                                                  carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                                  configurationId: settings.configurationId,
                                                  price: motor.getPriceString(),
                                                  equipment: motor.getEquipment().getCode(),
                                                  engine: motor.getId(),
                                                  //gear: cfgManager.getConfigurator().getConfiguredMotor().getGearboxLabel(),
                                                  mbv: motor.getMbvKey(),
                                                  color: color,
                                                  exterior: wheelCode,
                                                  interior: interior,
                                                  extraEq: settings.packages,
                                                  //itemPrice: itemPrice,
                                                  defaultItem: defaultItem,
                                                  itemReplacement: itemReplacement,
                                                  itemOrigianl: defaultItem ? null : itemOrigianl
                                              }
                                             ));

                     SkodaAuto.Event.publish(
                                "event.backStep",
                                new SkodaAuto.Event.Model.EventParams(
                                     cfgManager.getConfigurator().getInstanceName(),
                                     cfgManager.getConfigurator().getSalesProgramName(),
                                     cfgManager.getConfigurator().getCulture(),
                                     cfgManager.getConfigurator().getModelCode(),
                                     cfgManager.getConfigurator().getCarlineCode(),
                                     settings.view,
                                     cfgManager.getConfigurator()
                         ));
                 });
        }
    }

    var activeFound = false;
    $stepPanel.find('a.step-bar').each(function () {
        var $stepBar = $(this);
        var step = $stepBar.attr('data-step');
        if (activeFound === false) {
            $stepBar.addClass('active');
            var href = cfgManager.getUrlOfSettings(HtmlCc.Workflow.Params2Settings(cfgManager, settings, cfgManager.getParamsByStepName(step), step));
            $stepBar.attr('href', href);
            $stepBar.bind('click.htmlcc', function () {
                $cc.find('div.cc-root div.step-hover').remove();
            });
        } else {
            $stepBar.removeClass('active');
            $stepBar.attr('href', null);
        }
        if (step == currentStep) {
            activeFound = true;
        }

        if ($stepBar.hasClass('active')) {
            switch (step) {
                case 'step1':
                    HtmlCc.Gui.Web.StepBarHover($cc, $stepBar, cfgManager, settings, step);
                    break;
                case 'step2':
                    HtmlCc.Gui.Web.StepBarHover($cc, $stepBar, cfgManager, settings, step);
                    break;
                case 'step3':
                    HtmlCc.Gui.Web.StepBarHover($cc, $stepBar, cfgManager, settings, step);
                    break;
                case 'step4':
                    HtmlCc.Gui.Web.StepBarHover($cc, $stepBar, cfgManager, settings, step);
                    break;
                case 'step5':
                    HtmlCc.Gui.Web.StepBarHover($cc, $stepBar, cfgManager, settings, step);
                    break;
                case 'step6':
                    HtmlCc.Gui.Web.StepBarHover($cc, $stepBar, cfgManager, settings, step);
                    break;
                case 'step7':
                    HtmlCc.Gui.Web.StepBarHover($cc, $stepBar, cfgManager, settings, step);
                    break;
            }
        }
    });

    var stepDialogOpen = function () {
        if ($cc.hasClass('tablet')) {
            var $ccRoot = $cc.find('div.cc-root:first');
            $ccRoot.find('div.dialog.step-dialog:first').remove();
            if ($cc.hasClass('newtablet')) {
                $ccRoot.append('<div class="dialog step-dialog"><div class="dialog-inner choose-item-box"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><div class="close-box"><a class="close">{0}</a></div></div><div class="dialog-content"><div class="step-summary"></div></div><div class="dialog-waiting"></div></div></div>'.format('Tbl_ChosenItems'.resx()));
            }
            else {
                $ccRoot.append('<div class="dialog step-dialog"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"><div class="step-summary"></div></div><div class="dialog-waiting"></div></div></div>');
            }
            var $dialog = $ccRoot.find('div.dialog.step-dialog:first');
            $dialog.find('div.header-text-inner').text('StepDialogHeader'.resx());
            var $dialogContent = $dialog.find('div.dialog-content');
            var $stepSummary = $dialogContent.find('div.step-summary');

            $dialog.find('a.close').attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
                evt.preventDefault();
                $dialog.remove();
            });
            var $progressIndicator = $cfgFooter.find('div.progress-indicator');
            $.each(['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'], function (stepIndex, thisStep) {
                $dialogContent.append('<a class="step-dialog-{0} step"></a>'.format(thisStep));
                var $thisStep = $dialogContent.find('a.step-dialog-{0}'.format(thisStep));
                $thisStep.text('StepLabelTablet_{0}'.format(thisStep).resx());
                var thisStepHref = $progressIndicator.find('a.step-bar[data-step={0}]'.format(thisStep)).attr('href');
                $thisStep.attr('href', thisStepHref);
                $thisStep.bind('click.htmlcc', function (evt) {
                    evt.preventDefault();
                    var targetUrl = $thisStep.attr('href');
                    if (targetUrl) {
                        $dialog.remove();
                        location.href = targetUrl;
                    }
                });

                if (thisStepHref) {
                    switch (thisStep) {
                        case 'step1':
                            HtmlCc.Gui.Web.Step1Summary($cc, $stepSummary, cfgManager, settings);
                            break;
                        case 'step2':
                            HtmlCc.Gui.Web.Step2Summary($cc, $stepSummary, cfgManager, settings);
                            break;
                        case 'step3':
                            HtmlCc.Gui.Web.Step3Summary($cc, $stepSummary, cfgManager, settings);
                            break;
                        case 'step4':
                            HtmlCc.Gui.Web.Step4Summary($cc, $stepSummary, cfgManager, settings);
                            break;
                        case 'step5':
                            HtmlCc.Gui.Web.Step5Summary($cc, $stepSummary, cfgManager, settings);
                            break;
                        case 'step6':
                            HtmlCc.Gui.Web.Step6Summary($cc, $stepSummary, cfgManager, settings);
                            break;
                        case 'step7':
                            HtmlCc.Gui.Web.Step7Summary($cc, $stepSummary, cfgManager, settings);
                            break;
                    }
                }
            });

            $stepSummary.append('<div class="terminator"></div>');

            // align the collumns at the bottom
            var stepSummaryHeight = $stepSummary.innerHeight();
            $stepSummary.find('div.step-hover').each(function () {
                var $thisBox = $(this);
                $thisBox.css('top', stepSummaryHeight - $thisBox.height() - 10);
            });
        }
    };
    $stepPanel.find('span.step-label-header').text('StepLabelHeader'.resx()).unbind('click.htmlcc').bind('click.htmlcc', stepDialogOpen);
    var $stepLabel = $stepPanel.find('span.step-label');
    $stepLabel.text('StepLabel'.resx().format(stepNumber, totalStepNumer));
    $stepLabel.unbind('click.htmlcc').bind('click.htmlcc', stepDialogOpen);

    var makeCorrectSize = function () {
        var prevWidth = $previousButton.innerWidth();
        var nextWidth = $nextButton.innerWidth();
        var buttonWidths = prevWidth + nextWidth + 20;

        $progressIndicator.css({
            width: 438 - buttonWidths,
            left: prevWidth + 10
        });
    };

    makeCorrectSize();

    // sometimes it is slow and I have to reposition it
    setTimeout(makeCorrectSize, 100);
};

HtmlCc.Gui.Web.Step1Summary = function ($cc, $target, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$target' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var stepHoverId = HtmlCc.Libs.randomString(8);
    $target.append('<div id="{0}" class="step-hover"><div class="step-hover-header"></div><div class="step-hover-scrollable"><div class="step-hover-section"><div class="step-hover-section-header"></div><div class="step-hover-section-text"></div></div></div></div>'.format(stepHoverId));
    var $stepHover = $target.find('div#{0}'.format(stepHoverId));

    var $stepHoverHeader = $stepHover.find('div.step-hover-header');

    var $stepHoverScrollable = $stepHover.find('div.step-hover-scrollable');
    var $stepHoverSection = $stepHoverScrollable.find('div.step-hover-section');
    var $stepHoverSectionHeader = $stepHoverSection.find('div.step-hover-section-header');
    var $stepHoverSectionText = $stepHoverSection.find('div.step-hover-section-text');

    $stepHover.addClass('step-{0}'.format('step1'));

    // fills the template
    var params = cfgManager.getParamsByStepName('step1');
    var motor = null;
    var motorId = params.motorId;

    if (motorId > 0) {
        // fill with simple motor
        motor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
    }

    if (motor == null) {
        motor = cfgManager.getConfigurator().getConfiguredMotor();
    }
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    $stepHoverHeader.text('StepBarStep1Header'.resx());
    if (!$cc.hasClass('newtablet')) {
        $stepHoverSectionHeader.text('StepBarStep1SectionHeaderEquipment'.resx());
    }
    $stepHoverSectionText.text(equipment.getName());
};

HtmlCc.Gui.Web.Step2Summary = function ($cc, $target, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$target' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var stepHoverId = HtmlCc.Libs.randomString(8);
    $target.append('<div id="{0}" class="step-hover"><div class="step-hover-header"></div><div class="step-hover-scrollable"><div class="step-hover-section"><div class="step-hover-section-header"></div><div class="step-hover-section-text"></div></div></div></div>'.format(stepHoverId));
    var $stepHover = $target.find('div#{0}'.format(stepHoverId));

    var $stepHoverHeader = $stepHover.find('div.step-hover-header');

    var $stepHoverScrollable = $stepHover.find('div.step-hover-scrollable');
    var $stepHoverSection = $stepHoverScrollable.find('div.step-hover-section');
    var $stepHoverSectionHeader = $stepHoverSection.find('div.step-hover-section-header');
    var $stepHoverSectionText = $stepHoverSection.find('div.step-hover-section-text');

    $stepHover.addClass('step-{0}'.format('step2'));

    // fills the template
    var params = cfgManager.getParamsByStepName('step2');
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    $stepHoverHeader.text('StepBarStep2Header'.resx());
    if (!$cc.hasClass('newtablet')) {
        $stepHoverSectionHeader.text('StepBarStep2SectionHeaderEngine'.resx());
    }
    $stepHoverSectionText.text(motor.getName());
};

HtmlCc.Gui.Web.Step3Summary = function ($cc, $target, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$target' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var stepHoverId = HtmlCc.Libs.randomString(8);
    $target.append('<div id="{0}" class="step-hover"><div class="step-hover-header"></div><div class="step-hover-scrollable"><div class="step-hover-section"><div class="step-hover-section-header"></div><div class="step-hover-section-text"></div></div></div></div>'.format(stepHoverId));
    var $stepHover = $target.find('div#{0}'.format(stepHoverId));

    var $stepHoverHeader = $stepHover.find('div.step-hover-header');

    var $stepHoverScrollable = $stepHover.find('div.step-hover-scrollable');
    var $stepHoverSection = $stepHoverScrollable.find('div.step-hover-section');
    var $stepHoverSectionHeader = $stepHoverSection.find('div.step-hover-section-header');
    var $stepHoverSectionText = $stepHoverSection.find('div.step-hover-section-text');

    $stepHover.addClass('step-{0}'.format('step3'));

    // fills the template
    var params = cfgManager.getParamsByStepName('step3');
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    $stepHoverHeader.text('StepBarStep3Header'.resx());

    var $wheelHoverSection = $stepHoverSection.clone();

    $stepHoverScrollable.append($wheelHoverSection);
    if (!$cc.hasClass('newtablet')) {
        $stepHoverSectionHeader.text('StepBarStep3SectionHeaderColor'.resx());
    }
    $stepHoverSectionText.text(motor.getSelectedColor().getName());

    $stepHoverSectionText.append('<div class="step-hover-section-price"></div>');
    var $price = $stepHoverSectionText.find('div.step-hover-section-price');
    $price.text(motor.getSelectedColor().getPriceString());

    var $wheelHoverSectionHeader = $wheelHoverSection.find('div.step-hover-section-header');
    var $wheelHoverSectionText = $wheelHoverSection.find('div.step-hover-section-text');

    if (!$cc.hasClass('newtablet')) {
        $wheelHoverSectionHeader.text('StepBarStep3SectionHeaderWheels'.resx());
    }
    if (motor.getSelectedWheel() != null) {
        var wheel = motor.getAvailableWheel(motor.getSelectedWheel().getCode());
        if (wheel != null) {
            $wheelHoverSectionText.text(wheel.getName());
            $wheelHoverSectionText.append('<div class="step-hover-section-price"></div>');
            var $price = $wheelHoverSectionText.find('div.step-hover-section-price');
            $price.text(wheel.getPriceString());
        } else {
            $wheelHoverSectionText.text('StepBarStep3UnknownWheel'.resx());
        }
    }
};

HtmlCc.Gui.Web.Step4Summary = function ($cc, $target, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$target' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var stepHoverId = HtmlCc.Libs.randomString(8);
    $target.append('<div id="{0}" class="step-hover"><div class="step-hover-header"></div><div class="step-hover-scrollable"><div class="step-hover-section"><div class="step-hover-section-header"></div><div class="step-hover-section-text"></div></div></div></div>'.format(stepHoverId));
    var $stepHover = $target.find('div#{0}'.format(stepHoverId));

    var $stepHoverHeader = $stepHover.find('div.step-hover-header');

    var $stepHoverScrollable = $stepHover.find('div.step-hover-scrollable');
    var $stepHoverSection = $stepHoverScrollable.find('div.step-hover-section');
    var $stepHoverSectionHeader = $stepHoverSection.find('div.step-hover-section-header');
    var $stepHoverSectionText = $stepHoverSection.find('div.step-hover-section-text');

    $stepHover.addClass('step-{0}'.format('step4'));

    // fills the template
    var params = cfgManager.getParamsByStepName('step4');
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    $stepHoverHeader.text('StepBarStep4Header'.resx());
    if (!$cc.hasClass('newtablet')) {
        $stepHoverSectionHeader.text('StepBarStep4SectionHeaderInterior'.resx());
    }
    $stepHoverSectionText.text(motor.getSelectedInterior().getName());
    $stepHoverSectionText.append('<div class="step-hover-section-price"></div>');
    var $price = $stepHoverSectionText.find('div.step-hover-section-price');
    $price.text(motor.getSelectedInterior().getPriceString());
};

HtmlCc.Gui.Web.Step5Summary = function ($cc, $target, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$target' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var stepHoverId = HtmlCc.Libs.randomString(8);
    $target.append('<div id="{0}" class="step-hover"><div class="step-hover-header"></div><div class="step-hover-scrollable"><div class="step-hover-section"><div class="step-hover-section-text"></div></div></div></div>'.format(stepHoverId));
    var $stepHover = $target.find('div#{0}'.format(stepHoverId));

    var $stepHoverHeader = $stepHover.find('div.step-hover-header');

    var $stepHoverScrollable = $stepHover.find('div.step-hover-scrollable');
    var $stepHoverSection = $stepHoverScrollable.find('div.step-hover-section');
    var $stepHoverSectionHeader = $stepHoverSection.find('div.step-hover-section-header');

    var $stepHoverSectionText = $stepHoverSection.find('div.step-hover-section-text');

    $stepHover.addClass('step-{0}'.format('step5'));

    // fills the template
    var params = cfgManager.getParamsByStepName('step5');
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    $stepHoverHeader.text('StepBarStep5Header'.resx());

    $stepHoverSection.detach();

    var packages = motor.getPackages().slice();

    var buildExtraSection = function ($section, index) {
        if (packages.length > index) {
            var foundPkg = motor.getAvailablePackage(packages[index].getCode());

            if (foundPkg != null) {
                var $newSection = $stepHoverSection.clone();
                //$newSection.find('div.step-hover-section-header').text('StepBarStep5SectionHeaderExtra'.resx());
                var $hoverText = $newSection.find('div.step-hover-section-text');
                $hoverText.text(foundPkg.getName() || foundPkg.getCode());
                $hoverText.append('<div class="step-hover-section-price"></div>');
                var $price = $hoverText.find('div.step-hover-section-price');
                if (foundPkg.hasQuantity()) {
                    $price.text('QuantityPriceFormat{0}'.format(packages[index].getQuantity()).resx().format(foundPkg.getPriceString(), packages[index].getQuantity()));
                } else {
                    $price.text(foundPkg.getPriceString() || '');
                }

                $stepHoverScrollable.append($newSection);
            }

            buildExtraSection($stepHoverSection, index + 1);
        }
    };

    buildExtraSection($stepHoverSection, 0);

    if (packages.length == 0) {
        $stepHoverScrollable.remove();
    }
};

HtmlCc.Gui.Web.Step6Summary = function ($cc, $target, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$target' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var stepHoverId = HtmlCc.Libs.randomString(8);
    $target.append('<div id="{0}" class="step-hover"><div class="step-hover-header"></div><div class="step-hover-scrollable"><div class="step-hover-section"><div class="step-hover-section-header"></div><div class="step-hover-section-text"></div></div></div></div>'.format(stepHoverId));
    var $stepHover = $target.find('div#{0}'.format(stepHoverId));

    var $stepHoverHeader = $stepHover.find('div.step-hover-header');

    var $stepHoverScrollable = $stepHover.find('div.step-hover-scrollable');
    var $stepHoverSection = $stepHoverScrollable.find('div.step-hover-section');
    var $stepHoverSectionHeader = $stepHoverSection.find('div.step-hover-section-header');
    var $stepHoverSectionText = $stepHoverSection.find('div.step-hover-section-text');

    $stepHover.addClass('step-{0}'.format('step6'));

    // fills the template
    var params = cfgManager.getParamsByStepName('step6');
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    $stepHoverHeader.text('StepBarStep6Header'.resx());
    $stepHoverSection.detach();

    var packages = motor.getPackages().slice();
    // add mobility insurance which is always selected
    $.each(motor.getAvailableSkodaCareGroups(), function () {
        var grp = this;
        if (grp.getGroupType() == 1) {
            $.each(grp.getPackages(), function () {
                packages.push(this);
            });
        }
    });

    var buildExtraSection = function ($section, index) {
        if (packages.length > index) {
            var foundPkg = motor.getAvailablePackageInSkodaCare(packages[index].getCode());

            if (foundPkg != null) {
                var $newSection = $stepHoverSection.clone();
                if (!$cc.hasClass('newtablet')) {
                    $newSection.find('div.step-hover-section-header').text('StepBarStep6SectionHeaderCare'.resx());
                }
                var $hoverText = $newSection.find('div.step-hover-section-text');
                $hoverText.text(foundPkg.getName() || foundPkg.getCode());
                $hoverText.append('<div class="step-hover-section-price"></div>');
                var $price = $hoverText.find('div.step-hover-section-price');
                $price.text(foundPkg.getPriceString() || '');
                $stepHoverScrollable.append($newSection);
            }

            buildExtraSection($stepHoverSection, index + 1);
        }
    };

    buildExtraSection($stepHoverSection, 0);

    if (packages.length == 0) {
        $stepHoverScrollable.remove();
    }
};

HtmlCc.Gui.Web.Step7Summary = function ($cc, $target, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$target' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var stepHoverId = HtmlCc.Libs.randomString(8);
    $target.append('<div id="{0}" class="step-hover"><div class="step-hover-header"></div><div class="step-hover-scrollable"><div class="step-hover-section"><div class="step-hover-section-header"></div><div class="step-hover-section-text"></div></div></div></div>'.format(stepHoverId));
    var $stepHover = $target.find('div#{0}'.format(stepHoverId));

    var $stepHoverHeader = $stepHover.find('div.step-hover-header');

    var $stepHoverScrollable = $stepHover.find('div.step-hover-scrollable');
    var $stepHoverSection = $stepHoverScrollable.find('div.step-hover-section');
    var $stepHoverSectionHeader = $stepHoverSection.find('div.step-hover-section-header');
    var $stepHoverSectionText = $stepHoverSection.find('div.step-hover-section-text');

    $stepHover.addClass('step-{0}'.format('step7'));

    // fills the template
    var params = cfgManager.getParamsByStepName('step7');
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    $stepHoverHeader.text('StepBarStep7Header'.resx());
    $stepHoverScrollable.remove();
};

// handles hover action over step bar item
HtmlCc.Gui.Web.StepBarHover = function ($cc, $stepBar, cfgManager, settings, stepName) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$stepBar' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='stepName' type='String' />
    /// </signature>

    $stepBar.unbind('hover.htmlcc');

    $stepBar.bind('hover.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        HtmlCc.Libs.Log.log('hover: ' + stepName);

        $ccRoot.find('div.step-hover').remove();

        $stepBar.toggleClass('hover');

        setTimeout(function () {
            if ($stepBar.hasClass('hover')) {
                //if ($stepBar.is(':hover')) {
                switch (stepName) {
                    case 'step1':
                        HtmlCc.Gui.Web.Step1Summary($cc, $ccRoot, cfgManager, settings);
                        break;
                    case 'step2':
                        HtmlCc.Gui.Web.Step2Summary($cc, $ccRoot, cfgManager, settings);
                        break;
                    case 'step3':
                        HtmlCc.Gui.Web.Step3Summary($cc, $ccRoot, cfgManager, settings);
                        break;
                    case 'step4':
                        HtmlCc.Gui.Web.Step4Summary($cc, $ccRoot, cfgManager, settings);
                        break;
                    case 'step5':
                        HtmlCc.Gui.Web.Step5Summary($cc, $ccRoot, cfgManager, settings);
                        break;
                    case 'step6':
                        HtmlCc.Gui.Web.Step6Summary($cc, $ccRoot, cfgManager, settings);
                        break;
                    case 'step7':
                        HtmlCc.Gui.Web.Step7Summary($cc, $ccRoot, cfgManager, settings);
                        break;
                    default:
                        throw new Error('Unexpected step name.');
                }

                var closeFunction = function () {
                    cancelClose();
                    var timeout = setTimeout(function () {
                        $ccRoot.find('div.step-hover.step-{0}'.format(stepName)).remove();
                        $stepBar.removeClass('hover');
                    }, 500);
                    $ccRoot.find('div.step-hover.step-{0}'.format(stepName)).data('closetimeout', timeout);
                };
                var cancelClose = function () {
                    if ($ccRoot.find('div.step-hover.step-{0}'.format(stepName)).data('closetimeout')) {
                        clearTimeout($ccRoot.find('div.step-hover.step-{0}'.format(stepName)).data('closetimeout'));
                    }
                };

                var $stepHover = $ccRoot.find('div.step-hover');
                cancelClose();
                $stepBar.bind('mouseleave.htmlcc', function () {
                    HtmlCc.Libs.Log.log('leave: ' + stepName);
                    closeFunction();
                });
                $stepHover.bind('mouseenter.htmlcc', function () {
                    HtmlCc.Libs.Log.log('hover enter: ' + stepName);
                    cancelClose();
                });
                $stepHover.bind('mouseleave.htmlcc', function () {
                    HtmlCc.Libs.Log.log('hover leave: ' + stepName);
                    closeFunction();
                });
            }
        }, 200);
    });
};

// dipslays presentarion box
HtmlCc.Gui.Web.PresentationBox = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$ccRoot' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $presentationBox = $ccRoot.find('div.presentation-box');
    if ($presentationBox.length == 0) {
        $ccRoot.append('<div class="presentation-box"></div>');
        $presentationBox = $ccRoot.find('div.presentation-box');
    }

    var currentStep = cfgManager.getCurrentStepName();

    switch (currentStep) {
        case 'step1':
        case 'step2':
        case 'step3':
            HtmlCc.Gui.Web.PresentatePresentation($cc, $presentationBox, cfgManager, settings);
            break;
        case 'step4':
            HtmlCc.Gui.Web.PresentatePresentation($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
            break;
        case 'step5':
            HtmlCc.Gui.Web.PresentatePresentation($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateExtraEquipment($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
            break;
        case 'step6':
            HtmlCc.Gui.Web.PresentatePresentation($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateInsurance($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
            break;
        case 'step7':
            HtmlCc.Gui.Web.PresentatePresentation($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateFinish($cc, $presentationBox, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
            break;
        default:

    }

    HtmlCc.Gui.Web.NavigationLayer($cc, $presentationBox, cfgManager, settings);

    // setup lower copyright content
    HtmlCc.Gui.Web.CopyrightNoteLink($cc, $presentationBox, cfgManager, settings);
};

HtmlCc.Gui.Web.NavigationLayer = function ($cc, $presentationBox, cfgManager, settings) {
    if (!HtmlCc.Gui.Web.IsVredAvailable($cc)) {
        if ($presentationBox.find('div.exterior-presentation').length != 0) {

            var $navigationBox = $presentationBox.find('div.navigation-box');
            var $exterior = $cc.find('div.exterior-presentation');

            var $navigationBox = $presentationBox.find('div.navigation-box');

            if ($navigationBox.length != 0) {
                $navigationBox.remove();
            }

            $presentationBox.append('<div class="navigation-box"></div>');
            $navigationBox = $presentationBox.find('div.navigation-box');

            var savedXTouchPosition = 0;
            var lastX = 0;

            var isNavigationBoxMouseDown = false;

            $navigationBox
                .mousedown(function (event) {
                    isNavigationBoxMouseDown = true;

                    //HtmlCc.Libs.Log.log('mouse down start');
                    document.onselectstart = function () {
                        event.preventDefault();
                        return false;
                    };
                });

            $cc.mouseup(function (event) {
                if (isNavigationBoxMouseDown) {
                    document.onselectstart = null;
                }
            });

            $navigationBox
                .hammer().bind("dragstart", function (event) {
                    lastX = event.position.x;
                    savedXTouchPosition = 0;
                    event.preventDefault();

                    //HtmlCc.Libs.Log.log('drag start');
                })
                .hammer().bind('drag', function (event) {
                    var dx = event.position.x - lastX;

                    savedXTouchPosition += dx;
                    if (savedXTouchPosition > 10) {
                        savedXTouchPosition = 0;
                        $exterior.trigger('rotateclockwise');
                    } else if (savedXTouchPosition < -10) {
                        savedXTouchPosition = 0;
                        $exterior.trigger('rotatecounterclockwise');
                    }

                    lastX = event.position.x;
                    event.preventDefault();

                    //HtmlCc.Libs.Log.log('drag dx: {0}, pageX: {1}, lastX: {2}, savedXTouchPosition: {3} '.format(dx, event.originalEvent.pageX, lastX, savedXTouchPosition));
                })
                .hammer().bind('dragend', function (event) {
                    savedXTouchPosition = 0;
                    lastX = 0;
                    event.preventDefault();
                    //document.onselectstart = null;

                    //HtmlCc.Libs.Log.log('dragend');
                    $cc.focus();
                });

        }
    }
        // vred is available
    else {
        HtmlCc.Vred.setup(cfgManager);

        if ($presentationBox.find('div.interior-presentation').length != 0
            || $presentationBox.find('div.exterior-presentation').length != 0
            || $presentationBox.find('div.exterior-viewpoints-presentation').length != 0) {

            var $navigationBox = $presentationBox.find('div.navigation-box');

            if ($navigationBox.length != 0) {
                $navigationBox.remove();
            }

            $presentationBox.append('<div class="navigation-box" id="{0}"></div>'.format(HtmlCc.Libs.randomString(8)));
            $navigationBox = $presentationBox.find('div.navigation-box');
            HtmlCc.Vred.navigate($navigationBox);

            $navigationBox.bind('touchmove.htmlcc', function (evt) {
                if ($cc.hasClass('tablet')) {
                    evt.preventDefault();
                }
            });

        }
    }
};

HtmlCc.Gui.Web.MickeyMouseLayer = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var $mickeyMouseLayer = $presentationBox.find('div.mickey-mouse-layer');
    if ($mickeyMouseLayer.length == 0) {
        $presentationBox.append('<div class="mickey-mouse-layer"><div class="home-icon"></div><div class="plus-icon"></div><div class="minus-icon"></div><div class="rotation-icon"></div><div class="move-icon"></div><div class="animation-icon"></div></div>');
        $mickeyMouseLayer = $presentationBox.find('div.mickey-mouse-layer');
    }

    var $exteriorPresentation = $cc.find('div.exterior-presentation');
    var $interiorPresentation = $cc.find('div.interior-presentation');
    var $exteriorViewPointsPresentation = $cc.find('div.exterior-viewpoints-presentation');
    if ($exteriorPresentation.length > 0 || $interiorPresentation.length > 0 || $exteriorViewPointsPresentation.length > 0) {
        $mickeyMouseLayer.addClass("displayed");
    }

    $mickeyMouseLayer.find('div.minus-icon').attr('title', 'MickeyMouseMinus'.resx()).attr('href', cfgManager.getUrlOfSettings(settings)).unbind('click.htmlcc').bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        for (var i = 0; i < 6; i++) {
            HtmlCc.Vred.zoom(0.3002 + i / 1000);
        }
    });
    $mickeyMouseLayer.find('div.plus-icon').attr('title', 'MickeyMousePlus'.resx()).attr('href', cfgManager.getUrlOfSettings(settings)).unbind('click.htmlcc').bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        for (var i = 0; i < 6; i++) {
            HtmlCc.Vred.zoom(-0.3002 + i / 1000);
        }
    });

    $mickeyMouseLayer.find('div.home-icon').attr('title', 'MickeyMouseHome'.resx()).attr('href', cfgManager.getUrlOfSettings(settings)).unbind('click.htmlcc').bind('click.htmlcc', function (evt) {
        evt.preventDefault();

        var $exteriorPresentation = $cc.find('div.exterior-presentation');
        if ($exteriorPresentation.length > 0) {
            //var angle = parseInt ($exteriorPresentation.attr('data-angle')) / 10;
            //var rotationName = 'rotation' + (angle < 10 ? '0' + angle : angle);

            //HtmlCc.Vred.selectViewPoint('rotationView');
            //HtmlCc.Vred.selectVariantSet(rotationName);
            //HtmlCc.Vred.selectVariantSet('rotationInit');
            HtmlCc.Vred.showInit();

            return;
        }

        var $interiorPresentation = $cc.find('div.interior-presentation');

        if ($interiorPresentation.length > 0) {
            var $activeScene = $interiorPresentation.find('a.active');

            var currentView = $activeScene.attr('data-scene');

            var currentVariantSet = HtmlCc.Vred.viewToVariantSetTranslation(currentView);

            HtmlCc.Vred.selectViewPoint(currentVariantSet);
            //HtmlCc.Vred.selectVariantSet(currentVariantSet);
            return;
        }

        var $exteriorViewpointpresentation = $cc.find('div.exterior-viewpoints-presentation');
        if ($exteriorViewpointpresentation.length > 0) {
            HtmlCc.Vred.showInit();
            return;
        }
    });
    $mickeyMouseLayer.find('div.move-icon').attr('title', 'MickeyMouseMove'.resx()).attr('href', cfgManager.getUrlOfSettings(settings)).unbind('click.htmlcc').bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        $cc.addClass('vred-mode-move');
    });

    $mickeyMouseLayer.find('div.rotation-icon').attr('title', 'MickeyMouseMoveActive'.resx()).attr('href', cfgManager.getUrlOfSettings(settings)).unbind('click.htmlcc').bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        $cc.removeClass('vred-mode-move');
    });

    //$mickeyMouseLayer.find('div.animation-icon').attr('title', 'AnimationSelectionVred'.resx()).attr('href', cfgManager.getUrlOfSettings(settings)).unbind('click.htmlcc').bind('click.htmlcc', function (evt) {
    //    evt.preventDefault();

    //    var $ccRoot = $cc.find('div.cc-root');
    //    $ccRoot.append('<div class="dialog animation-switcher waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

    //    var $dialog = $ccRoot.find('div.dialog.animation-switcher:first');
    //    $dialog.find('div.header-text-inner').text('AnimationSelectionVredHeader'.resx());
    //    $dialog.find('a.close').attr('href', cfgManager.getSettingsFromUrl(settings)).bind('click.htmlcc', function (evt) {
    //        evt.preventDefault();
    //        $dialog.remove();
    //    });

    //    cfgManager.getConfigurator().getVariantSetAnimation(function (variantSetData) {
    //        // success
    //        if (variantSetData.Error && variantSetData.Error.Description) {
    //            HtmlCc.Libs.Log.warn('Variant set collection of animations failed to load because "{0}".'.format(variantSetData.Error.Description));
    //            $dialog.remove();
    //            return;
    //        }
    //        $dialog.find('div.dialog-content').each(function () {
    //            var $dialogContent = $(this);

    //            $.each(variantSetData, function () {
    //                var thisValue = this;
    //                $dialogContent.append('<div class="viewpoint-box viewpoint-{0}"><div class="active-ico"></div><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>'.format(thisValue.VariantSetCode));
    //                var $viewpointBox = $dialogContent.find('div.viewpoint-{0}'.format(thisValue.VariantSetCode));
    //                $viewpointBox.bind('click.htmlcc', function () {
    //                    $viewpointBox.siblings().removeClass('active');
    //                    $viewpointBox.addClass('active');

    //                    var viewpointCode = $viewpointBox.find('div.viewpoint-name').attr('data-code');
    //                    HtmlCc.Vred.selectVariantSet(viewpointCode);
    //                });
    //                $viewpointBox.find('img.viewpoint-image').attr('src', thisValue.IconUrl == 'nil' ? '/Content/images/unknown-variantset.png' : thisValue.IconUrl);
    //                $viewpointBox.find('div.viewpoint-name').text(thisValue.Name).attr('data-code', thisValue.VariantSetCode);
    //                $dialog.removeClass('waiting');
    //            });
    //        });
    //    }, function () {
    //        // error
    //        HtmlCc.Libs.Log.warn('Variant set collection of viewpoints failed.');
    //        $dialog.remove();
    //    });
    //});

    $mickeyMouseLayer.find('div.animation-icon').attr('title', 'ViewpointSelectionVred'.resx()).attr('href', cfgManager.getUrlOfSettings(settings)).unbind('click.htmlcc').bind('click.htmlcc', function (evt) {
        evt.preventDefault();

        var $ccRoot = $cc.find('div.cc-root');
        $ccRoot.append('<div class="dialog view-switcher waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

        var $dialog = $ccRoot.find('div.dialog.view-switcher:first');
        $dialog.find('div.header-text-inner').text('ViewSwitcherVredDialogHeader'.resx());
        $dialog.find('a.close').attr('href', cfgManager.getSettingsFromUrl(settings)).bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            $dialog.remove();
        });

        var params = cfgManager.getParamsByStepName('step1');
        var motor = null;
        var motorId = params.motorId;

        if (motorId > 0) {
            // fill with simple motor
            motor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
        }
        if (motor == null || (settings.view != 'step1')) {
            motor = cfgManager.getConfigurator().getConfiguredMotor();
        }

        //var motor = cfgManager.getConfigurator().getConfiguredMotor();
        cfgManager.getConfigurator().getQueryString(motor, function (queryString) {
            var queryStringObject = {};
            $.each(queryString, function () {
                var queryStringItem = this;

                queryStringObject[queryStringItem] = 1;
            });

            cfgManager.getConfigurator().getVariantSetViewPoint(function (variantSetData) {
                // success
                if (variantSetData.Error && variantSetData.Error.Description) {
                    HtmlCc.Libs.Log.warn('Variant set collection of environments failed to load because "{0}".'.format(variantSetData.Error.Description));
                    $dialog.remove();
                    return;
                }

                $dialog.find('div.dialog-content').each(function () {
                    var $dialogContent = $(this);

                    $.each(variantSetData, function () {
                        var thisValue = this;

                        var isRestricted = HtmlCc.Gui.Web.CheckQueryStringRestrictions(thisValue.Restriction, queryStringObject);
                        if (isRestricted)
                            return true;

                        var $viewpointBox = $('<div class="viewpoint-box"><div class="active-ico"></div><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>');

                        $viewpointBox.bind('click.htmlcc', function () {
                            $viewpointBox.siblings().removeClass('active');
                            $viewpointBox.addClass('active');

                            var viewpointCode = $viewpointBox.find('div.viewpoint-name').attr('data-code');

                            if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                                HtmlCc.Vred.selectViewPoint(viewpointCode);
                            }
                        });
                        $viewpointBox.find('img.viewpoint-image').attr('src', thisValue.IconUrl == 'nil' ? '/Content/images/unknown-variantset.png' : thisValue.IconUrl);
                        $viewpointBox.find('div.viewpoint-name').text(thisValue.Name == null ? '-' + thisValue.VariantSetCode : thisValue.Name).attr('data-code', thisValue.VariantSetCode);

                        $dialogContent.append($viewpointBox);
                    });
                });

                cfgManager.getConfigurator().getVariantSetAnimation(function (variantSetData) {
                    // success
                    if (variantSetData.Error && variantSetData.Error.Description) {
                        HtmlCc.Libs.Log.warn('Variant set collection of animations failed to load because "{0}".'.format(variantSetData.Error.Description));
                        $dialog.remove();
                        return;
                    }
                    $dialog.find('div.dialog-content').each(function () {
                        var $dialogContent = $(this);

                        $dialogContent.append('<div class="terminator"></div><div class="raw-label"></div><div class="terminator"></div>');

                        var $animationLabel = $dialogContent.find('div.raw-label').text('AnimationSelectionVredHeader'.resx());

                        $.each(variantSetData, function () {
                            var thisValue = this;

                            var isRestricted = HtmlCc.Gui.Web.CheckQueryStringRestrictions(thisValue.Restriction, queryStringObject);
                            if (isRestricted)
                                return true;

                            //oprava na nezobrazovani zaskrtavadla u pohledu animaci
                            //var $viewpointBox = $('<div class="viewpoint-box"><div class="active-ico"></div><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>');
                            var $viewpointBox = $('<div class="viewpoint-box"><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>');
                            //oprava na nezobrazovani zaskrtavadla u pohledu animaci
                            $viewpointBox.bind('click.htmlcc', function () {
                                $viewpointBox.siblings().removeClass('active');
                                //$viewpointBox.addClass('active');

                                var viewpointCode = $viewpointBox.find('div.viewpoint-name').attr('data-code');
                                //HtmlCc.Vred.selectVariantSet(viewpointCode);
                                HtmlCc.Dashboard.startAnimation(viewpointCode, function () { });
 
                            });
                            $viewpointBox.find('img.viewpoint-image').attr('src', thisValue.IconUrl == 'nil' ? '/Content/images/unknown-variantset.png' : thisValue.IconUrl);
                            $viewpointBox.find('div.viewpoint-name').text(thisValue.Name == null ? '-' + thisValue.VariantSetCode : thisValue.Name).attr('data-code', thisValue.VariantSetCode);

                            $dialogContent.append($viewpointBox);
                        });
                        //Zobrazení ikony pro zastavení animace
                        if (cfgManager.getConfigurator().getSalesProgramSetting("showStopAnimation") == "true") {                        
                        var $viewpointBox = $('<div class="viewpoint-box"><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>');
                        
                        $viewpointBox.bind('click.htmlcc', function () {
                            $viewpointBox.siblings().removeClass('active');
                            //var viewpointCode = $viewpointBox.find('div.viewpoint-name').attr('data-code');
                            HtmlCc.Dashboard.pauseAnimation(function () { });
                        });
                        $viewpointBox.find('img.viewpoint-image').attr('src', '/Content/images/vred-animation-icons/animation-stop.png');
                        $viewpointBox.find('div.viewpoint-name').text('AnimationSelectionStopAnimation'.resx()).attr('data-code', "stop_animation");

                        $dialogContent.append($viewpointBox);
                        }
                        $dialog.removeClass('waiting');
                    });
                }, function () {
                    // error
                    HtmlCc.Libs.Log.warn('Variant set collection of viewpoints failed.');
                    $dialog.remove();
                });

            }, function () {
                // error
                HtmlCc.Libs.Log.warn('Variant set collection of viewpoints failed.');
                $dialog.remove();
            });
        }, function () {
            HtmlCc.Libs.Log.warn('Query string wasn\'t returned due an error.');
            $dialog.remove();
        });
    });
};

HtmlCc.Gui.Web.CopyrightNoteLink = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    $('div.copyright-note').each(function () {
        var $thisNote = $(this);
        $thisNote.html('<a class="copyright-note-href"></a>');
        var $noteA = $thisNote.find('a.copyright-note-href');
        $noteA.text('CopyrightNote'.resx());

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.viewstate.displayCopyright = true;
        $noteA.attr('href', cfgManager.getUrlOfSettings(newSettings));
    });
};

HtmlCc.Gui.ImgSrcBuilder = function (configurator, settings, viewpointName, isPreview) {
    /// <signature>
    /// <param name='configurator' type='HtmlCc.Api.Configurator' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='viewpointName' type='String' />
    /// <param name='isPreview' type='bool' />
    /// <returns type='String' />
    /// </signature>

    var preview = (!isPreview) ? false : true;

    // {0} model, {1} carline, {2} color, {3} interior, {4} rendering type, {5} motorid, {6} viewpoint, {7} instance, {8} salesprogram, {9} culture, {10} version
    var src = HtmlCc.Gui.Web.GetUrl('/ConfigureRefactored/ImageExact?modelCode={0}&carlineCode={1}&exterior={2}&interior={3}&renderingType={4}&motorId={5}&viewpointName={6}&instanceName={7}&salesProgramName={8}&language={9}&packages={10}&version={11}&isPreview={12}').format(
        settings.model,
        settings.carline,
        settings.color,
        settings.interior,
        'standard',
        settings.motor,
        viewpointName,
        settings.instance,
        settings.salesprogram,
        settings.culture,
        settings.packages,
        configurator.getVersion(),
        preview ? 'true' : 'false'
        );
    return src;
};

HtmlCc.Gui.Web.PresentatePresentation = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var selectedPresentation = null;

    switch (settings.view) {
        case 'step1':
            selectedPresentation = settings.viewstate['selectedPresentation-{0}'.format(settings.view)] || 'exterior';
            switch (selectedPresentation) {
                case 'interior':
                    HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'exterior':
                default:
                    var renderFleet = (cfgManager.getConfigurator().getSalesProgramSetting('renderFleet') === 'true' && !$cc.hasClass('dealer') || cfgManager.getConfigurator().getSalesProgramSetting('renderDealerFleet') === 'true' && $cc.hasClass('dealer'));
                    showExteriorViewPoints = renderFleet && cfgManager.getConfigurator().getConfiguredMotor().getSelectedColor().getType() == HtmlCc.Api.ColorTypeEnum.FLEET
                    if (showExteriorViewPoints) {
                        HtmlCc.Gui.Web.PresentateExteriorViewPoints($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    }
                    else {
                        HtmlCc.Gui.Web.PresentateExterior($cc, $presentationBox, cfgManager, settings);
                    }
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
            }
            break;
        case 'step2':
            var showMotorList =
               (cfgManager
                .getConfigurator()
                .getSalesProgramSetting('showMotorList') === 'true');
            var directShowMotorList =
               (cfgManager
                .getConfigurator()
                .getSalesProgramSetting('directShowMotorList') === 'true');
            var defaultViewForStep2 = showMotorList && directShowMotorList ? 'engine' : 'exterior'
            //
            selectedPresentation = settings.viewstate['selectedPresentation-{0}'.format(settings.view)] || defaultViewForStep2;
            switch (selectedPresentation) {
                case 'engine':
                    HtmlCc.Gui.Web.PresentateEngine($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'interior':
                    HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'exterior':
                default:
                    var renderFleet = (cfgManager.getConfigurator().getSalesProgramSetting('renderFleet') === 'true' && !$cc.hasClass('dealer') || cfgManager.getConfigurator().getSalesProgramSetting('renderDealerFleet') === 'true' && $cc.hasClass('dealer'));
                    showExteriorViewPoints = renderFleet && cfgManager.getConfigurator().getConfiguredMotor().getSelectedColor().getType() == HtmlCc.Api.ColorTypeEnum.FLEET
                    if (showExteriorViewPoints) {
                        HtmlCc.Gui.Web.PresentateExteriorViewPoints($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    }
                    else {
                        HtmlCc.Gui.Web.PresentateExterior($cc, $presentationBox, cfgManager, settings);
                    }
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
            }
            break;
        case 'step3':
            selectedPresentation = settings.viewstate['selectedPresentation-{0}'.format(settings.view)] || 'exterior';
            switch (selectedPresentation) {
                case 'interior':
                    HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'exterior':
                default:
                    var renderFleet = (cfgManager.getConfigurator().getSalesProgramSetting('renderFleet') === 'true' && !$cc.hasClass('dealer') || cfgManager.getConfigurator().getSalesProgramSetting('renderDealerFleet') === 'true' && $cc.hasClass('dealer'));
                    showExteriorViewPoints = renderFleet && cfgManager.getConfigurator().getConfiguredMotor().getSelectedColor().getType() == HtmlCc.Api.ColorTypeEnum.FLEET
                    if (showExteriorViewPoints) {
                        HtmlCc.Gui.Web.PresentateExteriorViewPoints($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    }
                    else {
                        HtmlCc.Gui.Web.PresentateExterior($cc, $presentationBox, cfgManager, settings);
                    }
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
            }
            break;
        case 'step4':
            selectedPresentation = settings.viewstate['selectedPresentation-{0}'.format(settings.view)] || 'interior';
            switch (selectedPresentation) {
                case 'interior':
                    HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'exterior':
                default:
                    var renderFleet = (cfgManager.getConfigurator().getSalesProgramSetting('renderFleet') === 'true' && !$cc.hasClass('dealer') || cfgManager.getConfigurator().getSalesProgramSetting('renderDealerFleet') === 'true' && $cc.hasClass('dealer'));
                    showExteriorViewPoints = renderFleet && cfgManager.getConfigurator().getConfiguredMotor().getSelectedColor().getType() == HtmlCc.Api.ColorTypeEnum.FLEET
                    if (showExteriorViewPoints) {
                        HtmlCc.Gui.Web.PresentateExteriorViewPoints($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                        HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    }
                    else {
                        HtmlCc.Gui.Web.PresentateExterior($cc, $presentationBox, cfgManager, settings);
                    }
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
            }
            break;
        case 'step5':
            selectedPresentation = settings.viewstate['selectedPresentation-{0}'.format(settings.view)] || 'extra';
            switch (selectedPresentation) {
                case 'exteriorViewPoints':
                    HtmlCc.Gui.Web.PresentateExteriorViewPoints($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'interior':
                    HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'extra':
                default:
                    HtmlCc.Gui.Web.PresentateExtraEquipment($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    if ($cc.hasClass('newtablet')) {
                        HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    }
            }
            break;
        case 'step6':
            selectedPresentation = settings.viewstate['selectedPresentation-{0}'.format(settings.view)] || 'insurance';
            switch (selectedPresentation) {
                case 'exteriorViewPoints':
                    HtmlCc.Gui.Web.PresentateExterior($cc, $presentationBox, cfgManager, settings);
                    //HtmlCc.Gui.Web.PresentateExteriorViewPoints($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'interior':
                    HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'insurance':
                default:
                    HtmlCc.Gui.Web.PresentateInsurance($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
            }
            break;
        case 'step7':
            selectedPresentation = settings.viewstate['selectedPresentation-{0}'.format(settings.view)] || 'finish';
            switch (selectedPresentation) {
                case 'exteriorViewPoints':
                    HtmlCc.Gui.Web.PresentateExterior($cc, $presentationBox, cfgManager, settings);
                    //HtmlCc.Gui.Web.PresentateExteriorViewPoints($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'interior':
                    HtmlCc.Gui.Web.PresentateInterior($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'exterior':
                    HtmlCc.Gui.Web.PresentateFinish($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
                    break;
                case 'finish':
                default:
                    HtmlCc.Gui.Web.PresentateFinish($cc, $presentationBox, cfgManager, settings);
                    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);
            }
            break;
        default:
            HtmlCc.Libs.Log.warn('No suitable view found to display presentation.');
    }
};

HtmlCc.Gui.Web.DisplayUpperFleetSlider = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType && cfgManager != null)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    if (!(settings instanceof HtmlCc.Workflow.SettingsType && settings != null)) {
        throw new Error('Object settings is not instance of HtmlCc.Workflow.SettingsType.');
    }

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    if ($cc.data('fleet-displayed-{0}'.format(motor.getSelectedColor().getCode())) !== true) {
        $presentationBox.find('div.upper-notification-slider').remove();
        $presentationBox.append('<div class="upper-notification-slider fleet-slider"><div class="slider-content"></div></div>');

        var $slider = $presentationBox.find('div.upper-notification-slider');
        var $sliderContent = $slider.find('div.slider-content');

        $sliderContent.text('FleetColorNotificationSliderContent'.resx());

        var contentHeight = $sliderContent.outerHeight();

        // RQDE98 - popup timeout
        var fleetColorNotificationSliderContentTimeout =
            cfgManager
                .getConfigurator()
                .getSalesProgramSetting('fleetColorNotificationSliderContentTimeout');

        //var sliderTimeout = parseInt('FleetColorNotificationSliderContentTimeout'.resx());
        var sliderTimeout = parseInt(fleetColorNotificationSliderContentTimeout);
        if (sliderTimeout == NaN || sliderTimeout <= 0) {
            sliderTimeout = 10000;
        }

        $slider.animate({
            height: contentHeight
        }, 400, function () {
            setTimeout(function () {
                $slider.animate({
                    height: 0
                }, 400, function () {
                    $slider.remove();
                });
            }, sliderTimeout);
        });
        $cc.data('fleet-displayed-{0}'.format(motor.getSelectedColor().getCode()), true);
    }

};

HtmlCc.Gui.Web.PresentateSelectionBox = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType && cfgManager != null)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    if (!(settings instanceof HtmlCc.Workflow.SettingsType && settings != null)) {
        throw new Error('Object settings is not instance of HtmlCc.Workflow.SettingsType.');
    }

    var $presentateSelectionBoxWrapper = $presentationBox.find('div.presentation-selection-box-wrapper');

    var configurator = cfgManager.getConfigurator();

    if ($presentateSelectionBoxWrapper.length == 0) {
        $presentationBox.append('<div class="presentation-selection-box-wrapper"><div class="animation-progress"></div><div class="presentation-selection-box"><div class="chosen-view"><span class="chosen-view-label"></span><span class="chosen-view-items"></span></div><div class="background-switcher"><span class="background-switcher-label"></span><span class="background-switcher-items"><a class="display-background"></a><a class="no-background"></a></span><div class="background-switcher-vred"></div></div><div class="save-car-label"></div><div class="save-car"><a class="save-car-a"></a></div><div class="car-storage"><a class="car-storage-a"></a></div><div class="warning-switcher"><a class="warning-switcher-a"></a></div></div><div class="fleet-color-notice"></div></div>');
        $presentateSelectionBoxWrapper = $presentationBox.find('div.presentation-selection-box-wrapper');
    }

    // fills the template
    var params = cfgManager.getParamsByStepName('step1');
    var motor = null;
    var motorId = params.motorId;

    if (motorId > 0) {
        // fill with simple motor
        motor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
    }
    if (motor == null || (settings.view != 'step1')) {
        motor = cfgManager.getConfigurator().getConfiguredMotor();
    }

    if (configurator.getSalesProgramSetting("showCO2Box") == "True") {
        var $emissionBox = $presentateSelectionBoxWrapper.find('.emissions-box')
        if ($emissionBox.length == 0) {
            $emissionBox = $('<div class="emissions-box"></div>');
            $emissionBox.html("CO<sub>2</sub> {0} g/km".format(motor.getEmissionGasDouble() > 0 ? motor.getEmissionGasDouble() : motor.getEmissionDouble()));
            $presentateSelectionBoxWrapper.append($emissionBox);
        }
        else {
            $emissionBox.html("CO<sub>2</sub> {0} g/km".format(motor.getEmissionGasDouble() > 0 ? motor.getEmissionGasDouble() : motor.getEmissionDouble()));
        }
    }

    // hide animation progress bar
    HtmlCc.Gui.Web.DisplayAnimationProgess($presentationBox, false, null);

    var $presentateSelectionBox = $presentateSelectionBoxWrapper.find('div.presentation-selection-box');
    $presentateSelectionBox.find('div.save-car-label').text('SaveCarLabel'.resx());

    //hide garage offlineCC
    if (cfgManager.getConfigurator().getSalesProgramSetting("showGarage") != "true") {
        $presentateSelectionBox.find('div.save-car-label').hide();
        $presentateSelectionBox.find('div.save-car').hide();
        $presentateSelectionBox.find('div.car-storage').hide();
        $presentateSelectionBox.find('div.car-storage-a').hide();
    }

    var $saveCarWrapper = $presentateSelectionBox.find('div.save-car');
    var $saveCar = $saveCarWrapper.find('a.save-car-a');
    $saveCar.attr('title', 'SwitchSaveCar'.resx());

    //if ($.inArray(settings.view, ['step5', 'step6', 'step7']) !== -1) {
    var saveCarSettings = new HtmlCc.Workflow.SettingsType(settings);
    saveCarSettings.viewstate.saveCar = true;
    saveCarSettings.viewstate.displayCarStorage = true;
    $saveCar.attr('href', cfgManager.getUrlOfSettings(saveCarSettings));
    $saveCar
        .unbind("click.hmlcc")
        .bind("click.hmlcc", function () {

           

            var motor = null;
            //var currentMotor = null;
            var motorId = params.motorId;

            if (motorId > 0) {
                // fill with simple motor
                motor = configurator.getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
            }
            if (motor == null || (settings.view != 'step1')) {
                motor = configurator.getConfiguredMotor();
            }

            var financingChanged = null;
            if (cfgManager.getConfigurator().getFinancing() != null) {
                financingChanged = cfgManager.getConfigurator().getFinancing().getHasFinancingDefaults(motor) ? 0 : 1;
            }


            var wheelCode = motor.getSelectedWheel() != null ? motor.getSelectedWheel().getCode() : null;

            //var itemPrice = 0;
            var defaultItem = undefined;
            var itemReplacement = undefined;
            var itemOrigianl = undefined;
            switch (settings.view) {
                case "step1":
                    //itemPrice = 0;
                    //// find the cheapest motor in that equipment
                    //var cheapestLookup = null;
                    //var lookups = motor.getEquipment().getMotorLookups();
                    //$.each(lookups, function (k, lookup) {
                    //    if (cheapestLookup == null || cheapestLookup.getPrice() > lookup.getPrice()) {
                    //        cheapestLookup = lookup;
                    //    }
                    //});
                    //if (cheapestLookup != null) {
                    //    itemPrice = cheapestLookup.getPrice();
                    //}
                    itemOrigianl = motor.getEquipment().getModel().getDefaultEquipmentId();
                    defaultItem = motor.getEquipment().getModel().getDefaultEquipmentId() == motor.getEquipment().getId();
                    if (!defaultItem) {
                        itemReplacement = motor.getEquipment().getId();
                    }

                    break;
                case "step2":
                    var simpleMotor = cfgManager.getConfigurator().getSimpleMotor(motor.getId(), settings.color, settings.interior, settings.getPackagesArray());
                    //itemPrice = simpleMotor.getPriceFrom();
                    itemOrigianl = motor.getEquipment().getDefaultMotorId();
                    defaultItem = motor.getEquipment().getDefaultMotorId() == motor.getId();
                    if (!defaultItem) {
                        itemReplacement = motor.getId();
                    }
                    break;
                case "step3":
                    //itemPrice = motor.getPriceExterior();
                    itemOrigianl = motor.getDefaultColor().getCode() + ";" + motor.getAvailableWheels()[0].getCode();
                    defaultItem = motor.getDefaultColor().getCode() == motor.getSelectedColor().getCode() && motor.getAvailableWheels()[0].getCode() == motor.getSelectedWheel().getCode();
                    if (!defaultItem) {
                        itemReplacement = motor.getSelectedColor().getCode() + ";" + motor.getSelectedWheel().getCode();
                    }
                    break;
                case "step4":
                    //itemPrice = 0;
                    itemOrigianl = motor.getDefaultInterior().getCode();
                    defaultItem = motor.getDefaultInterior().getCode() == motor.getSelectedInterior().getCode();
                    if (!defaultItem) {
                        itemReplacement = motor.getSelectedInterior().getCode();
                    }
                    break;
                case "step5":
                    //itemPrice = parseInt(motor.getPricePackagesString());
                    break;
                case "step6":
                    //itemPrice = parseInt(motor.getPricePackagesString());
                    break;
                case "step7":
                    //itemPrice = null;
                    break;
            }
            
            SkodaAuto.Event.publish(
                        "gtm.configurationSaved",
                        new SkodaAuto.Event.Model.GTMEventParams(
                              "LifeCC Configuration",
                              settings.view,
                              "Save Configuration",
                         {
                             context: cfgManager.getConfigurator().getCCContext(),
                             model: cfgManager.getConfigurator().getModelCodeShort(),
                             modelBody: cfgManager.getConfigurator().getModelCode(),
                             carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                             price: motor.getPriceString(),
                             equipment: motor.getEquipment().getCode(),
                             engine: motor.getId(),
                             mbv: motor.getMbvKey(),
                             color: saveCarSettings.color,
                             exterior: wheelCode,
                             interior: saveCarSettings.interior,
                             extraEq: saveCarSettings.packages,
                             //itemPrice: itemPrice,
                             defaultItem: defaultItem,
                             itemReplacement: itemReplacement,
                             itemOrigianl: defaultItem ? null : itemOrigianl
                         }
                        ));

            SkodaAuto.Event.publish(
                "event.saveConfigurationClick",
                new SkodaAuto.Event.Model.EventParams(
                    configurator.getInstanceName(),
                    configurator.getSalesProgramName(),
                    configurator.getCulture(),
                    configurator.getModelCode(),
                    configurator.getCarlineCode(),
                    settings.view));
        });

    //}

    var $carStorageWrapper = $presentateSelectionBox.find('div.car-storage');
    var $carStorage = $carStorageWrapper.find('a.car-storage-a');
    $carStorage.attr('title', 'SwitchCarStorage'.resx());
    var carStorageSettings = new HtmlCc.Workflow.SettingsType(settings);
    carStorageSettings.viewstate.displayCarStorage = true;
    $carStorage.attr('href', cfgManager.getUrlOfSettings(carStorageSettings));
    $carStorage.unbind("click.hmlcc")
        .bind("click.hmlcc", function () {
            var confId = undefined;
            if (carStorageSettings.configurationId != undefined) {
                confId = parseInt(saveCarSettings.configurationId);
            }
            SkodaAuto.Event.publish(
                       "gtm.displayCarStorageClick",
                       new SkodaAuto.Event.Model.GTMEventParams(
                             "LifeCC Configuration",
                             settings.view,
                             "Garage Link",
                        {
                            context: cfgManager.getConfigurator().getCCContext(),
                            model: cfgManager.getConfigurator().getModelCodeShort(),
                            modelBody: cfgManager.getConfigurator().getModelCode(),
                            carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                            configurationId: confId,
                            price: motor.getPriceString()
                        }
                       ));
        });



    var $warningSwitcher = $presentateSelectionBox.find('div.warning-switcher');
    var $warningSwitcherA = $warningSwitcher.find('a.warning-switcher-a');

    if (settings.viewstate.disableWarnings === true) {
        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.viewstate.disableWarnings = false;
        $warningSwitcherA.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $warningSwitcherA.attr('title', 'EnableWarningsTitle'.resx());
        $presentateSelectionBoxWrapper.addClass('disabled-warnings');
    } else {
        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.viewstate.disableWarnings = true;
        $warningSwitcherA.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $presentateSelectionBoxWrapper.removeClass('disabled-warnings');
        $warningSwitcherA.attr('title', 'DisableWarningsTitle'.resx());
    }

    $presentateSelectionBox.find('span.chosen-view-label').text('SelectionBoxChosenView'.resx());

    var $fleetColorNotice = $presentateSelectionBoxWrapper.find('div.fleet-color-notice');
    $fleetColorNotice.text('FleetColorNotice'.resx());

    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var renderFleet = (cfgManager.getConfigurator().getSalesProgramSetting('renderFleet') === 'true' && !$cc.hasClass('dealer') || cfgManager.getConfigurator().getSalesProgramSetting('renderDealerFleet') === 'true' && $cc.hasClass('dealer'));
    showExteriorViewPoints = renderFleet && motor.getSelectedColor().getType() == HtmlCc.Api.ColorTypeEnum.FLEET

    if (motor.getSelectedColor().getType().name == 'FLEET' && !showExteriorViewPoints) {
        $fleetColorNotice.removeClass('do-not-display');
        HtmlCc.Gui.Web.DisplayUpperFleetSlider($cc, $presentationBox, cfgManager, settings);
    } else {
        $fleetColorNotice.addClass('do-not-display');
    }

    var $chosenViewItems = $presentateSelectionBox.find('span.chosen-view-items');
    $chosenViewItems.html('');

    switch (settings.view) {
        case 'step2':
            HtmlCc.Gui.Web.PresentateExteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateInteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateEnginesSwitch($cc, $chosenViewItems, cfgManager, settings);
            break;
        case 'step1':
        case 'step3':
            //HtmlCc.Gui.Web.PresentateExteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateInteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            //break;
        case 'step4':
            HtmlCc.Gui.Web.PresentateExteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateInteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            break;
        case 'step5':
            HtmlCc.Gui.Web.PresentateExteriorViewPointsSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateInteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateExtraEquipmentSwitch($cc, $chosenViewItems, cfgManager, settings);
            break;
        case 'step6':
            HtmlCc.Gui.Web.PresentateExteriorViewPointsSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateInteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateInsuranceSwitch($cc, $chosenViewItems, cfgManager, settings);
            break;
        case 'step7':
            HtmlCc.Gui.Web.PresentateExteriorViewPointsSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateInteriorSwitch($cc, $chosenViewItems, cfgManager, settings);
            HtmlCc.Gui.Web.PresentateFinishInfoSwitch($cc, $chosenViewItems, cfgManager, settings);
            break;
        default:
            $chosenViewItems.text('view is not supported');
    }

    var $backgroundSwitcher = $presentateSelectionBox.find('div.background-switcher');

    if (settings.view != 'step4' && (settings.viewstate['selectedPresentation-' + settings.view] == null || settings.viewstate['selectedPresentation-' + settings.view] == 'exterior')) {
        $backgroundSwitcher.removeClass('visibility-none');
    } else {
        $backgroundSwitcher.addClass('visibility-none');
    }
    $backgroundSwitcher.find('span.background-switcher-label').text('BackgroundSwitcherLabel'.resx());
    var $backgroundSwitcherItemList = $backgroundSwitcher.find('span.background-switcher-items');

    var $noBackground = $backgroundSwitcherItemList.find('a.no-background');
    var $displayBackground = $backgroundSwitcherItemList.find('a.display-background');

    $noBackground.attr('title', 'SwitchDoNotDisplayBackground'.resx());
    $displayBackground.attr('title', 'SwitchDisplayBackground'.resx());
    $displayBackground
        .unbind("click.hmlcc")
        .bind("click.hmlcc", function () {
            SkodaAuto.Event.publish(
                "event.showBackground",
                new SkodaAuto.Event.Model.EventParams(
                    configurator.getInstanceName(),
                    configurator.getSalesProgramName(),
                    configurator.getCulture(),
                    configurator.getModelCode(),
                    configurator.getCarlineCode(),
                    settings.view));

            SkodaAuto.Event.publish(
                         "gtm.showBackground",
                         new SkodaAuto.Event.Model.GTMEventParams(
                               "LifeCC Configuration",
                               settings.view,
                               "Background Switched: Displayed",
                                              {
                                                  instanceName: settings.instance,
                                                  salesProgramName: settings.salesprogram,
                                                  culture: settings.culture,
                                                  context: cfgManager.getConfigurator().getCCContext(),
                                                  model: cfgManager.getConfigurator().getModelCodeShort(),
                                                  modelBody: cfgManager.getConfigurator().getModelCode(),
                                                  carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                                  configurationId: settings.configurationId,
                                                  price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                                                  extraEq: settings.packages
                                              }
                                             ));
        });

    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.viewstate.noBackground = true;

    $noBackground.attr('href', cfgManager.getUrlOfSettings(newSettings));
    newSettings.viewstate.noBackground = false;
    $noBackground
      .unbind("click.hmlcc")
      .bind("click.hmlcc", function () {
          SkodaAuto.Event.publish(
              "event.hideBackground",
              new SkodaAuto.Event.Model.EventParams(
                  configurator.getInstanceName(),
                  configurator.getSalesProgramName(),
                  configurator.getCulture(),
                  configurator.getModelCode(),
                  configurator.getCarlineCode(),
                  settings.view));

          SkodaAuto.Event.publish(
                         "gtm.showBackground",
                         new SkodaAuto.Event.Model.GTMEventParams(
                               "LifeCC Configuration",
                               settings.view,
                               "Background Switched: Hidden",
                                              {
                                                  instanceName: settings.instance,
                                                  salesProgramName: settings.salesprogram,
                                                  culture: settings.culture,
                                                  context: cfgManager.getConfigurator().getCCContext(),
                                                  model: cfgManager.getConfigurator().getModelCodeShort(),
                                                  modelBody: cfgManager.getConfigurator().getModelCode(),
                                                  carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                                  configurationId: settings.configurationId,
                                                  price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                                                  extraEq: settings.packages
                                              }
                                             ));
      });

    $displayBackground.attr('href', cfgManager.getUrlOfSettings(newSettings));

    if (settings.viewstate.noBackground === true) {
        $noBackground.addClass('active');
        $displayBackground.removeClass('active');
    } else {
        $noBackground.removeClass('active');
        $displayBackground.addClass('active');
    }

    var $backgroundSwitcherVred = $backgroundSwitcher.find('div.background-switcher-vred');
    $backgroundSwitcherVred.text('BackgroundSwitcherVredLabel'.resx());

    $backgroundSwitcherVred.unbind('click.htmlcc').bind('click.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        $ccRoot.append('<div class="dialog background-switcher waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

        var $dialog = $ccRoot.find('div.dialog.background-switcher:first');
        $dialog.find('div.header-text-inner').text('BackgroundSwitcherVredDialogHeader'.resx());
        $dialog.find('a.close').attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            $dialog.remove();
        });

        cfgManager.getConfigurator().getEnviroments(function (variantSetData) {
            // success
            if (variantSetData.Error && variantSetData.Error.Description) {
                HtmlCc.Libs.Log.warn('Variant set collection of environments failed to load because "{0}".'.format(variantSetData.Error.Description));
                $dialog.remove();
                return;
            }
            $dialog.find('div.dialog-content').each(function () {
                var $dialogContent = $(this);

                $.each(variantSetData, function () {
                    var thisValue = this;

                    var $viewpointBox = $('<div class="viewpoint-box"><div class="active-ico"></div><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>');
                    $viewpointBox.bind('click.htmlcc', function () {
                        $viewpointBox.siblings().removeClass('active');
                        $viewpointBox.addClass('active');

                        var viewpointCode = $viewpointBox.find('div.viewpoint-name').attr('data-code');
                        HtmlCc.Vred.selectVariantSet(viewpointCode);
                    });
                    $viewpointBox.find('img.viewpoint-image').attr('src', thisValue.IconUrl == 'nil' ? '/Content/images/unknown-variantset.png' : thisValue.IconUrl);

                    var name = thisValue.Name == null ? thisValue.VariantSetCode : thisValue.Name;

                    $viewpointBox.find('div.viewpoint-name').text(thisValue.Name == null ? '-' + thisValue.VariantSetCode : thisValue.Name).attr('data-code', thisValue.VariantSetCode);

                    $dialogContent.append($viewpointBox);

                    $dialog.removeClass('waiting');
                });
            });
        }, function () {
            // error
            HtmlCc.Libs.Log.warn('Variant set collection of viewpoints failed.');
            $dialog.remove();
        });
    });

    var $chosenViewVred = $presentateSelectionBox.find('div.chosen-view-vred');
    $chosenViewVred.text('SelectionBoxChosenViewVred'.resx());

    $chosenViewVred.unbind('click.htmlcc').bind('click.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        $ccRoot.append('<div class="dialog view-switcher waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

        var $dialog = $ccRoot.find('div.dialog.view-switcher:first');
        $dialog.find('div.header-text-inner').text('ViewSwitcherVredDialogHeader'.resx());
        $dialog.find('a.close').attr('href', cfgManager.getSettingsFromUrl(settings)).bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            $dialog.remove();
        });

        cfgManager.getConfigurator().getVariantSetViewPoint(function (variantSetData) {
            // success
            if (variantSetData.Error && variantSetData.Error.Description) {
                HtmlCc.Libs.Log.warn('Variant set collection of environments failed to load because "{0}".'.format(variantSetData.Error.Description));
                $dialog.remove();
                return;
            }
            $dialog.find('div.dialog-content').each(function () {
                var $dialogContent = $(this);

                $.each(variantSetData, function () {
                    var thisValue = this;
                    $dialogContent.append('<div class="viewpoint-box viewpoint-{0}"><div class="active-ico"></div><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>'.format(thisValue.VariantSetCode));
                    var $viewpointBox = $dialogContent.find('div.viewpoint-{0}'.format(thisValue.VariantSetCode));
                    $viewpointBox.bind('click.htmlcc', function () {
                        $viewpointBox.siblings().removeClass('active');
                        $viewpointBox.addClass('active');

                        var viewpointCode = $viewpointBox.find('div.viewpoint-name').attr('data-code');
                        if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                            HtmlCc.Vred.selectViewPoint(viewpointCode);
                        }
                    });
                    $viewpointBox.find('img.viewpoint-image').attr('src', thisValue.IconUrl == 'nil' ? '/Content/images/unknown-variantset.png' : thisValue.IconUrl);
                    $viewpointBox.find('div.viewpoint-name').text(thisValue.Name).attr('data-code', thisValue.VariantSetCode);
                    $dialog.removeClass('waiting');
                });
            });
        }, function () {
            // error
            HtmlCc.Libs.Log.warn('Variant set collection of viewpoints failed.');
            $dialog.remove();
        });
    });

    var $animationVred = $presentateSelectionBox.find('div.animation-vred-switcher');
    $animationVred.text('AnimationSelectionVred'.resx());

    $animationVred.unbind('click.htmlcc').bind('click.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        $ccRoot.append('<div class="dialog animation-switcher waiting"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div>');

        var $dialog = $ccRoot.find('div.dialog.animation-switcher:first');
        $dialog.find('div.header-text-inner').text('AnimationSelectionVredHeader'.resx());
        $dialog.find('a.close').attr('href', cfgManager.getSettingsFromUrl(settings)).bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            $dialog.remove();
        });

        cfgManager.getConfigurator().getVariantSetAnimation(function (variantSetData) {
            // success
            if (variantSetData.Error && variantSetData.Error.Description) {
                HtmlCc.Libs.Log.warn('Variant set collection of animations failed to load because "{0}".'.format(variantSetData.Error.Description));
                $dialog.remove();
                return;
            }
            $dialog.find('div.dialog-content').each(function () {
                var $dialogContent = $(this);

                $.each(variantSetData, function () {
                    var thisValue = this;
                    $dialogContent.append('<div class="viewpoint-box viewpoint-{0}"><div class="active-ico"></div><img class="viewpoint-image" /><div class="viewpoint-name"></div></div>'.format(thisValue.VariantSetCode));
                    var $viewpointBox = $dialogContent.find('div.viewpoint-{0}'.format(thisValue.VariantSetCode));
                    $viewpointBox.bind('click.htmlcc', function () {
                        $viewpointBox.siblings().removeClass('active');
                        $viewpointBox.addClass('active');

                        var viewpointCode = $viewpointBox.find('div.viewpoint-name').attr('data-code');
                        HtmlCc.Vred.selectVariantSet(viewpointCode);
                    });
                    $viewpointBox.find('img.viewpoint-image').attr('src', thisValue.IconUrl == 'nil' ? '/Content/images/unknown-variantset.png' : thisValue.IconUrl);
                    $viewpointBox.find('div.viewpoint-name').text(thisValue.Name).attr('data-code', thisValue.VariantSetCode);
                    $dialog.removeClass('waiting');
                });
            });
        }, function () {
            // error
            HtmlCc.Libs.Log.warn('Variant set collection of viewpoints failed.');
            $dialog.remove();
        });
    });
};

HtmlCc.Gui.Web.PresentateFinishInfoSwitch = function ($cc, $chosenViewItems, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$chosenViewItems' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var switchName = 'finish-info';
    var switchClass = switchName + '-switch';

    var $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    if ($switch.length == 0) {
        $chosenViewItems.append('<a class="{0} switch-view"></a>'.format(switchClass));
        $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    }

    $switch.attr('title', 'SwitchFinish'.resx());

    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    if (newSettings.viewstate == null) {
        newSettings.viewstate = {};
    }
    if (newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == switchName
        || (settings.view == 'step7' && newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)) {
        $switch.addClass('active');
    }

    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = switchName;
    newSettings.viewstate['finishDisplay'] = "info";

    $switch.attr('href', cfgManager.getUrlOfSettings(newSettings));
};

HtmlCc.Gui.Web.PresentateExtraEquipmentSwitch = function ($cc, $chosenViewItems, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$chosenViewItems' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var switchName = 'extra';
    var switchClass = switchName + '-switch';

    var $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    if ($switch.length == 0) {
        $chosenViewItems.append('<a class="{0} switch-view"></a>'.format(switchClass));
        $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    }

    $switch.attr('title', 'SwitchExtraEquipment'.resx());

    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    if (newSettings.viewstate == null) {
        newSettings.viewstate = {};
    }
    if (newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == switchName
        || (settings.view == 'step5' && newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)) {
        $switch.addClass('active');
    }

    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = switchName;

    $switch.attr('href', cfgManager.getUrlOfSettings(newSettings));

};

HtmlCc.Gui.Web.PresentateInsuranceSwitch = function ($cc, $chosenViewItems, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$chosenViewItems' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var switchName = 'insurance';
    var switchClass = switchName + '-switch';

    var $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    if ($switch.length == 0) {
        $chosenViewItems.append('<a class="{0} switch-view"></a>'.format(switchClass));
        $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    }

    $switch.attr('title', 'SwitchInsurance'.resx());

    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    if (newSettings.viewstate == null) {
        newSettings.viewstate = {};
    }
    if (newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == switchName
        || (settings.view == 'step6' && newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)) {
        $switch.addClass('active');
    }

    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = switchName;

    $switch.attr('href', cfgManager.getUrlOfSettings(newSettings));
};

HtmlCc.Gui.Web.PresentateExteriorSwitch = function ($cc, $chosenViewItems, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$chosenViewItems' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var switchName = 'exterior';
    var switchClass = switchName + '-switch';

    var $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    if ($switch.length == 0) {
        $chosenViewItems.append('<a class="{0} switch-view"></a>'.format(switchClass));
        $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    }

    $switch.attr('title', 'SwitchExterior'.resx());

    $switch.bind('click.htmlcc', function () {
        if ($cc.hasClass('dealer')) {
            if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                HtmlCc.Vred.selectViewPoint("rotationView");
            }
        }
    });    

    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    if (newSettings.viewstate == null) {
        newSettings.viewstate = {};
    }
    if (newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == switchName
        || (settings.view == 'step1' && newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)
        || (settings.view == 'step2' && newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)
        || (settings.view == 'step3' && newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)) {
        $switch.addClass('active');
    }

    newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = switchName;

    $switch.attr('href', cfgManager.getUrlOfSettings(newSettings));
};

HtmlCc.Gui.Web.PresentateExteriorViewPointsSwitch = function ($cc, $chosenViewItems, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$chosenViewItems' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var switchName = 'exteriorViewPoints';

    var switchClass = switchName + '-switch';

    var $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    if ($switch.length == 0) {
        $chosenViewItems.append('<a class="{0} switch-view"></a>'.format(switchClass));
        $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    }

    $switch.attr('title', 'SwitchExteriorViewpoints'.resx());
    $switch.attr('href', '');
    if (settings.viewstate['selectedPresentation-{0}'.format(settings.view)] == switchName) {
        $switch.addClass('active');

        //if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
        //    HtmlCc.Vred.selectVariantSet('init');
        //}
    }

    $switch.bind('click.htmlcc', function () {
        var offset = $cc.find("div.extra-content").scrollTop();

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        if (newSettings.viewstate == null) {
            newSettings.viewstate = {};
        }

        if ($cc.hasClass('dealer')) {
            if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                    HtmlCc.Vred.selectViewPoint("rotationView");
            }
        }

        newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = switchName;
        newSettings.viewstate['packagesScrollPosition'] = offset;
        newSettings.viewstate['packageItem'] = false;

        location.href = cfgManager.getUrlOfSettings(newSettings);

        SkodaAuto.Event.publish(
                    "event.interiorExteriorViewClick",
                    new SkodaAuto.Event.Model.InteriorExteriorViewClickEvntParams(
                        cfgManager.getConfigurator().getInstanceName(),
                        cfgManager.getConfigurator().getSalesProgramName(),
                        cfgManager.getConfigurator().getCulture(),
                        cfgManager.getConfigurator().getModelCode(),
                        cfgManager.getConfigurator().getCarlineCode(),
                        settings.view, "exterior"));

        return false;
    });

};

HtmlCc.Gui.Web.PresentateEnginesSwitch = function ($cc, $chosenViewItems, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$chosenViewItems' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var showMotorList =
    (cfgManager
        .getConfigurator()
        .getSalesProgramSetting('showMotorList') === 'true');
    if (!showMotorList) {
        return;
    }

    var switchName = 'engine';
    var switchClass = switchName + '-switch';

    var $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    if ($switch.length == 0) {
        $chosenViewItems.append('<a class="{0} switch-view"></a>'.format(switchClass));
        $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    }

    $switch.attr('title', 'SwitchEngine'.resx());
    $switch.attr('href', '');

    if (settings.viewstate['selectedPresentation-{0}'.format(settings.view)] == switchName
            || (settings.view == 'step4' && settings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)) {
        $switch.addClass('active');
    }

    $switch.bind('click.htmlcc', function () {
        //if (settings.view == 'step2') return false;

        var offset = $cc.find("div.extra-content").scrollTop();

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        if (newSettings.viewstate == null) {
            newSettings.viewstate = {};
        }

        newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = switchName;
        newSettings.viewstate['packagesScrollPosition'] = offset;
        newSettings.viewstate['packageItem'] = false;

        location.href = cfgManager.getUrlOfSettings(newSettings);

        SkodaAuto.Event.publish(
                   "event.interiorExteriorViewClick",
                   new SkodaAuto.Event.Model.InteriorExteriorViewClickEvntParams(
                       cfgManager.getConfigurator().getInstanceName(),
                       cfgManager.getConfigurator().getSalesProgramName(),
                       cfgManager.getConfigurator().getCulture(),
                       cfgManager.getConfigurator().getModelCode(),
                       cfgManager.getConfigurator().getCarlineCode(),
                       settings.view, "engine"));

        return false;
    });
}

HtmlCc.Gui.Web.PresentateInteriorSwitch = function ($cc, $chosenViewItems, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$chosenViewItems' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var switchName = 'interior';
    var switchClass = switchName + '-switch';

    var $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    if ($switch.length == 0) {
        $chosenViewItems.append('<a class="{0} switch-view"></a>'.format(switchClass));
        $switch = $chosenViewItems.find('a.{0}'.format(switchClass));
    }

    $switch.attr('title', 'SwitchInterior'.resx());
    $switch.attr('href', '');

    if (settings.viewstate['selectedPresentation-{0}'.format(settings.view)] == switchName
            || (settings.view == 'step2' && settings.viewstate['selectedPresentation-{0}'.format(settings.view)] == null)) {
        $switch.addClass('active');
    }

    $switch.bind('click.htmlcc', function () {
        //if (settings.view == 'step4') return false;

        var offset = $cc.find("div.extra-content").scrollTop();

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        if (newSettings.viewstate == null) {
            newSettings.viewstate = {};
        }

        newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = switchName;
        newSettings.viewstate['packagesScrollPosition'] = offset;
        newSettings.viewstate['packageItem'] = false;
        
        if ($cc.hasClass('dealer')) {
            if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                if (newSettings.viewstate.selectedScene == null) { newSettings.viewstate.selectedScene = "Passenger" }
                HtmlCc.Vred.selectViewPoint(HtmlCc.Vred.viewToVariantSetTranslation(newSettings.viewstate.selectedScene));
            }
        }

        location.href = cfgManager.getUrlOfSettings(newSettings);

        SkodaAuto.Event.publish(
                   "event.interiorExteriorViewClick",
                   new SkodaAuto.Event.Model.InteriorExteriorViewClickEvntParams(
                       cfgManager.getConfigurator().getInstanceName(),
                       cfgManager.getConfigurator().getSalesProgramName(),
                       cfgManager.getConfigurator().getCulture(),
                       cfgManager.getConfigurator().getModelCode(),
                       cfgManager.getConfigurator().getCarlineCode(),
                       settings.view, "interior"));

        return false;
    });

};

HtmlCc.Gui.Web.PresentateExterior = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var configurator = cfgManager.getConfigurator();
    var model = configurator.getConfiguredMotor().getEquipment().getModel();
    var params;
    switch (settings.view) {
        case 'step1':
            params = cfgManager.getParamsByStepName('step1');
            break;
        case 'step2':
        case 'step3':
            params = cfgManager.getParamsByStepName('step3');
            break;
        case 'step4':
        case 'step5':
        case 'step6':
        case 'step7':
            params = cfgManager.getParamsByStepName('step7');
            break;
        default:
            throw new Error('Invalid step name.');
    }

    var motorId = params.motorId;

    // prepairs motor
    //var motor = configurator.getSimpleMotor(motorId, settings.color, settings.interior, settings.packages);
    var motor = configurator.getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes || '');
    if (motor == null) {
        HtmlCc.Libs.Log.warn('Motor wasn\'t found motorid={0}; color={1}; interior={2}; packages={3}'.format(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes || ''));
        motor = cfgManager.getConfigurator().getConfiguredMotor();
    }
    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    newSettings.motor = motorId;

    // prepair animation images
    var animationImages = motor.getAnimationImages();

    if (animationImages.length == 0) {
        // this is critical point - I have no images to display so I have to create something to display
        HtmlCc.Libs.Log.warn('Current motor contains EMPTY animation images array! Trying to fake content.');
        $.each([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], function () {
            var angle = this;
            var imageToAdd = new HtmlCc.Api.ImageType();
            imageToAdd.setAngle(angle);
            animationImages.push(imageToAdd);
        });
    }

    var $exterior = $presentationBox.find('div.exterior-presentation');
    if ($exterior.length == 0) {
        $presentationBox.html('<div class="exterior-presentation"><div class="presentating-area"><div class="displayed-picture"><div class="rotate-left-icon"></div><div class="rotate-right-icon"></div></div><div class="inactive-pictures"></div></div><div class="preload"></div><div class="copyright-note"></div></div>');
        $exterior = $presentationBox.find('div.exterior-presentation');

        // prevent touch gestures to bubble out of the configurator at tablet design
        $exterior.bind('touchmove.htmlcc', function (evt) {
            if ($cc.hasClass('tablet')) {
                evt.preventDefault();
            }
        });

        // set class to current model
        $exterior.addClass('model-code-{0}'.format(motor.getEquipment().getModel().getCode()));

        // try to pick 60 deg of animation
        var found = false;
        for (var i = 0; i < animationImages.length; i++) {
            if (animationImages[i].getAngle() == 60) {
                found = true;
                $exterior.attr('data-angle', 60);
                break;
            }
        }
        if (found === false) {
            $exterior.attr('data-angle', 0);
        }

        $exterior.bind('rotateclockwise', function () {
            var $newImage = $exterior.data('rotationPresentation').rotateClockwise();
            if ($newImage != null && $exterior.find("div.ready-{0}".format($newImage.attr('data-angle'))).length != 0) {
                var $displayedPictureTmp = $presentatingArea.find('div.displayed-picture');
                var $inactivePicturesTmp = $presentatingArea.find('div.inactive-pictures');
                var $oldImage = $displayedPictureTmp.find('img');
                $oldImage.appendTo($inactivePicturesTmp);
                $newImage.appendTo($displayedPictureTmp);
                if ($exterior.data('rotateclockwise') != "sent") {
                    $exterior.data('rotateclockwise', 'sent');
                    SkodaAuto.Event.publish(
                                         "gtm.carRotated",
                                         new SkodaAuto.Event.Model.GTMEventParams(
                                          "LifeCC Configuration",
                                          settings.view,
                                          "Car Rotated: Right",
                                          {
                                              context: cfgManager.getConfigurator().getCCContext(),
                                              model: cfgManager.getConfigurator().getModelCodeShort(),
                                              modelBody: cfgManager.getConfigurator().getModelCode(),
                                              carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                              configurationId: settings.configurationId,
                                              price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                                          }
                                         ));
                }
                $exterior.attr('data-angle', $newImage.attr('data-angle'));
            }
        });
        $exterior.bind('rotatecounterclockwise', function () {
            var $newImage = $exterior.data('rotationPresentation').rotateCounterclockwise();
            if ($newImage != null && $exterior.find("div.ready-{0}".format($newImage.attr('data-angle'))).length != 0) {
                var $displayedPictureTmp = $presentatingArea.find('div.displayed-picture');
                var $inactivePicturesTmp = $presentatingArea.find('div.inactive-pictures');
                var $oldImage = $displayedPictureTmp.find('img');
                $oldImage.appendTo($inactivePicturesTmp);
                $newImage.appendTo($displayedPictureTmp);

                if ($exterior.data('rotatecounterclockwise') != "sent") {
                    $exterior.data('rotatecounterclockwise', 'sent');
                    SkodaAuto.Event.publish(
                                         "gtm.carRotated",
                                         new SkodaAuto.Event.Model.GTMEventParams(
                                          "LifeCC Configuration",
                                          settings.view,
                                          "Car Rotated: Left",
                                          {
                                              context: cfgManager.getConfigurator().getCCContext(),
                                              model: cfgManager.getConfigurator().getModelCodeShort(),
                                              modelBody: cfgManager.getConfigurator().getModelCode(),
                                              carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                              configurationId: settings.configurationId,
                                              price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                                          }
                                         ));
                }

                $exterior.attr('data-angle', $newImage.attr('data-angle'));
            }
        });

        $exterior.find('div.rotate-left-icon').bind('tapone.htmlcc', function () {
            $exterior.trigger('rotatecounterclockwise');
        });
        $exterior.find('div.rotate-right-icon').bind('tapone.htmlcc', function () {
            $exterior.trigger('rotateclockwise');
        });
    }

    HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);

    if (settings.viewstate.noBackground === true) {
        $exterior.addClass('no-background');
    } else {
        $exterior.removeClass('no-background');
    }

    var $presentatingArea = $exterior.find('div.presentating-area');
    var $displayedPicture = $presentatingArea.find('div.displayed-picture');
    var $inactivePictures = $presentatingArea.find('div.inactive-pictures');

    if (motor.getConflicts().getAdd().length > 0 || motor.getConflicts().getRemove().length > 0) {
        // do not presentate conflicts
        return;
    }

    var rotationPresentation = null;

    rotationPresentation = new HtmlCc.Gui.PresentatingRotationType(configurator, $presentationBox.find('div.preload'), motor, $exterior.attr('data-angle'), settings);
    $exterior.data('rotationPresentation', rotationPresentation);

    $presentatingArea.addClass('loading-first');
    $presentatingArea.removeClass('loading-others');

    // removes all of loading triangles
    $.each([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], function (k, angle) {
        $presentatingArea.removeClass('ready-' + angle);
    });

    if ($displayedPicture.find('img').length == 0) {
        var defaultViewPoint = $('<img />');
        defaultViewPoint.addClass("angle-60");
        defaultViewPoint.attr("src", $cc.data("last-angle-url-60"));

        if (defaultViewPoint.attr("src") != null) {
            $displayedPicture.find('img').remove();
            $displayedPicture.append(defaultViewPoint);
        }
    }

    if (settings.view != null && settings.view == 'step6' || settings.view == 'step7') {
        HtmlCc.Gui.Web.DisplayAnimationProgess($presentationBox, true, "ViewpointWaiting".resx());
    }

    rotationPresentation.fullyPrepair(function () {
        $presentatingArea.removeClass('loading-first');
        $presentatingArea.removeClass('loading-others');

        HtmlCc.Gui.Web.DisplayAnimationProgess($presentationBox, false, null);

    }, function ($image) {
        // first of the pictures is ready - remove all existing images
        $inactivePictures.find('img').remove();
        $displayedPicture.find('img').remove();

        // display new image
        $image.appendTo($displayedPicture);

        $presentatingArea.removeClass('loading-first');
        $presentatingArea.addClass('loading-others');
    }, function ($image) {
        // an image is ready
        $image.hammer().bind('dragstart', function (event) {
            //disable image dragging
            event.preventDefault();
            //event.stopPropagation();
        });

        $image.hammer().bind('drag', function (event) {
            // disable image dragging
            event.preventDefault();
            //event.stopPropagation();
        });

        if ($displayedPicture.find('#{0}'.format($image.attr('id'))).length == 0) {
            // move it into inactive pictures only if it is not already active picture
            $image.appendTo($inactivePictures);
        }
        $presentatingArea.addClass('ready-' + $image.attr('data-angle'));

        $cc.data('last-angle-url-{0}'.format($image.attr('data-angle')), $image.attr('src'));

    });
};

HtmlCc.Gui.Web.PresentateExteriorViewPoints = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var configurator = cfgManager.getConfigurator();

    // fills the template
    var params = cfgManager.getParamsByStepName('step1');
    var motor = null;
    var motorId = params.motorId;

    if (motorId > 0 && settings.view == "step1") {
        // fill with simple motor
        motor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
    }

    if (motor == null) {
        motor = cfgManager.getConfigurator().getConfiguredMotor();
    }
    
    var stepName = "step3";

    var afterGetNonEquippedMotor = function (nonEquippedMotor) {
        var $exteriorPresentation = $presentationBox.find('div.exterior-viewpoints-presentation');
        if ($exteriorPresentation.length == 0) {
            // clear everything out
            $presentationBox.html('');
            $presentationBox.append('<div class="exterior-viewpoints-presentation"><div class="target-container"><div data-scene="front" class="target-display"></div><div class="dialog-waiting"></div></div><div class="waiting-box"></div> <div class="other-scenes"></div><div class="preload"></div><div class="copyright-note"></div></div>');
            $exteriorPresentation = $presentationBox.find('div.exterior-viewpoints-presentation');

            // prevent touch gestures to bubble out of the configurator at tablet design
            $exteriorPresentation.bind('touchmove.htmlcc', function (evt) {
                if ($cc.hasClass('tablet')) {
                    evt.preventDefault();
                }
            });
        }

        HtmlCc.Gui.Web.PresentateSelectionBox($cc, $presentationBox, cfgManager, settings);

        if (settings.viewstate.noBackground === true) {
            $exteriorPresentation.addClass('no-background');
        } else {
            $exteriorPresentation.removeClass('no-background');
        }

        // preload box to precache images
        var $preload = $exteriorPresentation.find('div.preload');

        // clear all preloading images
        $preload.html('');

        // skip displaying if there is a conflict
        if (motor.getConflicts().getAdd().length > 0 || motor.getConflicts().getRemove().length > 0) {
            return;
        }

        // scenes: Front (rotation06), Back (rotation24)
        var $targetDisplay = $exteriorPresentation.find('div.target-display');
        var $otherScenes = $exteriorPresentation.find('div.other-scenes');
        var $waitingBox = $exteriorPresentation.find('div.waiting-box');

        var scenes = nonEquippedMotor.getViewpointImages();

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

        // Add default images  
        var defaultViewPoint = $('<img />');
        defaultViewPoint.addClass("presentation-image");
        defaultViewPoint.attr(
            "src",
            $cc.data("last-angle-url-{0}0".format(getSelectedScene().replace(/^\D+/g, ''))));

        if (defaultViewPoint.attr("src") != null) {
            $targetDisplay.find('img.presentation-image').remove();
            $targetDisplay.append(defaultViewPoint);
        }

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

            var viewpointPreviewUrl = scene.getPreviewUrl();
            if (viewpointPreviewUrl == null) {
                viewpointPreviewUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Like_Offline_Preview');
            }

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
            $scene
                .unbind("click.hmlcc")
                .bind("click.hmlcc", function () {
                    SkodaAuto.Event.publish(
                       "event.showViewPoint",
                       new SkodaAuto.Event.Model.ShowViewPointEvntParams(
                            configurator.getInstanceName(),
                            configurator.getSalesProgramName(),
                            configurator.getCulture(),
                            configurator.getModelCode(),
                            configurator.getCarlineCode(),
                            settings.view, viewpointName));
                   
                });

            if (selectedScene == viewpointName) {
                $scene.addClass('active');
                $waitingBox.addClass('loading');
                HtmlCc.Gui.VhqDisplayer($targetDisplay, $preload, viewpointLowUrl, viewpointHighUrl, function ($lqImage) {
                    //preLowLoad               
                    $targetDisplay.find('img.presentation-image').remove();
                    $lqImage.addClass('presentation-image');
                }, function ($lqImage, $hqImage) {
                    //postLowLoad
                    $exteriorPresentation.removeClass("waiting");
                }, function ($lqImage, $hqImage) {
                    //preHighLoad   
                    $targetDisplay.find('img.presentation-image').remove();
                    $hqImage.addClass('presentation-image');
                }, function ($hqImage) {
                    //postHighLoad
                    //HtmlCc.Gui.Web.DisplayAnimationProgess($presentationBox, false, "ViewpointWaiting".resx());
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

        var currentScene = $targetDisplay.attr('data-scene');
        $otherScenes.find('a.scene').each(function () {
            var $thisScene = $(this);
            if ($thisScene.attr('data-scene') == currentScene) {
                $thisScene.trigger('click.htmlcc');
            }
        });
    };

    var newSettings = cfgManager.getParamsByStepName(stepName);

    cfgManager.getMotorByStep(stepName, afterGetNonEquippedMotor,
        function (error) {
        });

};

// makes VHQ technology usable for view
HtmlCc.Gui.VhqDisplayer = function ($target, $preload, lowUrl, highUrl, preLowLoad, postLowLoad, preHighLoad, postHighLoad) {
    /// <signature>
    /// <param name='$target' type='jQuery' />
    /// <param name='$preload' type='jQuery' />
    /// <param name='lowUrl' type='String' />
    /// <param name='highUrl' type='String' />
    /// <param name='preLowLoad' type='Function'>function($lqImage); Before moving of image from preload area to target.</param>
    /// <param name='postLowLoad' type='Function'>function($lqImage, $hqImage); After moving of image from preload area to target.</param>
    /// <param name='preHighLoad' type='Function'>function($lqImage, $hqImage); Before moving of high quality image from preload area to target.</param>
    /// <param name='postHighLoad' type='Function'>function($hqImage); After moving of high quality image from preload area to target.</param>
    /// </signature>

    if (typeof preLowLoad !== 'function') {
        throw new Error('Object preLowLoad is not a function.');
    }
    if (typeof postLowLoad !== 'function') {
        throw new Error('Object postLowLoad is not a function.');
    }
    if (typeof preHighLoad !== 'function') {
        throw new Error('Object preHighLoad is not a function.');
    }
    if (typeof postHighLoad !== 'function') {
        throw new Error('Object postHighLoad is not a function.');
    }

    // preload low
    var lowId = HtmlCc.Libs.randomString(8);
    $preload.append('<img id="{0}" />'.format(lowId));
    var $imageLow = $preload.find('#' + lowId);
    $imageLow.bind('load.htmlcc', function () {
        preLowLoad($imageLow);

        $target.append($imageLow);

        // preload high
        var highId = HtmlCc.Libs.randomString(8);
        $preload.append('<img id="{0}" />'.format(highId));

        var $imageHigh = $preload.find('#' + highId);

        $imageHigh.bind('load.htmlcc', function () {
            preHighLoad($imageLow, $imageHigh);

            $target.append($imageHigh);
            $imageLow.remove();

            postHighLoad($imageHigh);
        });
        $imageHigh.attr('src', highUrl);

        postLowLoad($imageLow, $imageHigh);
    });
    $imageLow.attr('src', lowUrl);
};

HtmlCc.Gui.PresentatingRotationType = function (configurator, $preloadBox, motor, angle, settings) {
    /// <signature>
    /// <param name='configurator' type='HtmlCc.Api.Configurator' />
    /// <param name='$preloadBox' type='jQuery' />
    /// <param name='motor' type='MotorType' />
    /// <param name='angle' type='int' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <returns type='ImageType'/>
    /// </signature>

    var thisPresentatingRotationType = this;
    var _motor = motor;
    var _$preloadBox = $preloadBox;
    var _angle = this.sanitizeAngle(angle);
    var _settings = settings;

    // returns current angle
    this.getCurrentAngle = function () {
        /// <signature>
        /// <returns type='int'/>
        /// </signature>
        return _angle;
    };

    // sets new angle
    var setAngle = function (angle) {
        /// <signature>
        /// <param name='angle' type='int' />
        /// </signature>
        _angle = angle;
    };

    // returns simple motor
    this.getMotor = function () {
        /// <signature>
        /// <returns type='SimpleMotor'/>
        /// </signature>
        return _motor;
    };

    // returns true whether the angle is currently prepairing
    this.isPartialyPrepairing = function (angle) {
        /// <signature>
        /// <param name='angle' type='int' />
        /// <returns type='bool'/>
        /// </signature>
        return _images[angle] != null && _images[angle].prepairing;
    };

    // returns true whether all images are prepairing
    this.isFullyPrepairing = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _fullyPrepairing;
    };

    // returns true whether all images are fully prepaired
    this.isFullyPrepaired = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _fullyPrepaired;
    };

    // prepairs selected angle
    this.partialyPrepair = function (angle, callback) {
        /// <signature>
        /// <param name='angle' type='int' />
        /// <param name='callback' type='Function'>function($image)</param>
        /// </signature>
        if (_images[angle] == null) {
            HtmlCc.Libs.Log.error('Angle {0} is not found.'.format(angle));
            return;
            //throw new Error('Angle is not found.');
        }

        var preloadingImage = new HtmlCc.Gui.PresentatingImageType($preloadBox, _images[angle].imageData, configurator, _settings);
        _images[angle].prepairing = true;
        _images[angle].preloadingImage = preloadingImage;
        preloadingImage.preloadImage(function ($image) {
            _images[angle].prepairing = false;
            _images[angle].prepaired = true;
            _images[angle].image = $image;
            callback($image);
        });
    };

    // prepaires all images
    this.fullyPrepair = function (fullCallback, currentPartialCallback, anyPartialCallback) {
        /// <signature>
        /// <param name='fullCallback' type='Function'>function()</param>
        /// <param name='currentPartialCallback' type='Function'>function($image)</param>
        /// <param name='anyPartialCallback' type='Function'>function($image)</param>
        /// </signature>

        // the strategy:
        // 1) current image
        // 2) oposite direction image (this angle + 180)
        // 3) side directions (this angle + 90 and this angle + 270)
        // 4) all others
        var currentAngle = this.getCurrentAngle();
        var level2Angles = [this.sanitizeAngle(currentAngle + 180)];
        var level3Angles = [this.sanitizeAngle(currentAngle + 90), this.sanitizeAngle(currentAngle + 270)];
        var level4Angles = [];
        $.each(_angles, function (k, angle) {
            if (angle != currentAngle && $.inArray(angle, level2Angles) === -1 && $.inArray(angle, level3Angles) === -1) {
                level4Angles.push(angle);
            }
        });

        // prefetch the current angle
        thisPresentatingRotationType.partialyPrepair(currentAngle, function ($currentImage) {
            // call callbacks
            currentPartialCallback($currentImage);
            anyPartialCallback($currentImage);

            // first level reached
            var threadJoin2Level = new HtmlCc.Libs.MultiAsyncJoin();
            $.each(level2Angles, function (k, angle) {
                var clbck2 = threadJoin2Level.getHandler(angle);
                thisPresentatingRotationType.partialyPrepair(angle, function ($image2Level) {
                    anyPartialCallback($image2Level);
                    clbck2($image2Level);
                });
            });

            threadJoin2Level.join(function () {
                // second level reached
                var threadJoin3Level = new HtmlCc.Libs.MultiAsyncJoin();
                $.each(level3Angles, function (k, angle) {
                    var clbck3 = threadJoin3Level.getHandler(angle);
                    thisPresentatingRotationType.partialyPrepair(angle, function ($image3Level) {
                        anyPartialCallback($image3Level);
                        clbck3($image3Level);
                    });
                });

                threadJoin3Level.join(function () {
                    var threadJoin4Level = new HtmlCc.Libs.MultiAsyncJoin();
                    $.each(level4Angles, function (k, angle) {
                        var clbck4 = threadJoin4Level.getHandler(angle);
                        thisPresentatingRotationType.partialyPrepair(angle, function ($image4Level) {
                            anyPartialCallback($image4Level);
                            clbck4($image4Level);
                        });
                    });
                    threadJoin4Level.join(function () {
                        fullCallback();
                    });
                });
            });

        });

    };

    // returns object of next image
    this.rotateClockwise = function () {
        /// <signature>
        /// <returns type='jQuery'/>
        /// </signature>
        for (var i = 30; i < 360; i += 30) {
            var tmp = this.sanitizeAngle(this.getCurrentAngle() + i);
            if (_images[tmp] != null && _images[tmp].prepaired) {
                setAngle(tmp);
                return _images[tmp].image;
            }
        }
        if (_images[this.getCurrentAngle()] != null) {
            return _images[this.getCurrentAngle()].image;
        }
        // for the case that everything failed
        return null;
    };

    // returns object of previous image
    this.rotateCounterclockwise = function () {
        /// <signature>
        /// <returns type='jQuery'/>
        /// </signature>
        for (var i = 330; i > 0; i -= 30) {
            var tmp = this.sanitizeAngle(this.getCurrentAngle() + i);
            if (_images[tmp] != null && _images[tmp].prepaired) {
                setAngle(tmp);
                return _images[tmp].image;
            }
        }
        if (_images[this.getCurrentAngle()] != null) {
            return _images[this.getCurrentAngle()].image;
        }
        // for the case that everything failed
        return null;
    };

    var _fullyPrepairing = false;
    var _fullyPrepaired = false;
    var _angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    var _images = {};
    var animationImages = motor.getAnimationImages();
    for (var i = 0; i < animationImages.length; i++) {
        var animationImage = animationImages[i];

        var url = animationImage.getUrl();
        if (url == null) {
            var tmpSettings = new HtmlCc.Workflow.SettingsType();
            tmpSettings.carline = configurator.getCarlineCode();
            tmpSettings.color = motor.getSelectedColor().getCode();
            tmpSettings.culture = configurator.getCulture();
            tmpSettings.equipment = null;
            tmpSettings.instance = configurator.getInstanceName();
            tmpSettings.interior = motor.getSelectedInterior().getCode();
            tmpSettings.model = configurator.getModelCode();
            tmpSettings.motor = motor.getId();
            tmpSettings.packages = HtmlCc.Libs.packagesToString(motor.getPackages());
            tmpSettings.prefix = '';
            tmpSettings.salesprogram = configurator.getSalesProgramName();

            url = HtmlCc.Gui.ImgSrcBuilder(configurator, tmpSettings, 'Rotation{0}'.format(animationImage.getAngle() / 10));
        }

        _images[animationImage.getAngle()] = {
            url: url,
            prepairing: false,
            prepaired: false,
            image: null,
            preloadingImage: null,
            imageData: animationImage
        };
    }

};
// returns useful angle
HtmlCc.Gui.PresentatingRotationType.prototype.sanitizeAngle = function (rawAngle) {
    /// <signature>
    /// <param name='rawAngle' type='int' />
    /// <returns type='int'/>
    /// </signature>

    var tmp = parseInt(rawAngle);
    if (tmp < 0) {
        tmp = 0;
    }
    return (Math.floor(tmp / 30) % 12) * 30;
};

// type of presentating image that is preloaded in preload box and notified onload event to move it anywhere
HtmlCc.Gui.PresentatingImageType = function ($preloadBox, imageData, configurator, settings) {
    /// <signature>
    /// <param name='$preloadBox' type='jQuery' />
    /// <param name='imageData' type='ImageType' />
    /// <param name='configurator' type='HtmlCc.Api.Configurator' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <returns type='ImageType'/>
    /// </signature>

    if (!(configurator instanceof HtmlCc.Api.Configurator)) {
        throw new Error('Object configurator is not instance of HtmlCc.Api.Configurator.');
    }
    if (!(settings instanceof HtmlCc.Workflow.SettingsType)) {
        throw new Error('Object settings is not instance of HtmlCc.Workflow.SettingsType.');
    }

    var _$preloadBox = $preloadBox;
    var _imageData = imageData;
    var _randId = HtmlCc.Libs.randomString(8);
    var _preloadCallback = null;
    var _isPreloaded = false;
    var _configurator = configurator;
    var _settings = settings;

    // preloads image and calls callback after image is prefetched into browser
    this.preloadImage = function (callback) {
        /// <signature>
        /// <param name='callback' type='Function'>function($image)</param>
        /// </signature>
        if (this.isPreloading()) {
            throw new Error('Image is already preloading.');
        }
        if (this.isPreloaded()) {
            throw new Error('Image is already preloaded.');
        }

        _preloadCallback = callback;

        _$preloadBox.append('<img id="{0}"/>'.format(_randId));
        var _$image = _$preloadBox.find('#{0}'.format(_randId));

        _$image.attr('data-angle', imageData.getAngle());
        _$image.addClass('angle-{0}'.format(imageData.getAngle()));

        _$image.load(function () {
            // is triggered when image is fully loaded
            var tmp = _preloadCallback;
            _preloadCallback = null;
            _isPreloaded = true;
            _$image.unbind('load');
            tmp(_$image);

            if (_$image.attr('data-high-src')) {
                // there is better quality url, so preload it and change it
                var newId = HtmlCc.Libs.randomString(8);
                _$preloadBox.append('<img id="{0}"/>'.format(newId));
                var $betterImage = _$preloadBox.find('#' + newId);
                $betterImage.bind('load.htmlcc', function () {
                    _$image.attr('src', $betterImage.attr('src'));
                    _$image.attr('data-high-src', undefined);
                    $betterImage.remove();
                });
                $betterImage.attr('src', _$image.attr('data-high-src'));
            }
        });

        var $ccRoot = _$preloadBox.parents('div.cc-root');
        if ($ccRoot.hasClass('view-step1') || $ccRoot.hasClass('view-step2') || $ccRoot.hasClass('view-step3') || $ccRoot.hasClass('view-step4')) {
            var url = imageData.getUrl();
            if (url == null) {
                _$image.attr('src', HtmlCc.Workflow.ImageExactBuilder(_configurator, _settings, 'Rotation{0}'.format(imageData.getAngle() / 10), 'Like_Offline_Low'));
                _$image.attr('data-high-src', HtmlCc.Workflow.ImageExactBuilder(_configurator, _settings, 'Rotation{0}'.format(imageData.getAngle() / 10), 'Like_Offline_High'))
            } else {
                _$image.attr('src', url);
            }
        } else {
            _$image.attr('src', HtmlCc.Workflow.ImageExactBuilder(_configurator, _settings, 'Rotation{0}'.format(imageData.getAngle() / 10), 'Online_Low'));
            _$image.attr('data-high-src', HtmlCc.Workflow.ImageExactBuilder(_configurator, _settings, 'Rotation{0}'.format(imageData.getAngle() / 10), 'Online_High'))
        }
    };

    // returns true if image is just preloading; false if image is not yet preloaded or it is already preloaded
    this.isPreloading = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _preloadCallback !== null
    };

    // returns true if image is already preloaded
    this.isPreloaded = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _isPreloaded;
    };

    // returns image data
    this.getImageData = function () {
        /// <signature>
        /// <returns type='ImageType'/>
        /// </signature>
        return _imageData;
    };

    // returns unique ID of image
    this.getImageId = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _randId;
    };
};

HtmlCc.Gui.Web.PresentateExtraEquipment = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $extraPresentation = $presentationBox.find('div.extra-presentation.extra-equipment');
    if ($extraPresentation.length == 0) {
        // clear everything out
        $presentationBox.html('<div class="extra-presentation extra-equipment"><div class="extra-header"><div class="star-note"></div><div class="heart-note"></div></div><div class="extra-content">extra contetnt</div><div class="extra-footer"></div><div class="copyright-note"></div></div>');
        $extraPresentation = $presentationBox.find('div.extra-presentation.extra-equipment');
    } else {
        // Suppress reloading extra equipments when car storage is displayed
        if (settings.viewstate.displayCarStorage) {
            return;
        }
    }

    var $extraHeader = $presentationBox.find('div.extra-header');
    var $extraFooter = $presentationBox.find('div.extra-footer');
    var $extraContent = $presentationBox.find('div.extra-content');

    // extra header captions
    $extraHeader.find('div.heart-note').text('ExtraHeartNote'.resx());
    $extraHeader.find('div.star-note').text('ExtraStarNote'.resx());

    var itemsToDraw = [];

    if (settings.viewstate.toDisplay == null || settings.viewstate.toDisplay == '' || settings.viewstate.toDisplay == 'groups') {
        // define what group will be displayed
        var selectedPackageGroup = null;
        if ('selectedPackageGroup' in settings.viewstate) {
            selectedPackageGroup = parseInt(settings.viewstate.selectedPackageGroup);
            if (!(selectedPackageGroup > 0)) {
                selectedPackageGroup = null;
            }
        }
        else {
            var defaultGroup = motor.getDefaultPackageGroup();
            if (defaultGroup != null) {
                selectedPackageGroup = defaultGroup.getId();
            }
        }

        var packageGroups = motor.getAvailablePackageGroups();
        if (selectedPackageGroup == null) {
            for (var i = 0; i < packageGroups.length; i++) {
                var packageGroup = packageGroups[i];
                if (packageGroup.getName() == '-') {
                    // this is faked group that is hidden
                    continue;
                }
                var packages = packageGroup.getPackages();
                for (var j = 0; j < packages.length; j++) {
                    itemsToDraw.push(packages[j]);
                }
            }
        } else {
            for (var i = 0; i < packageGroups.length; i++) {
                var packageGroup = packageGroups[i];
                if (packageGroup.getId() != selectedPackageGroup) {
                    continue;
                }
                var packages = packageGroup.getPackages();
                for (var j = 0; j < packages.length; j++) {
                    itemsToDraw.push(packages[j]);
                }
            }
        }
    } else if (settings.viewstate.toDisplay == 'selected') {
        var packageGroups = motor.getAvailablePackageGroups();
        var selectedPackages = motor.getPackages();
        for (var i = 0; i < packageGroups.length; i++) {
            var packageGroup = packageGroups[i];
            var packages = packageGroup.getPackages();
            for (var j = 0; j < packages.length; j++) {
                for (var k = 0; k < selectedPackages.length; k++) {
                    if (selectedPackages[k].getCode() == packages[j].getCode()) {
                        itemsToDraw.push(packages[j]);
                    }
                }
            }
        }
    } else if (settings.viewstate.toDisplay == 'recommended') {
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
                    itemsToDraw.push(packages[j]);
                }
            }
        }
    }

    HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $extraContent, 3, itemsToDraw, motor);

    if (settings.viewstate.packageItem == 'undefinded' || !settings.viewstate.packageItem) {
        if (settings.viewstate['packagesScrollPosition'] == 'undefinded') {
            $extraContent.scrollTop(0);
        } else {
            $extraContent.scrollTop(settings.viewstate['packagesScrollPosition']);
        }
    }
};

HtmlCc.Gui.Web.DrawExtraPackages = function ($cc, cfgManager, settings, $extraContent, numberOfColumns, itemsToDraw, motor) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='$extraContent' type='jQuery'></param>
    /// <param name='numberOfColumns' type='int' />
    /// <param name='itemsToDraw' type='Array' />
    /// <param name='motor' type='HtmlCc.Api.MotorType' />
    /// </signature>

    // delete extra content
    $extraContent.html('<div class="terminator"></div>');
    var $extraTerminator = $extraContent.find('div.terminator');

    var solutionOfConflict = false;
    if ((motor.getConflicts().getAdd().length > 0 || motor.getConflicts().getRemove().length > 0) && $extraContent.parents('div.dialog').length > 0) {
        solutionOfConflict = true;
    }

    var conflictAdd = [];
    var conflictRemove = [];
    $.each(motor.getConflicts().getAdd(), function () {
        conflictAdd.push(this.getCode());
    });
    $.each(motor.getConflicts().getRemove(), function () {
        conflictRemove.push(this.getCode());
    });

    var i = 0;

    $.each(itemsToDraw, function () {
        //for (var i = 0; i < itemsToDraw.length; i++) {
        var itemToDraw = this;//itemsToDraw[i];
        $extraTerminator.before('<div class="extra-item extra-item-{0}"><div class="item-top-part"><div class="extra-item-image-div"><img class="extra-item-image" /><span class="video-player-arrow"></span></div><div class="heart-icon"></div><div class="star-icon"></div><div class="info-ico"></div><div class="video-ico"></div></div><div class="item-label-part"></div><div class="item-price-part"><div class="monthly-from"></div><div class="total"></div><div class="quantity"></div><a class="add"></a><a class="remove"></a></div><div class="disabled-layer"></div><div class="active-icon"></div></div>'.format(itemToDraw.getCode()));
        //$extraTerminator.before('<div class="extra-item extra-item-{0}"><div class="item-top-part"><div class="extra-item-image-div"><div class="imageHidden"><img class="extra-item-image" /></div><span class="video-player-arrow"></span></div><div class="heart-icon"></div><div class="star-icon"></div><div class="info-ico"></div></div><div class="item-label-part"></div><div class="item-price-part"><div class="monthly-from"></div><div class="total"></div><div class="quantity"></div><a class="add"></a><a class="remove"></a></div><div class="disabled-layer"></div><div class="active-icon"></div></div>'.format(itemToDraw.getCode()));
        var $extraItem = $extraContent.find('div.extra-item-{0}'.format(itemToDraw.getCode()));
        $extraItem.attr('data-item-code', itemToDraw.getCode());

        // detect whether it is fill featured package; if not, try to obtain it from motor package collection
        if (itemToDraw.getPriceString() == null && itemToDraw instanceof HtmlCc.Api.PackageType) {
            var tmp = motor.getAvailablePackage(itemToDraw.getCode());
            if (tmp != null) {
                itemToDraw = tmp;
            }
        }

        if (itemToDraw instanceof HtmlCc.Api.ColorType) {
            $extraItem.addClass('color-type');
        } else if (itemToDraw instanceof HtmlCc.Api.InteriorType) {
            $extraItem.addClass('interior-type');
        }

        // columnize
        switch (i % numberOfColumns) {
            case 0:
                $extraItem.addClass('left-column');
                break;
            case 1:
                $extraItem.addClass('central-column');
                break;
            case 2:
                $extraItem.addClass('right-column');
                $extraTerminator.before('<div class="terminator"></div>');
        }

        if (i >= itemsToDraw.length - 3) {
            $extraItem.addClass('last-row');
            if (i == itemsToDraw.length - 1) {
                $extraItem.addClass('last-item');
            }
        }

        // fill inner content
        var $topPart = $extraItem.find('div.item-top-part');
        var $labelPart = $extraItem.find('div.item-label-part');
        var $pricePart = $extraItem.find('div.item-price-part');
        var $disabledLayer = $extraItem.find('div.disabled-layer');
        var $topImage = $topPart.find('img.extra-item-image');
        var $topImageDiv = $topPart.find('div.extra-item-image-div');
        var $heartIcon = $topPart.find('div.heart-icon');
        var $starIcon = $topPart.find('div.star-icon');
        var $infoIco = $topPart.find('div.info-ico');
        var $imageHidden = $topPart.find('div.imageHidden');


        if (cfgManager.getConfigurator().getSalesProgramSetting("showAccessoriesPopupWindow") == "true") {
            $extraItem.addClass('with-accessories')
            var accessorySettings = new HtmlCc.Workflow.SettingsType(settings);
            accessorySettings.viewstate.packageItem = true;
            var $accesoryIco = $('<a class="accessory-ico"></a>')
            accessorySettings.viewstate.selectedAccessories = [];
            accessorySettings.viewstate.selectedAccessories.push(itemToDraw.getCode())
            accessorySettings.viewstate.accessoriesPopupWindow = true;
            $accesoryIco.attr('href', cfgManager.getUrlOfSettings(accessorySettings));
        
            $infoIco.after($accesoryIco);
        }

        var $monthlyFrom = $pricePart.find('div.monthly-from');
        var $total = $pricePart.find('div.total');
        var $quantity = $pricePart.find('div.quantity');
        var $add = $pricePart.find('a.add');
        var $remove = $pricePart.find('a.remove');

        $labelPart.text(itemToDraw.getName());
        if (itemToDraw.getImage && itemToDraw.getImage()) {
            $topImage.attr('src', itemToDraw.getImage().getUrl());
            $topImage.attr('alt', itemToDraw.getName());
            if (cfgManager.getConfigurator().getSalesProgramSetting("showMarketingImageWatermark") == "true") {
                $topImage.after("<p class='disclaimer-marketing-image'>{0}</p>".format('MarketingImageWatermark'.resx()));
            }
        } else {
            $topImage.css({
                'width': 188,
                'height': 93,
                'border': '1px solid black'
            });
            $topImage.attr('alt', 'image not available');
        }

        // get video element from description and use it's data-url attribute
        var $ccRoot = $cc.find('div.cc-root:first');
       
        if (!(itemToDraw instanceof HtmlCc.Api.ColorType || itemToDraw instanceof HtmlCc.Api.InteriorType)) {
            var videoUrl = itemToDraw.getVideoUrl();
            if (videoUrl != null && videoUrl != '') {
                $topImage.attr('src', itemToDraw.getImage().getUrl());
                $topImage.attr('alt', itemToDraw.getName());
                HtmlCc.Gui.BindVideoToImage($topImageDiv, videoUrl, $ccRoot, cfgManager, settings);
                //$infoIco.addClass("left");
                
            }
        }

        // disabled layer content
        $disabledLayer.html('<div class="disabled-inner"></div>');
        var $disabledInner = $disabledLayer.find('div.disabled-inner');
        $disabledInner.text('ExtraPackageDisabledItem'.resx());

        if (itemToDraw.hasQuantity && itemToDraw.hasQuantity()) {
            $total.attr("data-price", itemToDraw.getPriceString());
            $total.text('TotalWithQuantity{0}'.format(itemToDraw.getQuantity()).resx().format(itemToDraw.getPriceString(), itemToDraw.getQuantity()));

            $quantity.text('QuantityLabel{0}'.format(itemToDraw.getQuantity()).resx().format(itemToDraw.getQuantity()));

            $monthlyFrom.text('ExtraPackageMonthlyPriceQuantity'.resx().format('...'));

        } else {
            if (itemToDraw.getPriceString() === null) {
                // ust fake for the case that no price is available from backend
                $total.attr("data-price", 0);
                $total.text('');
            } else {
                $total.attr("data-price", itemToDraw.getPriceString());
                $total.text('ExtraPackageTotalPrice'.resx().format(itemToDraw.getPriceString()));
            }

            $quantity.remove();

            $monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format('...'));
        }

        var hasQuantity = function () { return itemToDraw.hasQuantity && itemToDraw.hasQuantity(); };

        if (itemToDraw.getMonthlyPriceStringAsync) {
            //model.getMonthlyPriceStringAsync(function (monthlyPrice) {
            var monthlyPriceText = itemToDraw.getMonthlyPriceString();

            if (monthlyPriceText == null) {
                $monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format('...'));
                   } else {
                $monthlyFrom.text(
                    hasQuantity() ? 'ExtraPackageMonthlyPriceQuantity' : 'ExtraPackageMonthlyPrice'.resx().format(itemToDraw.getMonthlyPriceString()));
            }
            //});
                   } else {
                       if (!hasQuantity()) {
                $monthlyFrom.css('visibility', 'hidden');
                       }
                       }

        //var fce = function ($monthlyFromElement, model) {
        //    return function (params) {
        //        if(params.id == model.getCode()){
        //            $monthlyFromElement.text(
        //                hasQuantity() ? 'ExtraPackageMonthlyPriceQuantity' : 'ExtraPackageMonthlyPrice'.resx().format(params.formattedRate));
        //        }
        //    };
        //}($monthlyFrom, itemToDraw);

        var setMonthlyPrie =
            function (model, $monthlyFromElement) {
                SkodaAuto.Event.subscribe(
                            'event.partRateChanged',
                            function (event, params) {
                                if (params.id == model.getCode()) {
                                    $monthlyFromElement.text(
                                        hasQuantity() ? 'ExtraPackageMonthlyPriceQuantity' : 'ExtraPackageMonthlyPrice'.resx().format(params.formattedRate));
                   }
                            });

            }(itemToDraw, $monthlyFrom);

        //$extraItem.bind('htmlcc.getMonthlyPrice',
        //   function (model, $monthlyFromElement) {
        //       return function () {
        //           var hasQuantity = function () { return model.hasQuantity && model.hasQuantity(); };
        //           if (model.getMonthlyPriceStringAsync) {
        //               model.getMonthlyPriceStringAsync(function (monthlyPrice) {
        //                   $monthlyFromElement.text(
        //                       hasQuantity() ? 'ExtraPackageMonthlyPriceQuantity' : 'ExtraPackageMonthlyPrice'.resx().format(monthlyPrice));
        //               });
        //           } else {
        //               if (!hasQuantity()) {
        //                   $monthlyFromElement.css('visibility', 'hidden');
        //               }
        //           }
        //       };
        //}(itemToDraw, $monthlyFrom);//);

        $add.text('ExtraPackageAdd'.resx());

        $remove.text('ExtraPackageRemove'.resx());

        var addSettings = new HtmlCc.Workflow.SettingsType(settings);
        addSettings.viewstate.packageItem = true;

        if (itemToDraw.getHasQuantity && itemToDraw.getHasQuantity()) {
            addSettings.viewstate.multiplicityDialog = true;
            addSettings.viewstate.multiplicityItem = itemToDraw.getCode();
            HtmlCc.Libs.Log.log('Multiplicity item {0}: {1}'.format(itemToDraw.getCode(), itemToDraw.getName()));
        } else {
            if (!(itemToDraw instanceof HtmlCc.Api.ColorType) && !(itemsToDraw instanceof HtmlCc.Api.InteriorType)) {
                addSettings.addPackage(itemToDraw.getCode());
                }
            }

        if (cfgManager.getConfigurator().getSalesProgramSetting("showAccessoriesPopupWindow") == "true") {
            if (!(itemToDraw instanceof HtmlCc.Api.ColorType || itemToDraw instanceof HtmlCc.Api.InteriorType)) {
                if (itemToDraw.getIsAccessories()) {
            
                    addSettings.viewstate.accessoriesPopupWindow = true;
                    if (addSettings.viewstate.accessoriesItems == undefined) {
                        addSettings.viewstate.accessoriesItems = [];
                    }
                    if (addSettings.viewstate.selectedAccessories == undefined) {
                        addSettings.viewstate.selectedAccessories = [];
                    }
                    addSettings.viewstate.selectedAccessories.push(itemToDraw.getCode());
                    addSettings.viewstate.accessoriesItems.push(itemToDraw.getCode());
                }
            }
        }

        addSettings.viewstate.itemClicked = {};
        addSettings.viewstate.itemClicked.price = itemToDraw.getPriceString();
        addSettings.viewstate.itemClicked.id = itemToDraw.getCode();
        addSettings.viewstate.itemClicked.type = 'extra';

        $add.attr('href', cfgManager.getUrlOfSettings(addSettings));

        var removeSettings = new HtmlCc.Workflow.SettingsType(settings);
        removeSettings.viewstate.packegeItem = true;

        removeSettings.viewstate.itemClicked = {};
        removeSettings.viewstate.itemClicked.price = itemToDraw.getPriceString();
        removeSettings.viewstate.itemClicked.id = itemToDraw.getCode();
        removeSettings.viewstate.itemClicked.type = 'extra';

        if (itemToDraw instanceof HtmlCc.Api.PackageType) {
            removeSettings.removePackage(itemToDraw.getCode());
        } else if (itemToDraw instanceof HtmlCc.Api.ColorType) {
            removeSettings.color = motor.getDefaultColor().getCode();
        } else if (itemToDraw instanceof HtmlCc.Api.InteriorType) {
            removeSettings.interior = motor.getDefaultInterior().getCode();
        }

        if (cfgManager.getConfigurator().getSalesProgramSetting("showAccessoriesPopupWindow") == "true") {
            if (!(itemToDraw instanceof HtmlCc.Api.ColorType || itemToDraw instanceof HtmlCc.Api.InteriorType)) {
                if (itemToDraw.getIsAccessories()) {
                    if (removeSettings.viewstate.accessoriesItems !== undefined) {                
                        $.each(removeSettings.viewstate.accessoriesItems, function (index, accessoryCode) {                
                        if (accessoryCode == itemToDraw.getCode()) {
                            removeSettings.viewstate.accessoriesItems.splice(index, 1);
                            return;
                        }
                    });
                }    
                }
            }
        }

        $remove.attr('href', cfgManager.getUrlOfSettings(removeSettings));

        $add.unbind('click.htmlcc').bind('click.htmlcc', function () {
            $extraContent.find('div.item-price-part a.loading').removeClass('loading');
            $(this).addClass('loading');

            var some = settings;
            var isClear = cfgManager.isClearNextSteps(settings.view);


            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       settings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: settings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: settings.packages
                       }));
            }
            cfgManager.clearNextSteps(settings.view);

            if (solutionOfConflict
                   && addSettings.packages != settings.packages
                   && $.inArray(itemToDraw.getCode(), conflictAdd) !== -1
                   && $.inArray(settings.view, ['step1', 'step2', 'step3', 'step4']) !== -1) {
                addSettings.addConflictSolution(new HtmlCc.Workflow.ConflictSolutionType(motor, 'add', itemToDraw.getCode()));
            }
            //SkodaAuto.Event.publish(
            //               "gtm.itemClicked",
            //               new SkodaAuto.Event.Model.GTMEventParams(
            //                  "LifeCC Configuration",
            //                  settings.view,
            //                  "Item Clicked: " + itemToDraw.getCode(),
            //                  {
            //                      context: cfgManager.getConfigurator().getCCContext(),
            //                      model: cfgManager.getConfigurator().getModelCodeShort(),
            //                      modelBody: cfgManager.getConfigurator().getModelCode(),
            //                      carlineCode: cfgManager.getConfigurator().getCarlineCode(),
            //                      configurationId: settings.configurationId,
            //                      price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
            //                      extra: itemToDraw.getCode(),
            //                      itemPrice: itemToDraw.getPriceString()
            //                  }));
            SkodaAuto.Event.publish(
                           "gtm.itemAdded",
                           new SkodaAuto.Event.Model.GTMEventParams(
                              "LifeCC Configuration",
                              settings.view,
                              "Item Added: " + itemToDraw.getCode(),
                              {
                                  context: cfgManager.getConfigurator().getCCContext(),
                                  model: cfgManager.getConfigurator().getModelCodeShort(),
                                  modelBody: cfgManager.getConfigurator().getModelCode(),
                                  carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                  extra: itemToDraw.getCode(),
                                  configurationId: settings.configurationId,
                                  //price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                                  itemPrice: itemToDraw.getPriceString()
                              }));
            
        });

        $remove.unbind('click.htmlcc').bind('click.htmlcc', function () {
            $extraContent.find('div.item-price-part a.loading').removeClass('loading');
            $(this).addClass('loading');
            //configurationManager.clearNextSteps(nextStep);
            var isClear = cfgManager.isClearNextSteps(settings.view);


            //SkodaAuto.Event.publish(
            //              "gtm.itemClicked",
            //              new SkodaAuto.Event.Model.GTMEventParams(
            //                 "LifeCC Configuration",
            //                 settings.view,
            //                 "Item Clicked: " + itemToDraw.getCode(),
            //                 {
            //                     context: cfgManager.getConfigurator().getCCContext(),
            //                     model: cfgManager.getConfigurator().getModelCodeShort(),
            //                     modelBody: cfgManager.getConfigurator().getModelCode(),
            //                     carlineCode: cfgManager.getConfigurator().getCarlineCode(),
            //                     configurationId: settings.configurationId,
            //                     price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
            //                     extra: itemToDraw.getCode(),
            //                     itemPrice: itemToDraw.getPriceString()
            //                 }));
            if (isClear) {
                SkodaAuto.Event.publish(
                    "gtm.confClearedByApp",
                    new SkodaAuto.Event.Model.GTMEventParams(
                       "LifeCC Configuration",
                       newSettings.view,
                       "Configuration Cleared by App",
                       {
                           context: cfgManager.getConfigurator().getCCContext(),
                           model: cfgManager.getConfigurator().getModelCodeShort(),
                           modelBody: cfgManager.getConfigurator().getModelCode(),
                           carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                           configurationId: newSettings.configurationId,
                           price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                           //equipment: cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getCode(),
                           extraEq: newSettings.packages
                       }));
            }
            cfgManager.clearNextSteps(settings.view);

            if (solutionOfConflict
                && removeSettings.packages != settings.packages
                && $.inArray(itemToDraw.getCode(), conflictRemove) !== -1
                && $.inArray(settings.view, ['step1', 'step2', 'step3', 'step4']) !== -1
                && !(itemToDraw instanceof HtmlCc.Api.ColorType)
                && !(itemToDraw instanceof HtmlCc.Api.InteriorType)) {
                removeSettings.addConflictSolution(new HtmlCc.Workflow.ConflictSolutionType(motor, 'remove', itemToDraw.getCode()));
            }

            
            SkodaAuto.Event.publish(
             "gtm.itemRemoved",
                          new SkodaAuto.Event.Model.GTMEventParams(
                             "LifeCC Configuration",
                             settings.view,
                "Item Removed: " + itemToDraw.getCode(),
                             {
                                 context: cfgManager.getConfigurator().getCCContext(),
                                 model: cfgManager.getConfigurator().getModelCodeShort(),
                                 modelBody: cfgManager.getConfigurator().getModelCode(),
                                 carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                    extra: itemToDraw.getCode(),
                                 configurationId: settings.configurationId,
                                 price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                    itemPrice: itemToDraw.getPriceString()
                       }));
        });

        // bind marketing info box on hover event
        var hoverImageUrl = '';
        if (itemToDraw.getImage && itemToDraw.getImage() && itemToDraw.getImage().getUrl()) {
            hoverImageUrl = itemToDraw.getImage().getUrl();
        }
        var hoverDescription = '';
        if (itemToDraw.getDescription && itemToDraw.getDescription()) {
            hoverDescription = itemToDraw.getDescription();
        }

        //HtmlCc.Gui.Web.HoverBoxWithTimeout($cc, cfgManager, $infoIco, hoverImageUrl, itemToDraw.getName(), hoverDescription, itemToDraw.getPriceString(), undefined, undefined, 115);      

        // make item active
        var motorPackages = motor.getPackages();
        var found = false;
        for (var j = 0; j < motorPackages.length; j++) {
            var motorPackage = motorPackages[j];
            if (motorPackage.getCode() == itemToDraw.getCode()) {
                found = true;
                break;
            }
        }
        if (cfgManager.getConfigurator().getSalesProgramSetting("showAccessoriesPopupWindow") == "true" && settings.viewstate.accessoriesItems !== undefined) {
            var accessories = settings.viewstate.accessoriesItems;
                for (var j = 0; j < accessories.length; j++) {
                    var accessory = accessories[j];
                    var itemCode = itemToDraw.getCode()
                    if (accessory == itemCode) {
                        found = true;
                        break;
            }
        }
        }

        if (found || itemToDraw instanceof HtmlCc.Api.ColorType || itemToDraw instanceof HtmlCc.Api.InteriorType) {
            $extraItem.addClass('active');
        }

        if ($cc.hasClass('tablet')) {
            $infoIco.bind('click.htmlcc', function (evt) {
                itemId = $infoIco.parents('.extra-item').data("item-code");
                HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                    {
                        extra: itemId,
                        itemPrice: $infoIco.parents('.extra-item').find(".total").data("price")
                    });
            });
        }
        else {
            var timer;
            var delay = 1000;
            $infoIco.hover(function (el) {
                itemId = $infoIco.parents('.extra-item').data("item-code");
                timer = setTimeout(function () {                    
                    HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                        {
                            extra: itemId,
                            itemPrice: $infoIco.parents('.extra-item').find(".total").data("price")
                        });
                }, delay);
            }, function () {
                // on mouse out, cancel the timer
                clearTimeout(timer);
            });

        }

        HtmlCc.Gui.Web.PackageHoverBoxWithTimeout(
            $cc,
            cfgManager,
            $infoIco,
            115,
            itemToDraw,
            settings, motor, $remove.clone(), $add.clone(), $extraItem.hasClass('active'));

        // make item disabled
        if (itemToDraw.isSelectable === undefined || itemToDraw.isSelectable()) {
            $extraItem.removeClass('disabled');
        } else {
            $extraItem.addClass('disabled');
        }

        // make item starred
        if (itemToDraw.isRecommended && itemToDraw.isRecommended()) {
            $extraItem.addClass('starred');
        } else {
            $extraItem.removeClass('starred');
        }

        // make accessory visible button
        if (cfgManager.getConfigurator().getSalesProgramSetting("showAccessoriesPopupWindow") == "true" && itemToDraw.getIsAccessories() && itemToDraw.isSelectedAccesory(settings.viewstate.accessoriesItems)) {
                $extraItem.addClass('accessory-view');     
        } else {
            $extraItem.removeClass('accessory-view');
        }

        // make item loved
        if (itemToDraw.isSuitable && itemToDraw.isSuitable()) {
            $extraItem.addClass('loved');
        } else {
            $extraItem.removeClass('loved');
        }

        i = i++;
    });
};

HtmlCc.Gui.Web.PresentateInsurance = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    var $extraPresentation = $presentationBox.find('div.extra-presentation.skoda-care');
    if ($extraPresentation.length == 0) {
        // clear everything out
        $presentationBox.html('<div class="extra-presentation skoda-care"><div class="extra-header"></div><div class="extra-content">extra contetnt</div><div class="extra-footer"></div><div class="copyright-note"></div></div>');
        $extraPresentation = $presentationBox.find('div.extra-presentation.skoda-care');
    }

    var $extraHeader = $presentationBox.find('div.extra-header');
    var $extraFooter = $presentationBox.find('div.extra-footer');
    var $extraContent = $presentationBox.find('div.extra-content');

    var itemsToDraw = [];

    // delete extra content
    $extraContent.html('<div class="terminator"></div>');
    var $extraTerminator = $extraContent.find('div.terminator');

    var displayInsurance = false;

    if (settings.viewstate.skodaCareToDisplay == null || settings.viewstate.skodaCareToDisplay == '' || settings.viewstate.skodaCareToDisplay == 'groups') {
        // define what group will be displayed
        var selectedSkodaCareGroup = null;
        if ('selectedSkodaCareGroup' in settings.viewstate) {
            var tmp = parseInt(settings.viewstate.selectedSkodaCareGroup);
            if (tmp > 0 || tmp < 0) {
                selectedSkodaCareGroup = tmp;
            } else if (settings.viewstate.selectedSkodaCareGroup == 'service-care') {
                selectedSkodaCareGroup = 'service-care'
            } else {
                selectedSkodaCareGroup = null;
            }
        }

        var packageGroups = motor.getAvailableSkodaCareGroups();
        if (selectedSkodaCareGroup == null) {
            for (var i = 0; i < packageGroups.length; i++) {
                var packageGroup = packageGroups[i];

                if (packageGroup.getGroupType() == 3) {
                    // skoda care service care groups are IFed
                    itemsToDraw.push(packageGroup);
                } else {
                    var packages = packageGroup.getPackages();
                    for (var j = 0; j < packages.length; j++) {
                        itemsToDraw.push(packages[j]);
                    }

                    if (packageGroup.getGroupType() == 4) {
                        selectedSkodaCareGroup = true;
                    }
                }
            }
        } else {
            for (var i = 0; i < packageGroups.length; i++) {
                var packageGroup = packageGroups[i];

                if (packageGroup.getGroupType() == 3 && 'service-care' == selectedSkodaCareGroup) {
                    // skoda care service care groups are IFed
                    itemsToDraw.push(packageGroup);
                } else {
                    if (packageGroup.getId() != selectedSkodaCareGroup) {
                        continue;
                    }

                    var packages = packageGroup.getPackages();
                    for (var j = 0; j < packages.length; j++) {
                        itemsToDraw.push(packages[j]);
                    }
                    if (packageGroup.getGroupType() == 4) {
                        selectedSkodaCareGroup = true;
                    }
                }
            }
        }
    } else if (settings.viewstate.skodaCareToDisplay == 'selected') {
        var packageGroups = motor.getAvailableSkodaCareGroups();
        var selectedPackages = motor.getPackages();
        for (var i = 0; i < packageGroups.length; i++) {
            var packageGroup = packageGroups[i];
            var packages = packageGroup.getPackages();
            for (var j = 0; j < packages.length; j++) {
                for (var k = 0; k < selectedPackages.length; k++) {
                    if (selectedPackages[k].getCode() == packages[j].getCode()) {
                        if (packageGroup.getGroupType() == 3) {
                            // skoda care service care is IFed
                            itemsToDraw.push(packageGroup);
                        } else {
                            itemsToDraw.push(packages[j]);
                        }
                    }
                }
            }

            if (packageGroup.getGroupType() == 1) {
                $.each(packageGroup.getPackages(), function () {
                    itemsToDraw.push(this);
                });
            }
        }
    }

    // draw packages    
    var sortedItemsToDraw = itemsToDraw.sort(function (a, b) { return a.Sort - b.Sort });

    for (var i = 0; i < sortedItemsToDraw.length; i++) {
        var itemToDraw = sortedItemsToDraw[i];

        var itemCode = '';
        var itemPrice = 0;
        var isGroup = false;
        var groupItemType = null;
        if ('getGroupType' in itemToDraw) {
            itemCode = itemToDraw.getId();
            isGroup = true;
            if (itemToDraw.getPackages().length > 0) {
                itemPrice = itemToDraw.getPackages()[0].getPriceString();
            }
            
            if (itemToDraw.getGroupType() == 3) {
                groupItemType = 'service-care';
            } else {
                throw new Error('Unsupported group type.');
            }
        } else {
            itemPrice = itemToDraw.getPriceString()
            itemCode = itemToDraw.getCode();
        }

        $extraTerminator.before('<div class="extra-item extra-item-{0}" data-price="{1}"><div class="item-top-part"><img class="extra-item-image" /><div class="heart-icon"></div><div class="star-icon"></div><div class="info-ico"></div><div class="video-ico"></div></div><div class="item-label-part"></div><div class="item-price-part"><div class="monthly-from"></div><div class="total"></div><div class="service-care-active-total"></div><div class="service-care-inactive-total total"></div><a class="change"></a><a class="add"></a><a class="remove"></a></div><div class="disabled-layer"></div><div class="active-icon"></div></div>'.format(itemCode, itemPrice));
        var $extraItem = $extraContent.find('div.extra-item-{0}'.format(itemCode));
        $extraItem.attr('data-item-code', itemCode);

        if (itemToDraw.insurance === true) {
            $extraItem.addClass('insurance');
        }
        if (itemToDraw.mobilityInsurance === true) {
            $extraItem.addClass('mobility-insurance');
            $extraItem.addClass('active');
        }
        if (isGroup && groupItemType == 'service-care') {
            $extraItem.addClass('grouped-item').addClass('service-care');
        }

        // columnize
        switch (i % 3) {
            case 0:
                $extraItem.addClass('left-column');
                break;
            case 1:
                $extraItem.addClass('central-column');
                break;
            case 2:
                $extraItem.addClass('right-column');
                $extraTerminator.before('<div class="terminator"></div>');
        }

        if (i >= itemsToDraw.length - 3) {
            $extraItem.addClass('last-row');
            if (i == itemsToDraw.length - 1) {
                $extraItem.addClass('last-item');
            }
        }

        // fill inner content
        var $topPart = $extraItem.find('div.item-top-part');
        var $labelPart = $extraItem.find('div.item-label-part');
        var $pricePart = $extraItem.find('div.item-price-part');
        var $disabledLayer = $extraItem.find('div.disabled-layer');
        var $topImage = $topPart.find('img.extra-item-image');
        var $heartIcon = $topPart.find('div.heart-icon');
        var $starIcon = $topPart.find('div.star-icon');
        var $infoIco = $topPart.find('div.info-ico');

        var $monthlyFrom = $pricePart.find('div.monthly-from');
        var $total = $pricePart.find('div.total');
        var $serviceCareActiveTotal = $pricePart.find('div.service-care-active-total');
        var $serviceCareInactiveTotal = $pricePart.find('div.service-care-inactive-total');
        var $add = $pricePart.find('a.add');
        var $remove = $pricePart.find('a.remove');
        //var $change = $pricePart.find('a.change');

        $labelPart.text(itemToDraw.getName());

        if (isGroup) {
            var activeGroupPackage = itemToDraw.getPackages()[0];
            activeGroupPackage.setHasGroupName(true);
            activeGroupPackage.setGroupName(itemToDraw.getName());
            if (itemToDraw.getPackages().length > 0 && itemToDraw.getPackages()[0].getImage()) {
                $topImage.attr('src', itemToDraw.getPackages()[0].getImage().getUrl());
                $topImage.attr('alt', itemToDraw.getName());
                if (cfgManager.getConfigurator().getSalesProgramSetting("showMarketingImageWatermark") == "true") {
                    $topImage.after("<p class='disclaimer-marketing-image'>{0}</p>".format('MarketingImageWatermark'.resx()));
                }
            } else {
                $topImage.css({
                    'width': 188,
                    'height': 93,
                    'border': '1px solid black'
                });
                $topImage.attr('alt', 'image not available');
            }
        } else {
            if (itemToDraw.getImage()) {
                $topImage.attr('src', itemToDraw.getImage().getUrl());
                $topImage.attr('alt', itemToDraw.getName());
                if (cfgManager.getConfigurator().getSalesProgramSetting("showMarketingImageWatermark") == "true") {
                    $topImage.after("<p class='disclaimer-marketing-image'>{0}</p>".format('MarketingImageWatermark'.resx()));
                }
            } else {
                $topImage.css({
                    'width': 188,
                    'height': 93,
                    'border': '1px solid black'
                });
                $topImage.attr('alt', 'image not available');
            }
        }

        // disabled layer content
        $disabledLayer.html('<div class="disabled-inner"></div>');
        var $disabledInner = $disabledLayer.find('div.disabled-inner');
        $disabledInner.text('ExtraPackageDisabledItem'.resx());

        if (isGroup) {
            $monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format('...'));

            //$monthlyFrom.css('visibility', 'hidden');
        } else {
            if (itemToDraw.insurance !== true) {
                $monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format('...'));

                if (itemToDraw.getMonthlyPriceStringAsync) {
                    var monthlyPriceText = itemToDraw.getMonthlyPriceString();
                    if (monthlyPriceText != null) {
                        $monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format(itemToDraw.getMonthlyPriceString()));
                    }
                } 
                var setMonthlyPrie =
                function (model, $monthlyFromElement) {
                        SkodaAuto.Event.subscribe(
                                    'event.partRateChanged',
                                    function (event, params) {
                                        if (params.id == model.getCode()) {
                                            $monthlyFromElement.text('ExtraPackageMonthlyPrice'.resx().format(params.formattedRate));
                                        }
                        });

                    }(itemToDraw, $monthlyFrom);
            }
        }

        if (isGroup) {
            var fromPriceString = null;
            var fromPrice = null;
            var activePrice = null;
            var monthlyPriceFrom = null;
            var itemToDisplay = null;
            var defaultItem = null;

            $.each(itemToDraw.getPackages(), function () {
                var tmpPkg = this;
                if (fromPrice == null || fromPrice > tmpPkg.getPrice()) {
                    fromPrice = tmpPkg.getPrice();
                    fromPriceString = tmpPkg.getPriceString();
                    defaultItem = tmpPkg;
                }
                // get active price
                $.each(motor.getPackages(), function () {
                    var configuredPkg = this;
                    if (tmpPkg.getCode() == configuredPkg.getCode()) {
                        activePrice = tmpPkg.getPriceString();
                        itemToDisplay = tmpPkg;
                    }
                });
            });          

           

            if (itemToDisplay == null) itemToDisplay = defaultItem;

            $extraItem.data('price',  itemToDisplay.getPriceString())
            $extraItem.data('item-code', itemToDisplay.getCode())

            if (itemToDisplay.getMonthlyPriceStringAsync) {
                var monthlyPriceText = itemToDisplay.getMonthlyPriceString();
                if (monthlyPriceText != null) {
                    $monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format(itemToDisplay.getMonthlyPriceString()));
                }
            }
            var setMonthlyPrie =
                function (model, $monthlyFromElement) {
                    SkodaAuto.Event.subscribe(
                                'event.partRateChanged',
                                function (event, params) {
                                    if (params.id == model.getCode()) {
                                        $monthlyFromElement.text('ExtraPackageMonthlyPrice'.resx().format(params.formattedRate));
                                    }                                    
            });          
                }(itemToDisplay, $monthlyFrom);

            if (itemToDisplay == null) itemToDisplay = defaultItem;

            if (itemToDisplay.getMonthlyPriceStringAsync) {
                var monthlyPriceText = itemToDisplay.getMonthlyPriceString();
                if (monthlyPriceText != null) {
                    $monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format(itemToDisplay.getMonthlyPriceString()));
                }
            }
            var setMonthlyPrie =
                function (model, $monthlyFromElement) {
                    SkodaAuto.Event.subscribe(
                                'event.partRateChanged',
                                function (event, params) {
                                    if (params.id == model.getCode()) {
                                        $monthlyFromElement.text('ExtraPackageMonthlyPrice'.resx().format(params.formattedRate));
                                    }                                    
            });
                }(itemToDisplay, $monthlyFrom);

            $serviceCareInactiveTotal.text('ServiceCarePackagePriceFrom'.resx().format(fromPriceString));
            $serviceCareActiveTotal.text('ServiceCarePackagePrice'.resx().format(activePrice));

            //$monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format(monthlyPriceFrom));
            //$monthlyFrom.text('ExtraPackageMonthlyPrice'.resx().format(monthlyPriceFrom));
            //$monthlyFrom.css('visibility', 'hidden');
            
        } else {
            if (itemToDraw.insurance !== true) {
                $total.text('ExtraPackageTotalPrice'.resx().format(itemToDraw.getPriceString()));
                $total.attr("data-price", itemToDraw.getPriceString());
            } else {
                $total.text('ExtraPackageInsurance'.resx().format('...'));
                $total.attr("data-price", itemToDraw.getPriceString());
                (function ($rateElement) {
                    cfgManager.getConfigurator().getInsurance().getRate(motor, function (rateData) {
                        var resxTemplate = 'ExtraPackageInsurance';
                        var insurance = cfgManager.getConfigurator().getInsurance();
                        if (!insurance.getHasFinancingDefaults(motor)) {
                            resxTemplate = "ExtraPackageYourInsurance";
                        }

                        if (rateData.Rate != null && rateData.Rate.Value != null) {
                            $rateElement.text(resxTemplate.resx().format(rateData.Rate.Value.FormattedValueByCC));
                        } else {
                            $rateElement.text('ExtraPackageInsuranceFailed'.resx());
                        }
                    }, function () {
                        $rateElement.text('ExtraPackageInsuranceFailed'.resx());
                    });
                })($total);
            }
        }

        if (itemToDraw.insurance === true) {
            $add.text('InsuranceAdd'.resx());
        } else {
            $add.text('ExtraPackageAdd'.resx());
        }

        $remove.text('ExtraPackageRemove'.resx());

        if (isGroup) {
            var addSettings = new HtmlCc.Workflow.SettingsType(settings);
            addSettings.viewstate.displayServiceCareDialog = true;
            addSettings.viewstate.serviceCare = itemToDraw.getId();

            addSettings.viewstate.itemClicked = {};
            addSettings.viewstate.itemClicked.price = $extraItem.data('price');
            addSettings.viewstate.itemClicked.id = itemToDraw.getId();
            addSettings.viewstate.itemClicked.type = 'extra';

            $add.attr('href', cfgManager.getUrlOfSettings(addSettings));

            
            var removeSettings = new HtmlCc.Workflow.SettingsType(settings);

            $.each(itemToDraw.getPackages(), function () {
                removeSettings.removePackage(this.getCode());
            });

            removeSettings.viewstate.itemClicked = {};
            removeSettings.viewstate.itemClicked.price = $extraItem.data('price');
            removeSettings.viewstate.itemClicked.id = itemToDraw.getId();
            removeSettings.viewstate.itemClicked.type = 'extra';

            $remove.attr('href', cfgManager.getUrlOfSettings(removeSettings));

        } else {
            if (itemToDraw.insurance === true) {
                var addSettings = new HtmlCc.Workflow.SettingsType(settings);
                addSettings.viewstate.insurance = itemCode;
                addSettings.viewstate.displayInsuranceDialog = true;

                addSettings.viewstate.itemClicked = {};
                addSettings.viewstate.itemClicked.price = itemToDraw.getPriceString();
                addSettings.viewstate.itemClicked.id = itemToDraw.getCode();
                addSettings.viewstate.itemClicked.type = 'extra';

                $add.attr('href', cfgManager.getUrlOfSettings(addSettings));
                $add
                   .unbind('click.htmlcc')
                   .bind('click.htmlcc', function () {

                       //SkodaAuto.Event.publish(
                       //   "gtm.itemAdded",
                       //   new SkodaAuto.Event.Model.GTMEventParams(
                       //      "LifeCC Configuration",
                       //      settings.view,
                       //      "Item Added: " + $(this).parents('.extra-item').data('item-code'),
                       //      {
                       //          context: cfgManager.getConfigurator().getCCContext(),
                       //          model: cfgManager.getConfigurator().getModelCodeShort(),
                       //          modelBody: cfgManager.getConfigurator().getModelCode(),
                       //          carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                       //          extra: $(this).parents('.extra-item').data('item-code'),
                       //          configurationId: settings.configurationId,
                       //          price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                       //          itemPrice: $(this).parents('.extra-item').data('price')
                       //      }));

                       SkodaAuto.Event.publish(
                                "event.setInsurance",
                                new SkodaAuto.Event.Model.InsuranceSetEvntParams(
                                     cfgManager.getConfigurator().getInstanceName(),
                                     cfgManager.getConfigurator().getSalesProgramName(),
                                     cfgManager.getConfigurator().getCulture(),
                                     cfgManager.getConfigurator().getModelCode(),
                                     cfgManager.getConfigurator().getCarlineCode(),
                                     "add"));
                   });

                var removeSettings = new HtmlCc.Workflow.SettingsType(settings);
                removeSettings.viewstate.insurance = undefined;
                removeSettings.viewstate.insuranceRateGuid = undefined;
                removeSettings.viewstate.insuranceDefaultsGuid = undefined;

                removeSettings.viewstate.itemClicked = {};
                removeSettings.viewstate.itemClicked.price = itemToDraw.getPriceString();
                removeSettings.viewstate.itemClicked.id = itemToDraw.getCode();
                removeSettings.viewstate.itemClicked.type = 'extra';

                $remove.attr('href', cfgManager.getUrlOfSettings(removeSettings));
                $remove
                    .unbind('click.htmlcc')
                    .bind('click.htmlcc', function () {


                        SkodaAuto.Event.publish(
                                 "event.setInsurance",
                                 new SkodaAuto.Event.Model.InsuranceSetEvntParams(
                                      cfgManager.getConfigurator().getInstanceName(),
                                      cfgManager.getConfigurator().getSalesProgramName(),
                                      cfgManager.getConfigurator().getCulture(),
                                      cfgManager.getConfigurator().getModelCode(),
                                      cfgManager.getConfigurator().getCarlineCode(),
                                      "remove"));
                        //SkodaAuto.Event.publish(
                        // "gtm.itemRemoved",
                        // new SkodaAuto.Event.Model.GTMEventParams(
                        //    "LifeCC Configuration",
                        //    settings.view,
                        //    "Item Removed: " + $(this).parents('.extra-item').data('item-code'),
                        //    {
                        //        context: cfgManager.getConfigurator().getCCContext(),
                        //        model: cfgManager.getConfigurator().getModelCodeShort(),
                        //        modelBody: cfgManager.getConfigurator().getModelCode(),
                        //        carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                        //        extra: $(this).parents('.extra-item').data('item-code'),
                        //        configurationId: settings.configurationId,
                        //        price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                        //        itemPrice: $(this).parents('.extra-item').data('price')
                        //    }));
                    });



                var $insuranceChangeBtn = $('<div class="insurance">{0}</div>'.format('ChangeInsuranceSetting'.resx()))
                $labelPart.after($insuranceChangeBtn);

                $insuranceChangeBtn.after('<div class="clear"></div>');
                $insuranceChangeBtn
                    .unbind('click.htmlcc')
                    .bind('click.htmlcc',
                            function () {
                                var changeSetting = new HtmlCc.Workflow.SettingsType(settings);
                                changeSetting.viewstate.displayInsuranceDialog = true;
                                location.href = cfgManager.getUrlOfSettings(changeSetting);

                                SkodaAuto.Event.publish(
                                  "event.setInsurance",
                                  new SkodaAuto.Event.Model.InsuranceSetEvntParams(
                                       cfgManager.getConfigurator().getInstanceName(),
                                       cfgManager.getConfigurator().getSalesProgramName(),
                                       cfgManager.getConfigurator().getCulture(),
                                       cfgManager.getConfigurator().getModelCode(),
                                       cfgManager.getConfigurator().getCarlineCode(),
                                       "change"));
                            });

            } else {
                var addSettings = new HtmlCc.Workflow.SettingsType(settings);
                addSettings.addPackage(itemCode);
                addSettings.viewstate.itemClicked = {};
                addSettings.viewstate.itemClicked.price = itemToDraw.getPriceString();
                addSettings.viewstate.itemClicked.id = itemToDraw.getCode();
                addSettings.viewstate.itemClicked.type = 'extra';
                $add.attr('href', cfgManager.getUrlOfSettings(addSettings));

                var removeSettings = new HtmlCc.Workflow.SettingsType(settings);
                removeSettings.removePackage(itemCode);

                removeSettings.viewstate.itemClicked = {};
                removeSettings.viewstate.itemClicked.price = itemToDraw.getPriceString();
                removeSettings.viewstate.itemClicked.id = itemToDraw.getCode();
                removeSettings.viewstate.itemClicked.type = 'extra';

                $remove.attr('href', cfgManager.getUrlOfSettings(removeSettings));
            }
        }

        $add.unbind('click.htmlc').bind('click.htmlcc', function () {
            $extraContent.find('div.item-price-part a.loading').removeClass('loading');
            //SkodaAuto.Event.publish(
            //               "gtm.itemClicked",
            //               new SkodaAuto.Event.Model.GTMEventParams(
            //                  "LifeCC Configuration",
            //                  settings.view,
            //                  "Item Clicked: " + $(this).parents('.extra-item').attr('data-item-code'),
            //                  {
            //                      context: cfgManager.getConfigurator().getCCContext(),
            //                      model: cfgManager.getConfigurator().getModelCodeShort(),
            //                      modelBody: cfgManager.getConfigurator().getModelCode(),
            //                      carlineCode: cfgManager.getConfigurator().getCarlineCode(),
            //                      configurationId: settings.configurationId,
            //                      price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
            //                      extra: $(this).parents('.extra-item').attr('data-item-code'),
            //                      itemPrice: $(this).parents('.extra-item').attr("data-price")
            //                  }));
            SkodaAuto.Event.publish(
                          "gtm.itemAdded",
                           new SkodaAuto.Event.Model.GTMEventParams(
                              "LifeCC Configuration",
                              settings.view,
                             "Item Added: " + $(this).parents('.extra-item').attr('data-item-code'),
                              {
                                  context: cfgManager.getConfigurator().getCCContext(),
                                  model: cfgManager.getConfigurator().getModelCodeShort(),
                                  modelBody: cfgManager.getConfigurator().getModelCode(),
                                  carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                 extra: $(this).parents('.extra-item').attr('data-item-code'),
                                  configurationId: settings.configurationId,
                                  price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                                 itemPrice: $(this).parents('.extra-item').attr("data-price")
                              }));
            $(this).addClass('loading');
        });
        $remove.unbind('click.htmlc').bind('click.htmlcc', function () {
            $extraContent.find('div.item-price-part a.loading').removeClass('loading');
            $(this).addClass('loading');
            //SkodaAuto.Event.publish(
            //               "gtm.itemClicked",
            //               new SkodaAuto.Event.Model.GTMEventParams(
            //                  "LifeCC Configuration",
            //                  settings.view,
            //                  "Item Clicked: " + $(this).parents('.extra-item').attr('data-item-code'),
            //                  {
            //                      context: cfgManager.getConfigurator().getCCContext(),
            //                      model: cfgManager.getConfigurator().getModelCodeShort(),
            //                      modelBody: cfgManager.getConfigurator().getModelCode(),
            //                      carlineCode: cfgManager.getConfigurator().getCarlineCode(),
            //                      configurationId: settings.configurationId,
            //                      price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
            //                      extra: $(this).parents('.extra-item').attr('data-item-code'),
            //                      itemPrice: $(this).parents('.extra-item').attr("data-price")
            //                  }));
            SkodaAuto.Event.publish(
                         "gtm.itemRemoved",
                           new SkodaAuto.Event.Model.GTMEventParams(
                              "LifeCC Configuration",
                              settings.view,
                            "Item Removed: " + $(this).parents('.extra-item').attr('data-item-code'),
                              {
                                  context: cfgManager.getConfigurator().getCCContext(),
                                  model: cfgManager.getConfigurator().getModelCodeShort(),
                                  modelBody: cfgManager.getConfigurator().getModelCode(),
                                  carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                extra: $(this).parents('.extra-item').attr('data-item-code'),
                                  configurationId: settings.configurationId,
                                  price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                                itemPrice: $(this).parents('.extra-item').attr("data-price")
                              }));
            if (itemToDraw.insurance === true) {
                cfgManager.getConfigurator().getInsurance().removeUserFinancingApply(motor);
            }
        });

        // make item active
        if (isGroup) {
            var motorPackages = motor.getPackages();
            var found = false;
            for (var j = 0; j < motorPackages.length; j++) {
                var motorPackage = motorPackages[j];
                var servicePackages = itemToDraw.getPackages();
                for (var k = 0; k < servicePackages.length; k++) {
                    if (motorPackage.getCode() == servicePackages[k].getCode()) {
                        found = true;

                        // change tile according to active item
                        activeGroupPackage = servicePackages[k]
                        $labelPart.text(servicePackages[k].getName());
                        $topImage.attr('src', servicePackages[k].getImage().getUrl());
                        $topImage.attr('alt', servicePackages[k].getName());
                        break;
                    }
                }
            }
        } else {
            var motorPackages = motor.getPackages();
            var found = false;
            for (var j = 0; j < motorPackages.length; j++) {
                var motorPackage = motorPackages[j];
                if (motorPackage.getCode() == itemCode) {
                    found = true;
                    break;
                }
            }
        }

        // make insurance active
        if (settings.viewstate.insurance != null) {
            if (itemCode == settings.viewstate.insurance) {
                found = true;
            }
        }

        if (found) {
            $extraItem.addClass('active');
        }

        var getActionBtn = function ($btn) { return $extraItem.hasClass('mobility-insurance') ? null : $btn.clone(); };

        if (isGroup) {
            // bind marketing info box on hover event

            if ($cc.hasClass('tablet')) {
                $infoIco.bind('click.htmlcc', function (evt) {
                    itemId = $infoIco.parents('.extra-item').data("item-code");
                    HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                        {
                            extra: itemId,
                            itemPrice: $infoIco.parents('.extra-item').attr("data-price")
                        });
                });
            }
            else {
                var timer;
                var delay = 1000;
                $infoIco.hover(function () {
                    $inf = $(this);
                    itemId = $inf.parents('.extra-item').data("item-code");
                    timer = setTimeout(function () {                        
                        HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                            {
                                extra: itemId,
                                itemPrice: $inf.parents('.extra-item').attr("data-price")
                            });
                    }, delay);
                }, function () {
                    // on mouse out, cancel the timer
                    clearTimeout(timer);
                });

            }

            HtmlCc.Gui.Web.PackageHoverBoxWithTimeout(
              $cc,
              cfgManager,
              $infoIco,
              115,
              activeGroupPackage,
              settings,
              motor,
              getActionBtn($remove), getActionBtn($add), found);



        }
        else {

            if ($cc.hasClass('tablet')) {
                $infoIco.bind('click.htmlcc', function (evt) {
                    var itemId = $infoIco.parents('.extra-item').data("item-code");
                    var itemPrice = $infoIco.parents('.extra-item').attr("data-price");
                    HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                        {
                            extra: itemId,
                            itemPrice: itemPrice
                        });
                });
        }
        else {
                var timer;
                var delay = 1000;
                $infoIco.hover(function () {
                    var $inf = $(this);
                    var itemId = $inf.parent().parent().data("item-code");
                    timer = setTimeout(function () {                        
                        HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed($cc, cfgManager, cfgManager.getConfigurator().getConfiguredMotor(), settings.view, itemId,
                            {
                                extra: itemId,
                                itemPrice: $inf.parents('.extra-item').attr("data-price")
                            });
                    }, delay);
                }, function () {
                    // on mouse out, cancel the timer
                    clearTimeout(timer);
                });

            }

            HtmlCc.Gui.Web.PackageHoverBoxWithTimeout(
              $cc,
              cfgManager,
              $infoIco,
              115,
              itemToDraw,
              settings,
              motor,
              getActionBtn($remove), getActionBtn($add), found);
        }

        if (isGroup) {

        } else {
            // make item disabled
            if (itemToDraw.isSelectable()) {
                $extraItem.removeClass('disabled');
            } else {
                $extraItem.addClass('disabled');
            }
        }
    }

    // if there is already selected service care package, disable all others
    $extraContent.find('div.service-care.active').each(function () {
        $extraContent.find('div.service-care').each(function () {
            var $thisSkodaCarePackage = $(this);
            if ($thisSkodaCarePackage.hasClass('active') === false) {
                $thisSkodaCarePackage.addClass('disabled');
            }
        });
    });

    $extraContent.scrollTop(0);
};
HtmlCc.Gui.Web.PresentateFinish = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();

    //var $finishPresentation = $presentationBox.find('div.finish-presentation');
    //if ($finishPresentation.length == 0) {
    // clear everything out
    $presentationBox.html('<div class="finish-presentation"></div>');
    var $finishPresentation = $presentationBox.find('div.finish-presentation');
    //}

    // decide what to display
    var finishDisplay = null;
    if (settings.viewstate.finishDisplay) {
        finishDisplay = settings.viewstate.finishDisplay;
    }

    if (finishDisplay == null || finishDisplay == '') {
        finishDisplay = 'info';
    }

    switch (finishDisplay) {
        case 'show':
            HtmlCc.Gui.Web.PresentateExterior($cc, $finishPresentation, cfgManager, settings);
            //HtmlCc.Gui.Web.PresentateInterior($cc, $finishPresentation, cfgManager, settings);
            HtmlCc.Gui.Web.MickeyMouseLayer($cc, $presentationBox, cfgManager, settings);
            break;
        case 'financing':
            HtmlCc.Gui.Web.PresentateFinishFinancing($cc, $finishPresentation, cfgManager, settings);
            break;
        case 'insurance':
            HtmlCc.Gui.Web.PresentateFinishInsurance($cc, $finishPresentation, cfgManager, settings);
            break;
        case 'services':
            HtmlCc.Gui.Web.PresentateFinishServices($cc, $finishPresentation, cfgManager, settings);
            break;
        case 'carcard':

            HtmlCc.Gui.Web.PresentateFinishCarcard($cc, $finishPresentation, cfgManager, settings);
            break;
        case 'finddealer':
            HtmlCc.Gui.Web.PresentateFinishFinddealer($cc, $finishPresentation, cfgManager, settings);
            break;
        case 'wallpaper':
            HtmlCc.Gui.Web.PresentateFinishWallpaper($cc, $finishPresentation, cfgManager, settings);
            break;
        case 'info':
        default:
            HtmlCc.Gui.Web.PresentateFinishInfo($cc, $finishPresentation, cfgManager, settings);
    }
};
HtmlCc.Gui.Web.PresentateFinishInfo = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    if (settings.viewstate.displayCarStorage != undefined && settings.viewstate.displayCarStorage == true) {
        return;
    }
    var configurator = cfgManager.getConfigurator()
    var motor = configurator.getConfiguredMotor();
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    var $infoBox = $finishPresentation.find('div.info-box');
    if ($infoBox.length == 0) {
        $finishPresentation.html('<div class="info-box"><div class="left-column"><div class="info-header"></div><div class="scroll"><div class="info-box-row"><div class="box box-model"></div><div class="box box-equipment"></div><div class="terminator"></div></div> <div class="info-box-row"><div class="box box-engine"></div><div class="box box-exterior"></div><div class="terminator"></div></div> <div class="info-box-row double-column"><div class="box box-interior"></div></div> <div class="info-box-row double-column the-last"><div class="box box-extra"></div><div class="box box-skoda-care"></div></div></div> <div class="info-footer"></div></div><div class="copyright-note"></div></div>');
        $infoBox = $finishPresentation.find('div.info-box');
    }

    var $infoHeader = $infoBox.find('div.info-header');
    var $infoFooter = $infoBox.find('div.info-footer');

    var $boxModel = $infoBox.find('div.box-model');
    var $boxEquipment = $infoBox.find('div.box-equipment');

    var $boxEngine = $infoBox.find('div.box-engine');
    var $boxExterior = $infoBox.find('div.box-exterior');

    var $boxInterior = $infoBox.find('div.box-interior');

    var $boxExtra = $infoBox.find('div.box-extra');
    var $boxSkodaCare = $infoBox.find('div.box-skoda-care');

    // creation of header
    var instanceName = cfgManager.getConfigurator().getInstanceName();

    // GRB text in summary title
    if (instanceName.toLowerCase() === "gbr") {
        $infoHeader.text('SummaryTitle'.resx());
    }
    else {
        $infoHeader.text('{0} {1} {2}'.format(model.getName(), equipment.getName(), motor.getShortName()));
    }

    // creation of header of model box
    var $boxTitle = $boxModel.find('div.box-title');
    if ($boxTitle.length == 0) {
        $boxModel.prepend('<div class="box-title"></div>');
        $boxTitle = $boxModel.find('div.box-title');
    }
    $boxTitle.text('FinishInfoTitleModel'.resx());

    // creation item of model
    var $boxItem = $boxModel.find('li.box-item');
    if ($boxItem.length == 0) {
        $boxModel.append('<ul><li class="box-item"></li></ul>');
        $boxItem = $boxModel.find('li.box-item');
    }
    $boxItem.text(model.getName());

    HtmlCc.Gui.Web.HoverBoxWithTimeout(
        $cc,
        settings,
        cfgManager,
        $boxItem,
        model.getImage().getUrl(),
        model.getName(),
        model.getDescription() != null ? model.getDescription().replace('%#PRICE#%', model.getPriceFromString()) : '',
        model.getPriceFromString());

    // creation header of equipment box
    $boxTitle = $boxEquipment.find('div.box-title');
    if ($boxTitle.length == 0) {
        $boxEquipment.prepend('<div class="box-title"></div>');
        $boxTitle = $boxEquipment.find('div.box-title');
    }
    $boxTitle.text('FinishInfoTitleEquipment'.resx());

    // creation item of equipment
    $boxItem = $boxEquipment.find('li.box-item');
    if ($boxItem.length == 0) {
        $boxEquipment.append('<ul><li class="box-item"></li></ul>');
        $boxItem = $boxEquipment.find('li.box-item');
    }

    $boxItem.text(equipment.getName());
    $boxItem.prepend('<span class="box-item-price"></span>');

    $boxItem.find('span.box-item-price').text(motor.getPriceFromString());

    HtmlCc.Gui.Web.HoverBoxWithTimeout(
       $cc,
       settings,
       cfgManager,
       $boxItem,
       equipment.getImage().getUrl(), equipment.getName(), equipment.getDescription().replace('%#PRICE#%', equipment.getPriceFromString()), equipment.getPriceFromString());

    // creation of header of engine box
    $boxTitle = $boxEngine.find('div.box-title');
    if ($boxTitle.length == 0) {
        $boxEngine.prepend('<div class="box-title"></div>');
        $boxTitle = $boxEngine.find('div.box-title');
    }
    $boxTitle.text('FinishInfoTitleMotor'.resx());

    // creation item of model

    $boxEngine.find('ul').remove();
    $boxEngine.append('<ul></ul>');
    if (configurator.getSummaryTechDataList().length > 0) {
        var eventParams = new SkodaAuto.Event.Model.ConfigureEvntParams(
                                        settings.instance,      // instanceName
                                        settings.salesprogram,  // salesProgramName
                                        settings.culture,       // culture
                                        settings.model,         // modelCode
                                        settings.carline,       // carlineCode
                                        settings.view,       // step
                                        cfgManager.getConfigurator(),           // configurator
                                        settings.packages,    // packages
                                        motor           //currentMotor - in step 1 configurator.getConfiguredMotor() doesn´t refresh
                            );

        var translator = htmlcc.ValueTranslations.GetTranslatorInstance();
        var provider = translator.GetProvider("configuration");
        provider.ConfigureEventConverter(provider, eventParams);

        $.each(configurator.getSummaryTechDataList(), function (index, techData) {
            try {
                var restrictionResult = eval(techData.Restrictions.translate()) || techData.Restrictions == "";
            }
            catch (err) {
                restrictionResult = false;
            }
            if (restrictionResult) {
                if (techData.Code == 'item-energy') {
                    $boxEngine.find('ul').append('<li class="box-item {0}"></li>'.format(techData.Code));
                    var $energyClass = $('<div />').html(HtmlCc.Gui.Web.createEnergyClass(motor.getEnergyClass(), 100, 61));
                    var $energyBox = $boxEngine.find('.box-item.item-energy');
                    $energyBox.append(techData.Param.translate().format($energyClass.html()));
                    var fuelConsumption = motor.getFuelType().name == 'CNG' ? motor.getFuelConsumptionGas() : motor.getFuelConsumption();
                    var emission = motor.getFuelType().name == 'CNG' ? motor.getEmissionGasDouble() : motor.getEmissionDouble();

                    if (cfgManager.getConfigurator().getSalesProgramSetting("showEnergyClassPopup") == "true") {
                    HtmlCc.Gui.Web.HoverEnergyClassDetail(
                        $cc,
                        cfgManager,
                        settings,
                        $energyBox.find('.emision-item'),
                        "div.box-item.item-energy",
                        motor.getEnergyClass(),
                        fuelConsumption.getCombinedDecimal(),
                        motor.getFuelType(),
                        motor.getFuelNameTranslated(),
                        emission,
                        motor.getMotorCubicCapacity(),
                        new Date().toString(),
                        false,
                        "div.box-engine")
                    }                       
                }
                else {
                 $boxEngine.find('ul').append('<li class="box-item {0}">{1}</li>'.format(techData.Code, techData.Param.translate()));
                }
            }
        });
    }
    else {
        $boxEngine.find('ul').append('<li class="box-item item-engine"></li><li class="box-item item-emission"></li>');
        $boxEngine.find('li.item-engine').text(motor.getName());

        $boxEngine.find('li.item-emission').html("CO<sub>2</sub> {0} g/km".format(motor.getEmissionGasDouble() > 0 ? motor.getEmissionGasDouble() : motor.getEmissionDouble()));

    }

    HtmlCc.Gui.Web.HoverBoxWithTimeout(
       $cc,
       settings,
       cfgManager,
       $boxEngine.find('li.item-engine'),
       motor.getImage().getUrl(), motor.getName(), motor.getDescription().replace('%#PRICE#%', motor.getPriceFromString()), motor.getPriceFromString());

    // creation header of exterior box
    $boxTitle = $boxExterior.find('div.box-title');
    if ($boxTitle.length == 0) {
        $boxExterior.prepend('<div class="box-title"></div>');
        $boxTitle = $boxExterior.find('div.box-title');
    }
    $boxTitle.text('FinishInfoTitleExterior'.resx());

    // creation item of exterior
    $boxExterior.find('ul').remove();
    $boxExterior.append('<ul></ul>');
    var $boxExteriorList = $boxExterior.find('ul');

    // color
    $boxExteriorList.append('<li class="body-color"></li>');
    var $bodyColor = $boxExteriorList.find('li.body-color');
    $bodyColor.text(motor.getSelectedColor().getName());
    $bodyColor.prepend('<span class="box-item-price"></span>');

    var $bodyColorPrice = $bodyColor.find('span.box-item-price');
    $bodyColorPrice.text(motor.getSelectedColor().getPriceString());

    $bodyColor.attr('data-code', motor.getSelectedColor().getCode());

    HtmlCc.Gui.Web.HoverBoxWithTimeout(
      $cc,
      settings,
      cfgManager,
      $bodyColor,
      //motor.getSelectedColor().getImage().getUrl(),
      HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, 'Rotation0', 'Like_Offline_Low'),
      motor.getSelectedColor().getName(), null, motor.getSelectedColor().getPriceString());

    // wheels
    if (motor.getSelectedWheel() != null) {
        // wheels are defined
        $boxExteriorList.append('<li class="wheels"></li>');
        var $wheels = $boxExteriorList.find('li.wheels');
        $wheels.text(motor.getSelectedWheel().getName());
        $wheels.attr('data-code', motor.getSelectedWheel().getName());
        $wheels.prepend('<span class="box-item-price"></span>');
        var $wheelsPrice = $wheels.find('span.box-item-price');
        $wheelsPrice.text(motor.getSelectedWheel().getPriceString());
    } else {
        // wheels are not defined in data yet, try to guess it
        // TODO
    }

    // creation of title of interior
    $boxTitle = $boxInterior.find('div.box-title');
    if ($boxTitle.length == 0) {
        $boxInterior.prepend('<div class="box-title"></div>');
        $boxTitle = $boxInterior.find('div.box-title');
    }
    $boxTitle.text('FinishInfoTitleInterior'.resx());

    // creation item of interior
    $boxInterior.find('ul').remove();
    $boxInterior.append('<ul><li class="interior"></li></ul>');
    var $boxInteriorList = $boxInterior.find('ul');

    var $interiorItem = $boxInterior.find('li.interior');
    $interiorItem.text(motor.getSelectedInterior().getName());
    $interiorItem.attr('data-code', motor.getSelectedInterior().getCode());

    HtmlCc.Gui.Web.HoverBoxWithTimeout(
      $cc,
      settings,
      cfgManager,
      $interiorItem,
      motor.getSelectedInterior().getImage().getUrl(),
      motor.getSelectedInterior().getName(), null, motor.getSelectedInterior().getPriceString());

    // creation of title of extras
    $boxTitle = $boxExtra.find('div.box-title');
    if ($boxTitle.length == 0) {
        $boxExtra.prepend('<div class="box-title"></div>');
        $boxTitle = $boxExtra.find('div.box-title');
    }
    $boxTitle.text('FinishInfoTitleExtra'.resx());

    // creation of extra list 
    $boxExtra.find('ul').remove();
    $boxExtra.append('<ul></ul>');
    var $boxExtrasList = $boxExtra.find('ul');

    // creation of title of extras
    var $skodaCareTitle = $boxSkodaCare.find('div.box-title');
    if ($skodaCareTitle.length == 0) {
        $boxSkodaCare.prepend('<div class="box-title"></div>');
        $skodaCareTitle = $boxSkodaCare.find('div.box-title');
    }
    $skodaCareTitle.text('FinishInfoTitleSkodaCare'.resx());

    // creation of skoda care list 
    $boxSkodaCare.find('ul').remove();
    $boxSkodaCare.append('<ul></ul>');
    var $boxSkodaCareList = $boxSkodaCare.find('ul');

    var getPackages = function (packages, predicate) {
        var filteredPackages = [];
        for (var i = 0; i < packages.length; i++) {
            if (predicate(packages[i])) {
                filteredPackages.push(packages[i]);
            }
        }

        return filteredPackages;
    };

    var extrPackages = getPackages(motor.getPackages(), function (packageItem) { return !packageItem.isSkodaCarePackage(); });
    var skodaCarePackages = getPackages(motor.getPackages(), function (packageItem) { return packageItem.isSkodaCarePackage(); });

    $.each(motor.getAvailableSkodaCareGroups(), function () {
        var grp = this;
        if (grp.getGroupType() == 1) {
            $.each(grp.getPackages(), function () {
                skodaCarePackages.push(this);
            });
        }
    });

    var createPackageList = function ($listContainer, packages) {
        for (var i = 0; i < packages.length; i++) {
            var pkg = packages[i];

            if (pkg.getCode() == motor.getSelectedWheel().getCode()) {
                continue;
            }

            $listContainer.append('<li class="extra-{0}"></li>'.format(pkg.getCode()));
            var $currentPkg = $listContainer.find('li.extra-{0}'.format(pkg.getCode()));

            $currentPkg.append('<span class="box-item-name" ></span>');
            var $currentPkgItem = $currentPkg.find('span.box-item-name');
            $currentPkgItem.text(pkg.getName());
            $currentPkg.append($currentPkgItem);

            $currentPkg.prepend('<span class="box-item-price"></span>');
            var $currentPkgPrice = $currentPkg.find('span.box-item-price');
            $currentPkgPrice.text(pkg.getPriceString());

            //$currentPkg.prepend('<span>-</span>');

            $currentPkg.attr('data-code', pkg.getCode());

            HtmlCc.Gui.Web.HoverBoxWithTimeout(
              $cc,
              settings,
              cfgManager,
              $currentPkg,
              pkg.getImage() != null ? pkg.getImage().getUrl() : null,
              pkg.getName(), pkg.getDescription(), pkg.getPriceString());
        }
    };

    createPackageList($boxExtrasList, extrPackages);
    createPackageList($boxSkodaCareList, skodaCarePackages);

    if (extrPackages.length == 0) {
        $boxExtrasList.append('<li class="extra-none"></li>');
        var $currentPkg = $boxExtrasList.find('li.extra-none');
        $currentPkg.text('FinishInfoNoExtraPackagesLabel'.resx());
    }

    if (skodaCarePackages.length == 0) {
        $boxSkodaCareList.append('<li class="extra-none"></li>');
        var $currentPkg = $boxSkodaCareList.find('li.extra-none');
        $currentPkg.text('FinishInfoNoSkodaCareProductsLabel'.resx());
    }

    // right box
    var $rightColumn = $infoBox.find('div.right-column');
    var creating = false;
    if ($rightColumn.length == 0) {
        $infoBox.append('<div class="right-column"></div>');
        $rightColumn = $infoBox.find('div.right-column');
        creating = true;
    }

    if (cfgManager.getConfigurator().getSalesProgramSetting("showQRCodeStep7") != "false") {
        $infoBox.find('.right-column').append('<div class="box qr-box"><div class="label"></div><div class="qr-target para"></div><div class="description"></div></div>');
    }

    if (cfgManager.getConfigurator().getSalesProgramSetting("showShareBoxStep7") != "false") {
        $infoBox.find('.right-column').append('<div class="box share-box"><div class="label"></div></div>');
    }

    $infoBox.find('.right-column').append('<div class="box configuration-box"><div class="label"></div><div class="para"></div></div>');

    var $qrBox = $rightColumn.find('div.qr-box');
    var $shareBox = $rightColumn.find('div.share-box');
    var $configurationBox = $rightColumn.find('div.configuration-box');

    cfgManager.saveConfiguration(function (data, fromCache) {
        if (data == null) {
            $cc.find('a.finish-item.item-carcard').hide();
            $cc.find('a.finish-item item-sendemail').hide();
            $cc.find('div.right-column').hide();
            return;
        }

        $infoBox.find('div.qr-target').html('<img class="qr-code" />');
        var $qrCode = $infoBox.find('img.qr-code');
        //var carCardUrl = cfgManager.getConfigurator().getCarCardUrlFormat().format(data.Id);
        var carCardUrl = "/CarCard/{0}".format(data.Id);

        // IE hack if does not have access to window.location.origin
        if (!window.location.origin) {
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }
        $qrCode.attr('src', cfgManager.getConfigurator().getQrCodeGeneratorUrlFormat().format(escape(window.location.origin + carCardUrl + "?skipMobileDetection=true")));
        $cc.find('a.finish-item.item-carcard').attr('href', carCardUrl);
        $cc.find('a.finish-item.item-carcard')
            .unbind("click.hmlcc")
            .bind("click.hmlcc", function () {
                SkodaAuto.Event.publish(
                            "event.carCardClick",
                            new SkodaAuto.Event.Model.CarCardEvntParams(
                                 cfgManager.getConfigurator().getInstanceName(),
                                 cfgManager.getConfigurator().getSalesProgramName(),
                                 cfgManager.getConfigurator().getCulture(),
                                 cfgManager.getConfigurator().getModelCode(),
                                 cfgManager.getConfigurator().getCarlineCode(),
                                 settings.view, data.Id));
            });

        $cc.find('div.box.configuration-box div.para:first').text(data.Id);
        //$cc.find('div.box.configuration-box div.para').eq(1).text(data.GlobalId);

        if (cfgManager.getConfigurator().getSalesProgramSetting("showVsssID") == "true") {
            $cc.find('div.box.configuration-box').append('<div class="label"></div><div class="para"></div>')
        $cc.find('div.box.configuration-box div.para').eq(1).text(data.GlobalId);
            var $headerGlobalConfigurationId = $infoHeader.find('div.global-id');
            if ($headerGlobalConfigurationId.length == 0) {
                $infoHeader.prepend('<div class="configuration-id global-id"></div>');
                $headerGlobalConfigurationId = $infoHeader.find('div.global-id');
            }
            $headerGlobalConfigurationId.text('FinishHeaderGlobalConfigurationId'.resx().format(data.GlobalId));
        }
      
        if (data.Id != undefined) {
            settings.configurationId = data.Id;
        }
        else {
            settings.configurationId = 0;
        }

        // id of configuration place near model name
        var $headerSkodaConfigurationId = $infoHeader.find('div.skoda-id');

        if ($headerSkodaConfigurationId.length == 0) {
            $infoHeader.append('<div class="configuration-id skoda-id"></div>');
            $headerSkodaConfigurationId = $infoHeader.find('div.skoda-id');
        }
        $headerSkodaConfigurationId.text('FinishHeaderConfigurationId'.resx().format(data.Id));

        var $shareIcons = $shareBox.find('div.icons');
        if ($shareIcons.length == 0) {
            $shareBox.append('<div class="icons para"><a class="facebook"></a><a class="sendemail"><div class="email-img"/><div class="email-text"></div></a><div class="terminator"></div></div>');
        }

        var $facebookIcon = $shareBox.find('a.facebook');
        //$facebookIcon.attr('title', 'FacebookIconTooltipText'.resx());
        $facebookIcon.text('FacebookIconTooltipText'.resx());

        var $itemEmailLink = $cc.find('a.item-sendemail');
        var $sendemailIcon = $shareBox.find('a.sendemail');

        if (cfgManager.getConfigurator().getSalesProgramSetting("showEmail") != "true") {
            $sendemailIcon.hide();
        }

        $sendemailIcon.text('EmailIconTooltipText'.resx());

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);

        newSettings.viewstate.displaySendemailDialog = true;
        newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';

        $sendemailIcon.attr('href', cfgManager.getUrlOfSettings(newSettings));
        $itemEmailLink.attr('href', cfgManager.getUrlOfSettings(newSettings));

        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
        newSettings.viewstate.displayFacebookBox = true;
        newSettings.viewstate['selectedPresentation-{0}'.format(settings.view)] = 'finish-info';
        $facebookIcon.attr('href', cfgManager.getUrlOfSettings(newSettings));

        var $ccRoot = $cc.find('div.cc-root:first');

        // get and show importer's link 
        cfgManager.getConfigurator().loadImporterLinks(
            data,
            function (importerLinks) {
                var $finishMenu = $cc.find("div.finish-menu");
                $finishMenu.find("a.importer-link").remove();

                if (importerLinks != null) {
                    $.each(importerLinks, function (index, item) {
                        try {
                            var restrictionResult = eval(item.getRestrictions());
                        }
                        catch (err) {
                            restrictionResult = true;
                        }
                        if (restrictionResult || restrictionResult == null) {
                        $finishMenu.append('<a class="finish-item importer-link importer-link-{0}"></a>'.format(index));
                        var $importerLink = $finishMenu.find('a.importer-link-{0}'.format(index));

                        $importerLink.append("<span>{0}</span>".format(item.getText()));
                        $importerLink.prepend('<img src="{0}" class="icon-image" />'.format(item.getIconUrl()));
                        $importerLink.append('<div class="next-arrow"></div>');

                        if (!item.getOpenInPopup() || $cc.hasClass('tablet')) {
                            
                                if (item.getOnClick() != "") {
                                $importerLink.attr('onclick', item.getOnClick());
                            }
                            if (item.getUrl() != "") {
                                $importerLink.attr('href', item.getUrl());
                            }
                            $importerLink.attr('target', '_blank');
                        }

                        $importerLink
                          .unbind("click.hmlcc")
                          .bind("click.hmlcc", function () {
                              if (item.getOpenInPopup() && !$cc.hasClass('tablet')) {
                                  var $dialog = $('<div class="importer-link-dialog"><div class="dialog-inner"><div class="dialog-header"><a class="close"></a></div><div class="dialog-content"></div></div></div>');
                                  var $iframeContainer = $dialog.find('div.dialog-content');
                                  var $iframe = $('<iframe />');
                                  $iframe.attr("src", item.getUrl());
                                  $iframeContainer.append($iframe);

                                  var $close = $dialog.find('a.close');
                                  $close.attr('href', '#');
                                  $close.bind('click.htmlcc', function (evtB) {
                                      evtB.preventDefault();
                                      $dialog.remove();
                                  });

                                  $ccRoot.append($dialog);
                              }

                                  SkodaAuto.Event.publish(
                                          "gtm.menuItemClick",
                                          new SkodaAuto.Event.Model.GTMEventParams(
                                           "LifeCC Configuration",
                                           settings.view,
                                           "Menu Clicked: " + $(this).text(),
                                           {
                                               context: cfgManager.getConfigurator().getCCContext(),
                                               model: cfgManager.getConfigurator().getModelCodeShort(),
                                               modelBody: cfgManager.getConfigurator().getModelCode(),
                                               carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                               configurationId: settings.configurationId,
                                               price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString(),
                                           }
                                          ));

                              SkodaAuto.Event.publish(
                                          "event.importerLinkClick",
                                          new SkodaAuto.Event.Model.ImporterLinkEvntParams(
                                               cfgManager.getConfigurator().getInstanceName(),
                                               cfgManager.getConfigurator().getSalesProgramName(),
                                               cfgManager.getConfigurator().getCulture(),
                                               cfgManager.getConfigurator().getModelCode(),
                                               cfgManager.getConfigurator().getCarlineCode(),
                                               settings.view,
                                               item.getId(),
                                               item.getUrl()));
                          });
                        }
                    });
                }
            },
            function () {
                HtmlCc.Libs.Log.error('Loading importers links have failed.');
            });

        if (!fromCache) {
            //var allConfiguratorLinks = $("a[href^='#!cc\']");
            //$.each(allConfiguratorLinks, function (index, value) {
            //    var matches = $(value).attr("href").match(/\b(cc-configurationId=)(\d+)\b/);
            //    if (matches != null && matches.length > 0) {
            //        $(value).attr("href", $(value).attr("href").replace(/\b(cc-configurationId=)(\d+)\b/, "\$1" + data.Id));
            //    }
            //});
            var newSettings = new HtmlCc.Workflow.SettingsType(settings);
            newSettings.configurationId = data.Id;
            location.href = cfgManager.getUrlOfSettings(settings);

            //window.location.hash =
            //    window.location.hash.replace(/\b(cc-configurationId=)(\d+)\b/, "\$1" + data.Id);

            var motor = cfgManager.getConfigurator().getConfiguredMotor();

            var wheelCode = motor.getSelectedWheel() != null ? motor.getSelectedWheel().getCode() : null;


            SkodaAuto.Event.publish(
               "gtm.configurationFinished",
               new SkodaAuto.Event.Model.GTMEventParams(
                     "LifeCC Configuration",
                     settings.view,
                     "Configuration Finished",
                                    {
                                        context: cfgManager.getConfigurator().getCCContext(),
                                        model: cfgManager.getConfigurator().getModelCodeShort(),
                                        modelBody: cfgManager.getConfigurator().getModelCode(),
                                        carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                        configurationId: newSettings.configurationId,
                                        price: motor.getPriceString(),
                                        equipment: motor.getEquipment().getCode(),
                                        engine: motor.getId(),
                                        //gear: cfgManager.getConfigurator().getConfiguredMotor().getGearboxLabel(),
                                        mbv: motor.getMbvKey(),
                                        color: newSettings.color,
                                        exterior: wheelCode,
                                        interior: newSettings.interior,
                                        extraEq: newSettings.packages,
                                        finishedConfiguration: 1
                                    }
                                   ));

            SkodaAuto.Event.publish(
                         "event.configurationSaved",
                         new SkodaAuto.Event.Model.ConfigurationSavedEvntParams(
                              cfgManager.getConfigurator().getInstanceName(),
                              cfgManager.getConfigurator().getSalesProgramName(),
                              cfgManager.getConfigurator().getCulture(),
                              cfgManager.getConfigurator().getModelCode(),
                              cfgManager.getConfigurator().getCarlineCode(),
                              settings.view, data.Id));
        }

    }, function () {
        HtmlCc.Libs.Log.error('Configuration save failed.');
    }, settings.configurationId, settings.viewstate.insurance, false);

    if (creating) {
        $qrBox.find('div.label').text('FinishInfoYourQrCode'.resx());
        $qrBox.find('div.description').text('FinishInfoQrDescription'.resx());

        $shareBox.find('div.label').text('FinishInfoShareLabel'.resx());

        $configurationBox.find('div.label').text('FinishInfoYourCfgSkodaId'.resx());
        $configurationBox.find('div.label').eq(1).text('FinishInfoYourCfgGlobalId'.resx());
    }

    var $priceSummary = $infoFooter.find('table.price-summary');
    if ($priceSummary.length == 0) {
        //$infoFooter.append('<table class="price-summary" cellspacing="0" cellpadding="0"><tr><td class="your-car-price-label"></td><td class="your-car-price-value"></td></tr><tr class="extra-price"><td class="your-car-price-labelExtraPriceOne"></td><td class="your-car-price-valueExtraPriceOne"></td></tr><tr class="extra-price"><td class="your-car-price-labelExtraPriceTwo"></td><td class="your-car-price-valueExtraPriceTwo"></td></tr><tr class="financing-row"><td class="monthly-rate-label"></td><td class="monthly-rate-value"></td></tr></table>');
        $infoFooter.append('<table class="price-summary" cellspacing="0" cellpadding="0"><tr><td class="your-car-price-label"></td><td class="your-car-price-value"></td><tr class="financing-row"><td class="monthly-rate-label"></td><td class="monthly-rate-value"></td></tr> <tr class="insurance-row"><td class="insurance-rate-label"></td><td class="insurance-rate-value"></td></tr></table>');
        $priceSummary = $infoFooter.find('table.price-summary');
    }

    var $priceLabel = $priceSummary.find('td.your-car-price-label');
    var $priceValue = $priceSummary.find('td.your-car-price-value');
    var $monthlyLabel = $priceSummary.find('td.monthly-rate-label');
    var $monthlyValue = $priceSummary.find('td.monthly-rate-value');

    var $insuranceLabel = $priceSummary.find('td.insurance-rate-label');
    var $insuranceValue = $priceSummary.find('td.insurance-rate-value');

    $priceLabel.text('FinishInfoYourPrice'.resx());
    $priceValue.text(motor.getPriceString());

    var financing = cfgManager.getConfigurator().getFinancing();

    if (financing == null) {
        $priceSummary.find('tr.financing-row').addClass('do-not-display');

        if (cfgManager.getConfigurator().getInstanceId() === 15) {
            $.each(motor.getTotalExtraPrices(), function (index, value) {
                $that = value;
                var $row = $('<tr class="extra-price">');
                var $labelCell = $('<td class="your-car-extra-price-label">').html("{0}:".format($that.getLabel()));
                var $valueCell = $('<td class="your-car-extra-price-value">').html(($that.getValue()));

                $row.append($labelCell);
                $row.append($valueCell);

                $priceSummary.append($row);
            });
        }
        else {
            $priceSummary.addClass('do-not-show-extra-prices');
        }
    }

    if (financing != null) {
        $monthlyLabel.append(
            financing.getHasFinancingDefaults(motor) ? 'FinishInfoTentativeFinacing'.resx() : 'FinishInfoYourFinacing'.resx());

        $monthlyValue.append('<div class="info-ico">...</div>');

        financing.getRateFromDefaults(
            motor,
            function (rate) {
                $rateElement = $monthlyValue.find("div.info-ico");
                (rate != null && !rate.isEmpty()) ? $rateElement.text(rate) : $rateElement.text('MonthlyRateDetail'.resx());
            },
            function () {
                $rateElement.text('MonthlyRateDetail'.resx());
            });
        $monthlyValue.find('div.info-ico').bind("click.htmlcc",
            function () { 
                HtmlCc.Gui.Web.ClickBoxSummary($cc, cfgManager, settings, financing)
            });
        //HtmlCc.Gui.Web.SummaryHoverBoxWithTimeout($cc, cfgManager, $monthlyValue.find('div.info-ico'), financing);
    }

    var insurance = cfgManager.getConfigurator().getInsurance();
    if (insurance == null || settings.viewstate.insurance == undefined) {
        $priceSummary.find('tr.insurance-row').addClass('do-not-display');
    }
    else {
        $insuranceLabel.text(//'InsuranceSummaryLabel'.resx());
            insurance.getHasFinancingDefaults(motor) ? 'FinishInfoTentativeInsurance'.resx() : 'FinishInfoYourInsurance'.resx());
        $insuranceValue.append('<div class="info-ico">{0}</div>'.format('InsuranceDetail'.resx()));

        $insuranceValue.find('div.info-ico').bind("click.htmlcc",
            function () { HtmlCc.Gui.Web.ClickBoxSummary($cc, cfgManager, settings, insurance) });
        //HtmlCc.Gui.Web.SummaryHoverBoxWithTimeout($cc, cfgManager, $insuranceValue.find('div.info-ico'), insurance);
    }

};

HtmlCc.Gui.Web.PresentateFinishFinancingOffer = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

};

HtmlCc.Gui.Web.PresentateFinishFinddealer = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    $finishPresentation.html('Find dealer feature is not ready yet.');
};
HtmlCc.Gui.Web.PresentateFinishCarcard = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    $finishPresentation.html('Car card feature is not ready yet.');
};
HtmlCc.Gui.Web.PresentateFinishServices = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    $finishPresentation.html('Services feature is not ready yet.');
};
HtmlCc.Gui.Web.PresentateFinishInsurance = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    $finishPresentation.html('Insurance feature is not ready yet.');
};
HtmlCc.Gui.Web.PresentateFinishShow = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    $finishPresentation.html('Presentation of car feature is not ready yet.');
};
HtmlCc.Gui.Web.PresentateFinishFinancing = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    $finishPresentation.html('Financing feature is not ready yet.');
};
HtmlCc.Gui.Web.PresentateFinishWallpaper = function ($cc, $finishPresentation, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>
    var motor = cfgManager.getConfigurator().getConfiguredMotor();
    $finishPresentation.html('Wallpaper feature is not ready yet.');
};

HtmlCc.Gui.Web.HoverEnergyClassDetail = function (
    $cc,
    cfgManager,
    settings,
    $energyClassCell,
    jQueryECLocator,
    energyClassLetter,
    combinedConsumption,
    fuelType,
    fuelNameTranslated,
    emission,
    motorCubicCapacity,
    dateCreated,
    isSelected,
    jQueryHoverLockerLocator
    ) {
    $energyClassCell.data("energy-class", energyClassLetter);
    $energyClassCell.data("motor-fuel-consumption", combinedConsumption);
    $energyClassCell.data("motor-fuel-type", fuelType);
    $energyClassCell.data("motor-fuel-name", fuelNameTranslated);
    $energyClassCell.data("motor-emission", emission);
    $energyClassCell.data("motor-value", motorCubicCapacity);
    $energyClassCell.data("date-created", dateCreated);
    // Dialog that will show at cell click.
    //$energyClassCell.unbind('click.htmlcc').bind('click.htmlcc', function () {
    $energyClassCell.unbind('hover.htmlcc').bind('hover.htmlcc', function () {
        var $ccRoot = $cc.find('div.cc-root');
        if ($ccRoot.find('div.dialog.load-configuration').length > 0) {
            return;
        }
        if ($(jQueryECLocator).data('closetimeout')) {
            clearTimeout($(jQueryECLocator).data('closetimeout'));
            $(jQueryHoverLockerLocator).removeClass('hover');
        }
        var $energyClassCell = $(this);
        //$(jQueryHoverLockerLocator).toggleClass('hover');
        handle = setTimeout(function () {
            if (!$(jQueryHoverLockerLocator).hasClass('hover')) {
                $(jQueryHoverLockerLocator).addClass('hover');
                var energyClass = $energyClassCell.data("energy-class");
                var motorFuelConsumption = $energyClassCell.data("motor-fuel-consumption");
                var motorFuelType = $energyClassCell.data("motor-fuel-type");
                var motorFuelName = $energyClassCell.data("motor-fuel-name");
                var motorEmission = $energyClassCell.data("motor-emission");
                var motorValue = $energyClassCell.data("motor-value");
                var dateCreated = $energyClassCell.data("date-created");
                //
                var translator = htmlcc.ValueTranslations.GetTranslatorInstance();
                var energyClassProvider = translator.GetProvider("EnergyClassMath");
                var energyClassSetup = cfgManager.getConfigurator().getEnergyClassSetupSettings();
                energyClassProvider.CalculateValues(energyClassSetup, motorFuelConsumption, motorFuelType.name, motorFuelName, motorEmission, motorValue, dateCreated);
                //
                //
                var $ccRoot = $cc.find('div.cc-root');
                $ccRoot.append('<div class="dialog energy-class load-configuration"><div class="dialog-inner-bck"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content"></div><div class="dialog-waiting"></div></div></div></div>');

                var $dialog = $ccRoot.find('div.dialog.load-configuration:first');
                $dialog.find('div.header-text-inner').html('Step2EnergyClassDetailDialog'.resx().toString());

                var closeFunction = function () {
                    cancelClose();
                    var timeout = setTimeout(function () {
                        $ccRoot.find('div.dialog.load-configuration:first').remove();
                        var $energyClassCell = $(jQueryECLocator);
                        $(jQueryHoverLockerLocator).removeClass('hover');
                    }, 200);
                    $ccRoot.find('div.dialog.load-configuration:first').data('closetimeout', timeout);
                };
                var cancelClose = function () {
                    if ($ccRoot.find('div.dialog.load-configuration:first').data('closetimeout')) {
                        clearTimeout($ccRoot.find('div.dialog.load-configuration:first').data('closetimeout'));
                    }
                };

                $dialog.find('a.close').attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
                    evt.preventDefault();
                    //$dialog.remove();
                    //$cc.find("td.motor-energy-class").removeClass("hover");
                    closeFunction();
                });

                var $content = $dialog.find('div.dialog-content');
                //
                var $co2infoTable = $("<table width='100%'><tbody></tbody></table>");
                var $co2infoBody = $co2infoTable.find("tbody");
                $row = $("<tr></tr>");

                // Left co2 info
                var $leftDivMaster = $("<td class='co2infoDetails' width='100%'></td>");
                var $topParagraph = $("<div class='co2info-top-paragraph'></div>").html("Co2InfoTopParagraph".resx().toString());
                $leftDivMaster.append($topParagraph);
                // Calculatd data
                var $yearFeeMaster = $("<div class='co2info-top'></div>");
                var $yearFeeLabel = $("<div class='Co2InfoTopLabel'></div>").html("Co2InfoYearFeeLabel".resx().toString());
                var $yearFeeValue = $("<div class='Co2InfoTopValue'></div>").html("Co2InfoYearFeeValue".resx().translate().evaluate("-").toString()); // "#EnergyClassMath.ecoFeeExpressionEvaluated# EUR"
                $yearFeeMaster.append($yearFeeLabel);
                $yearFeeMaster.append($yearFeeValue);
                $yearFeeMaster.append($("<div class='clear'></div>"));
                $leftDivMaster.append($yearFeeMaster);
                //
                var $yearMilage = $("<div class='co2info-year-milage'></div>").html("Co2InfoYearMilage".resx().translate().toString());
                $leftDivMaster.append($yearMilage);
                //
                var $fuelNameLabel = $("<div class='Co2InfoTopLabel-no-float'></div>").html("Co2InfoFuelNameLabel".resx().translate().toString());
                $leftDivMaster.append($fuelNameLabel);
                //
                var $fuelCostLabel = $("<div class='Co2InfoTopLabel-no-float'></div>").html("Co2InfoFuelCostLabel".resx().translate().evaluate("-").toString());
                $leftDivMaster.append($fuelCostLabel);
                //
                var $yearCostMaster = $("<div></div>");
                var $yearCostLabel = $("<div class='Co2InfoTopLabel'></div>").html("Co2InfoYearFuelCostLabel".resx().toString());
                var $yearCostValue = $("<div class='Co2InfoTopValue'></div>").html("Co2InfoYearFuelCostValue".resx().translate().evaluate("-").toString()); // "#EnergyClassMath.ecoYearCostExpressionEvaluated# EUR"
                $yearCostMaster.append($yearCostLabel);
                $yearCostMaster.append($yearCostValue);
                $yearCostMaster.append($("<div class='clear'></div>"));
                $leftDivMaster.append($yearCostMaster);
                //
                $row.append($leftDivMaster);

                // Energy class
                $row.append($("<td class='co2infoEnergyClass'></td>").append(HtmlCc.Gui.Web.createEnergyClassBig2(energyClass, 200, 160).addClass("noborder")));
                $co2infoBody.append($row);
                //
                // Title
                $row = $("<tr></tr>");
                var $middleDivMaster = $("<td colspan='2' class='co2infoDetailsCenterTitle'></td>");
                $middleDivMaster.html("Co2InfoDetailsCenterTitle".resx().translate().toString());
                $row.append($middleDivMaster);
                $co2infoBody.append($row);
                //
                // Disclaimers
                $row = $("<tr></tr>");
                var $middleDivMaster = $("<td colspan='2' class='co2infoDetailsCenterContent'></td>");
                $middleDivMaster.html("Co2InfoDetailsCenterContent".resx().toString() + "<br><br>");
                $row.append($middleDivMaster);
                $co2infoBody.append($row);
                //
                $content.append($co2infoTable);
                //$content.append($("<div></div>").html("#EnergyClassMath.ecoYearCostExpressionEvaluated#".translate().toString() + "::" + "#EnergyClassMath.ecoYearCostExpression#".translate().translate().toString()));

                /*
                $energyClassCell.unbind('mouseleave.htmlcc').bind('mouseleave.htmlcc', function () {
                    var $ccRoot = $cc.find('div.cc-root');
                    clearTimeout($ccRoot.find('div.dialog.load-configuration:first').data('closetimeout'));
                });
                */

                cancelClose();
                /*
                var $stepHover = $ccRoot.find('div.dialog.load-configuration:first');
                $energyClassCell.bind('mouseleave.htmlcc', function () {
                    closeFunction();
                });
                $stepHover.bind('mouseenter.htmlcc', function () {
                    cancelClose();
                });
                $stepHover.bind('mouseleave.htmlcc', function () {
                    closeFunction();
                });
                */

            }
        }, 500);
        $(jQueryECLocator).data('closetimeout', handle);
    });
}

HtmlCc.Gui.Web.PresentateEngine = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$finishPresentation' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var configurator = cfgManager.getConfigurator();
    //var motor = configurator.getConfiguredMotor();
    $presentationBox.html("");

    var $enginePresentation = $presentationBox.find('div.engine-presentation');
    if ($enginePresentation.length == 0) {
        // clear everything out
        $presentationBox.html('');
        $presentationBox.append('<div class="engine-presentation"><div class="target-container"></div><div class="copyright-note"></div></div>');
        $enginePresentation = $presentationBox.find('div.engine-presentation');

        /*
        
        */

        // prevent touch gestures to bubble out of the configurator at tablet design
        //$enginePresentation.bind('touchmove.htmlcc', function (evt) {
        //    if ($cc.hasClass('tablet')) {
        //        evt.preventDefault();
        //    }
        //});
    }
    var model = configurator.getConfiguredMotor().getEquipment().getModel();
    var equipments = model.getEquipments();
    var powerUnit = "MotorPowerUnit".resx();
    $table = $("<table class='target-engine-table'></table>");

    //var g = 0;
    for (var e = 0; e < equipments.length; e++) {
        var equipment = equipments[e];
        var name = configurator.getConfiguredMotor().getEquipment().getName();
        if (equipment.getName() != name) continue;

        var motorLookups = equipment.getMotorLookups();
        //motorLookups.sort(function (a, b) {
        //    var aName = a.getFuelType().name.toLowerCase();
        //    var bName = b.getFuelType().name.toLowerCase();
        //    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        //});

        var indxOf = function (array, needle) {
            var i = -1, index = -1;
            for (i = 0; i < array.length; i++) {
                if (array[i]["key"] === needle) {
                    index = i;
                    break;
                }
            }
            return index;
        };

        var grouped = [];
        $(motorLookups).each(function (index) {
            var motor = motorLookups[index];
            var key = motor.getFuelType().name;
            //
            var index = indxOf(grouped, key);
            if (index < 0) {
                index = grouped.push({
                    "key": key,
                    "objects": []
                }) - 1;
            }
            grouped[index]["objects"].push(motor);
        });

        for (var f = 0; f < grouped.length; f++) {

            $row = $("<tr class='row-header'></tr>");
            var $thead = $("<thead></thead>");

            var fuelTypeName = grouped[f]["key"];
            var fuelTypeNameTranslated = ("FuelType" + fuelTypeName).resx();
            //if (g++ == 0) {
            $row.addClass('row-header-with-description')
            $row.append($("<th class='equipmentName'></th>").text(fuelTypeNameTranslated));

            $row.append($("<th><div>{0}</div></th>".format(("MotorFuelConsumpionUrbanTitleWithUnits" + fuelTypeName).resx())));
            $row.append($("<th><div>{0}</div></th>".format(("MotorFuelConsumpionExtraUrbanTitleWithUnits" + fuelTypeName).resx())));
            $row.append($("<th><div>{0}</div></th>".format(("MotorFuelConsumpionCombinedTitleWithUnits" + fuelTypeName).resx())));
            $row.append($("<th><div>{0}</div></th>".format(("MotorCo2EmissionTitleWithUnits" + fuelTypeName).resx())));
            $row.append($("<th><div></div></th>").html(("MotorEnergyClassTitle" + fuelTypeName).resx().toString()));
            //}
            //else {
            //    $row.append($("<th class='equipmentName' colspan=6></th>").text(fuelTypeNameTranslated));
            //}
            $thead.append($row);
            $table.append($thead);

            var $tbody = $("<tbody></tbody>");
            for (var m = 0; m < grouped[f]["objects"].length; m++) {
                var motorLookup = grouped[f]["objects"][m];

                var energyClassLetter = motorLookup.getEnergyClass();
                //
                $row = $("<tr class='row'></tr>");
                var $motorName = $("<td class='motor-name'></td>").html(motorLookup.getShortName() + " " + motorLookup.getPower() + " " + powerUnit + " <span class='fuel-type'>" + motorLookup.getGearboxLabel() + "</span>"); // + "<br><span class='fuel-type'>" + ('FuelType' + motorLookup.getFuelType().name).resx() + "</span>");
                $row.append($motorName);
                var urbanConsumption = motorLookup.getFuelType().name == "CNG" ? motorLookup.getFuelConsumptionGas().getUrbanDecimal() : motorLookup.getFuelConsumption().getUrbanDecimal()
                var extraUrbanConsumption = motorLookup.getFuelType().name == "CNG" ? motorLookup.getFuelConsumptionGas().getExtraUrbanDecimal() : motorLookup.getFuelConsumption().getExtraUrbanDecimal()
                var combinedConsumption = motorLookup.getFuelType().name == "CNG" ? motorLookup.getFuelConsumptionGas().getCombinedDecimal() : motorLookup.getFuelConsumption().getCombinedDecimal()
                var emission = motorLookup.getFuelType().name == "CNG" ? motorLookup.getEmissionGasDouble() : motorLookup.getEmissionDouble();

                $row.append($("<td class='motor-fc-urban'></td>").html(HtmlCc.Libs.numberFormat(urbanConsumption, 1, ",", "")));
                $row.append($("<td class='motor-fc-extra-urban'></td>").html(HtmlCc.Libs.numberFormat(extraUrbanConsumption, 1, ",", "")));
                $row.append($("<td class='motor-fc-combined'></td>").html(HtmlCc.Libs.numberFormat(combinedConsumption, 1, ",", "")));
                $row.append($("<td class='motor-emission'></td>").html(HtmlCc.Libs.numberFormat(emission, 0, ",", "")));

                var $energyClassCell = $("<td class='motor-energy-class'></td>").html(HtmlCc.Gui.Web.createEnergyClass(energyClassLetter, 90, 50));
                $row.append($energyClassCell);
                $tbody.append($row);
                //

                if (motorLookup.getId() == settings.motor) {
                    $row.addClass("selected");
                }

                if (cfgManager.getConfigurator().getSalesProgramSetting("showEnergyClassPopup") == "true") {
                    $energyClassCell.css("cursor", "pointer")
                HtmlCc.Gui.Web.HoverEnergyClassDetail(
                    $cc,
                    cfgManager,
                    settings,
                    $energyClassCell,
                    "td.motor-energy-class",
                    energyClassLetter,
                    combinedConsumption,
                    motorLookup.getFuelType(),
                    motorLookup.getFuelNameTranslated(),
                    motorLookup.getEmissionDouble(),
                    motorLookup.getMotorCubicCapacity(),
                    new Date().toString(),
                    (motorLookup.getId() == settings.motor),
                    "table.target-engine-table"
                );
            }
            }
            $row.addClass("space-after");
            $table.append($tbody);
        }
    }
    var $envelope = $('<div class="target-engine-envelope"><div class="target-engine-scrollable"><div class="target-scrolling-area"></div></div></div>');
    var $scollableArea = $envelope.find('div.target-scrolling-area');
    $scollableArea.append($table);

    var $target = $presentationBox.find('div.target-container');
    $target.append($envelope);
    // Scroll to view
    var $scroller = $(".target-engine-scrollable");
    var rowpos = $('.target-engine-table tr.selected').position();
    if (rowpos != null) {
        $scroller.scrollTop(rowpos.top);
    }
};

HtmlCc.Gui.Web.getEnergyClassLevels = function () {
    return [
            { text: "A+", color: "#2AA356" },
            { text: "A", color: "#009136" },
            { text: "B", color: "#59AA27" },
            { text: "C", color: "#C9D100" },
            { text: "D", color: "#FEED01" },
            { text: "E", color: "#FBBB01" },
            { text: "F", color: "#EB690B" },
            { text: "G", color: "#E3001C" }
    ];
}
HtmlCc.Gui.Web.createEnergyClassBig = function (energyClassStr, width, height) {
    var $energyClass = htmlcc.energyclass.MakeEnergyClass(null, energyClassStr, HtmlCc.Gui.Web.getEnergyClassLevels(), width, height, "noborder");
    return $energyClass;
}

HtmlCc.Gui.Web.createEnergyClassBig2 = function (energyClassStr, width, height) {
    var $energyClass = htmlcc.energyclass.MakeEnergyClass2(null, energyClassStr, HtmlCc.Gui.Web.getEnergyClassLevels(), width, height, "noborder");
    return $energyClass;
}

HtmlCc.Gui.Web.createEnergyClass = function (energyClassStr, width, height) {
    var $energyClass = htmlcc.energyclass.MakeSmallEnergyLabel(null, energyClassStr, HtmlCc.Gui.Web.getEnergyClassLevels(), width, height, "noborder", "Step2EnergyClassNoData".resx());
    return $energyClass;
}

HtmlCc.Gui.Web.PresentateInterior = function ($cc, $presentationBox, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var configurator = cfgManager.getConfigurator();


    var prms = cfgManager.getParamsByStepName('step4');
    var motorId = prms.motorId;



    var afterGetNonEquippedMotor = function (nonEquippedMotor) {

        // scenes: Passenger, Dashboard, Back, Top
        var $targetDisplay = $interiorPresentation.find('div.target-display');
        var $otherScenes = $interiorPresentation.find('div.other-scenes');
        var $waitingBox = $interiorPresentation.find('div.waiting-box');

        var scenesToDisplay = ['Passenger', 'PassengerDriverOnRight', 'Dashboard', 'Top', 'Back', 'BackDriverOnRight'];        
        var scenesToDisplayForBothDriver = ['Dashboard', 'Top'];

        var scenes = nonEquippedMotor.getViewpointImages();

        if (scenes == null || scenes.length == 0) {
            for (var i = 0; i < scenesToDisplay.length; i++) {
                if (scenesToDisplayForBothDriver.indexOf(scenesToDisplay[i]) == -1) {
                    if (configurator.getConfiguredMotor().getIsOnRight()) {
                        if (scenesToDisplay[i].indexOf('Right') == -1) {
                            continue;
                        }
                    }
                    else {
                        if (scenesToDisplay[i].indexOf('Right') != -1) {
                            continue;
                        }
                    }
                }

                var dummyImage = new HtmlCc.Api.ImageType();
                dummyImage.setViewpoint(scenesToDisplay[i]);
                scenes.push(dummyImage);
            }          
        }

        var currentParams = cfgManager.getCurrentParams();
        var defaultScene = null;
        var sceneName = null;

        if (settings.viewstate.selectedScene != undefined && settings.viewstate.selectedScene != null) {
            sceneName = settings.viewstate.selectedScene;
        }
        else {
            sceneName = scenesToDisplay[0];
        }

        if (settings.view == "step5") {
            // Add default images  
            var defaultViewPoint = $('<img />');
            defaultViewPoint.addClass("presentation-image");
            defaultViewPoint.attr(
                "src",
                $cc.data("last-interior-url-{0}".format(sceneName)));

            if (defaultViewPoint.attr("src") != null) {
                $targetDisplay.find('img.presentation-image').remove();
                $targetDisplay.append(defaultViewPoint);
            }
        }

        $.each(scenesToDisplay, function (i, vp) {
            var scene = null;
            $.each(scenes, function () {
                var tmpScene = this;
                if (tmpScene.getViewpoint() == vp) {
                    scene = tmpScene;
                    if (defaultScene === null) {
                        defaultScene = vp;
                    }
                }
            });
            if (scene == null) {
                HtmlCc.Libs.Log.warn('Scene {0} is not found.'.format(vp));
                return;
            }

            var viewpointName = scene.getViewpoint();
            var viewpointHighUrl = scene.getUrl();
            var viewpointLowUrl = scene.getUrl();
            if ($.inArray(settings.view, ['step1', 'step2', 'step3', 'step4']) !== -1) {
                if (viewpointHighUrl == null) {
                    viewpointHighUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Like_Offline_High');
                    viewpointLowUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Like_Offline_Low');
                }
            } else {
                viewpointHighUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Online_High');
                viewpointLowUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Online_Low');
            }

            var viewpointPreviewUrl = scene.getPreviewUrl();
            if (viewpointPreviewUrl == null) {
                viewpointPreviewUrl = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, vp, 'Offline_Preview');
            }

            var $scene = $otherScenes.find('a.scene.viewpoint-{0}'.format(viewpointName));
            if ($scene.length == 0) {
                $otherScenes.append('<a class="scene viewpoint-{0}"><img class="scene-img" /></a>'.format(viewpointName));
                $scene = $otherScenes.find('a.scene.viewpoint-{0}'.format(viewpointName));

                $scene.bind('click.vred', function () {
                    if (HtmlCc.Gui.Web.IsVredAvailable($cc)) {
                        var currentVariantSet = HtmlCc.Vred.viewToVariantSetTranslation(viewpointName);
                        HtmlCc.Vred.selectViewPoint(currentVariantSet);
                    }
                });
                $scene.attr('data-scene', viewpointName);
            }
            var $sceneImg = $scene.find('img.scene-img');

            var selectedScene = defaultScene;
            if ('selectedScene' in settings.viewstate && settings.viewstate != null) {
                if ($.inArray(settings.viewstate.selectedScene, scenesToDisplay) !== -1) {
                    selectedScene = settings.viewstate.selectedScene;
                }
            }

            $targetDisplay.attr('data-scene', selectedScene);

            $sceneImg.attr('src', viewpointPreviewUrl);

            var newSettings = new HtmlCc.Workflow.SettingsType(settings);
            newSettings.viewstate.selectedScene = viewpointName;

            $scene.attr('href', cfgManager.getUrlOfSettings(newSettings));
            $scene
                .unbind("click.hmlcc")
                .bind("click.hmlcc", function () {
                    SkodaAuto.Event.publish(
                           "event.showViewPoint",
                           new SkodaAuto.Event.Model.ShowViewPointEvntParams(
                                configurator.getInstanceName(),
                                configurator.getSalesProgramName(),
                                configurator.getCulture(),
                                configurator.getModelCode(),
                                configurator.getCarlineCode(),
                                settings.view, viewpointName));

                    SkodaAuto.Event.publish(
                          "gtm.showViewPoint",
                          new SkodaAuto.Event.Model.GTMEventParams(
                                "LifeCC Configuration",
                                settings.view,
                                "View Switched: " + viewpointName,
                                               {
                                                   context: cfgManager.getConfigurator().getCCContext(),
                                                   model: cfgManager.getConfigurator().getModelCodeShort(),
                                                   modelBody: cfgManager.getConfigurator().getModelCode(),
                                                   carlineCode: cfgManager.getConfigurator().getCarlineCode(),
                                                   configurationId: settings.configurationId,
                                                   price: cfgManager.getConfigurator().getConfiguredMotor().getPriceString()
                                               }
                                              ));
                });

            if (selectedScene == viewpointName) {
                $scene.addClass('active');
                //if ($targetDisplay.find('img.presentation-image').length == 0) {
                //$waitingBox.addClass('loading');
                $interiorPresentation.addClass("waiting");
                //}
                HtmlCc.Gui.VhqDisplayer($targetDisplay, $preload, viewpointLowUrl, viewpointHighUrl, function ($lqImage) {
                    var newSettings = cfgManager.getSettingsFromUrl(cfgManager.getPrefix());
                    if (newSettings.viewstate.selectedScene == null || newSettings.viewstate.selectedScene == vp) {
                        $targetDisplay.find('img.presentation-image').remove();
                        $lqImage.addClass('presentation-image');
                    } else {

                    }
                }, function ($lqImage, $hqImage) {
                    var newSettings = cfgManager.getSettingsFromUrl(cfgManager.getPrefix());
                    if (newSettings.viewstate.selectedScene == null || newSettings.viewstate.selectedScene == vp) {

                    } else {
                        $lqImage.remove();
                    }
                    $waitingBox.removeClass('loading');
                    $interiorPresentation.removeClass("waiting");
                }, function ($lqImage, $hqImage) {
                    var newSettings = cfgManager.getSettingsFromUrl(cfgManager.getPrefix());
                    if (newSettings.viewstate.selectedScene == null || newSettings.viewstate.selectedScene == vp) {
                        $targetDisplay.find('img.presentation-image').remove();
                        $hqImage.addClass('presentation-image');
                    } else {

                    }
                }, function ($hqImage) {
                    $waitingBox.removeClass('loading');
                    $interiorPresentation.removeClass("waiting");
                    // try to precache all the rest of views
                    var newSettings = cfgManager.getSettingsFromUrl(cfgManager.getPrefix());
                    if (newSettings.viewstate.selectedScene == null || newSettings.viewstate.selectedScene == vp) {

                    } else {
                        $hqImage.remove();
                    }
                    
                    $.each(scenes, function () {
                        var thisOtherScene = this;

                        var viewpointHighUrlOther = thisOtherScene.getUrl();
                        var viewpointLowUrlOther = thisOtherScene.getUrl();
                        if ($.inArray(settings.view, ['step1', 'step2', 'step3', 'step4']) !== -1) {
                            if (viewpointHighUrlOther == null) {
                                viewpointHighUrlOther = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, thisOtherScene.getViewpoint(), 'Like_Offline_High');
                                viewpointLowUrlOther = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, thisOtherScene.getViewpoint(), 'Like_Offline_Low');
                            }
                        } else {
                            viewpointHighUrlOther = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, thisOtherScene.getViewpoint(), 'Online_High');
                            viewpointLowUrlOther = HtmlCc.Workflow.ImageExactBuilder(cfgManager.getConfigurator(), settings, thisOtherScene.getViewpoint(), 'Online_Low');
                        }

                        HtmlCc.Gui.VhqDisplayer($targetDisplay, $preload, viewpointLowUrlOther, viewpointHighUrlOther, function ($lqImageOther) {
                            $lqImageOther.addClass('do-not-display');
                        }, function ($lqImageOther, $hqImageOther) {

                        }, function ($lqImageOther, $hqImageOther) {
                            $hqImageOther.addClass('do-not-display');
                        }, function ($hqImageOther) {
                            $hqImageOther.remove();
                            $cc.data("last-interior-url-{0}".format(thisOtherScene.getViewpoint()), $hqImageOther.attr("src"));
                        });
                    });

                    $cc.data("last-interior-url-{0}".format(selectedScene), $hqImage.attr("src"));
                });
            } else {
                $scene.removeClass('active');
            }
        });

        var currentScene = $targetDisplay.attr('data-scene');

        $otherScenes.find('a.scene').each(function () {
            var $thisScene = $(this);
            if ($thisScene.attr('data-scene') == currentScene) {
                $thisScene.trigger('click.htmlcc');
            }
        });
    };

    var configurator = cfgManager.getConfigurator();

    // fills the template
    var params = cfgManager.getParamsByStepName('step1');
    var motor = null;
    var motorId = params.motorId;

    if (motorId > 0 && settings.view == "step1") {
        // fill with simple motor
        motor = cfgManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
    }

    if (motor == null) {
        motor = cfgManager.getConfigurator().getConfiguredMotor();
    }

    // prepairs motor
    //var motor = configurator.getSimpleMotor(motorId, prms.colorCode || '', prms.interiorCode || '', prms.packageCodes || '');
    //if (motor == null) {
    //    HtmlCc.Libs.Log.warn('Motor wasn\'t found motorid={0}; color={1}; interior={2}; packages={3}'.format(motorId, prms.colorCode || '', prms.interiorCode || '', prms.packageCodes || ''));
        //motor = cfgManager.getConfigurator().getConfiguredMotor();
    //}

    var $interiorPresentation = $presentationBox.find('div.interior-presentation');
    if ($interiorPresentation.length == 0) {
        // clear everything out
        $presentationBox.html('');
        $presentationBox.append('<div class="interior-presentation"><div class="target-container"><div data-scene="Passenger" class="target-display"></div><div class="other-scenes"></div><div class="dialog-waiting"></div><div class="preload"></div><div class="copyright-note"></div></div>');
        $interiorPresentation = $presentationBox.find('div.interior-presentation');

        // prevent touch gestures to bubble out of the configurator at tablet design
        $interiorPresentation.bind('touchmove.htmlcc', function (evt) {
            if ($cc.hasClass('tablet')) {
                evt.preventDefault();
            }
        });
    }

    // preload area
    var $preload = $interiorPresentation.find('div.preload');

    // skip displaying if there is a conflict
    if (motor.getConflicts().getAdd().length > 0 || motor.getConflicts().getRemove().length > 0) {
        return;
    }

    var stepName = "step4";

    cfgManager.getMotorByStep(stepName, afterGetNonEquippedMotor,
        function (error) {
        });

};

HtmlCc.Gui.Web.NewConflictBox = function ($cc, $ccRoot, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='$presentationBox' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    var model = cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getModel();
    var motorId = null;
    if (settings.motor > 0) {
        motorId = settings.motor;
    } else {
        if (settings.equipment > 0) {
            var equipment = model.getEquipment(settings.equipment);
            if (equipment != null) {
                motorId = equipment.getDefaultMotorId();
            }
        }
        if (!(motorId > 0)) {
            equipment = model.getEquipment(model.getDefaultEquipmentId());
            motorId = equipment.getDefaultMotorId();
        }
    }

    var motor = cfgManager.getConfigurator().getSimpleMotor(motorId, settings.color, settings.interior, settings.packages);
    if (motor == null) {
        // TODO
        // please investigate this issue
        HtmlCc.Libs.Log.warn('The motor could be found this way but it isn\'t!');
        motor = cfgManager.getConfigurator().getConfiguredMotor();
    }

    var conflicts = motor.getConflicts();

    var conflictsToAdd = conflicts.getAdd();
    var conflictsToRemove = conflicts.getRemove();

    var stepName = cfgManager.getCurrentStepName();

    $ccRoot.find('div.dialog.conflict-dialog').remove();
    if (conflictsToAdd.length > 0 || conflictsToRemove.length > 0 || conflicts.getExteriorConflict() || conflicts.getInteriorConflict()) {
        $cc.addClass('conflicts');
        $ccRoot.append('<div class="dialog conflict-dialog"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"><div class="conflict-explanation"></div><div class="conflict-box"><div class="conflict-add"><div class="head"></div><div class="tiles-area"></div></div><div class="conflict-remove"><div class="head"></div><div class="tiles-area"></div></div></div><div class="terminator"></div></div><div class="dialog-waiting"></div></div></div>');
        var $dialog = $ccRoot.find('div.dialog.conflict-dialog');

        var $dialogHeader = $dialog.find('div.header-text');
        $dialogHeader.text('ConflictHeader'.resx());

        var $close = $dialog.find('a.close');
        $close.attr('href', '#');
        $close.bind('click.htmlcc', function (evt) {
            evt.preventDefault();
            if (cfgManager.getLastNonConflictState() !== null) {
                location.href = cfgManager.getUrlOfSettings(cfgManager.getLastNonConflictState());
            } else {
                location.href = "#";
            }
        });

        $dialog.find('div.conflict-explanation').text('ConflictExplanation'.resx());

        var $conflictBox = $dialog.find('div.conflict-box');

        if (conflictsToAdd.length > 0 && (conflictsToRemove.length > 0 || conflicts.getExteriorConflict() || conflicts.getInteriorConflict())) {
            $conflictBox.addClass('has-add-and-remove');
        } else if (conflictsToAdd.length > 0) {
            $conflictBox.addClass('has-add');
        } else if (conflictsToRemove.length > 0 || conflicts.getExteriorConflict() || conflicts.getInteriorConflict()) {
            $conflictBox.addClass('has-remove');
        }

        var $conflictAdd = $conflictBox.find('div.conflict-add');
        var $addTilesArea = $conflictAdd.find('div.tiles-area');
        if (conflictsToAdd.length > 1) {
            $conflictAdd.find('div.head').text('ConflictAddsHeader'.resx());
        } else {
            $conflictAdd.find('div.head').text('ConflictAddHeader'.resx());
        }

        var $conflictRemove = $conflictBox.find('div.conflict-remove');
        var $removeTilesArea = $conflictRemove.find('div.tiles-area');
        if (conflictsToRemove.length > 1) {
            $conflictRemove.find('div.head').text('ConflictRemovesHeader'.resx());
        } else {
            $conflictRemove.find('div.head').text('ConflictRemoveHeader'.resx());
        }

        HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $addTilesArea, 2, conflictsToAdd, motor);
        HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $removeTilesArea, 2, conflictsToRemove, motor);

        if (conflicts.getExteriorConflict()) {
            HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $removeTilesArea, 2, [conflicts.getExteriorConflictModel()], motor);
            //conflictsToRemove.push(conflicts.getExteriorConflictModel());
        }
        if (conflicts.getInteriorConflict()) {
            HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $removeTilesArea, 2, [conflicts.getInteriorConflictModel()], motor);
            //conflictsToRemove.push(conflicts.getInteriorConflictModel());
        }
        var wheelCode = motor.getSelectedWheel() != null ? motor.getSelectedWheel().getCode() : null;
        var conflictCause = "";

        if (cfgManager.getLastNonConflictState().color != settings.color) {
            conflictCause = settings.color;
        }
        else if (cfgManager.getLastNonConflictState().interior != settings.interior) {
            conflictCause = settings.color;
        }
        else {
            if (cfgManager.getLastNonConflictState().packages != settings.packages) {
                var packages = settings.packages.split(",");
                if (packages.length > 0) {
                    conflictCause = packages[0];
                }
            }            
        }
              
        SkodaAuto.Event.publish(
        "gtm.compatibilityCheckLoaded",
        new SkodaAuto.Event.Model.GTMEventParams(
         "pageview",
         null,
         null,
         {
             instanceName: settings.instance,
             salesProgramName: settings.salesprogram,
             culture: settings.culture,
             groupName: cfgManager.getConfigurator().getPageGroupName(),
             pageName: cfgManager.getConfigurator().getPageName($(document).find("title").text(), "Car page"),
             context: cfgManager.getConfigurator().getCCContext(),
             model: cfgManager.getConfigurator().getModelCodeShort(),
             modelBody: cfgManager.getConfigurator().getModelCode(),
             carlineCode: cfgManager.getConfigurator().getCarlineCode(),
             configurationId: settings.configurationId,
             price: motor.getPriceString(),
             extraEqConflict: conflictCause

         }
        ));

    } else {
        $cc.removeClass('conflicts');
    }
};

HtmlCc.Gui.Web.PrecacheData = function ($cc, cfgManager, settings) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// </signature>

    switch (settings.view) {
        case 'step2':
            // precaches selected motor as the configured one
            cfgManager.configure(settings, function () {
                // success
            }, function () {
                // fail
            });
            break;
            // pass through step1, it is the same purpose
        case 'step1':
            // precaches all motors at the selected equipment
            var selectedEquipment = null;
            var selectedEquipmentId = null;
            var selectedMotor = null;
            var selectedMotorId = null;

            var model = cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getModel();
            var equipments = model.getEquipments();

            selectedMotorId = parseInt(settings.motor);
            if (!(selectedMotorId > 0)) {
                selectedMotorId = null;
            } else {
                for (var i = 0; i < equipments.length; i++) {
                    selectedMotor = equipments[i].getMotorLookup(selectedMotorId);
                    if (selectedMotor != null) {
                        break;
                    }
                }
            }

            if (selectedMotor != null) {
                selectedEquipment = selectedMotor.getEquipment();
                selectedEquipmentId = selectedEquipment.getId();
            } else {
                selectedEquipmentId = parseInt(settings.equipment);
                if (!(selectedEquipmentId > 0)) {
                    // equipment is not defined at all, using the fedault one
                    selectedEquipmentId = model.getDefaultEquipmentId();

                }
                selectedEquipment = model.getEquipment(selectedEquipmentId);
            }

            cfgManager.getConfigurator().prefetchEquipmentMotors(selectedEquipment.getId(), function () {
                // success
            }, function () {
                // fail
                HtmlCc.Libs.Log.warn('prefetching motors of equipment failed');
            }, settings);
            break;
        case 'step3':
        case 'step4':
        case 'step5':
        case 'step6':
        case 'step7':
            break;
    }
};

HtmlCc.Gui.Web.ClickBoxSummary = function ($cc, cfgManager, settings, headerText, bodyText, moreLabel, moreUrl, overrideZIndex) {
    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    var $ccRoot = $cc.find('div.cc-root:first');

    $ccRoot.find('div.hover-box').remove();
    $ccRoot.append('<div class="hover-box"></div>');
    var $hoverBox = $ccRoot.find('div.hover-box');

    var $presentationBox = $ccRoot.find('div.presentation-box');

    var positionX = $presentationBox.position().left + 50;
    var positionY = $presentationBox.position().top + 50;
    var width = $presentationBox.width() - 150;
    var height = $presentationBox.height() - 100;
    $hoverBox.css({ left: positionX, top: positionY, width: width, height: height });
    //$hoverBox.css({ left:'50px', top: '50px' });

    if (overrideZIndex != null && parseInt(overrideZIndex) >= 0) {
        $hoverBox.css({ 'z-index': parseInt(overrideZIndex) });
    }

    var reposition = function () {
        var overflow = $cc.outerHeight() - positionY - $hoverBox.outerHeight();
        if (overflow < 0) {
            $hoverBox.css({ top: positionY + overflow - 20 });
        }

        overflow = $cc.outerWidth() - positionX - $hoverBox.outerWidth();
        if (overflow < 0) {
            $hoverBox.css({ left: positionX + overflow - 20 });
        }
    };

    // append header
    $hoverBox.append('<div class="hover-header"></div>');
    var $hoverHeader = $hoverBox.find('div.hover-header');
    var $closeButton = $('<a class="close"></a>')
    $hoverHeader.append($closeButton);

    $closeButton.attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        $hoverBox.remove();
    });
    // append text - if exists
    var $hoverText = null;
    if (bodyText != null && bodyText != '') {
        $hoverBox.append('<div class="hover-text external-html"></div>');
        $hoverText = $hoverBox.find('div.hover-text');
        $hoverText.html(bodyText);
    }

    // get data
    var financing = cfgManager.getConfigurator().getFinancing();
    financing.getLatestDefaultsAsync(function (data) {
        HtmlCc.Gui.Web.SummaryHoverBoxContent($cc, cfgManager, $hoverBox, data);
    }
        , function () {
            $dialogContent.text('FinancingDialogFailedDefaults'.resx());
        });

    // append more url
    if (moreLabel != null && moreLabel != '' && moreUrl != null && moreUrl != '') {
        $hoverBox.append('<div class="hover-more-label"><a class="hover-more-link"></a></div>');
        var $moreLink = $hoverBox.find('a.hover-more-link');
        $moreLink.text(moreLabel);
        $moreLink.attr('href', moreUrl);
    }

    // reposition();
    return $hoverBox;
}

// not used changed by - HtmlCc.Gui.Web.ClickBoxSummary
HtmlCc.Gui.Web.HoverBox = function ($cc, settings, cfgManager, positionX, positionY, imageUrl, headerText, bodyText, price, moreLabel, moreUrl, overrideZIndex, forceImageHidding) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='positionX' type='int' />
    /// <param name='positionY' type='int' />
    /// <param name='imageUrl' type='String' />
    /// <param name='headerText' type='String' />
    /// <param name='bodyText' type='String'>bodyText is HTML formatted text! Use it carefuly.</param>
    /// <param name='price' type='String' />
    /// <param name='moreLabel' type='String' />
    /// <param name='moreUrl' type='String' />
    /// <returns type='jQuery'>Hover box jQuery object.</returns>
    /// <param name='overrideZIndex' type='int'>Sets inline z-index style to this value if it is present.</param>
    /// </signature>  

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    var $ccRoot = $cc.find('div.cc-root:first');

    $ccRoot.find('div.hover-box').remove();
    $ccRoot.append('<div class="hover-box"></div>');
    var $hoverBox = $ccRoot.find('div.hover-box');
    $hoverBox.css({ left: positionX, top: positionY });
    if (overrideZIndex != null && parseInt(overrideZIndex) >= 0) {
        $hoverBox.css({ 'z-index': parseInt(overrideZIndex) });
    }

    var reposition = function () {
        var overflow = $cc.outerHeight() - positionY - $hoverBox.outerHeight();
        if (overflow < 0) {
            $hoverBox.css({ top: positionY + overflow - 20 });
        }

        overflow = $cc.outerWidth() - positionX - $hoverBox.outerWidth();
        if (overflow < 0) {
            $hoverBox.css({ left: positionX + overflow - 20 });
        }
    };

    // append image if exists
    var $hoverImage = null;
    var hideImage = false;

    var imageHideStep = cfgManager.getConfigurator().getSalesProgramSetting('hidePopupImage');

    if (imageHideStep != null && forceImageHidding == undefined) {
        var stepNumber = settings.view.slice(-1);
        if ($.inArray(stepNumber, imageHideStep.split(',')) != -1) {
            hideImage = true;
        }
    }

    if (forceImageHidding !== undefined && forceImageHidding) {
        hideImage = true;
    }

    if (imageUrl != null && imageUrl != '' && !hideImage) {
        $hoverBox.append('<img class="hover-image" />');
        $hoverImage = $hoverBox.find('img.hover-image');
        $hoverImage.bind('load.htmlcc', function () {
            reposition();
        });
        $hoverImage.attr('src', imageUrl);
        $hoverImage.attr('alt', 'Image: {0}'.format(headerText));
        if (cfgManager.getConfigurator().getSalesProgramSetting("showMarketingImageWatermark") == "true") {
            var tmpImg = new Image();
            tmpImg.src = imageUrl
            $(tmpImg).on('load', function () {
                var $markDisclaimer = $("<p class='disclaimer-marketing-image'>{0}</p>".format('MarketingImageWatermark'.resx()));
                var width = tmpImg.width - 10                
                $markDisclaimer.css({ width: tmpImg.width - 10, "maxWidth": 338 })
                $hoverImage.after($markDisclaimer);
            });           
        }
    }

    // append header
    $hoverBox.append('<div class="hover-header"></div>');
    var $hoverHeader = $hoverBox.find('div.hover-header');
    $hoverHeader.text(headerText);

    // append text - if exists
    var $hoverText = null;
    if (bodyText != null && bodyText != '') {
        $hoverBox.append('<div class="hover-text external-html"></div>');
        $hoverText = $hoverBox.find('div.hover-text');
        $hoverText.html(bodyText);
    }

    // append price - if exists
    var $hoverPrice = null;
    if (price != null && price != '') {
        $hoverBox.append('<div class="hover-price"></div>');
        $hoverPrice = $hoverBox.find('div.hover-price');
        $hoverPrice.text(price);
    }

    // append more url
    if (moreLabel != null && moreLabel != '' && moreUrl != null && moreUrl != '') {
        $hoverBox.append('<div class="hover-more-label"><a class="hover-more-link"></a></div>');
        var $moreLink = $hoverBox.find('a.hover-more-link');
        $moreLink.text(moreLabel);
        $moreLink.attr('href', moreUrl);
    }

    reposition();

    $hoverBox.trigger("infoDialogDisplayed.htmlcc");

    return $hoverBox;
};

HtmlCc.Gui.Web.PackageHoverBox = function ($cc, cfgManager, positionX, positionY, overrideZIndex, $hoverItem, settings, motor, $removeBtn, $addBtn, active) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='positionX' type='int' />
    /// <param name='positionY' type='int' />
    /// <param name='imageUrl' type='String' />
    /// <param name='headerText' type='String' />
    /// <param name='bodyText' type='String'>bodyText is HTML formatted text! Use it carefuly.</param>
    /// <param name='price' type='String' />
    /// <param name='moreLabel' type='String' />
    /// <param name='moreUrl' type='String' />
    /// <returns type='jQuery'>Hover box jQuery object.</returns>
    /// <param name='overrideZIndex' type='int'>Sets inline z-index style to this value if it is present.</param>
    /// </signature>  

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    var $ccRoot = $cc.find('div.cc-root:first');

    $ccRoot.find('div.hover-box').remove();
    $ccRoot.append('<div class="hover-box"></div>');
    var $hoverBox = $ccRoot.find('div.hover-box');
    $hoverBox.css({ left: positionX, top: positionY });
    $hoverBox.addClass('package-{0}'.format($hoverItem.getCode()));

    if (active) {
        $hoverBox.addClass("active");
    }

    if (overrideZIndex != null && parseInt(overrideZIndex) >= 0) {
        $hoverBox.css({ 'z-index': parseInt(overrideZIndex) });
    }

    var reposition = function () {
        var overflow = $cc.outerHeight() - positionY - $hoverBox.outerHeight();
        if (overflow < 0) {
            $hoverBox.css({ top: positionY + overflow - 20 });
        }
        overflow = $cc.outerWidth() - positionX - $hoverBox.outerWidth();
        if (overflow < 0) {
            $hoverBox.css({ left: positionX + overflow - 20 });
        }
    };

    // append image if exists
    var $hoverImage = null;
    // FEJK
    var imageUrl;
    if ($hoverItem.getImage()) {
        imageUrl = $hoverItem.getImage().getUrl();
    } else {
        imageUrl = null;
    }

    var bodyText = '';
    var headerText = ''
    if ('getHasGroupName' in $hoverItem) {
        $hoverItem.getHasGroupName() ? headerText = $hoverItem.getGroupName() : headerText = $hoverItem.getName()
    }
    else {
        headerText = $hoverItem.getName()
    }
    if (typeof $hoverItem.getDescription == 'function') {
        var bodyText = $hoverItem.getDescription();
    }

    var price = $hoverItem.getPriceString();

    if (imageUrl != null && imageUrl != '') {
        $hoverBox.append('<img class="hover-image" />');
        $hoverImage = $hoverBox.find('img.hover-image');
        $hoverImage.bind('load.htmlcc', function () {
            reposition();
        });
        $hoverImage.attr('src', imageUrl);
        $hoverImage.attr('alt', 'Image: {0}'.format(headerText));
        if (cfgManager.getConfigurator().getSalesProgramSetting("showMarketingImageWatermark") == "true") {
            var tmpImg = new Image();
            tmpImg.src = imageUrl
            $(tmpImg).on('load', function () {
                var $markDisclaimer = $("<p class='disclaimer-marketing-image'>{0}</p>".format('MarketingImageWatermark'.resx()));
                var width = tmpImg.width - 10
                $markDisclaimer.css({ width: tmpImg.width - 10, "maxWidth": 338 })
                $hoverImage.after($markDisclaimer);
            });
        }
    }

    // append header
    $hoverBox.append('<div class="hover-header"></div>');
    var $hoverHeader = $hoverBox.find('div.hover-header');
    $hoverHeader.text(headerText);

    // append text - if exists
    var $hoverText = null;
    if (bodyText != null && bodyText != '') {
        $hoverBox.append('<div class="hover-text external-html"></div>');
        $hoverText = $hoverBox.find('div.hover-text');
        $hoverText.html(bodyText);
    }

    // append price - if exists

    //ISSUE - 14435 - disable hover price

    //var $hoverPrice = null;
    //if (price != null && price != '') {
    //    $hoverBox.append('<div class="hover-price"></div>');
    //    $hoverPrice = $hoverBox.find('div.hover-price');
    //    $hoverPrice.text(price);
    //}

    // append add/remove butttons

    if ($hoverItem.isSelectable()) {
    $hoverBox.append('<div class="hover-buttons"></div>');
    var $hoverButtons = $hoverBox.find('div.hover-buttons');
    $hoverButtons.append($addBtn);
    $hoverButtons.append($removeBtn);
    }

    // append more url
    //if (moreLabel != null && moreLabel != '' && moreUrl != null && moreUrl != '') {
    //    $hoverBox.append('<div class="hover-more-label"><a class="hover-more-link"></a></div>');
    //    $moreLink = $hoverBox.find('a.hover-more-link');
    //    $moreLink.text(moreLabel);
    //    $moreLink.attr('href', moreUrl);
    //}
    //HtmlCc.Gui.Web.DrawExtraPackages($cc, cfgManager, settings, $hoverBox, 1, $hoverItem, motor);

    reposition();
    return $hoverBox;
};

HtmlCc.Gui.Web.HoverBoxWithTimeout = function ($cc, settings, cfgManager, $hoverItem, imageUrl, headerText, bodyText, price, moreLabel, moreUrl, overrideZIndex, forceImageHidding) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='$hoverItem' type='jQuery' />
    /// <param name='imageUrl' type='String' />
    /// <param name='headerText' type='String' />
    /// <param name='bodyText' type='String'>bodyText is HTML formatted text! Use it carefuly.</param>
    /// <param name='price' type='String' />
    /// <param name='moreLabel' type='String' />
    /// <param name='moreUrl' type='String' />
    /// <param name='overrideZIndex' type='int'>Sets inline z-index style to this value if it is present.</param>
    /// </signature>  

    if ($cc.hasClass('tablet')) {
        $hoverItem.unbind('click.hoverinfo.htmlcc').bind('click.hoverinfo.htmlcc', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            var $ccRoot = $cc.find('div.cc-root:first');

            $ccRoot.find('div.dialog.hover-dialog').remove();

            $ccRoot.append('<div class="dialog hover-dialog middle-size"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content external-html"></div><div class="dialog-waiting"></div></div></div>');
            var $dialog = $ccRoot.find('div.dialog.hover-dialog');

            var $close = $dialog.find('a.close');
            $close.attr('href', '#');
            $close.bind('click.htmlcc', function (evtB) {
                evtB.preventDefault();
                $dialog.remove();
            });

            var $headerText = $dialog.find('div.header-text-inner');
            $headerText.text(headerText);
            var $dialogContent = $dialog.find('div.dialog-content');
            $dialogContent.html(bodyText);

            if (imageUrl != null && imageUrl != '') {
                $dialogContent.prepend('<img class="dialog-image"/>');
                var $dialogImage = $dialogContent.find('img.dialog-image');
                $dialogImage.attr('src', imageUrl);               
            }

            if (moreUrl && moreLabel) {
                var $dialogInner = $dialog.find('div.dialog-inner');
                $dialogInner.append('<div class="more-info-link-box"><a class="more-info-link-a"></a></div>');
                $dialogInner.find('a.more-info-link-a').attr('href', moreUrl).text(moreLabel);
            }
        });
    } else {
        HtmlCc.Gui.Web.SetHoverBehavior(
          $cc,
          $hoverItem,
          function (offsetX, offsetY) {
              return HtmlCc.Gui.Web.HoverBox($cc, settings ,cfgManager, offsetX, offsetY, imageUrl, headerText, bodyText, price, moreLabel, moreUrl, overrideZIndex, forceImageHidding);
          });
    }
};

HtmlCc.Gui.Web.PackageHoverBoxWithTimeout = function ($cc, cfgManager, $hoverItem, overrideZIndex, model, settings, motor, $remove, $add, active) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='$hoverItem' type='jQuery' />
    /// <param name='overrideZIndex' type='int'>Sets inline z-index style to this value if it is present.</param>
    /// <param name='model' type='HtmlCc.Api.PackageType'>Package</param>
    /// </signature>  

    if ($cc.hasClass('tablet')) {
        $hoverItem.unbind('click.hoverinfo.htmlcc').bind('click.hoverinfo.htmlcc', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            var $ccRoot = $cc.find('div.cc-root:first');

            $ccRoot.find('div.dialog.hover-dialog').remove();

            $ccRoot.append('<div class="dialog hover-dialog hover-dialog-for-package middle-size"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"><div class="header-text-inner"></div></div><a class="close"></a></div><div class="dialog-content external-html"></div><div class="dialog-waiting"></div><div class="hover-price"></div><div class="add-remove-area"></div></div></div>');
            var $dialog = $ccRoot.find('div.dialog.hover-dialog');

            var $close = $dialog.find('a.close');
            $close.attr('href', '#');
            $close.bind('click.htmlcc', function (evtB) {
                evtB.preventDefault();
                $dialog.remove();
            });

            var $headerText = $dialog.find('div.header-text-inner');
            $headerText.text(model.getName());
            var $dialogContent = $dialog.find('div.dialog-content');

            $dialogContent.css('height', 515 - $headerText.height() - $dialog.find('.add-remove-area').height());

            var subModel = null;
            if (model instanceof HtmlCc.Api.PackageGroupType) {
                if (model.getPackages().length > 0) {
                    subModel = model.getPackages()[0];
                }
            }
            var imageModel = (subModel != null ? subModel : model);
            $dialogContent.html(imageModel.getDescription());

            if (imageModel.getImage() != null && imageModel.getImage() != null && imageModel.getImage().getUrl() != '') {
                $dialogContent.prepend('<img class="dialog-image"/>');
                var $dialogImage = $dialogContent.find('img.dialog-image');
                $dialogImage.attr('src', imageModel.getImage().getUrl());
                if (cfgManager.getConfigurator().getSalesProgramSetting("showMarketingImageWatermark") == "true") {
                    $dialogImage.after("<p class='disclaimer-marketing-image'>{0}</p>".format('MarketingImageWatermark'.resx()));
                }
            }

            if (subModel == null) {
                var $clone;
                if (imageModel.isSelectable()) {
                if (active) {
                    $clone = $remove.clone();
                    $clone.unbind('click');
                    $clone.appendTo($dialog.find('div.add-remove-area'));
                    $clone.bind('click.htmlcc', function (evt2) {
                        $dialog.remove();
                        $cc.find('div.extra-item-{0}'.format(model.getCode())).find('a.add, a.remove').addClass('loading');
                    });
                } else {
                    $clone = $add.clone();
                    $clone.unbind('click');
                    $clone.appendTo($dialog.find('div.add-remove-area'));
                    $clone.bind('click.htmlcc', function (evt2) {
                        $dialog.remove();
                        $cc.find('div.extra-item-{0}'.format(model.getCode())).find('a.add, a.remove').addClass('loading');
                    });
                }
                }
                var $price = $dialog.find('div.hover-price');
                $price.text(model.getPriceString());
            }
        });
    } else {
        var $ccRoot = $cc.find('div.cc-root:first');
        var $hover = $ccRoot.find('div.hover-box.package-{0}'.format(model.getCode()));

        if ($hover.length != 0) {
            $hover.removeClass("active");
            if (active) {
                $hover.addClass("active");
            }
            else {
                $hover.removeClass("active");
            }
        }

        HtmlCc.Gui.Web.SetHoverBehavior(
            $cc,
            $hoverItem,
            function (offsetX, offsetY) {
                return HtmlCc.Gui.Web.PackageHoverBox($cc, cfgManager, offsetX, offsetY, overrideZIndex, model, settings, motor, $remove, $add, active);
            });
    }
};

HtmlCc.Gui.BindVideoToImage = function ($imageDiv, mediaUrl, $ccRoot, cfgManager, settings) {
    try {
    var videoHelper = new HtmlCc.Gui.Web.VideoHelper({
            mediaUrl: mediaUrl,
            autoplay: true,
            autodestroy:true,
            width: "100%",
            height: "100%"
        });
    $imageDiv.addClass("video");
    /* $imageDiv.mouseenter(function () {
        alert("enter")

    });

    $imageDiv.mouseleave(function () {
        alert("leave")

    });
    */
    $imageDiv.find('img').remove();
    $imageDiv.css("text-align", "center");
    $imageDiv.css("width", 190);
    $imageDiv.css("height", 90);
    $imageDiv.css("overflow", "hidden");
    videoHelper.insertThumbnailToContainer($imageDiv);
    $imageDiv.find('img').css("max-width", 190);
    $imageDiv.find('img').css("position", "relative");
    $imageDiv.find('img').css("top", -35);
    //$imageDiv.find('img').css("max-height", 95);
    $imageDiv.click(function () {
        var $dialog = $("<div/>").addClass("dialog video-dialog").appendTo($ccRoot);
        var $dialogInner = $("<div/>").addClass("dialog-inner").appendTo($dialog);
        var $header = $("<div/>").addClass("dialog-header").appendTo($dialogInner);
        var $closeBtn = $("<a href='#' class='close'></a>").appendTo($header);
        var $video = $("<div/>").css("width", "100%").css("height", "100%").appendTo($dialogInner);

        $closeBtn.click(function (e) {
            e.preventDefault();
            $dialog.remove();
        });
        // close on Escape
        document.onkeyup = function (event) {
            if (event.keyCode === 27) {
                $dialog.remove();
    }
};

        videoHelper.insertVideoToContainer($video);
    });
    }
    catch (err) {
        HtmlCc.Libs.Log.warn('Video was not loaded, check video url');
    }

};

HtmlCc.Gui.Web.SetHoverBehavior = function ($cc, $hoverItem, createHoverBox) {

    var hoverTimeout = null;
    var removeTimeout = null;
    var $hoverBox = null;
    var onTimeout = 1000;
    var offTimeout = 250;
    var removeHoverBox = function () {
        if ($hoverBox != null) {
            $hoverBox.remove();
            removeTimeout = null;
            $hoverBox = null;
        }
    };

    $hoverItem.hover(function (evt) {
        hoverTimeout = setTimeout(function () {
            var ccPos = $cc.offset();
            var offX = evt.pageX - ccPos.left;
            var offY = evt.pageY - ccPos.top;
            $hoverBox = createHoverBox(offX, offY);
            $hoverBox.hover(function () {
                // hovered on
                clearTimeout(removeTimeout);
                removeTimeout = null;
            }, function () {
                // hovered out
                removeTimeout = setTimeout(removeHoverBox, offTimeout);
            });
            hoverTimeout = null;
        }, onTimeout);

        if (removeTimeout != null) {
            clearTimeout(removeTimeout);
            removeTimeout = null;
        }

    }, function (evt) {
        if (hoverTimeout != null) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        if (removeTimeout == null) {
            removeTimeout = setTimeout(removeHoverBox, offTimeout);
        }
    });
};

HtmlCc.Gui.Web.DisplayAnimationProgess = function ($presentationBox, display, displaytext) {
    var $animationBox = $presentationBox.find("div.animation-progress");

    if (display) {
        var $animationTextContainer = $presentationBox.find("div.animation-text");
        $animationTextContainer.text(displaytext);
        $presentationBox.addClass("viewpoint-waiting");
    } else {
        $presentationBox.removeClass("viewpoint-waiting");
    }
};

HtmlCc.Gui.Web.ShowQueryStrings = function ($cc, configurationManager) {
    HtmlCc.Gui.Web.NewQueryStringBox($cc, configurationManager);
}

HtmlCc.Gui.Web.NewQueryStringBox = function ($cc, configurationManager) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='configurationManager' type='configurationManager' />
    /// </signature>

    // the root of everything
    var $ccRoot = $cc.find('div.cc-root');
    if ($ccRoot.length == 0) {
        $cc.html('<div class="cc-root web-size"></div>');
        $ccRoot = $cc.find('div.cc-root');
        $ccRoot.attr('data-unique', HtmlCc.Libs.randomString(8));
    }

    $ccRoot.find('div.dialog.queryStrings-dialog').remove();
    $ccRoot.append('<div class="dialog queryStrings-dialog"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"><div class="queryStrings-explanation"></div><div class="queryStrings-box"></div></div><div class="terminator"></div></div><div class="dialog-waiting"></div></div>');
    //$ccRoot.append('<div class="dialog queryStrings-dialog"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content"><div class="queryStrings-explanation"></div><div class="queryStrings-box"></div></div><div class="terminator"></div></div><div class="dialog-waiting"></div></div></div>');

    var $dialog = $ccRoot.find('div.dialog.queryStrings-dialog');

    var $dialogHeader = $dialog.find('div.header-text');
    $dialogHeader.text('Current QueryStrings');

    var $close = $dialog.find('a.close');
    $close.attr('href', '#');
    $close.bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        $ccRoot.find('div.dialog.queryStrings-dialog').remove();
    });

    var $queryStringsBox = $dialog.find('div.queryStrings-box');

    // get queryStrings
    var motor = configurationManager.getConfigurator().getConfiguredMotor();

    var queryStrings = [];

    var aniamtionImages = motor.getAnimationImages();
    var offlineQS = true;
    if (aniamtionImages.length > 0) {
        var queryString = aniamtionImages[0].getQueryString();
        if (queryString != null) {
            queryStrings.push(queryString);
        }
        else {
            offlineQS = false;
        }
    }
    else {
        offlineQS = false;
    }

    var viewpointImages = motor.getViewpointImages();
    $.each(viewpointImages, function (viewpointImageIndex, viewpointImage) {
        var queryString = viewpointImage.getQueryString();
        if (queryString != null)
            queryStrings.push(queryString);
    });

    if (offlineQS) {
        HtmlCc.Gui.Web.ShowNewQueryStringBoxItems(queryStrings, $dialog);
    }
    else {
        $dialog.find('div.queryStrings-explanation').text('Loading...');
        configurationManager.getConfigurator().getQueryString(motor, function (queryString) {
            var some = queryString;

            var modelCode = motor.getEquipment().getModel().getCode();
            var exteriorCode = motor.getSelectedColor().getCode();

            queryStrings.push(modelCode + '#' + exteriorCode + '#' + queryString.slice(1).join('') + '#720x360#day#VHQ#rotation06#1#0#8#0');
            queryStrings.push(modelCode + '#' + exteriorCode + '#' + queryString.slice(1).join('') + '#720x360#day#VHQ#rotation24#1#0#8#0');
            HtmlCc.Gui.Web.ShowNewQueryStringBoxItems(queryStrings, $dialog);
        }, function () {
            //HtmlCc.Libs.Log.warn('-- vred - Query string wasn\'t returned due an error.');
        });
    }

};

HtmlCc.Gui.Web.GTMInfoIconDetailDisplayed = function ($cc, cfgManager, currentMotor, step, itemId, paramsToSend ) {

    var params = {
        context: cfgManager.getConfigurator().getCCContext(),
        model: cfgManager.getConfigurator().getModelCodeShort(),
        modelBody: cfgManager.getConfigurator().getModelCode(),
        carlineCode: cfgManager.getConfigurator().getCarlineCode(),
        price: currentMotor.getPriceString(),
        itemPrice: paramsToSend.itemPrice
};
    switch (step) {
        case 'step1':
            params.equipment = paramsToSend.equipment;        
            break;
        case 'step2':
            params.engine = paramsToSend.engine;
            break;
        case 'step3':
            params.exterior = paramsToSend.exterior;
            params.color = paramsToSend.color;
            break;
        case 'step4':
            params.interior = paramsToSend.interior;
            break;
        case 'step5':            
        case 'step6':
            params.extra = paramsToSend.extra;
            break;
        default: 
            HtmlCc.Libs.Log.warn('Unrecognized view name {0}.'.format(step));
    }

    SkodaAuto.Event.publish(
                "gtm.infoIconDetailDisplayed",
                new SkodaAuto.Event.Model.GTMEventParams(
                "LifeCC Configuration",
                step,
                "Product Detail Displayed: " + itemId,
                params));
       
}


HtmlCc.Gui.Web.ShowNewQueryStringBoxItems = function (queryStrings, $dialog) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='configurationManager' type='configurationManager' />
    /// </signature>
    var currentTime = new Date();
    var queryStringsStoreTime = '{0}.{1}.{2} {3}:{4}:{5}'.format(currentTime.getDate(), currentTime.getMonth() + 1, currentTime.getFullYear(), currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());

    var $queryStringsBox = $dialog.find('div.queryStrings-box');
    $dialog.find('div.queryStrings-explanation').text(queryStringsStoreTime);

    $.each(queryStrings, function (queryStringIndex, queryString) {
        //       var queryStringItems = queryString.split('#');
        //       var queryStringCodes = (queryStringItems.length > 2) ? queryStringItems[2] : '';
        //       var queryStringSize = (queryStringItems.length > 3) ? queryStringItems[3] : '';
        //       var queryStringviewPoint = (queryStringItems.length > 6) ? queryStringItems[6] : '';
        //       $queryStringsBox.append('<div class="queryString-item"><div class="queryString-item-inner">{0}<br>{1}<br>{2}</div></div>'.format(queryStringCodes, queryStringSize, queryStringviewPoint));
        $queryStringsBox.append('<div class="queryString-item"><div class="queryString-item-inner">{0}</div></div>'.format(queryString));
    });

}

HtmlCc.Gui.Web.SummaryHoverBoxWithTimeout = function ($cc, cfgManager, $hoverItem, financing) {

    HtmlCc.Gui.Web.SetHoverBehavior(
            $cc,
            $hoverItem,
            function (offsetX, offsetY) {
                return HtmlCc.Gui.Web.HoverBoxSummary($cc, cfgManager, offsetX, offsetY, financing)
            });

}

HtmlCc.Gui.Web.ClickBoxSummary = function ($cc, cfgManager, settings, financing, headerText, bodyText, moreLabel, moreUrl, overrideZIndex) {
    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    var $ccRoot = $cc.find('div.cc-root:first');

    $ccRoot.find('div.hover-box').remove();
    $ccRoot.append('<div class="hover-box"></div>');
    var $hoverBox = $ccRoot.find('div.hover-box');

    var $presentationBox = $ccRoot.find('div.presentation-box');

    var positionX = $presentationBox.position().left + 50;
    var positionY = $presentationBox.position().top + 50;
    var width = $presentationBox.width() - 150;
    var height = $presentationBox.height() - 100;
    $hoverBox.css({ left: positionX, top: positionY, width: width, height: height });
    //$hoverBox.css({ left:'50px', top: '50px' });

    if (overrideZIndex != null && parseInt(overrideZIndex) >= 0) {
        $hoverBox.css({ 'z-index': parseInt(overrideZIndex) });
    }

    var reposition = function () {
        var overflow = $cc.outerHeight() - positionY - $hoverBox.outerHeight();
        if (overflow < 0) {
            $hoverBox.css({ top: positionY + overflow - 20 });
        }

        overflow = $cc.outerWidth() - positionX - $hoverBox.outerWidth();
        if (overflow < 0) {
            $hoverBox.css({ left: positionX + overflow - 20 });
        }
    };

    // append header
    $hoverBox.append('<div class="hover-header"></div>');
    var $hoverHeader = $hoverBox.find('div.hover-header');
    var $closeButton = $('<a class="close"></a>')
    $hoverHeader.append($closeButton);

    $closeButton.attr('href', cfgManager.getUrlOfSettings(settings)).bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        $hoverBox.remove();
    });
    // append text - if exists
    var $hoverText = null;
    if (bodyText != null && bodyText != '') {
        $hoverBox.append('<div class="hover-text external-html"></div>');
        $hoverText = $hoverBox.find('div.hover-text');
        $hoverText.html(bodyText);
    }

    // get data
    //var financing = cfgManager.getConfigurator().getFinancing();
    financing.getLatestDefaultsAsync(function (data) {
        HtmlCc.Gui.Web.SummaryHoverBoxContent($cc, cfgManager, $hoverBox, data);
    }
        , function () {
            $dialogContent.text('FinancingDialogFailedDefaults'.resx());
        });

    // append more url
    if (moreLabel != null && moreLabel != '' && moreUrl != null && moreUrl != '') {
        $hoverBox.append('<div class="hover-more-label"><a class="hover-more-link"></a></div>');
        var $moreLink = $hoverBox.find('a.hover-more-link');
        $moreLink.text(moreLabel);
        $moreLink.attr('href', moreUrl);
    }

    // reposition();
    return $hoverBox;
}

HtmlCc.Gui.Web.HoverBoxSummary = function ($cc, cfgManager, positionX, positionY, financing, headerText, bodyText, moreLabel, moreUrl, overrideZIndex) {
    /// <signature>
    /// <param name='$cc' type='jQuery' />
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='positionX' type='int' />
    /// <param name='positionY' type='int' />
    /// <param name='imageUrl' type='String' />
    /// <param name='headerText' type='String' />
    /// <param name='bodyText' type='String'>bodyText is HTML formatted text! Use it carefuly.</param>
    /// <param name='price' type='String' />
    /// <param name='moreLabel' type='String' />
    /// <param name='moreUrl' type='String' />
    /// <returns type='jQuery'>Hover box jQuery object.</returns>
    /// <param name='overrideZIndex' type='int'>Sets inline z-index style to this value if it is present.</param>
    /// </signature>      
    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }

    var $ccRoot = $cc.find('div.cc-root:first');

    $ccRoot.find('div.hover-box').remove();
    $ccRoot.append('<div class="hover-box"></div>');
    var $hoverBox = $ccRoot.find('div.hover-box');

    var $presentationBox = $ccRoot.find('div.presentation-box');

    positionX = $presentationBox.position().left + 50;
    positionY = $presentationBox.position().top + 50;
    var width = $presentationBox.width() - 150;
    var height = $presentationBox.height() - 100;
    $hoverBox.css({ left: positionX, top: positionY, width: width, height: height });
    //$hoverBox.css({ left:'50px', top: '50px' });

    if (overrideZIndex != null && parseInt(overrideZIndex) >= 0) {
        $hoverBox.css({ 'z-index': parseInt(overrideZIndex) });
    }

    var reposition = function () {
        var overflow = $cc.outerHeight() - positionY - $hoverBox.outerHeight();
        if (overflow < 0) {
            $hoverBox.css({ top: positionY + overflow - 20 });
        }

        overflow = $cc.outerWidth() - positionX - $hoverBox.outerWidth();
        if (overflow < 0) {
            $hoverBox.css({ left: positionX + overflow - 20 });
        }
    };

    // append header
    $hoverBox.append('<div class="hover-header"></div>');
    var $hoverHeader = $hoverBox.find('div.hover-header');
    $hoverHeader.text(headerText);
    // append text - if exists
    var $hoverText = null;
    if (bodyText != null && bodyText != '') {
        $hoverBox.append('<div class="hover-text external-html"></div>');
        $hoverText = $hoverBox.find('div.hover-text');
        $hoverText.html(bodyText);
    }

    // get data
    //var financing = cfgManager.getConfigurator().getFinancing();
    financing.getLatestDefaultsAsync(function (data) {
        HtmlCc.Gui.Web.SummaryHoverBoxContent($cc, cfgManager, $hoverBox, data);
    }
        , function () {
            $dialogContent.text('FinancingDialogFailedDefaults'.resx());
        });

    // append more url
    if (moreLabel != null && moreLabel != '' && moreUrl != null && moreUrl != '') {
        $hoverBox.append('<div class="hover-more-label"><a class="hover-more-link"></a></div>');
        var $moreLink = $hoverBox.find('a.hover-more-link');
        $moreLink.text(moreLabel);
        $moreLink.attr('href', moreUrl);
    }

    // reposition();
    return $hoverBox;
}

HtmlCc.Gui.Web.SummaryHoverBoxContent = function ($cc, cfgManager, $hoverBox, data) {

    var result = data.Result;

    // append header
    $hoverBox.append('<div class="fin-summary external-html"><div class="fin-product"></div><div class="fin-sum-groups"></div><div class="fin-summary-disclaimers"><div class="fin-product-disclaimer"></div><div class="fin-global-disclaimer"></div></div></div>');
    var $finProduct = $hoverBox.find('div.fin-product');
    var $finSumGroups = $hoverBox.find('div.fin-sum-groups');
    var $finSummaryDisclaimers = $hoverBox.find('div.fin-summary-disclaimers');
    var $finProductDisclaimer = $hoverBox.find('div.fin-product-disclaimer');
    var $finGlobalDisclaimer = $hoverBox.find('div.fin-global-disclaimer');

    //if($cc.hasClass())
    //var maxHeight = $hoverBox.height() - $finSumGroups.height() - $finProductDisclaimer.height() - $finGlobalDisclaimer.height() - $finProduct.height() - 200;

    //$finSummaryDisclaimers.css('max-height', maxHeight);

    var summary = null;
    for (var i = 0; i < result.Summaries.length; i++) {
        var auxSummary = result.Summaries[i];
        if (i == 0)
            summary = auxSummary;

        if (auxSummary.Type == 'full') {
            summary = auxSummary;
            break;
        }
    }

    if (summary != null) {
        $finProduct.append('<div class="product-label"></div><div class="product-value"></div><div class="product-clear"></div>');
        $finProduct.find('div.product-label').text('FinancingDialogSelectProduct'.resx());
        $finProduct.find('div.product-value').text(summary.Title.Value);
    }

    $.each(summary.DetailGroups, function (detailGroupIndex, detailGroup) {
        $finSumGroups.append('<div class="datail-group {0}"></div>'.format(detailGroup.ID));
        var $detailGroup = $finSumGroups.find('div.{0}'.format(detailGroup.ID));
        var $detailGroupHeader = $('<div class="detail-group-header"></div>');

        $detailGroupHeader.html(detailGroup.Label.Value);
        $detailGroup.append($detailGroupHeader);

        $.each(detailGroup.Details, function (detailIndex, detail) {
            $detailGroup.append('<div class="datail{0}"><div class="datail-label"></div><div class="datail-value"></div><div class="datail-units"></div><div class="clear"></div></div>'.format(detail.ID));
            var $detail = $detailGroup.find('div.datail{0}'.format(detail.ID));
            $label = $detail.find('div.datail-label').text(detail.Label);

            if (detail.Note != null && detail.Note != '') {
                $label.append($('<span class="note-text"></span>'));
                $label.find('span.note-text').text(' {0}'.format(detail.Note));
            }

            if (detail.Units != null)
            $detail.find('div.datail-units').text(detail.Units);

            $valueElement = $detail.find('div.datail-value');
            $valueElement.text(detail.Value);

            if (detail.Emphasize) {
                if (cfgManager.getConfigurator().getSalesProgramSetting("emphasizeStyle") != null) {
                        $detail.addClass('emphesize');
                        $detail.attr('style', cfgManager.getConfigurator().getSalesProgramSetting("emphasizeStyle"));
                }
                else {
                    $valueElement.addClass('bolded');
                }                
            }
        });
    });

    $finProductDisclaimer.append('<div class="disclaimer-header"></div><div class="disclaimer-body"></div>');
    $finProductDisclaimer.find('div.disclaimer-header').text('FinancingDialogProductDisclaimer'.resx())
    $finProductDisclaimer.find('div.disclaimer-body').html(result.ProductDisclaimer);

    $finGlobalDisclaimer.append('<div class="disclaimer-header"></div><div class="disclaimer-body"></div>');
    $finGlobalDisclaimer.find('div.disclaimer-header').text('FinancingDialogGlobalDisclaimer'.resx())
    $finGlobalDisclaimer.find('div.disclaimer-body').html(result.GlobalDisclaimer);
}

HtmlCc.Gui.Web.EntryDialog = function ($cc, $ccRoot, cfgManager, settings) {

    var entrySettingsDialog = cfgManager.getConfigurator().getEntryDialogSettings();

    if (entrySettingsDialog == null || !entrySettingsDialog.Enabled) {
        return;
    }

    var $dialog = $ccRoot.find('div.entry-dialog');
    if ($dialog.length == 0) {
        $ccRoot.append('<div class="entry-dialog"><div class="dialog entry"><div class="dialog-inner"><div class="dialog-header"><div class="header-text"></div><a class="close"></a></div><div class="dialog-content entry"></div><div class="button-box"></div></div></div></div>');
        $dialog = $ccRoot.find('div.entry-dialog');
    }

    if (entrySettingsDialog.WindowType == "small") {
        $dialog.addClass("small");
    }
  
    $dialog.find('a.close').attr('href', cfgManager.getSettingsFromUrl(settings)).bind('click.htmlcc', function (evt) {
        evt.preventDefault();
        $dialog.remove();
    });

    var $buttonBox = $dialog.find('div.button-box');

    if (entrySettingsDialog.RefuseUrl != "") {
        $buttonBox.append('<a class="reject-button"  ><div class="previous-arrow"></div>{0}</a>'.format('EntryDialogRejectButton'.resx()));   

    $buttonBox.append('<a class="accept-button"><div class="forward-arrow"></div>{0}</a>'.format('EntryDialogAcceptButton'.resx()));

    $buttonBox.find('a.accept-button').click(
        'htmlcc.click',
        function () { $dialog.remove(); return false; });

    $buttonBox.find('a.reject-button').attr('href', entrySettingsDialog.RefuseUrl);
    }
    $dialog.removeClass('do-not-display');

    var $dialogInner = $dialog.find('div.dialog-inner');
    var $dialogHeaderText = $dialogInner.find('div.dialog-header div.header-text');

    var $dialogContent = $dialogInner.find('div.dialog-content');
    //var $dialogDisclaimerContent = $dialogInner.find('div.dialog-disclaimer-content');

    if (entrySettingsDialog.Source == 'Resx') {
        $dialogHeaderText.text(entrySettingsDialog.Header.resx());
        var text = entrySettingsDialog.Content.resx();
        $dialogContent.html(text.toString());
    }
    else {
        $dialogHeaderText.text(entrySettingsDialog.Header);
        $dialogContent.html(entrySettingsDialog.Content);
    }
};

HtmlCc.Gui.Web.CheckQueryStringRestrictions = function (restrictionData, queryStringObject) {
    var isRestricted = false;
    if (restrictionData != null && restrictionData.length > 0) {
        var restrictions = restrictionData.split("|");
        isRestricted = true;

        $.each(restrictions, function () {
            var restriction = this;
            var restrictionItems = restriction.split(",");

            $.each(restrictionItems, function () {
                var restrictionItem = this;

                if (restrictionItem.indexOf("^") == 0) {
                    restrictionItem = restrictionItem.substring(1);
                    if (queryStringObject[restrictionItem] != undefined) {
                        isRestricted = true;
                        return false;
                    }
                    else {
                        isRestricted = false;
                    }
                }
                else {
                    if (queryStringObject[restrictionItem] == undefined) {
                        isRestricted = true;
                        return false;
                    }
                    else {
                        isRestricted = false;
                    }
                }
            });

            if (!isRestricted)
                return false;
        });
    };

    return isRestricted;
}

HtmlCc.Gui.Web.SwitchVredModel = function ($cc, configurationManager, settings) {

    if (!HtmlCc.Vred || !$cc.hasClass('dealer')) {
        return;
    }

    HtmlCc.Dashboard.isRunning(function (result) {
        if (result == "True")
            HtmlCc.Gui.Web.HttpSwitchVredModel($cc, configurationManager, settings);
    });
}

HtmlCc.Gui.Web.HttpSwitchVredModel = function ($cc, configurationManager, settings) {
    $cc.addClass('configuring');

    var params = configurationManager.getParamsByStepName('step1');
    var currentMotor = null;
    var motorId = params.motorId;

    if (motorId > 0) {
        // fill with simple motor
        currentMotor = configurationManager.getConfigurator().getSimpleMotor(motorId, params.colorCode || '', params.interiorCode || '', params.packageCodes ? params.getPackageArray() : []);
    }
    if (currentMotor == null || (settings.view != 'step1')) {
        currentMotor = configurationManager.getConfigurator().getConfiguredMotor();
    }


    //configurationManager.getConfigurator().setIsLoadingVredModel(true);
    //var modelCode = configurationManager.getConfigurator().getConfiguredMotor().getEquipment().getModel().getRenderedCode();
    var queryString = currentMotor.getQueryString();
    var modelCode = currentMotor.getEquipment().getModel().getCode();
    var exteriorCode = currentMotor.getSelectedColor().getCode();

    var fullQueryString = modelCode + '#' + exteriorCode + '#' + queryString.slice(1).join('') + '#720x360#day#VHQ#rotation06#1#0#8#0'

    HtmlCc.Dashboard.load(fullQueryString, function (result, data) {
        switch (result) {
            case "ModelLoadingFailed":
                configurationManager.getConfigurator().setIsLoadingVredModel(false);
                alert("Load failed.");
                $cc.removeClass('configuring');
                break;
            case "Inicializing":
                configurationManager.getConfigurator().setIsLoadingVredModel(false);
                alert("Dashboard is inicializing. Try it again.");
                $cc.removeClass('configuring');
            case "ModelIsLoading" || "AnotherModelIsLoading":
                HtmlCc.Gui.Web.HttpCheckLoadingModel($cc, configurationManager, settings, "ModelIsLoading");
                //$cc.removeClass('configuring');
                break;
            case "AfterLoadVredSetting":
                HtmlCc.Gui.Web.HttpCheckLoadingModel($cc, configurationManager, settings, "AfterLoadVredSetting");
                //$cc.removeClass('configuring');
                break;
            case "ModelLoaded":
                var $ccRoot = $cc.find('div.cc-root');
                configurationManager.getConfigurator().setIsLoadingVredModel(false);
                HtmlCc.Gui.Web.CommunicateWithVred($cc, $ccRoot, configurationManager, settings);
                $cc.removeClass('configuring');
                break;
            case "AnotherModelIsLoading":
                alert("Another model is loading.");
                $cc.removeClass('configuring');
                break;
            case "ModelFileDoesNotExists":
                configurationManager.getConfigurator().setIsLoadingVredModel(false);
                alert('CiMenuModelFileDoesNotExistsDialogHeader'.resx());
                $cc.removeClass('configuring');
                break;
            //default: //Unknown
            //    configurationManager.getConfigurator().setIsLoadingVredModel(false);
            //    alert('CiMenuModelFileDoesNotExistsDialogHeader'.resx());
            //    $cc.removeClass('configuring');
            //    break;
            default: //Unknown
                configurationManager.getConfigurator().setIsLoadingVredModel(false);
                alert("Load model undefined result.");
                $cc.removeClass('configuring');
                break;
        }
    }); // Load       
}

HtmlCc.Gui.Web.HttpCheckLoadingModel = function ($cc, configurationManager, settings, state) {

    var delay = 5000;

    switch (state) {
        case "ModelIsLoading":
            delay = 5000;
            break;
        case "AfterLoadVredSetting":
            delay = 2000;
            break;
        default: //Unknown //AnotherModelIsLoading
            delay = 5000;
            break;
    }

    HtmlCc.Dashboard.getState(function (result) {
        switch (result) {
            case "ModelLoaded":
                configurationManager.getConfigurator().setIsLoadingVredModel(false);
                $cc.removeClass('configuring');
                break;
            case "ModelIsLoading":
                HtmlCc.Gui.Web.HttpCheckLoadingModel($cc, configurationManager, settings, "ModelIsLoading");
                break;
            case "AfterLoadVredSetting":
                HtmlCc.Gui.Web.HttpCheckLoadingModel($cc, configurationManager, settings, "AfterLoadVredSetting");
                break;
            case "ModelFileDoesNotExists":
                    configurationManager.getConfigurator().setIsLoadingVredModel(false);
                alert('CiMenuModelFileDoesNotExistsDialogHeader'.resx());
                    $cc.removeClass('configuring');
                    break;
            default: //Unknown //AnotherModelIsLoading
                    configurationManager.getConfigurator().setIsLoadingVredModel(false);
                alert("Load model undefined result.");
                    $cc.removeClass('configuring');
                    break;
            }
    }, delay);
}
