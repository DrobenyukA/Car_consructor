/// <reference path="../jquery-1.7.2.js" /> 
/// <reference path="strings.libs.js" /> 
/// <reference path="htmlcc.libs.js" /> 
/// <reference path="htmlcc.api.js" />
/*
 *  HTML Car Configurator.
 *
 *  Bussiness behavior.
 *
 *  Requires: 
 *       * jquery-1.7.2.js
 *       * htmlcc.lib.js
 *       * htmlcc.api.js
 *       * properly set base url at header of web page
 *
 *  Date: 6/2012
 *  Author: jobratil @ Trask solutions a.s.
 *  © ŠKODA AUTO a.s. 2012
 */

if (HtmlCc === undefined) { var HtmlCc = {}; }
if (HtmlCc.Workflow === undefined) { HtmlCc.Workflow = {}; }

//Vrací Url + dealer, pokud local.href obsahuje řetězec dealer
HtmlCc.Workflow.GetUrl = function (localUrl) {
    if (location != null && location != null && location.href.toLowerCase().indexOf('dealer') > 0) {
        return '/dealer{0}'.format(localUrl);
    }
    else {
        return localUrl;
    }
}

// defines input settings
HtmlCc.Workflow.SettingsType = function (settings) {
    /// <signature>
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <returns type='HtmlCc.Workflow.SettingsType'/>
    /// </signature>
    if (settings == null) {
        settings = {};
    }

    /// <field name='prefix' type='String'>Prefix of location parameters.</field>
    this.prefix = null;

    /// <field name='instance' type='String'>Instance name.</field>
    this.instance = null;

    /// <field name='salesprogram' type='String'>Sales program name.</field>
    this.salesprogram = null;

    /// <field name='culture' type='String'>Culture string.</field>
    this.culture = null;

    /// <field name='model' type='String'>Model code, eg. 5L7.</field>
    this.model = null;

    /// <field name='carline' type='String'>Carline code, eg. 66113.</field>
    this.carline = null;

    /// <field name='color' type='String'>Color code, eg. 9P9P.</field>
    this.color = '';

    /// <field name='interior' type='String'>Interior code, eg. BW.</field>
    this.interior = '';

    /// <field name='packages' type='String'>Package codes separated by colon ',', eg. GPLAPLA,GPP2PP2.</field>
    this.packages = '';

    /// <field name='equipment' type='int'>Equipment id.</field>
    this.equipment = null;

    /// <field name='motor' type='int'>Motor id.</field>
    this.motor = null;

    /// <field name='view' type='String'>View name, eg. step1.</field>
    this.view = 'step1';

    /// <field name='view' type='String'>View name, eg. step1.</field>
    this.sessionGuid = null;

    /// <field name='viewstate' type='Object'>Custom viewstate of GUI.</field>
    this.viewstate = {};

    /// <field name='configurationId' type='int'>Id of saved configuration</field>
    this.configurationId = 0;

    if ('prefix' in settings) {
        this.prefix = settings.prefix;
    }
    if ('instance' in settings) {
        this.instance = settings.instance;
    }
    if ('salesprogram' in settings) {
        this.salesprogram = settings.salesprogram;
    }
    if ('culture' in settings) {
        this.culture = settings.culture;
    }
    if ('model' in settings) {
        this.model = settings.model;
    }
    if ('carline' in settings) {
        this.carline = settings.carline;
    }
    if ('color' in settings) {
        this.color = settings.color;
    }
    if ('interior' in settings) {
        this.interior = settings.interior;
    }
    if ('packages' in settings) {
        this.packages = settings.packages;
    }
    if ('equipment' in settings) {
        this.equipment = settings.equipment;
    }
    if ('motor' in settings) {
        this.motor = settings.motor;
    }
    if ('view' in settings) {
        this.view = settings.view;
    }
    if ('sessionGuid' in settings) {
        this.sessionGuid= settings.sessionGuid;
    }
    if ('configurationId' in settings) {
        this.configurationId = settings.configurationId;
    }
    if ('viewstate' in settings) {
        if (typeof settings.viewstate === 'string') {
            this.viewstate = JSON.parse(settings.viewstate);
        } else if (typeof settings.viewstate === 'object') {
            // make a copy of this object; yes, its ugly, sorry
            this.viewstate = JSON.parse(JSON.stringify(settings.viewstate));
        } else {
            HtmlCc.Libs.Log.log('Unrecognized viewstate type {0}'.format(typeof settings.viewstate));
        }
    }
};
// returns array of packages
HtmlCc.Workflow.SettingsType.prototype.getPackagesArray = function () {
    /// <signature>
    /// <returns type='Array' elementType='String'/>
    /// </signature>
    var out = [];
    var splittedValues = this.packages.split(',');
    for (var i = 0; i < splittedValues.length; i++) {
        var value = splittedValues[i];
        if (value != '' && value != null) {
            out.push(value);
        }
    }
    return out;
};
// sets packages as array
HtmlCc.Workflow.SettingsType.prototype.setPackagesArray = function (packagesArray) {
    /// <signature>
    /// <param name='packagesString' type='Array' elementType='String' />
    /// </signature>
    this.packages = packagesArray.sort().join(',');
};
// makes string from viewstate
HtmlCc.Workflow.SettingsType.prototype.viewstateToString = function () {
    /// <signature>
    /// <returns type='String'/>
    /// </signature>
    return JSON.stringify(this.viewstate);
};
// adds package into packages
HtmlCc.Workflow.SettingsType.prototype.addPackage = function (packageCode) {
    /// <signature>
    /// <param name='packageCode' type='String' />
    /// </signature>
    var pkgs = this.getPackagesArray();
    if ($.inArray(packageCode, pkgs) === -1) {
        pkgs.push(packageCode);
    }
    this.setPackagesArray(pkgs.sort());
};
// removes poackage from packages
HtmlCc.Workflow.SettingsType.prototype.removePackage = function (packageCode) {
    /// <signature>
    /// <param name='packageCode' type='String' />
    /// </signature>
    var pkgs = this.getPackagesArray();
    var result = [];
    for (var i = 0; i < pkgs.length; i++) {
        var pkgResult = pkgs[i].match(HtmlCc.Workflow.PackageCodeRegex);
        var pkgResultToRemove = packageCode.match(HtmlCc.Workflow.PackageCodeRegex);
        if (pkgResult[1] != pkgResultToRemove[1]) {
            result.push(pkgs[i]);
        }
    }
    this.setPackagesArray(result);
};


HtmlCc.Workflow.SettingsType.prototype.getConflictSolutions = function () {
    if (!htmlcc.libs.LocalStorageProvider.hasStorage()) {
        return [];
    }
    
    var conflictSolutions = localStorage.getItem("conflictSolutions");

    if (conflictSolutions == null) {
        return [];
    }
    else {
        conflictSolutions = JSON.parse(conflictSolutions);
        if ($.isArray(conflictSolutions) == false) {
            return [];
        }

        return conflictSolutions;
    }
}

HtmlCc.Workflow.SettingsType.prototype.removeConflictSolutions = function () {
    if (!htmlcc.libs.LocalStorageProvider.hasStorage()) {
        return;
    }

    localStorage.removeItem("conflictSolutions");   
}
// adds conflict solution into settings
HtmlCc.Workflow.SettingsType.prototype.addConflictSolution = function (conflictSolution) {
    /// <signature>
    /// <param name='conflictSolution' type='HtmlCc.Workflow.ConflictSolutionType' />
    /// </signature>
    if (!localStorage) {
        return;
    }

    if (!(conflictSolution instanceof HtmlCc.Workflow.ConflictSolutionType)) {
        throw new Error('Object conflictSolution is not instance of HtmlCc.Workflow.ConflictSolutionType.');
    }

    //if (encodeURI(JSON.stringify(this.viewstate.conflictSolutions)).length > 1000) {
    //    return;
    //}
    var conflictSolutions = localStorage.getItem("conflictSolutions");

    if (conflictSolutions == null) {
        conflictSolutions = [];
    }
    else {
        conflictSolutions = JSON.parse(conflictSolutions);
        if ($.isArray(conflictSolutions) == false) {
            conflictSolutions = [];
        }
    }

    for (var i = 0; i < conflictSolutions.length; i++) {
        if (conflictSolutions[i].addCodes == conflictSolution.addCodes && conflictSolutions[i].removeCodes == conflictSolution.removeCodes) {
            // override
            conflictSolutions[i] = conflictSolution;
            return;
        }
    }

    conflictSolutions.push(conflictSolution);

    localStorage.setItem("conflictSolutions", JSON.stringify(conflictSolutions));

    // find existing conflict solution type of the same signature
    //if (this.viewstate.conflictSolutions == null || $.isArray(this.viewstate.conflictSolutions) == false) {
    //    this.viewstate.conflictSolutions = [];
    //}

    //for (var i = 0; i < this.viewstate.conflictSolutions.length; i++) {
    //    if (this.viewstate.conflictSolutions[i].addCodes == conflictSolution.addCodes && this.viewstate.conflictSolutions[i].removeCodes == conflictSolution.removeCodes) {
    //        // override
    //        this.viewstate.conflictSolutions[i] = conflictSolution;
    //        return;
    //    }
    //}
    //this.viewstate.conflictSolutions.push(conflictSolution);
};

// tests for equivalence of objects
HtmlCc.Workflow.SettingsType.prototype.equals = function (anotherSettings) {
    /// <signature>
    /// <param name='anotherSettings' type='HtmlCc.Workflow.SettingsType' />
    /// <returns type='bool'/>
    /// </signature>
    if (!(anotherSettings instanceof HtmlCc.Workflow.SettingsType)) {
        return false;
    }

    if (anotherSettings === this) {
        return true;
    }

    return (this.carline == anotherSettings.carline
        && (this.color == anotherSettings.color || ((this.color == null || this.color == '') && (anotherSettings.color == null || anotherSettings.color == '')))
        && this.culture == anotherSettings.culture
        && this.instance == anotherSettings.instance
        && (this.interior == anotherSettings.interior || ((this.interior == null || this.interior == '') && (anotherSettings.interior == null || anotherSettings.interior == '')))
        && this.model == anotherSettings.model
        && (this.packages == anotherSettings.packages || ((this.packages == null || this.packages == '') && (anotherSettings.packages == null || anotherSettings.packages == '')))
        && this.prefix == anotherSettings.prefix
        && this.salesprogram == anotherSettings.salesprogram
        && this.view == anotherSettings.view
        && this.equipment == anotherSettings.equipment
        && this.motor == anotherSettings.motor
        && this.viewstateToString() == anotherSettings.viewstateToString());
};

// tests whether configuration attributes are quals
HtmlCc.Workflow.SettingsType.prototype.configurationEquals = function (anotherSettings) {
    /// <signature>
    /// <param name='anotherSettings' type='Object' />
    /// <returns type='bool'/>
    /// </signature>
    if (anotherSettings == null) {
        return false;
    }

    return (this.carline == anotherSettings.carline
        && (this.color == anotherSettings.color || ((this.color == null || this.color == '') && (anotherSettings.color == null || anotherSettings.color == '')))
        && this.culture == anotherSettings.culture
        && this.instance == anotherSettings.instance
        && (this.interior == anotherSettings.interior || ((this.interior == null || this.interior == '') && (anotherSettings.interior == null || anotherSettings.interior == '')))
        && this.model == anotherSettings.model
        && (this.equipment == anotherSettings.equipment || ((this.equipment == null || this.equipment == '') && (anotherSettings.equipment == null || anotherSettings.equipment == '')))
        && (this.motor == anotherSettings.motor || ((this.motor == null || this.motor == '') && (anotherSettings.motor == null || anotherSettings.motor == '')))
        && (this.packages == anotherSettings.packages || ((this.packages == null || this.packages == '') && (anotherSettings.packages == null || anotherSettings.packages == '')))
        && this.salesprogram == anotherSettings.salesprogram);
};

// regex for parsing package code; [1] - code; [3] - quantity
HtmlCc.Workflow.PackageCodeRegex = /^([A-Z0-9]{7})(\(([^)]*)\))?$/;

// converts ConfiguretionType to SettingsType
HtmlCc.Workflow.Params2Settings = function (cfgManager, currentSettings, params, view) {
    /// <signature>
    /// <param name='cfgManager' type='HtmlCc.Workflow.ConfigurationStepManagerType' />
    /// <param name='currentSettings' type='HtmlCc.Workflow.SettingsType'>Current settings to be altered.</param>
    /// <param name='params' type='HtmlCc.Api.Configurator.ConfigurationParams'>Params to alter the current settings.</param>
    /// <param name='view' type='String'>Optional attribute to change the view value.</param>
    /// <returns type='HtmlCc.Workflow.SettingsType'/>
    /// </signature>

    if (!(cfgManager instanceof HtmlCc.Workflow.ConfigurationStepManagerType)) {
        throw new Error('Object cfgManager is not instance of HtmlCc.Workflow.ConfigurationStepManagerType.');
    }
    if (!(currentSettings instanceof HtmlCc.Workflow.SettingsType)) {
        throw new Error('Object currentSettings is not instance of HtmlCc.Workflow.SettingsType.');
    }
    if (!(params instanceof HtmlCc.Api.Configurator.ConfigurationParams)) {
        throw new Error('Object params is not instance of HtmlCc.Api.Configurator.ConfigurationParams.');
    }


    switch (view) {
        case 'step1':
        case 'step2':
        case 'step3':
        case 'step4':
        case 'step5':
        case 'step6':
        case 'step7':
            break;
        default:
            view = currentSettings.view;
    }

    var equipmentId = null;
    var motorId = null;

    // correction of params at the first step
    if (view == 'step1') {
        var model = cfgManager.getConfigurator().getConfiguredMotor().getEquipment().getModel();

        var equipments = model.getEquipments();
        $.each(equipments, function () {
            var equipment = this;
            var motor = equipment.getMotorLookup(params.motorId);
            if (motor != null) {
                equipmentId = equipment.getId();
            }
        });

        if (equipmentId == null) {
            HtmlCc.Libs.Log.error('MotorId {0} wasn\'t found in equipment {1}.'.format(params.motorId));
        }
    } else {
        motorId = params.motorId;
    }

    var newSettings = new HtmlCc.Workflow.SettingsType(currentSettings);
    newSettings.color = params.colorCode;
    newSettings.interior = params.interiorCode;
    newSettings.motor = motorId;
    newSettings.equipment = equipmentId;
    newSettings.packages = params.packageCodes;
    newSettings.view = view;

    return newSettings;
};

// manager of configurator settings based on url params
HtmlCc.Workflow.ConfigurationStepManagerType = function (resetSettings) {
    /// <signature>
    /// <param name='resetSettings' type='Object' />
    /// <returns type='HtmlCc.Workflow.ConfigurationStepManagerType'/>
    /// </signature>

    if (!('prefix' in resetSettings)) {
        throw new Error('Field prefix is not present in resetSettings parameters.');
    }

    if (!('versionUrl' in resetSettings)) {
        throw new Error('Field versionUrl is not present in resetSettings parameters.');
    }

    if (!('configureUrl' in resetSettings)) {
        throw new Error('Field configureUrl is not present in resetSettings parameters.');
    }

    var _lastNonConflictState = null;
    this.getLastNonConflictState = function () {
        /// <signature>
        /// <returns type='Object'>Last non-conflict settings.</returns>
        /// </signature>
        return _lastNonConflictState;
    };
    this.setLastNonConflictState = function (lastNonConflictState) {
        /// <signature>
        /// <param name='lastNonConflictState' type='Object'>Last non-conflict settings.</param>
        /// </signature>
        _lastNonConflictState = lastNonConflictState;
    };

    var _initWithConfigurationId = false;

    var _prefix = resetSettings.prefix;
    // returns current prefix
    this.getPrefix = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _prefix;
    };

    var thisConfigurationStepManager = this;

    // stored settings of each configuration group
    // equipment: step1 - equipment selection
    // motor: step2 - motor selection
    // color: step3 - color & wheel selection
    // interior: step4 - interior & seat selection
    // extra: step5, step6, step7 - extra equipment
    var _settings = {
        equipment: null,
        motor: null,
        color: null,
        interior: null,
        extra: null
    };

    // converts step name into configuration setting name
    var step2SettingsName = function (stepName) {
        /// <signature>
        /// <param name='stepName' type='String' />
        /// <returns type='String'/>
        /// </signature>
        switch (stepName) {
            case 'step1':
                return 'equipment';
            case 'step2':
                return 'motor';
            case 'step3':
                return 'color';
            case 'step4':
                return 'interior';
            case 'step5':
            case 'step6':
            case 'step7':
                return 'extra';
            default:
                return 'step1';
        }
    };

    this.step2SettingsName = function(stepName) {
        return step2SettingsName(stepName);
    }

    // returns rendering type based on step name
    var step2RenderingType = function (stepName) {
        /// <signature>
        /// <param name='stepName' type='String' />
        /// <returns type='String'/>
        /// </signature>
        switch (stepName) {
            case 'step1':
            case 'step2':
            case 'step3':
            case 'step4':
                return 'standard';
            default:
                return 'standard-ee-norender';
        }
    };

    this.step2RenderingType = function(stepName) {
        return step2RenderingType(stepName);
    }
    // current step name
    var _currentStep = null;

    // returns current params
    this.getCurrentParams = function () {
        /// <signature>
        /// <returns type='HtmlCc.Api.Configurator.ConfigurationParams'/>
        /// </signature>
        var stngs = thisConfigurationStepManager.getParamsByStepName(this.getCurrentStepName());
        return new HtmlCc.Api.Configurator.ConfigurationParams(stngs.motorId, stngs.colorCode, stngs.interiorCode, stngs.packageCodes);
    };

    // returns current step name
    this.getCurrentStepName = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _currentStep;
    };

    this.setCurrentStepName = function (currentStep) {
        _currentStep = currentStep;
    }

    var _configurator = new HtmlCc.Api.Configurator({
        instanceName: resetSettings.instance,
        salesprogramName: resetSettings.salesprogram,
        culture: resetSettings.culture,
        versionUrl: resetSettings.versionUrl,
        configureUrl: resetSettings.configureUrl,
        modelCode: resetSettings.model
    });

    // returns settings from current settings
    this.getSettingsFromUrl = function (prefix) {
        /// <signature>
        /// <param name='prefix' type='String' />
        /// <returns type='Object'/>
        /// </signature>
        var output = {
            prefix: prefix
        };

        var urlParts = location.href.split('#!');

        if (urlParts.length > 1) {
            // ok, there is "#", so take she second part and parse it as get params
            var rawParamParts = urlParts[1].split('&');
            for (var i = 0; i < rawParamParts.length; i++) {
                var rawPartArray = rawParamParts[i].split('=');
                var key = decodeURIComponent(rawPartArray[0]);
                var value = decodeURIComponent(rawPartArray[1]);

                switch (key) {
                    case prefix + 'instance':
                        if (value != null) {
                            output.instance = value.toUpperCase();
                        }
                        break;
                    case prefix + 'salesprogram':
                        if (value != null) {
                            output.salesprogram = value.toUpperCase();
                        }
                        break;
                    case prefix + 'culture':
                        if (value != null) {
                            output.culture = value;
                        }
                        break;
                    case prefix + 'model':
                        if (value != null) {
                            output.model = value.toUpperCase();
                        }
                        break;
                    case prefix + 'carline':
                        if (value != null) {
                            output.carline = value.toUpperCase();
                        }
                        break;
                    case prefix + 'color':
                        if (value != null) {
                            output.color = value.toUpperCase();
                        }
                        break;
                    case prefix + 'interior':
                        if (value != null) {
                            output.interior = value.toUpperCase();
                        }
                        break;
                    case prefix + 'equipment':
                        if (value != null) {
                            output.equipment = parseInt(value, 10);
                            if (!(output.equipment > 0)) {
                                output.equipment = null;
                            }
                        }
                        break;
                    case prefix + 'motor':
                        if (value != null) {
                            output.motor = parseInt(value, 10);
                            if (!(output.motor > 0)) {
                                output.motor = null;
                            }
                        }
                        break;
                    case prefix + 'packages':
                        if (value != null) {
                            var packagesArray = value.toUpperCase().split(',');
                            var outputPackageArray = [];
                            for (var j = 0; j < packagesArray.length; j++) {
                                var regexResult = packagesArray[j].match(HtmlCc.Workflow.PackageCodeRegex);
                                if (regexResult !== null) {
                                    var packageCode = regexResult[1];
                                    var packageArgument = regexResult[3];
                                    outputPackageArray.push(regexResult[0]);
                                }
                            }
                            output.packages = outputPackageArray.sort().join(',');
                        }
                        break;
                    case prefix + 'view':
                        if (value != null) {
                            output.view = value;
                        }
                        break;
                    case prefix + 'configurationId':
                        if (value != null) {
                            output.configurationId = value;
                        }
                        break;
                    case prefix + 'viewstate':
                        if (value != null && value != '') {
                            output.viewstate = JSON.parse(value);
                        } else {
                            output.viewstate = {};
                        }
                        break;
                    default:
                        // other params are not important for this configurator application
                        break;
                }
            }
        }
        return output;
    };

    // returns href of merged params
    this.getUrlOfSettings = function (settings) {
        /// <signature>
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
        /// <returns type='String'/>
        /// </signature>

        if (!(settings instanceof HtmlCc.Workflow.SettingsType)) {
            throw new Error('settings is not instance of HtmlCc.Workflow.SettingsType');
        }

        // prepairs all parameters from current url
        var uriComponents = {};
        var urlParts = location.href.split('#!');
        if (urlParts.length > 1) {
            // ok, there is "#", so take she second part and parse it as get params
            var rawParamParts = urlParts[1].split('&');
            for (var i = 0; i < rawParamParts.length; i++) {
                var rawPartArray = rawParamParts[i].split('=');
                var key = decodeURIComponent(rawPartArray[0]);
                var value = decodeURIComponent(rawPartArray[1]);
                uriComponents[key] = value;
            }
        }

        // overwrite the parameters from url with current settings 
        $.each(['instance', 'salesprogram', 'culture', 'model', 'carline', 'equipment', 'motor', 'color', 'interior', 'packages', 'view', 'configurationId', 'viewstate',], function (k, v) {
            if (v == 'viewstate') {
                uriComponents[thisConfigurationStepManager.getPrefix() + v] = JSON.stringify(settings[v]);
            } else {
                uriComponents[thisConfigurationStepManager.getPrefix() + v] = settings[v];
            }
        });

        // creates encoded params back into url string
        var paramSegments = [];
        $.each(uriComponents, function (k, v) {
            var val = v;
            if (val == null) {
                val = '';
            }
            paramSegments.push(encodeURIComponent(k) + '=' + encodeURIComponent(val));
        });
        return '#!' + paramSegments.join('&');
    };

    this.getUrlOfParams = function (stepName, params) {
        /// <signature>
        /// <param name='stepName' type='String' />
        /// <param name='params' type='HtmlCc.Api.Configurator.ConfigurationParams' />
        /// <returns type='String'/>
        /// </signature>

        if (!(params instanceof HtmlCc.Api.Configurator.ConfigurationParams)) {
            throw new Error('Params must be type of HtmlCc.Api.Configurator.ConfigurationParams but it isn\'t!');
        }

        var settings = new HtmlCc.Workflow.SettingsType();
        settings.carline = _configurator.getCarlineCode();
        settings.color = params.colorCode;
        settings.culture = _configurator.getCulture();
        settings.instance = _configurator.getInstanceName();
        settings.interior = params.interiorCode;
        settings.model = _configurator.getModelCode();
        settings.packages = params.packageCodes;
        settings.prefix = thisConfigurationStepManager.getPrefix();
        settings.salesprogram = _configurator.getSalesProgramName();
        settings.view = stepName;

        settings.motor = null;
        settings.equipment = null;
        var motor = null;
        var equipments = _configurator.getConfiguredMotor().getEquipment().getModel().getEquipments();
        for (var i = 0; i < equipments.length; i++) {
            var lookup = equipments[i].getMotorLookup(params.motorId);
            if (lookup != null) {
                motor = lookup;
                break;
            }
        }
        if (motor == null) {
            motor = _configurator.getConfiguredMotor();
        }

        switch (stepName) {
            case 'step2':
            case 'step3':
            case 'step4':
            case 'step5':
            case 'step6':
            case 'step7':
                settings.motor = motor.getId();
                break;
            case 'step1':
            default:
                settings.view = 'step1';
                settings.motor = null;
                settings.equipment = motor.getEquipment().getId();
                break;
        }
        return this.getUrlOfSettings(settings);
    };

    // returns current settings from URL combinated with reset values 
    var getSanitizedSettingsFromUrlAndReset = function (reset) {
        /// <signature>
        /// <param name='resetSettings' type='Object' />
        /// <returns type='HtmlCc.Workflow.SettingsType'/>
        /// </signature>

        // check for reset object
        if (reset == null) {
            throw new Error('reset object is not set.');
        }

        // check for prefix field in reset object
        if (!('prefix' in reset)) {
            throw new Error('prefix field is not present in reset object.');
        }

        // merge reset object with url params, that can override them
        var settings = $.extend(reset, thisConfigurationStepManager.getSettingsFromUrl(reset.prefix));

        // mandatory parameter instance
        var instance = null;
        if (('instance' in settings) && typeof settings.instance === 'string' && settings.instance.length > 0) {
            instance = settings.instance;
        } else {
            if (('instance' in reset) && typeof reset.instance === 'string' && reset.instance.length > 0) {
                instance = reset.instance;
            } else {
                throw new Error('instance is not properly set.');
            }
        }

        // mandatory parameter salesprogram
        var salesprogram = null;
        if (('salesprogram' in settings) && typeof settings.salesprogram === 'string' && settings.salesprogram.length > 0) {
            salesprogram = settings.salesprogram;
        } else {
            if (('salesprogram' in reset) && typeof reset.salesprogram === 'string' && reset.salesprogram.length > 0) {
                salesprogram = reset.salesprogram;
            } else {
                throw new Error('salesprogram is not properly set.');
            }
        }

        // mandatory parameter culture
        var culture = null;
        if (('culture' in settings) && typeof settings.culture === 'string' && settings.culture.length > 0) {
            culture = settings.culture;
        } else {
            if (('culture' in reset) && typeof reset.culture === 'string' && reset.culture.length > 0) {
                culture = reset.culture;
            } else {
                throw new Error('culture is not properly set.');
            }
        }

        // mandatory parameter model
        var model = null;
        if (('model' in settings) && typeof settings.model === 'string' && settings.model.length > 0) {
            model = settings.model;
        } else {
            if (('model' in reset) && typeof reset.model === 'string' && reset.model.length > 0) {
                model = reset.model;
            } else {
                throw new Error('model is not properly set.');
            }
        }
        model = model.toUpperCase();

        // mandatory parameter carline
        var carline = null;
        if (('carline' in settings) && typeof settings.carline === 'string' && settings.carline.length > 0) {
            carline = settings.carline;
        } else {
            if (('carline' in reset) && typeof reset.carline === 'string' && reset.carline.length > 0) {
                carline = reset.carline;
            } else {
                throw new Error('carline is not properly set.');
            }
        }
        carline = carline.toUpperCase();

        // optional parameter equipment; integer if present, null if not present
        var equipment = null;
        if ('equipment' in settings) {
            equipment = parseInt(settings.equipment);
            if (!(equipment > 0)) {
                equipment = null;
            }
        }


        // optional parameter motor; integer if present, null if not present
        var motor = null;
        if ('motor' in settings) {
            motor = parseInt(settings.motor);
            if (!(motor > 0)) {
                motor = null;
            }
        }

        // if motor is not null and equipment as well, I need just motor value
        if (motor > 0 && equipment > 0) {
            equipment = null;
        }

        // optional parameter color
        var color = null;
        if (('color' in settings) && typeof settings.color === 'string' && settings.color.length > 0) {
            color = settings.color.toUpperCase();
        }

        // optional parameter interior
        var interior = null;
        if (('interior' in settings) && typeof settings.interior === 'string' && settings.interior.length > 0) {
            interior = settings.interior.toUpperCase();
        }

        // optional parameter packages
        var packages = null;
        if (('packages' in settings) && typeof settings.packages === 'string' && settings.packages.length > 0) {
            packages = settings.packages.toUpperCase();

            // sanitize packages
            var packagesArray = [];
            var packagesDirtyArray = packages.split(',');
            for (var i = 0; i < packagesDirtyArray.length; i++) {
                var regexResult = packagesDirtyArray[i].match(HtmlCc.Workflow.PackageCodeRegex);
                if (regexResult !== null) {
                    var packageCode = regexResult[1];
                    var packageArgument = regexResult[3];
                    if (packageArgument != null && packageArgument != '') {
                        packagesArray.push('{0}({1})'.format(packageCode, packageArgument));
                    } else {
                        packagesArray.push('{0}'.format(packageCode));
                    }

                }
            }

            packages = packagesArray.sort().join(',');
        }

        // optional parameter view
        var view = null;
        if (('view' in settings) && typeof settings.view === 'string' && settings.view.length > 0) {
            view = settings.view;
        } else {
            if (('view' in reset) && typeof reset.view === 'string' && reset.view.length > 0) {
                view = reset.view;
            } else {
                // default is the first step
                view = 'step1';
            }
        }

        // optional parameter viewstate
        var viewstate = null;
        if (('viewstate' in settings) && typeof settings.viewstate === 'string' && settings.viewstate.length > 0) {
            viewstate = JSON.parse(settings.viewstate);
        } else {
            if (('viewstate' in reset) && typeof reset.viewstate === 'string' && reset.viewstate.length > 0) {
                viewstate = JSON.parse(reset.viewstate);
            } else {
                // default is the first step
                viewstate = {};
            }
        }


        var settingsType = new HtmlCc.Workflow.SettingsType();
        settingsType.carline = carline;
        settingsType.color = color;
        settingsType.culture = culture;
        settingsType.instance = instance;
        settingsType.interior = interior;
        settingsType.model = model;
        settingsType.packages = packages;
        settingsType.prefix = reset.prefix;
        settingsType.salesprogram = salesprogram;
        settingsType.view = view;
        settingsType.motor = motor;
        settingsType.equipment = equipment;
        settingsType.viewstate = viewstate;

        return settingsType;
    };

    // clears configuration at next steps when configuration at changedSteps has changed
    this.clearNextSteps = function (changedStep) {
        switch (changedStep) {
            case 'step1':
                _settings.motor = null;
                _settings.color = null;
                _settings.interior = null;
                _settings.extra = null;
               break;
            case 'step2':
                _settings.color = null;
                _settings.interior = null;
                _settings.extra = null;
                break;
            case 'step3':
                _settings.interior = null;
                _settings.extra = null;
                break;
            case 'step4':
                _settings.extra = null;
               break;
        }
    };

    // check if clear is necessary provide
    this.isClearNextSteps = function (changedStep) {
        var isClear = false;
        switch (changedStep) {
            case 'step1':
                if(_settings.motor != null ||  _settings.interior != null || _settings.color != null || _settings.extra != null)
                    isClear = true;
                break;
            case 'step2':
                if (_settings.interior != null || _settings.color != null || _settings.extra != null)
                    isClear = true;
                break;
            case 'step3':
                if (_settings.interior != null || _settings.extra != null)
                    isClear = true;
                break;
            case 'step4':
                if (_settings.extra != null)
                    isClear = true;
                break;
        }
        return isClear;
    };

    this.clearViewStateAccessories = function (settings) {
        if (settings.viewstate != undefined) {
            settings.viewstate.accessoriesItems = [];
            settings.viewstate.selectedAccessories = [];
        }
        return settings;
    }

    // resets all steps according to settings
    var resetSteps = function (settings, successProgress, successCallback, errorCallback, newObject) {
        /// <signature>
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
        /// <param name='successProgress' type='Function'>function(step, totalSteps, message, messageKey)</param>
        /// <param name='successCallback' type='Function'>function()</param>
        /// <param name='errorCallback' type='Function'>function(failureMessage, messageTranslationKey)</param>
        /// <param name='newObject' type='bool'>If thue, the _configurator object is newly created.</param>
        /// </signature>
        if (!(settings instanceof HtmlCc.Workflow.SettingsType)) {
            throw new Error('settings param is not instance of HtmlCc.Workflow.SettingsType.');
        }

        if (newObject === true) {
            _configurator = new HtmlCc.Api.Configurator({
                instanceName: settings.instance,
                salesprogramName: settings.salesprogram,
                culture: settings.culture,
                versionUrl: resetSettings.versionUrl,
                configureUrl: resetSettings.configureUrl
            });
        }
        _configurator.setAfterInitFailureCallback(function () {
            // init failed
            HtmlCc.Libs.Log.error('An error occured during sales program initialization.');
            //alert("An error occured during initialization.\nClick to OK and refresh the page using F5 key.");
            errorCallback('An error ocured during sales program initialization.', 'ResetSalesProgramFailed');
        });



        _configurator.setAfterInitSuccessCallback(function () {
            successProgress(1, 3, 'Sales program initialization successfully finished.', 'ResetSalesProgramSuccess');
            _configurator.setModelAndCarline(settings.model, settings.carline, function () {
                // success
                successProgress(2, 3, 'Model initialization successfully finished.', 'ResetModelSuccess');

                // returns true if motorId exists somewhere in equipments of model
                var testIfMotorExistsInModel = function (motorId) {
                    /// <signature>
                    /// <returns type='bool'/>
                    /// </signature>
                    var motor = _configurator.getConfiguredMotor();
                    var model = motor.getEquipment().getModel();

                    var equipments = model.getEquipments();
                    for (var i = 0; i < equipments.length; i++) {
                        equipment = equipments[i]
                        var motorLookups = equipment.getMotorLookups();
                        for (var j = 0; j < motorLookups.length; j++) {
                            if (motorLookups[j].getId() == motorId) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                // reset view is step1
                if (settings.view == 'step1') {
                    // selecting equipment

                    var motor = _configurator.getConfiguredMotor();
                    var motorId = motor.getId();

                    if (settings.motor != '' && settings.motor != 0 && settings.motor != null && testIfMotorExistsInModel(settings.motor)) {
                        motorId = settings.motor;
                    } else if (settings.equipment != '' && settings.equipment != 0 && settings.equipment != null) {
                        equipment = motor.getEquipment().getModel().getEquipment(settings.equipment);
                        if (equipment != null) {
                            motorId = equipment.getDefaultMotorId();
                        }
                    }

                    _settings.equipment = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                } else if (settings.view == 'step2') {
                    // selecting motor
                    var motor = _configurator.getConfiguredMotor();
                    var motorId = motor.getId();
                    var model = motor.getEquipment().getModel();
                    var equipment = null;

                    if (settings.motor != '' && settings.motor != 0 && settings.motor != null && testIfMotorExistsInModel(settings.motor)) {
                        motorId = settings.motor;
                    } else if (settings.equipment != '' && settings.equipment != 0 && settings.equipment != null) {
                        equipment = model.getEquipment(settings.equipment);
                        if (equipment != null) {
                            motorId = equipment.getDefaultMotorId();
                        }
                    }

                    _settings.equipment = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, null, null, null);
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages);
                } else if (settings.view == 'step3') {
                    // selecting color and wheel
                    var motor = _configurator.getConfiguredMotor();
                    if (settings.motor == null || settings.motor == 0 || settings.motor == '') {
                        HtmlCc.Libs.Log.warn('Motor id is not set. Setting the default motor.');
                        settings.motor = motor.getId();
                    } else {
                        // using settings.motor
                        if (testIfMotorExistsInModel(settings.motor) === false) {
                            // motor in parameter does not exists so set the default one
                            HtmlCc.Libs.Log.warn('Motor id {0} is not present at this model. Default motor is set.'.format(settings.motor));
                            settings.motor = motor.getId();
                        }
                    }


                    _settings.equipment = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, null, null, null);
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, null, null, null);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, settings.interior, settings.packages);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, settings.interior, settings.packages);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, settings.interior, settings.packages);
                } else if (settings.view == 'step4') {
                    // selecting interior and seat
                    var motor = _configurator.getConfiguredMotor();
                    if (settings.motor == null || settings.motor == 0 || settings.motor == '') {
                        HtmlCc.Libs.Log.warn('Motor id is not set. Setting the default motor.');
                        settings.motor = motor.getId();
                    } else {
                        // using settings.motor
                        if (testIfMotorExistsInModel(settings.motor) === false) {
                            // motor in parameter does not exists so set the default one
                            HtmlCc.Libs.Log.warn('Motor id {0} is not present at this model. Default motor is set.'.format(settings.motor));
                            settings.motor = motor.getId();
                        }
                    }

                    _settings.equipment = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, null, null, null);
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, null, null, null);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, null, null);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, settings.interior, settings.packages);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, settings.interior, settings.packages);
                } else if (settings.view == 'step5' || settings.view == 'step6' || settings.view == 'step7') {
                    // selecting extra equipment
                    var motor = _configurator.getConfiguredMotor();
                    if (settings.motor == null || settings.motor == 0 || settings.motor == '') {
                        HtmlCc.Libs.Log.warn('Motor id is not set. Setting the default motor.');
                        settings.motor = motor.getId();
                    } else {
                        // using settings.motor
                        if (testIfMotorExistsInModel(settings.motor) === false) {
                            // motor in parameter does not exists so set the default one
                            HtmlCc.Libs.Log.warn('Motor id {0} is not present at this model. Default motor is set.'.format(settings.motor));
                            settings.motor = motor.getId();
                        }
                    }

                    _settings.equipment = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, null, null, null);
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, null, null, null);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, null, null);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, settings.interior, null);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(settings.motor, settings.color, settings.interior, settings.packages);
                } else {
                    settings.view == 'step1';
                    var motor = _configurator.getConfiguredMotor();
                    settings.interior = '';
                    settings.color = '';
                    settings.packages = '';

                    _settings.equipment = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), null, null, null);
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), null, null, null);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), null, null, null);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), null, null, null);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), null, null, null);
                }

                // configure current step into _configurator's inner state
                var currentSettings = _settings[step2SettingsName(settings.view)];
                var renderingType = step2RenderingType(settings.view);
                _currentStep = settings.view;
                _configurator.configureMotor(currentSettings, renderingType, function () {
                    // success
                    successProgress(3, 3, 'Model setup complete.', 'ResetMotorSuccess');
                    successCallback();
                }, function () {
                    // fail
                    errorCallback('Model setup failed.', 'ResetMotorFailed');
                });
            }, function () {
                // fail
                HtmlCc.Libs.Log.error('An error occured during model initialization.');
                errorCallback('An error ocured during sales program initialization.', 'ResetModelFailed');
            });
        });



    };

    // resets all steps according to reset and url params
    this.resetSteps = function (successProgress, successCallback, errorCallback) {
        /// <signature>
        /// <param name='successProgress' type='Function'>function(step, totalSteps, message, messageKey)</param>
        /// <param name='successCallback' type='Function'>function()</param>
        /// <param name='errorCallback' type='Function'>function(failureMessage, messageTranslationKey)</param>
        /// </signature>
        resetSteps(getSanitizedSettingsFromUrlAndReset(resetSettings), successProgress, successCallback, errorCallback);
    };

    // retuns settings by step name
    this.getParamsByStepName = function (stepName) {
        /// <signature>
        /// <param name='stepName' type='String'></param>
        /// <returns type='HtmlCc.Api.Configurator.ConfigurationParams'/>
        /// </signature>
        var settingsName = step2SettingsName(stepName);

        if (_settings[settingsName] == null) {
            switch (stepName) {
                case 'step1':
                    throw new Error('No configuration at step1.');
                    break;
                case 'step2':
                    _settings[settingsName] = thisConfigurationStepManager.getParamsByStepName('step1');
                    break;
                case 'step3':
                    _settings[settingsName] = thisConfigurationStepManager.getParamsByStepName('step2');
                    break;
                case 'step4':
                    _settings[settingsName] = thisConfigurationStepManager.getParamsByStepName('step3');
                    break;
                case 'step5':
                    _settings[settingsName] = thisConfigurationStepManager.getParamsByStepName('step4');
                    break;
                case 'step6':
                    _settings[settingsName] = thisConfigurationStepManager.getParamsByStepName('step5');
                    break;
                case 'step7':
                    _settings[settingsName] = thisConfigurationStepManager.getParamsByStepName('step6');
                    break;
                default:
                    throw new Error('Illegal step name.');
            }
        } 

        return _settings[settingsName];
    };


    this.getParamsByStepNameWithoutSet = function (stepName) {
        /// <signature>
        /// <param name='stepName' type='String'></param>
        /// <returns type='HtmlCc.Api.Configurator.ConfigurationParams'/>
        /// </signature>
        var settingsName = step2SettingsName(stepName);

        if (_settings[settingsName] == null) {
            switch (stepName) {
                case 'step1':
                    throw new Error('No configuration at step1.');
                    break;
                case 'step2':
                    return thisConfigurationStepManager.getParamsByStepNameWithoutSet('step1');
                    break;
                case 'step3':
                    return thisConfigurationStepManager.getParamsByStepNameWithoutSet('step2');
                    break;
                case 'step4':
                    return thisConfigurationStepManager.getParamsByStepNameWithoutSet('step3');
                    break;
                case 'step5':
                    return thisConfigurationStepManager.getParamsByStepNameWithoutSet('step4');
                    break;
                case 'step6':
                    return thisConfigurationStepManager.getParamsByStepNameWithoutSet('step5');
                    break;
                case 'step7':
                    return thisConfigurationStepManager.getParamsByStepNameWithoutSet('step6');
                    break;
                default:
                    throw new Error('Illegal step name.');
            }
        }

        return _settings[settingsName];
    };

    var configurationInProgressHash = null;

    // sets configuration to stepName
    this.moveToStep = function (stepName, successCallback, errorCallback) {
        var settings = thisConfigurationStepManager.getParamsByStepName(stepName);
        configurationInProgressHash = HtmlCc.Libs.randomString(8);
        _configurationInProgressHash = configurationInProgressHash;

        _configurator.configureMotor(settings, step2RenderingType(stepName), function (configuredMotor) {
            if (configurationInProgressHash == _configurationInProgressHash) {
                // configuration didn't changed during configure motor callback waiting
                _currentStep = stepName;
                successCallback(true);
            } else {
                // configuration has changed during callback waiting
                successCallback(false);
            }
        }, function (jqXHR, textStatus, errorThrown) {
            errorCallback(jqXHR, textStatus, errorThrown);
        });
    };

    // sets configuration settings into steps
    this.setSettings = function (settings) {
        /// <signature>
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
        /// </signature>
        if (!(settings instanceof HtmlCc.Workflow.SettingsType)) {
            throw new Error('settings param is not instance of HtmlCc.Workflow.SettingsType.');
        }

        var model = _configurator.getConfiguredMotor().getEquipment().getModel();

        // essential settings are untouched, continue configuring
        switch (settings.view) {
            case 'step2':
                // sanitize motor
                var motorId = parseInt(settings.motor);
                var motor = null;
                if (motorId > 0) {
                    var equipments = model.getEquipments();
                    for (var i = 0; i < equipments.length; i++) {
                        var equipment = equipments[i];
                        var lookup = equipment.getMotorLookup(motorId);
                        if (lookup != null) {
                            // lookup found here
                            motor = lookup;
                            break;
                        }
                    }
                }
                if (motor == null) {
                    // settings.motor is not specified (or motor found)
                    // try to found it from settings.equipment attribute
                    var equipmentId = parseInt(settings.equipment);
                    if (equipmentId > 0) {
                        var equipment = model.getEquipment(equipmentId);
                        if (equipment != null) {
                            motor = equipment.getMotorLookup(equipment.getDefaultMotorId());
                        }
                    }
                }
                if (motor == null) {
                    // nothing works, using default motor at default equipment
                    var equipment = model.getEquipment(model.getDefaultEquipmentId());
                    motor = equipment.getMotorLookup(equipment.getDefaultMotorId());    // this must work everytime
                }

                // this configuration will be configured
                confParams = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), settings.color, settings.interior, settings.packages, settings.viewstate.insurance);

                //decide whether configuration has changed
                if (confParams.equals(_settings.motor) === false) {
                    // configuration has changed, reset all further steps
                    // _settings.equipment stays untouched
                    _settings.motor = confParams;
                    //_settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    //_settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    //_settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes, settings.viewstate.insurance);
                }
                break;
            case 'step3':
                // sanitize motor
                var motorId = parseInt(settings.motor);
                var motor = null;
                if (motorId > 0) {
                    var equipments = model.getEquipments();
                    for (var i = 0; i < equipments.length; i++) {
                        var equipment = equipments[i];
                        var lookup = equipment.getMotorLookup(motorId);
                        if (lookup != null) {
                            // lookup found here
                            motor = lookup;
                            break;
                        }
                    }
                }
                if (motor == null) {
                    // motor must be ready here - it is not, so set it up as the 1st step
                    HtmlCc.Libs.Log.error('Motor id must be present here. But it is not. Starting up the first step of configurator with default values.');
                    settings.view = 'step1';
                    settings.color = '';
                    settings.interior = '';
                    settings.packages = '';
                    settings.motor = '';
                    settings.equipment = '';

                    confParams = new HtmlCc.Api.Configurator.ConfigurationParams(configuredMotor.getId(), settings.color, settings.interior, settings.packages, settings.viewstate.insurance);
                    _settings.equipment = confParams
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes, settings.viewstate.insurance);
                } else {
                    // this configuration will be configured
                    confParams = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), settings.color, settings.interior, settings.packages, settings.viewstate.insurance);

                    //decide whether configuration has changed
                    if (confParams.equals(_settings.color) === false) {
                        // configuration has changed, reset all further steps
                        // _settings.equipment stays untouched
                        _settings.color = confParams;
                        //_settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                        //_settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes, settings.viewstate.insurance);
                    }
                }
                break;
            case 'step4':
                // sanitize motor
                var motorId = parseInt(settings.motor);
                var motor = null;
                if (motorId > 0) {
                    var equipments = model.getEquipments();
                    for (var i = 0; i < equipments.length; i++) {
                        var equipment = equipments[i];
                        var lookup = equipment.getMotorLookup(motorId);
                        if (lookup != null) {
                            // lookup found here
                            motor = lookup;
                            break;
                        }
                    }
                }
                if (motor == null) {
                    // motor must be ready here - it is not, so set it up as the 1st step
                    HtmlCc.Libs.Log.error('Motor id must be present here. But it is not. Starting up the first step of configurator with default values.');
                    settings.view = 'step1';
                    settings.color = '';
                    settings.interior = '';
                    settings.packages = '';
                    settings.motor = '';
                    settings.equipment = '';

                    confParams = new HtmlCc.Api.Configurator.ConfigurationParams(configuredMotor.getId(), settings.color, settings.interior, settings.packages, settings.viewstate.insurance);
                    _settings.equipment = confParams
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes, settings.viewstate.insurance);
                } else {
                    // this configuration will be configured
                    confParams = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), settings.color, settings.interior, settings.packages, settings.viewstate.insurance);

                    //decide whether configuration has changed
                    if (confParams.equals(_settings.equipment) === false) {
                        // configuration has changed, reset all further steps
                        // _settings.equipment stays untouched
                        _settings.interior = confParams;
                        //_settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes, settings.viewstate.insurance);
                    }
                }
                break;
            case 'step5':
            case 'step6':
            case 'step7':
                // sanitize motor
                var motorId = parseInt(settings.motor);
                var motor = null;
                if (motorId > 0) {
                    var equipments = model.getEquipments();
                    for (var i = 0; i < equipments.length; i++) {
                        var equipment = equipments[i];
                        var lookup = equipment.getMotorLookup(motorId);
                        if (lookup != null) {
                            // lookup found here
                            motor = lookup;
                            break;
                        }
                    }
                }
                if (motor == null) {
                    // motor must be ready here - it is not, so set it up as the 1st step
                    HtmlCc.Libs.Log.error('Motor id must be present here. But it is not. Starting up the first step of configurator with default values.');
                    settings.view = 'step1';
                    settings.color = '';
                    settings.interior = '';
                    settings.packages = '';
                    settings.motor = '';
                    settings.equipment = '';

                    confParams = new HtmlCc.Api.Configurator.ConfigurationParams(configuredMotor.getId(), settings.color, settings.interior, settings.packages, settings.viewstate.insurance);
                    _settings.equipment = confParams
                    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes, settings.viewstate.insurance);
                } else {
                    // this configuration will be configured
                    confParams = new HtmlCc.Api.Configurator.ConfigurationParams(motor.getId(), settings.color, settings.interior, settings.packages, settings.viewstate.insurance);

                    //decide whether configuration has changed
                    if (confParams.equals(_settings.extra) === false) {
                        // configuration has changed, reset all further steps
                        // _settings.equipment stays untouched
                        _settings.extra = confParams;
                    }
                }
                break;
            case 'step1':
            default:
                // step1 or anything else
                if (settings.view != 'step1') {
                    settings.view = 'step1';
                }

                var motor = null;
                var motorId = parseInt(settings.equipment);
                if (motorId > 0) {
                    var equipments = model.getEquipments();
                    for (var i = 0; i < equipments.length; i++) {
                        motor = equipments[i].getMotorLookup(motorId);
                        if (motor != null) {
                            break;
                        }
                    }
                }

                var equipmentId = null;
                var equipment = null;

                if (motor == null) {
                    equipmentId = parseInt(settings.equipment);

                    if (equipmentId > 0) {
                        equipment = model.getEquipment(equipmentId);
                        if (equipment != null) {
                            settings.equipment = equipmentId;
                        } else {
                            settings.equipment = null;
                        }
                    }
                    if (equipment == null) {
                        equipment = model.getEquipment(model.getDefaultEquipmentId());
                        equipmentId = equipment.getId();
                    }

                    motorId = equipment.getDefaultMotorId();
                }


                // sanitize equipment



                // this configuration will be configured
                confParams = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, settings.color, settings.interior, settings.packages, settings.viewstate.insurance);

                //decide whether configuration has changed
                if (confParams.equals(_settings.equipment) === false) {
                    // configuration has changed, reset all further steps
                    _settings.equipment = confParams;
                    //_settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    //_settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    //_settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes);
                    //_settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes, settings.viewstate.insurance);
                }
        }
        //// fills mising parts
        //if (_settings.motor == null) {
        //    _settings.motor = new HtmlCc.Api.Configurator.ConfigurationParams(_settings.equipment.motorId, _settings.equipment.colorCode, _settings.equipment.interiorCode, _settings.equipment.packageCodes);
        //}
        //if (_settings.color == null) {
        //    _settings.color = new HtmlCc.Api.Configurator.ConfigurationParams(_settings.motor.motorId, _settings.motor.colorCode, _settings.motor.interiorCode, _settings.motor.packageCodes);
        //}
        //if (_settings.interior == null) {
        //    _settings.interior = new HtmlCc.Api.Configurator.ConfigurationParams(_settings.color.motorId, _settings.color.colorCode, _settings.color.interiorCode, _settings.color.packageCodes);
        //}
        //if (_settings.extra == null) {
        //    _settings.extra = new HtmlCc.Api.Configurator.ConfigurationParams(_settings.interior.motorId, _settings.interior.colorCode, _settings.interior.interiorCode, _settings.interior.packageCodes);
        //}
    };

    var configureLock = null;
    // configures model by the settings
    this.configure = function (settings, successCallback, errorCallback) {
        /// <signature>
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
        /// <param name='successCallback' type='Function'>function()</param>
        /// <param name='errorCallback' type='Function'>function(failureMessage, messageTranslationKey)</param>
        /// </signature>
        if (!(settings instanceof HtmlCc.Workflow.SettingsType)) {
            throw new Error('settings param is not instance of HtmlCc.Workflow.SettingsType.');
        }

        // test whether settings contains instance, salesprogram, culture, model and carline the same as current configurator; if not, reset will be callled
        if (_configurator.getInstanceName().toUpperCase() != settings.instance.toUpperCase()
            || _configurator.getSalesProgramName().toUpperCase() != settings.salesprogram.toUpperCase()
            || _configurator.getCulture().toUpperCase() != settings.culture.toUpperCase()
            || _configurator.getModelCode().toUpperCase() != settings.model.toUpperCase()
            || _configurator.getCarlineCode().toUpperCase() != settings.carline.toUpperCase()) {
            // some of essintial settings has changes so everythong should be reset
            HtmlCc.Libs.Log.warn('One of parameters: instance, salesprogram, culture, model, carline has changed. Resetting.');
            resetSteps(settings, function () { }, successCallback, errorCallback);
        } else {
            this.setSettings(settings);

            var currentLock = HtmlCc.Libs.randomString(8);
            configureLock = currentLock;
            _configurator.configureMotor(confParams, step2RenderingType(settings.view), function (newlyConfiguredMotor) {
                // success
                if (currentLock == configureLock) {
                    // nobody changed the configuration, ok

                    // check whether newly configuration is the same as it was requested (it can change because silent conflict can be resolved by the server)
                    var newConfigurationParams = new HtmlCc.Api.Configurator.ConfigurationParams(newlyConfiguredMotor.getId(),
                        newlyConfiguredMotor.getSelectedColor().getCode(),
                        newlyConfiguredMotor.getSelectedInterior().getCode(),
                        HtmlCc.Libs.packagesToString(newlyConfiguredMotor.getPackages()),
                        settings.viewstate.insurance);

                    if (!newConfigurationParams.equals(confParams)) {
                        // configuration differs, reconfigure it with the new one again
                        HtmlCc.Libs.Log.log('New configuration (motor={0};color={1};interior={2};packages={3}) differs from the requested one (motor={4};color={5};interior={6};packages={7}) so it is going to be requested the new one again.'.format(newConfigurationParams.motorId, newConfigurationParams.colorCode, newConfigurationParams.interiorCode, newConfigurationParams.packageCodes, confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes));

                        var newSettings = new HtmlCc.Workflow.SettingsType(settings);
                        newSettings.motor = newConfigurationParams.motorId;
                        newSettings.color = newConfigurationParams.colorCode;
                        newSettings.interior = newConfigurationParams.interiorCode;
                        newSettings.packages = newConfigurationParams.packageCodes;

                        location.href = thisConfigurationStepManager.getUrlOfSettings(newSettings);

                    } else {
                        // configuration is the same, no problem
                        HtmlCc.Libs.Log.log('Successfuly configured motor "{0}", color "{1}", interior "{2}" and extra equipment "{3}".'.format(confParams.motorId, confParams.colorCode, confParams.interiorCode, confParams.packageCodes));
                        _currentStep = settings.view;

                        successCallback(true);
                    }
                } else {
                    // someone changed configuration, cancel
                    successCallback(false);
                }
            }, function () {
                // fail
                errorCallback('An error occured during configuration.', 'ConfigurationError');
            });
        }
    };

    // sanitizes raw settigns from untrusted source like URL
    this.sanitizeSettings = function (rawSettings) {
        /// <signature>
        /// <param name='rawSettings' type='Object'/>
        /// <returns type='HtmlCc.Workflow.SettingsType'/>
        /// </signature>
        var settings = new HtmlCc.Workflow.SettingsType();
        if ('carline' in rawSettings) {
            settings.carline = rawSettings.carline;
        } else {
            settings.carline = _configurator.getCarlineCode();
        }
        if ('color' in rawSettings) {
            settings.color = rawSettings.color;
        } else {
            settings.color = '';
        }
        if ('culture' in rawSettings) {
            settings.culture = rawSettings.culture;
        } else {
            settings.culture = _configurator.getCulture();
        }
        if ('equipment' in rawSettings) {
            settings.equipment = parseInt(rawSettings.equipment);
            if (!(settings.equipment > 0)) {
                settings.equipment = '';
            }
        } else {
            settings.equipment = '';
        }
        if ('instance' in rawSettings) {
            settings.instance = rawSettings.instance;
        } else {
            settings.instance = _configurator.getInstanceName();
        }
        if ('interior' in rawSettings) {
            settings.interior = rawSettings.interior;
        } else {
            settings.interior = '';
        }
        if ('model' in rawSettings) {
            settings.model = rawSettings.model;
        } else {
            settings.model = _configurator.getConfiguredMotor().getEquipment().getModel().getCode();
        }
        if ('motor' in rawSettings) {
            settings.motor = parseInt(rawSettings.motor);
            if (!(settings.motor > 0)) {
                settings.motor = '';
            }
        } else {
            settings.motor = '';
        }
        if ('packages' in rawSettings) {
            if ($.isArray(rawSettings.packages)) {
                settings.packages = rawSettings.packages.join(',');
            } else if (rawSettings.packages == null) {
                settings.packages = '';
            } else if (typeof rawSettings.packages === 'string') {
                settings.packages = rawSettings.packages;
            } else {
                HtmlCc.Libs.Log.warn('Unrecognized type of packages input.');
                settings.packages = '';
            }
        } else {
            settings.packages = '';
        }
        if ('salesprogram' in rawSettings) {
            settings.salesprogram = rawSettings.salesprogram;
        } else {
            settings.salesprogram = _configurator.getSalesProgramName();
        }
        if ('view' in rawSettings) {
            switch (rawSettings.view) {
                case 'step1':
                case 'step2':
                case 'step3':
                case 'step4':
                case 'step5':
                case 'step6':
                case 'step7':
                    settings.view = rawSettings.view;
                    break;
                default:
                    settings.view = 'step1';
            }

        } else {
            settings.view = 'step1';
        }
        if ('viewstate' in rawSettings) {
            if (typeof rawSettings.viewstate === 'string') {
                settings.viewstate = JSON.parse(rawSettings.viewstate);
            } else {
                settings.viewstate = rawSettings.viewstate;
            }
        } else {
            settings.viewstate = {};
        }

        if ('sessionGuid' in rawSettings) {
            settings.sessionGuid = rawSettings.sessionGuid;
        }

        if ('configurationId' in rawSettings) {
            settings.configurationId = rawSettings.configurationId;
        }

        return settings;    
    };

    // configure model from parameters contained after hash sign
    this.configureFromUrl = function (successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function()</param>
        /// <param name='errorCallback' type='Function'>function(failureMessage, failureKey)</param>
        /// </signature>

        var rawSettings = thisConfigurationStepManager.getSettingsFromUrl(resetSettings.prefix);
        var settings = this.sanitizeSettings(rawSettings);

        this.configure(settings, successCallback, errorCallback);
    };

    // returns configurator object
    this.getConfigurator = function () {
        /// <signature>
        /// <returns type='HtmlCc.Api.Configurator'/>
        /// </signature>
        return _configurator;
    };

    // cached saved configurations
    var _savedConfigurations = {};

    // queue of currently saving configurations
    var _savingConfigurations = {};

    this.getCurrentConfigurationKey = function(financingSettings) {
        var motor = this.getConfigurator().getConfiguredMotor();
        var equipment = motor.getEquipment();
        var model = equipment.getModel();

        var saveMotor = motor.getId();
        var savePackages = HtmlCc.Libs.packagesToString(motor.getPackages());
        var saveInterior = motor.getSelectedInterior().getCode();
        var saveColor = motor.getSelectedColor().getCode();
        var cfgString = '{0}-{1}-{2}-{3}-{4}'.format(saveMotor, savePackages, saveInterior, saveColor, financingSettings);

        return cfgString;
    }

    this.getCurrentConfigurationKeyFromSettings = function (settings, insuranceCode) {
        var saveMotor = settings.motor;
        var savePackages = settings.packages;
        var saveInterior = settings.interior;
        var saveColor = settings.color;
        var cfgString = '{0}-{1}-{2}-{3}-{4}'.format(saveMotor, savePackages, saveInterior, saveColor, insuranceCode);

        return cfgString;
    }

    // save configuration to internal cache
    this.prepareSaveConfiguration = function (configurationId, insuranceCode, configurationKeyFce) {
        var configurationKey = '';
        if (configurationKeyFce == null) {
            configurationKey = this.getCurrentConfigurationKey(insuranceCode);
        }
        else {
            configurationKey = configurationKeyFce();
        }

        if (_savedConfigurations[configurationKey] == null) {
            _savedConfigurations[configurationKey] = { Id: configurationId };
        }

        _initWithConfigurationId = true;
    }

    // saves current configuration - it is cached saving - multiple saving of the same configuration returns the same result
    this.saveConfiguration = function (successCallback, errorCallback, configurationId, insuranceCode, garage) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function(savedConfiguraionData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// <param name='insuranceCode' type='String'>optional selected insurance code via fd proxy</param>
        /// <param name='garage' type='boolean'>determines whether configuration is being saved to garage</param>
        /// </signature>
        var that = this;
        var motor = this.getConfigurator().getConfiguredMotor();
        var financing = this.getConfigurator().getFinancing();
        var insurance = that.getConfigurator().getInsurance();
        var financingParameters = null;
        var insuranceParameters = null;

        // save configuration if is not cached
        var saveConfiguration = function (financingHash, insuranceHash) {
            var financingKey = financingHash + '_' + insuranceHash;
            var cfgString = that.getCurrentConfigurationKey(financingKey);

            if (_savedConfigurations[cfgString] == null) {

                if (_savingConfigurations[cfgString] != null) {
                    // add save configuration request to queue
                    _savingConfigurations[cfgString].Callbacks.push(successCallback);
                    return;
                }
                else {
                    _savingConfigurations[cfgString] = { 'Callbacks': new Array() };
                }

                var save = function () {
                    that.getConfigurator().saveConfiguration(function (saveData) {
                        if (saveData.Error == null) {
                            cfgString = that.getCurrentConfigurationKey(financingKey, saveData.Id);
                            _savedConfigurations[cfgString] = saveData;
                        }

                        if (_savingConfigurations[cfgString].Callbacks.length == 0) {
                            successCallback(saveData, false);
                        }

                        // process save configuration queue
                        $.each(_savingConfigurations[cfgString].Callbacks, function () {
                            this(saveData);
                        });

                    }, errorCallback, insuranceCode, garage);
                };

                if (financing != null) {
                    financing.getDefaultsAsync(
                        motor,
                        financing.getProductId(),
                        financingParameters,
                        function (data) {
                            if (insurance != null && insuranceCode != undefined) {
                                insurance.getDefaultsAsync(
                                motor,
                                insurance.getProductId(),
                                insuranceParameters,
                                function (data) {
                                    save();
                                },
                               // save even if error occurred
                               save);
                            }
                            else {
                                save();
                            }
                        },
                        // save even if error occurred
                        save);
                }
                else {
                    save();
                }
            } else {
                successCallback(_savedConfigurations[cfgString], true);
            }
        }

        // save configuration without financing cache keys
        var saveErrorCallback = function () {
            saveConfiguration('', '');
        }

        if (financing != null) {
            financing.getSavedParamsAsync(
                this.getConfigurator().getConfiguredMotor(),
                function (savedParams) {
                    var financigHash = HtmlCc.Financial.ObjectParamsToHash(savedParams);
                    financingParameters = savedParams;
                    // gets insurance params hash
                    if (insuranceCode != null && insuranceCode != undefined) {
                        insurance.getSavedParamsAsync(
                           that.getConfigurator().getConfiguredMotor(),
                           function (savedParams) {
                               var insuranceHash = HtmlCc.Financial.ObjectParamsToHash(savedParams);
                               insuranceParameters = savedParams;
                               saveConfiguration(financigHash, insuranceHash);
                           }, saveErrorCallback);
                    } else {
                        saveConfiguration(financigHash, '');
                    }

                }, saveErrorCallback);
        }
        else {
            saveConfiguration('', '');
        }
    }

    this.sendConfigurationEmail = function (successCallback, errorCallback, subject, senderEmail, recipientEmail, message, insurance) {
        /// <signature>
        /// <param name='successCallback' type='Function'></param>
        /// <param name='errorCallback' type='Function'></param>
        /// </signature>

        this.saveConfiguration(function (data) {
            // success
            //data.Id;
            var params = {};
            //params.dataSource = dataSource;
            params.configurationId = data.Id;
            params.salesProgram = thisConfigurationStepManager.getConfigurator().getSalesProgramName();
            params.instanceName = thisConfigurationStepManager.getConfigurator().getInstanceName();
            params.language = thisConfigurationStepManager.getConfigurator().getCulture();
            params.subject = subject;
            params.senderEmail = senderEmail;
            params.recipientEmail = recipientEmail;
            params.message = message;
            
            $.ajax({
                url: HtmlCc.Workflow.GetUrl('/ConfigureRefactored/SendConfigurationEmail'),
                data: JSON.stringify(params),
                success: successCallback,
                error: errorCallback,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                timeout: 10000
            });
            
        }, function () {
            // error
        }, 0, insurance);
    };

    this.saveDealerSettings = function(successCallback, errorCallback, params) {


        $.ajax({
            url: '/dealer/ConfigureRefactored/UpdateDealerSettings',
            data: JSON.stringify(params),
            success: successCallback,
            error: errorCallback,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            timeout: 10000
        });
    };

    this.getDealerSettings = function(successCallback, errorCallback) {

        $.ajax({
            url: '/dealer/ConfigureRefactored/GetDealerSettings',
            success: successCallback,
            error: errorCallback,
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            timeout: 10000
        });
    };

    this.getModelSelectorSettings = function(successCallback, errorCallback) {

        var params = {};
        
        params.instanceName = thisConfigurationStepManager.getConfigurator().getInstanceName();
        params.salesProgramName = thisConfigurationStepManager.getConfigurator().getSalesProgramName();
        params.culture = thisConfigurationStepManager.getConfigurator().getCulture();

        $.ajax({
            url: HtmlCc.Workflow.GetUrl('/ConfigureRefactored/GetModelSelectorSettings'),
            data: JSON.stringify(params),
            success: function(url) {
                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    success: function(data) {
                        successCallback(data);
                    },
                    error: function() {
                        errorCallback();
                    },
                    timeout: 10000
                }
            )},
            error: errorCallback,
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            timeout: 10000
        });
    }

    // returns simple or full motor asynchronously
    this.getMotorAsync = function (settings, successCallback, errorCallback) {
        var configuredMotor = thisConfigurationStepManager.getConfigurator().getConfiguredMotor();
        var configuredEquipment = configuredMotor.getEquipment();
        var model = configuredEquipment.getModel();
        var motorId = settings.motor;
        if (motorId > 0) {
            if (motor == null) {
                // check whether motorId matches with configuredMotor; if not, it is reset to null to be filled with lookup
                if (configuredMotor.getId() == motorId) {
                    motor = configuredMotor;
                }
            }

            if (motor == null) {
                for (var i = 0; i < equipments.length; i++) {
                    motor = equipments[i].getMotorLookup(motorId);
                    if (motor != null) {
                        break;
                    }
                }
            }
        }
        var motor = null;
        var equipment = null;
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

        if (motor.getType() == 'full' || motor.getType() == 'simple') {
            successCallback(motor);
        } else {
            thisConfigurationStepManager.configureFromUrl(function () {
                motor = thisConfigurationStepManager.getConfigurator().getConfiguredMotor();
                successCallback(motor);
            });
        }
    };
    
    this.getMotorByStep = function(stepName, successCallback, errorCallback) {
        var newSettings = this.getParamsByStepName(stepName);
        
        var oldMotor = this.getConfigurator().getSimpleMotor(newSettings.motorId, newSettings.colorCode, newSettings.interiorCode, newSettings.getPackageArray());

        if (oldMotor != null) {
            successCallback(oldMotor);
        } else {

            this.getConfigurator().configureMotor(newSettings, this.step2RenderingType(stepName), successCallback);
        }
    }

    // returns true if configurator has initialized with a given configuration ID
    this.isInitWithConfigurationId = function () {
        return _initWithConfigurationId;
    };

};

// object that stores a solution of conflict that can be used for automatic conflict solution
HtmlCc.Workflow.ConflictSolutionType = function (motor, solutionType, subject) {
    /// <signature>
    /// <param name='motor' type='MotorType' />
    /// <param name='solutionType' type='String'>"add" | "remove"</param>
    /// <param name='subject' type='Object'>package code</param>
    /// <returns type='HtmlCc.Workflow.ConflictSolutionType'/>
    /// </signature>

    this.addCodes = '';
    this.removeCodes = '';
    this.solutionType = null;
    this.solutionSubject = null;

    if (motor != null && solutionType != null && subject != null) {
        // only this case makes sense for initialization
        var toAdd = [];
        var toRemove = [];
        if (motor.getConflicts() != null) {
            if ($.isArray(motor.getConflicts().getAdd())) {
                $.each(motor.getConflicts().getAdd(), function () {
                    toAdd.push(this.getCode());
                });
            }
            if ($.isArray(motor.getConflicts().getRemove())) {
                $.each(motor.getConflicts().getRemove(), function () {
                    toRemove.push(this.getCode());
                });
            }
        }
        this.addCodes = toAdd.sort().join(',');
        this.removeCodes = toRemove.sort().join(',');

        var subjects = null;
        switch (solutionType) {
            case 'add':
                this.solutionType = solutionType;
                subjects = toAdd;
                break;
            case 'remove':
                this.solutionType = solutionType;
                subjects = toRemove;
                break;
            default:
                throw new Error('Solution type is not "add" nor "remove".');
        }

        for (var i = 0; i < subjects.length; i++) {
            if (subjects[i] == subject) {
                this.solutionSubject = subject;
                break;
            }
        }
        if (this.solutionSubject == null) {
            throw new Error('Subject of solution is not in add/remove items.');
        }
    }
};

HtmlCc.Workflow.ConflictSolutionTools = HtmlCc.Workflow.ConflictSolutionTools || {};

// determines whether motor matches conflict solution
HtmlCc.Workflow.ConflictSolutionTools.doMatch = function (motor, conflictSolution) {
    /// <signature>
    /// <param name='motor' type='MotorType' />
    /// <param name='conflictSolution' type='HtmlCc.Workflow.ConflictSolutionType'></param>
    /// <returns type='bool'>true whether motor is in conflict state and conflict solution solves the conflict</returns>
    /// </signature>

    if (motor.getConflicts() != null
        && ((motor.getConflicts().getAdd() != null && motor.getConflicts().getAdd().length > 0)
            || (motor.getConflicts().getRemove() != null && motor.getConflicts().getRemove().length > 0))) {
        // motor has a conflict
        var addPackages = [];
        var removePackages = [];
        $.each(motor.getConflicts().getAdd() || [], function () {
            addPackages.push(this.getCode());
        });
        $.each(motor.getConflicts().getRemove() || [], function () {
            removePackages.push(this.getCode());
        });

        var addCodes = addPackages.sort().join(',');
        var removeCodes = removePackages.sort().join(',');

        if (addCodes == conflictSolution.addCodes && removeCodes == conflictSolution.removeCodes) {
            // match found
            return true;
        }
    }
    return false;
};

// apply the solution to settings; new object of settings is returned
HtmlCc.Workflow.ConflictSolutionTools.applySolution = function (settings, conflictSolution) {
    /// <signature>
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='conflictSolution' type='HtmlCc.Workflow.ConflictSolutionType'></param>
    /// <returns type='HtmlCc.Workflow.SettingsType'>New settings with applied conflict solution.</returns>
    /// </signature>
    var newSettings = new HtmlCc.Workflow.SettingsType(settings);
    switch (conflictSolution.solutionType) {
        case 'add':
            newSettings.addPackage(conflictSolution.solutionSubject);
            break;
        case 'remove':
            newSettings.removePackage(conflictSolution.solutionSubject);
            break;
        default:
            throw new Error('Invalid conflict solution type "{0}".'.format(conflictSolution.solutionType));
    }
    return newSettings;
};

HtmlCc.Workflow.ImageExactType = {
    Like_Offline_Low: 'Like_Offline_Low',
    Like_Offline_High: 'Like_Offline_High',
    Like_Offline_Preview: 'Like_Offline_Preview',
    Offline_Preview: 'Offline_Preview',
    Online_Low: 'Online_Low',
    Online_High: 'Online_High',
    Wallpaper: 'Wallpaper'
};

HtmlCc.Workflow.ImageExactBuilder = function (configurator, settings, viewpointName, imageType) {
    /// <signature>
    /// <param name='configurator' type='HtmlCc.Api.Configurator' />
    /// <param name='settings' type='HtmlCc.Workflow.SettingsType' />
    /// <param name='viewpointName' type='String' />
    /// <param name='imageType' type='String'>Like_Offline_Low | Like_Offline_High | Like_Offline_Preview | Online_Low | Online_High</param>
    /// <returns type='String' />
    /// </signature>

    if (!(configurator instanceof HtmlCc.Api.Configurator)) {
        throw new Error('Object configurator is not instance of HtmlCc.Api.Configurator.');
    }

    if (!(settings instanceof HtmlCc.Workflow.SettingsType)) {
        throw new Error('Object settings is not instance of HtmlCc.Workflow.SettingsType.');
    }

    if (typeof viewpointName !== 'string') {
        throw new Error('Parameter viewpointName is not a string.');
    }

    if (typeof imageType !== 'string') {
        throw new Error('Parameter imageType is not a string.');
    }

    if (!(imageType in HtmlCc.Workflow.ImageExactType)) {
        throw new Error('Parameter imageType is not in valid range of values.');
    }

    var motorId = settings.motor;
    var motor = null;
    var equipment = null;
    if (motorId == null || motorId == '') {
        // motorId is not exists, try to get it from equipment
        var equipmentId = settings.equipment;
        if (equipmentId == null || equipmentId == '') {
            // settings is not defined, I have to get it from model's default
            equipmentId = configurator.getConfiguredMotor().getEquipment().getModel().getDefaultEquipmentId();
        }

        equipment = configurator.getConfiguredMotor().getEquipment().getModel().getEquipment(equipmentId);
        if (equipment == null) {
            equipment = configurator.getConfiguredMotor().getEquipment().getModel().getEquipment(configurator.getConfiguredMotor().getEquipment().getModel().getDefaultEquipmentId());
        }

        if (equipment == null) {
            equipment = configurator.getConfiguredMotor().getEquipment();
        }

        equipmentId = equipment.getId();

        motorId = equipment.getDefaultMotorId();
    }


    var acessoriesItems = settings.viewstate.accessoriesItems == undefined ? "" : settings.viewstate.accessoriesItems.join(",")
    var selectedAcessoriesItems = settings.viewstate.selectedAccessories == undefined ? "" : settings.viewstate.selectedAccessories.join(",")
    var exteriorCode = settings.color;
    var interiorCode = settings.interior;
    var extraEq = settings.getPackagesArray();
    if (acessoriesItems != "") {
        for (var i = 0; i < settings.viewstate.accessoriesItems.length; i++) {
            for (var j = 0; j < extraEq.length ; j++) {
                if (extraEq[j] == settings.viewstate.accessoriesItems[i]) {
                    extraEq.splice(j, 1);
                }
            }
            
        }
    }

    var packages = extraEq.join(",");

    

    if (configurator.getConfiguredMotor().getId() == motorId) {
        motor = configurator.getConfiguredMotor();
    } else {
        motor = configurator.getSimpleMotor(motorId, settings.color, settings.interior, settings.getPackagesArray());
    }

    if (exteriorCode == null || exteriorCode == '') {
        exteriorCode = motor.getSelectedColor().getCode();
    }
    if (interiorCode == null || interiorCode == '') {
        interiorCode = motor.getSelectedInterior().getCode();
    }
    if (packages == null) {
        packages = '';
    }   

   


    if (motor == null) {
        HtmlCc.Libs.Log.warn('Motor cant be found to draw exterior presentation properly.');
        motor = configurator.getConfiguredMotor();
    }


    var linkParams = {
        modelCode: configurator.getModelCode(),
        carlineCode: configurator.getCarlineCode(),
        exterior: exteriorCode,
        interior: interiorCode,
        renderingType: imageType,
        motorId: motor.getId(),
        viewpointName: viewpointName,
        instanceName: configurator.getInstanceName(),
        salesProgramName: configurator.getSalesProgramName(),
        language: configurator.getCulture(),
        packages: packages,
        version: configurator.getVersion(),
        variantSetVersion: configurator.getVariantSetVersion(),
        acessoriesItems: selectedAcessoriesItems
    };
    
    var linkParamsArray = [];
    $.each(linkParams, function (key, value) {
        linkParamsArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });

    var src = HtmlCc.Workflow.GetUrl('/ConfigureRefactored/ImageExact?') + linkParamsArray.join('&');


    //// {0} model, {1} carline, {2} color, {3} interior, {4} rendering type, {5} motorid, {6} viewpoint, {7} instance, {8} salesprogram, {9} culture, {10} version
    //var src = '/ConfigureRefactored/ImageExact?modelCode={0}&carlineCode={1}&exterior={2}&interior={3}&renderingType={4}&motorId={5}&viewpointName={6}&instanceName={7}&salesProgramName={8}&language={9}&packages={10}&version={11}&isPreview={12}'.format(
    //    settings.model,
    //    settings.carline,
    //    settings.color,
    //    settings.interior,
    //    'standard',
    //    settings.motor,
    //    viewpointName,
    //    settings.instance,
    //    settings.salesprogram,
    //    settings.culture,
    //    settings.packages,
    //    configurator.getVersion(),
    //    preview ? 'true' : 'false'
    //    );
    return src;
};