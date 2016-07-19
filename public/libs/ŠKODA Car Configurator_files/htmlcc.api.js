/// <reference path="../json2.js" /> 
/// <reference path="../jquery-1.7.2.js" /> 
/// <reference path="strings.libs.js" /> 
/// <reference path="htmlcc.libs.js" /> 
/// <reference path="htmlcc.alert.js" /> 
/// <reference path="htmlcc.financial.js" /> 
/// <reference path="htmlcc.garage.js" /> 
/*
 *  CarConfigurator JavaScript API.
 *
 *  Povides encapsulation over Skoda Auto's internal API.
 *
 *  Requires: jquery; string.libs.jsHtmlCc.Api.ComparisonDisplayType
 *
 *  Date: 6/2012
 *  Author: jobratil @ Trask solutions a.s.
 *  © ŠKODA AUTO a.s. 2012
 */
// namespace HtmlCc
var HtmlCc = HtmlCc || {};

// namespace HtmlCc.Api
HtmlCc.Api = HtmlCc.Api || {};

HtmlCc.Api.AppSettings = (function () {
    var private = {
        'GarageRequestTimeout': '120000',
    };

    return {
        get: function (name) { return private[name]; }
    };
})();

//Vrací Url + dealer, pokud local.href obsahuje řetězec dealer
HtmlCc.Api.GetUrl = function (localUrl) {
    if (localUrl != null && location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0) {
        return '/dealer{0}'.format(localUrl);
    }
    else {
        return localUrl;
    }
}

// type of interior
HtmlCc.Api.InteriorType = function (code, init) {
    /// <signature>
    /// <param name='code' type='String' />
    /// <param name='init' type='Object' />
    /// <returns type='HtmlCc.Api.InteriorType'/>
    /// </signature>
    init = init || {};
    if (code === undefined) {
        throw new Error("Code is not defined.");
    }
    
    var _code = code;
    var _image = null;
    if (init.image != null || init.image instanceof HtmlCc.Api.ImageType) {
        _image = init.image;
    }
    var _name = init.name || null;
    var _price = init.price != null ? parseFloat(init.price) : null;
    var _priceString = init.priceString || null;
    var _sort = init.sort || 0;
    var _selectable = true;
    var _description = '';

    this.getCode = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _code;
    };
    this.getImage = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _image;
    };
    this.setImage = function (image) {
        /// <signature>
        /// <param name='image' type='String' />
        /// </signature>
        _image = image;
    };
    this.getName = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _name;
    };
    this.setName = function (name) {
        /// <signature>
        /// <param name='name' type='String' />
        /// </signature>
        _name = name;
    };
    this.getPrice = function () {
        /// <signature>
        /// <returns type='double'/>
        /// </signature>
        return _price;
    };
    this.setPrice = function (price) {
        /// <signature>
        /// <param name='price' type='double' />
        /// </signature>
        _price = (price !== null && price !== undefined) ? parseFloat(price) : null;
    };
    this.getPriceString = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _priceString;
    };
    this.setPriceString = function (priceString) {
        /// <signature>
        /// <param name='priceString' type='String' />
        /// </signature>
        _priceString = priceString;
    };
    this.getSort = function () {
        /// <signature>
        /// <returns type='int'/>
        /// </signature>
        return _sort;
    };
    this.setSort = function (sort) {
        /// <signature>
        /// <param name='sort' type='int' />
        /// </signature>
        _sort = parseInt(sort);
    };
    this.getSelectable = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _selectable;
    };
    this.setSelectable = function (selectable) {
        /// <signature>
        /// <param name='selectable' type='bool' />
        /// </signature>
        _selectable = (new Boolean(selectable) == true);
    };
    this.getDescription = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _description;
    };
    this.setDescription = function (description) {
        /// <signature>
        /// <param name='description' type='String' />
        /// </signature>
        _description = description;
    };
};

// enum of image rendering status
HtmlCc.Api.ImageRenderingStatusEnum = {
    // server is unavailable
    UNAVAILABLE: {
        value: 0,
        name: 'UNAVAILABLE'
    },
    // server is rendering an image
    RENDERING: {
        value: 1,
        name: 'RENDERING'
    },
    // image is rendered and ready for use
    RENDERED: {
        value: 2,
        name: 'RENDERED'
    },
    // an error occured during rendering
    ERROR: {
        value: 3,
        name: 'ERROR'
    },
    // unknown status of rendering or image is not rendered so it is not applicable
    UNKNOWN: {
        value: 4,
        name: 'UNKNOWN'
    }
};

// enum of color type
HtmlCc.Api.ColorTypeEnum = {
    STANDARD: {
        value: 0,
        name: 'STANDARD'
    },
    FLEET: {
        value: 1,
        name: 'FLEET'
    },
    METALIC: {
        value: 2,
        name: 'METALIC'
    },
    ROOF: {
        value: 3,
        name: 'ROOF'
    }
};

// enum of color type
HtmlCc.Api.PackageGroupTypeEnum = {
    STANDARD: {
        value: 0,
        name: 'STANDARD'
    },
    ACCESSORIES: {
        value: 8,
        name: 'ACCESSORIES'
    }
};


// enum of disclamer source
HtmlCc.Api.SourceType = {
    RESX: {
        name: 'RESX',
        id: 0
    },
    TEXT: {
        name: 'TEXT',
        id: 1
    }
};


// enum of virtual item comparison display type
HtmlCc.Api.ComparisonDisplayType = {
    POINT: {
        name: 'POINT',
        id: 1
    },
    TEXT: {
        name: 'TEXT',
        id: 2
    }
};




// enum of Fd Proxy cache params  type
HtmlCc.Api.FdProxyParamsCacheTypeEnum = {
    PerMbv: {
        value: 0,
        name: 'PerMbv'
    },
    PerModel: {
        value: 1,
        name: 'PerModel'
    },
    PerCarline: {
        value: 2,
        name: 'PerCarline'
    }
};

// type of color
HtmlCc.Api.ColorType = function (code) {
    /// <signature>
    /// <param name='code' type='String' />
    /// <returns type='HtmlCc.Api.ColorType'/>
    /// </signature>
    var _code = code;
    var _cssColor = '#ffffff';
    var _cssRoofColor = '#ffffff';
    var _roof = false;
    var _name = '';
    var _price = 0;
    var _priceString = "-";
    var _type = HtmlCc.Api.ColorTypeEnum.STANDARD;
    var _selectable = true;
    var _image = new HtmlCc.Api.ImageType();

    this.getCode = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _code;
    };
    this.getCssColor = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _cssColor;
    };
    this.getCssRoofColor = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _cssRoofColor;
    };
    this.isRoof = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _roof;
    };
    this.getName = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _name;
    };
    this.getPrice = function () {
        /// <signature>
        /// <returns type='double'/>
        /// </signature>
        return _price;
    };
    this.getPriceString = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _priceString;
    };
    this.getType = function () {
        /// <signature>
        /// <returns type='Object'/>
        /// </signature>
        return _type;
    };

    this.setCssColor = function (cssColor) {
        /// <signature>
        /// <param name='cssColor' type='String' />
        /// </signature>
        _cssColor = cssColor;
    };
    this.setCssRoofColor = function (cssRoofColor) {
        /// <signature>
        /// <param name='cssRoofColor' type='String' />
        /// </signature>
        _cssRoofColor = cssRoofColor;
    };
    this.setRoof = function (roof) {
        /// <signature>
        /// <param name='roof' type='bool' />
        /// </signature>
        _roof = (new Boolean(roof) == true);
    };
    this.setName = function (name) {
        /// <signature>
        /// <param name='name' type='String' />
        /// </signature>
        _name = name;
    };
    this.setPrice = function (price) {
        /// <signature>
        /// <param name='price' type='double' />
        /// </signature>
        _price = parseFloat(price);
    };
    this.setPriceString = function (priceString) {
        /// <signature>
        /// <param name='priceString' type='String' />
        /// </signature>
        _priceString = priceString;
    };
    this.setType = function (colorType) {
        /// <signature>
        /// <param name='colorType' type='Object' />
        /// </signature>
        if (typeof colorType === 'number') {
            var num = parseInt(colorType);
            $.each(HtmlCc.Api.ColorTypeEnum , function (k, v) {
                if (num == v.value) {
                    _type = v;
                }
            });
        } else if (typeof colorType === 'object' && 'value' in colorType && typeof colorType.value === 'number') {
            this.setType(colorType.value);
        } else if (typeof colorType === 'string') {
            $.each(HtmlCc.Api.ColorTypeEnum , function (k, v) {
                if (colorType == v.name) {
                    _type = v;
                }
            });
        } else {
            throw new Error("Unresolved color type.");
        }
    };
    this.getSelectable = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _selectable;
    };
    this.setSelectable = function (selectable) {
        /// <signature>
        /// <param name='selectable' type='bool' />
        /// </signature>
        _selectable = (new Boolean(selectable) == true);
    }
    this.getImage = function () {
        /// <signature>
        /// <returns type='bool'/>
        /// </signature>
        return _image;
    };
    this.setImage = function (image) {
        /// <signature>
        /// <param name='selectable' type='bool' />
        /// </signature>
        if (!(image instanceof HtmlCc.Api.ImageType)) {
            throw new Error('Object image is not instance of HtmlCc.Api.ImageType');
        }
        _image = image;
    };
};

// type of image
HtmlCc.Api.ImageType = function (init) {
    /// <signature>
    /// <param name='init' type='Object' />
    /// <returns type='HtmlCc.Api.ImageType'/>
    /// </signature>
    init = init || {};
    // URL of image
    var _url = init.url || null;

    var _previewUrl;
    // width of image
    var _width = init.width || null;
    // height of image
    var _height = init.height || null;
    // angle of rendered rotation image
    var _angle = init.angle || null;
    // scene/viewpoint of rendered image
    var _viewpoint = init.viewpoint || null;
    // querystring of rendered image
    var _queryString = init.querystring || null;
    // status of rendered image
    var _status = init.status || HtmlCc.Api.ImageRenderingStatusEnum.UNKNOWN;

    this.getUrl = function () {
        if (_url != null && location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0) {
            if (_url.toLowerCase().indexOf('configurerefactored') > 0)
            return '/dealer{0}'.format(_url);
        }
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _url;
    };
    this.setUrl = function (url) {
        /// <signature>
        /// <param name='url' type='String' />
        /// </signature>
        _url = url;
    };
    this.getPreviewUrl = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _previewUrl;
    };
    this.setPreviewUrl = function (url) {
        /// <signature>
        /// <param name='url' type='String' />
        /// </signature>
        _previewUrl = url;
    };

    this.getWidth = function () {
        /// <signature>
        /// <returns type='int'/>
        /// </signature>
        return _width;
    };
    this.setWidth = function (width) {
        /// <signature>
        /// <param name='width' type='int' />
        /// </signature>
        _width = parseInt(width);
    };
    this.getHeight = function () {
        /// <signature>
        /// <returns type='int'/>
        /// </signature>
        return _height;
    };
    this.setHeight = function (height) {
        /// <signature>
        /// <param name='height' type='int' />
        /// </signature>
        _height = parseInt(height);
    };
    this.getAngle = function () {
        /// <signature>
        /// <returns type='int'/>
        /// </signature>
        return _angle;
    };
    this.setAngle = function (angle) {
        /// <signature>
        /// <param name='angle' type='int' />
        /// </signature>
        _angle = angle === undefined ? undefined : parseInt(angle);
    };
    this.getViewpoint = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _viewpoint;
    };
    this.setViewpoint = function (viewpoint) {
        /// <signature>
        /// <param name='viewpoint' type='String' />
        /// </signature>
        _viewpoint = viewpoint;
    };
    this.getQueryString = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _queryString;
    };
    this.setQueryString = function (queryString) {
        /// <signature>
        /// <param name='queryString' type='String' />
        /// </signature>
        _queryString = queryString;
    };
    this.getStatus = function () {
        /// <signature>
        /// <returns type='Object'/>
        /// </signature>
        return _status;
    }
    this.setStatus = function (status) {
        /// <signature>
        /// <param name='status' type='Object,String' />
        /// </signature>
        if (status in HtmlCc.Api.ImageRenderingStatusEnum) {
            _status = HtmlCc.Api.ImageRenderingStatusEnum[status];
        } else {
            var found = false;
            $.each(HtmlCc.Api.ImageRenderingStatusEnum, function (k, v) {
                if (v === status) {
                    _status = status;
                    found = true;
                }
            });
            if (found === false) {
                throw new Error("Status is not value from HtmlCc.Api.ImageRenderingStatusEnum.");
            }
        }
    };

};

// Car Configurator object
// ccSettings is object with initial settings
HtmlCc.Api.Configurator = function (ccSettings) {
    var thisConfigurator = this;

    // Type of Sales program setting
    var SettingsType = HtmlCc.Api.SettingsType = function (instanceName, salesprogramName, culture, modelCode) {
        /// <signature>
        /// <param name='instanceName' type='String' />
        /// <param name='salesprogramName' type='String' />
        /// <param name='culture' type='String' />
        /// <returns type='SettingsType'/>
        /// </signature>
        var _instanceName = instanceName;
        var _salesprogramName = salesprogramName;
        var _culture = culture;
        var _modelCode = modelCode;
        var _salesProgramSettings = [];
        // ajax timeout in miliseconds
        var _timeout = 180000;

        var _instanceId = null;
        var _salesprogramId = null;
        var _importerLinks = null;
        var _version = null;
        var _variantSetVersion = null;
        var _comparisonTranslVersion = null;
        var _importerDisclamerSettings = null;
        var _wheelDisplaySettings = null;
        var _energyClassSetupSettings = null;
        var _summaryTechDataList = null;
        var _colorTypeNameSettings = null;
        var _entryDialogSettings = null;

        var _useFdProxy = false;
        var _fdProxyDomain = '';
        var _fdProxyParamsCaching = "PerMbvCode";
        var _pageGroupName = "Car Configurator";

        // increment/change this number to invalidate old cache
        var _protocolVersion = '1.0.49.4.25';

        var _facebookId = '155231401266112';

        // you probably don't need to change this
        var _versionsUrl = HtmlCc.Libs.getBaseUrl() + 'Version';
        var _configureUrl = HtmlCc.Libs.getBaseUrl() + 'Configure';


        var _configuratorDealerHomepageUrl = window.location.protocol + '//' + window.location.host + '/dealer/{0}/{1}/{2}'.format(encodeURIComponent(_instanceName), encodeURIComponent(_salesprogramName), encodeURIComponent(_culture));

        var _configuratorHomepageUrl = 'http://www.skoda-auto.com/?app=configurator&instance={0}&salesprogram={1}&culture={2}'.format(encodeURIComponent(_instanceName), encodeURIComponent(_salesprogramName), encodeURIComponent(_culture));

        var _homepageUrl = 'http://www.skoda-auto.com/?app=homepage&instance={0}&salesprogram={1}&culture={2}'.format(encodeURIComponent(_instanceName), encodeURIComponent(_salesprogramName), encodeURIComponent(_culture));

        var _qrCodeGeneratorUrlFormat = '';
        var _hasExtraPrices = false;

        var _isLoadingVredModel = true;

        this.getPageGroupName = function () {
            return _pageGroupName;
        }

        this.getCCContext = function () {
            if (window.location.href.toLowerCase().indexOf("dealer") > -1) {
                return "Dealer"
            }
            else {
                return "Importer"
            }
        }

        this.getPageName = function (title, page) {
            return title + " | " + page;
        }

        this.getHomepageUrl = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _homepageUrl;
        };
        this.getConfiguratorHomepageUrl = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _configuratorHomepageUrl;
        };

        this.getDealerConfiguratorHomepageUrl = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _configuratorDealerHomepageUrl;
        };

        this.getQrCodeGeneratorUrlFormat = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _qrCodeGeneratorUrlFormat;
        };
        this.getInstanceName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _instanceName;
        };
        this.getSalesprogramName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _salesprogramName;
        };

        this.getImporterLinks = function () {
            /// <signature>
            /// <returns type='List<ImporterLink>'/>
            /// </signature>
            return _importerLinks;
        };

        this.getCulture = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _culture;
        };

        this.getVersionsUrl = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _versionsUrl;
        };
        this.setVersionUrl = function (versionUrl) {
            /// <signature>
            /// <param name='versionUrl' type='String'  />
            /// </signature>
            _versionsUrl = versionUrl;
        };
        this.getConfigureUrl = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _configureUrl;
        };
        this.setConfigureUrl = function (configureUrl) {
            /// <signature>
            /// <param name='configureUrl' type='String'  />
            /// </signature>
            _configureUrl = configureUrl;
        };
        this.getTimeout = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _timeout;
        };
        this.setTimeout = function (timeout) {
            /// <signature>
            /// <param name='timeout' type='int'  />
            /// </signature>
            var parsedValue = parseInt(timeout);
            _timeout = parsedValue > 0 ? parsedValue : _timeout;
        }
        this.isUseFdProxy = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _useFdProxy;
        };
        this.getFdProxyDomain = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _fdProxyDomain;
        };

        this.getFdProxyParamsCaching = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _fdProxyParamsCaching;
        };
        this.getSalesprogramId = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            if (_salesprogramId == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _salesprogramId;
        };
        this.getInstanceId = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            if (_instanceId == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _instanceId;
        };
        this.getVersion = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            if (_version == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _version;
        };

        this.getVariantSetVersion = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            if (_variantSetVersion == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _variantSetVersion;
        };

        this.getComparisonTranslVersion = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            if (_comparisonTranslVersion == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _comparisonTranslVersion;
        };

        this.getColorTypeNameSettings = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            if (_colorTypeNameSettings == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _colorTypeNameSettings;
        }

        this.getSummaryTechDataList = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            if (_summaryTechDataList == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _summaryTechDataList;
        }

        this.getImporterDisclamerSettings = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            if (_importerDisclamerSettings == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _importerDisclamerSettings;
        };

        this.getEnergyClassSetupSettings = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            if (_energyClassSetupSettings == null) {
                return null;
            }
            return _energyClassSetupSettings;
        };

        this.getWheelDisplaySettings = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            if (_wheelDisplaySettings == null) {
                throw new Error("Car configurator is not initialized yet.");
            }
            return _wheelDisplaySettings;
        };

        this.getEntryDialogSettings = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            //if (_entryDialogSettings == null) {
            //    throw new Error("Car configurator is not initialized yet.");
            //}
            return _entryDialogSettings;
        };


        this.getModelCode = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _modelCode;
        };

        this.getModelCodeShort = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _modelCode.substr(0, 2);
        };

        this.setModelCode = function (modelCode) {
            /// <signature>
            /// <param name='configureUrl' type='String'  />
            /// </signature>
            _modelCode = modelCode;
        };
        // defines version of protocol (for invalidating cache by application)
        this.getProtocolVersion = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _protocolVersion;
        };

        this.getFacebookId = function() {
            return _facebookId;
        };

        this.getHasExtraPrices = function () {
            return _hasExtraPrices;
        };

        this.setIsLoadingVredModel = function (isLoadingVredModel) {
            _isLoadingVredModel = isLoadingVredModel;
        };

        this.isLoadingVredModel = function () {
            return _isLoadingVredModel;
        };
        
        // gets sales program setting by key
        this.getSalesProgramSetting = function (key) {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>

            if (_salesProgramSettings != null > 0 && _salesProgramSettings.hasOwnProperty(key)) {
                return _salesProgramSettings[key];
            }

            return null;
        };

        // asynchronous initialization of version mark
        this.init = function (afterSuccessCallback, afterErrorCallback) {
            /// <signature>
            /// <param name='afterSuccessCallback' type='Function' />
            /// <param name='afterErrorCallback' type='Function' />
            /// <returns type='SettingsType'/>
            /// </signature>
            afterSuccessCallback = afterSuccessCallback || function () { };
            afterErrorCallback = afterErrorCallback || function () { };

            // reset data retrieval
            var ajaxFunc = function () {
                $.ajax(ajaxParams);
            };
            var ajaxParams = {
                'url': this.getVersionsUrl(),
                'data': { 'instanceName': this.getInstanceName(), 'salesProgramName': this.getSalesprogramName(), 'culture': this.getCulture(), 'protocol': this.getProtocolVersion(), 'modelCode': this.getModelCode() },
                'dataType': 'json',
                'type': 'GET',
                'success': function (data, textStatus, jqXHR) {
                    if (data.SalesProgram == null) {
                        HtmlCc.Libs.Log.error('Salesprogram is not returned! Configurator cannot be started.');
                        afterErrorCallback();
                    }
                    _salesprogramId = data.SalesProgram.SalesProgramId;
                    _instanceId = data.SalesProgram.InstanceId;
                    _version = data.SalesProgram.Version;
                    _variantSetVersion = data.SalesProgram.VariantSetVersion;
                    _comparisonTranslVersion = data.SalesProgram.VirtualCfgTranslationVersion
                    if (data.ImporterDisclamerSettings != null) {
                        _importerDisclamerSettings = data.ImporterDisclamerSettings
                    }
                    if (data.SummaryTechDataListSettings != null) {
                        _summaryTechDataList = data.SummaryTechDataListSettings
                    }
                    if (data.ColorTypeNameSettings != null) {
                        _colorTypeNameSettings = data.ColorTypeNameSettings
                    }
                    if (data.EnergyClassSetupSettings != null) {
                        _energyClassSetupSettings = data.EnergyClassSetupSettings
                    }
                    if (data.WheelDisplaySettings != null) {
                        _wheelDisplaySettings = data.WheelDisplaySettings
                    }

                    if (data.EntryDialogSettings != null) {
                        _entryDialogSettings = data.EntryDialogSettings
                    }

                    if (data.UseFdProxy != null) {
                        _useFdProxy = data.UseFdProxy;
                    }
                    if (data.FdProxyDomain != null) {
                        _fdProxyDomain = data.FdProxyDomain;
                    }
                    if (data.FdProxyCachingType != null) {
                        _fdProxyParamsCaching = data.FdProxyCachingType;
                    }

                    if (data.SalesProgram.ConfiguratorHomePageUrl != null && data.SalesProgram.ConfiguratorHomePageUrl != '') {
                        _configuratorHomepageUrl = data.SalesProgram.ConfiguratorHomePageUrl.format(window.location.hostname + (window.location.port ? ':' + window.location.port : ''));
                    }
                    if (data.SalesProgram.HomePageUrl != null && data.SalesProgram.HomePageUrl != '') {
                        _homepageUrl = data.SalesProgram.HomePageUrl.format(window.location.hostname + (window.location.port ? ':' + window.location.port : ''));
                    }
                    if (data.QRCodeGeneratorUrlFormat != null && data.QRCodeGeneratorUrlFormat != '') {
                        _qrCodeGeneratorUrlFormat = data.QRCodeGeneratorUrlFormat;
                    }
                    if (data.SalesProgram.ImporterLinks != null) {
                        _importerLinks = [];
                        for (var i = 0; i < data.SalesProgram.ImporterLinks.length;i++) {
                            var link = data.SalesProgram.ImporterLinks[i];
                            _importerLinks.push(new HtmlCc.Api.ImporterLinkType(link.Text, link.Url));
                        }
                    }
                    if (data.SalesProgram.HasExtraPrices != null) {
                        _hasExtraPrices = data.SalesProgram.HasExtraPrices;
                    }

                    if (data.SalesProgram.Settings != null) {
                        _salesProgramSettings = data.SalesProgram.Settings;
                    }

                    afterSuccessCallback();
                },
                'error': function (jqXHR, textStatus, errorThrown) {
                    //var errorMessage = "Problem";

                    //if (confirm(errorMessage + "\n" + 'AjaxRetry'.resx())) {
                    //    ajaxFunc();
                    //} else {
                    //    afterErrorCallback();
                    //}
                    
                    var ccConfirm = new HtmlCc.Alert();
                    //ccConfirm.setCancelCallback(function () {
                    //    afterErrorCallback();
                    //});
                    //ccConfirm.setCancelLabel('AlertCancelLabel'.resx());
                    ccConfirm.setOkCallback(function () {
                        ajaxFunc();
                    });
                    ccConfirm.setOkLabel('AlertOkLabel'.resx());
                    ccConfirm.setMessageLabel('InitializationFailedMessage'.resx().format());
                    ccConfirm.renderAlert();
                },
                'timeout': this.getTimeout()
            };

            ajaxFunc();
        }
    };




    // displays a choice to user with ability to retry or not retry the ajax call
    var ajaxErrorHandling = function (jqXHR, retryCallback, cancelCallback, textStatus, errorThrown) {
        /// <signature>
        /// <param name='jqXHR' type='XMLHttpRequest' />
        /// <param name='retryCallback' type='Function' />
        /// <param name='cancelCallback' type='Function' />
        /// <param name='textStatus' type='String' />
        /// <param name='errorThrown' type='String' />
        /// <returns type='PackageType'/>
        /// </signature>
        retryCallback = retryCallback || function () { };
        cancelCallback = cancelCallback || function () { };

        var okCallBack = function () { location.reload(); }
        var errorMessage = 'CommunicationErrorMessage'.resx().format(textStatus, errorThrown);

        if (typeof textStatus === 'string' && textStatus.toLowerCase() == 'timeout') {
            errorMessage = 'CommunicationTimeoutMessage'.resx();
        }

        else if (typeof textStatus === 'string' && textStatus.toLowerCase() == 'user') {
            errorMessage = errorThrown;
            okCallBack = function () { window.history.back(); }
        }
        else {
            errorMessage = 'CommunicationFailedMessage'.resx();
        }

        HtmlCc.Libs.Log.error('An error ocured in network connection.');
        HtmlCc.Libs.Log.error('Text status: {0}'.format(textStatus));
        HtmlCc.Libs.Log.error('Error thrown: {0}'.format(errorThrown));

        //if (confirm(errorMessage)) {
        //    retryCallback();
        //} else {
        //    cancelCallback();
        //}

        var ccConfirm = new HtmlCc.Alert();

        ccConfirm.setOkCallback(okCallBack);
        //ccConfirm.setCancelCallback(function () {
        //    cancelCallback();
        //});
        //ccConfirm.setCancelLabel('AlertCancelLabel'.resx());
        ccConfirm.setOkLabel('AlertOkLabel'.resx());
        ccConfirm.setMessageLabel(errorMessage);
        ccConfirm.renderAlert();

    };

    // this is a storage of all configurations for use
    var ConfigurationStorageType = HtmlCc.Api.ConfigurationStorageType = function (settings, carConfiguration) {
        /// <signature>
        /// <param name='settings' type='Object' />
        /// <param name='carConfiguration' type='CarConfigurationType' />
        /// <returns type='ConfigurationStorageType'/>
        /// </signature>
        var thisConfigurationStorage = this;

        if (settings == null || !(settings instanceof SettingsType)) {
            throw new Error("Setting is not instance of setting type.");
        }

        if (!(carConfiguration instanceof CarConfigurationType)) {
            throw new Error('CarConfiguration is not instance of CarConfigurationType.');
        }

        // core settings
        var _settings = settings;

        // car configuration - the current configuration
        var _carConfiguration = carConfiguration;

        // models; [version][modelId]; value - model object
        var _models = {};

        // motors; [version][motorId][configHash]; value - motor object
        var _motors = {};

        // simpleMotors; [version][key - motorId][configHash]; value - motor object
        var _simpleMotors = {};

        // motorLookups; [version][motorId]
        var _motorLookups = {};

        // the last getted hash of simple motor for viewpoints
        var _lastSimpleMotorBeforeExtraEquipment = '';

        // computes 'hash string' from configuration
        this.computeHash = function (color, interior, packages) {
            /// <signature>
            /// <param name='color' type='HtmlCc.Api.ColorType' />
            /// <param name='interior' type='HtmlCc.Api.InteriorType' />
            /// <param name='packages' type='Array' elementType='PackageType'  />
            /// <returns type='String'/>
            /// </signature>
            var result = [];
            if (color instanceof HtmlCc.Api.ColorType) {
                result.push(color.getCode());
            } else if (color == null || color.length == 0) {
                result.push('');
            } else if ((typeof color === 'string') && (color.length == 4 || color.length == 0)) {
                result.push(color);
            } else {
                throw new Error('Color is not instance of HtmlCc.Api.ColorType nor String of length 4 (or empty for default).');
            }

            if (interior instanceof HtmlCc.Api.InteriorType) {
                result.push(interior.getCode());
            } else if (interior == null || interior.length == 0) {
                result.push('');
            } else if ((typeof interior === 'string') && (interior.length == 2 || interior.length == 0)) {
                result.push(interior);
            } else {
                throw new Error('Interior is not instance of HtmlCc.Api.InteriorType nor String of lenth 2 (or empty for default).');
            }

            if ($.isArray(packages) == false) {
                var tmp = packages.split(',');
                packages = [];
                for (var i = 0; i < tmp.length; i++) {
                    if (tmp[i] != '') {
                        packages.push(tmp[i]);
                    }
                }
            }

            $.each(packages, function (k, v) {
                if (v instanceof PackageType) {
                    result.push(v.getFullCode());
                } else if (typeof v === 'string') {
                    if (v != '') {
                        result.push(v);
                    }
                } else {
                    throw new Error('Package is not instance of PackageType nor String.');
                }
            });

            return result.join(',');
        };

        // stores model
        var storeModel = function (modelData) {
            /// <signature>
            /// <param name='modelData' type='Object' />
            /// </signature>
            var model;
            var version = _settings.getVersion();
            if (!(version in _models)) {
                _models[version] = {};
            }

            if (modelData.Id in _models[version]) {
                // existing model
                model = _models[version][modelData.Id];
            } else {
                // new model
                model = new ModelType(modelData.Id);
                _models[version][modelData.Id] = model;
            }

            model.setCode(modelData.Code);
            model.setDefaultEquipmentId(modelData.DefaultEquipmentId);
            model.setDescription(modelData.Description);
            model.setName(modelData.Name);
            model.setPriceFrom(modelData.PriceFrom);
            model.setPriceFromString(modelData.PriceFromString);
            model.setRenderedCode(modelData.RenderedCode);
            // Two diferent calls are going trough this part, but only one defines agregates.
            if (modelData.FuelConsumptionCombined !== undefined) { model.setFuelConsumptionCombined(modelData.FuelConsumptionCombined); }
            if (modelData.FuelConsumptionUrban !== undefined) { model.setFuelConsumptionUrban(modelData.FuelConsumptionUrban); }
            if (modelData.FuelConsumptionExtraUrban !== undefined) { model.setFuelConsumptionExtraUrban(modelData.FuelConsumptionExtraUrban); }

            if (modelData.FuelConsumptionCombinedGas !== undefined) { model.setFuelConsumptionCombinedGas(modelData.FuelConsumptionCombinedGas); }
            if (modelData.FuelConsumptionExtraUrbanGas !== undefined) { model.setFuelConsumptionExtraUrbanGas(modelData.FuelConsumptionExtraUrbanGas); }
            if (modelData.FuelConsumptionUrbanGas !== undefined) { model.setFuelConsumptionUrbanGas(modelData.FuelConsumptionUrbanGas); }

            if (modelData.Co2Combined !== undefined) { model.setCo2Combined(modelData.Co2Combined); }
            if (modelData.Co2Gas !== undefined) { model.setCo2Gas(modelData.Co2Gas); }


            if (modelData.ModelYear != null) {
                model.setModelYear(modelData.ModelYear);
            }

            if ('Image' in modelData) {
                var image = model.getImage();
                if (image == null) {
                    image = new HtmlCc.Api.ImageType();
                    model.setImage(image);
                }
                updateImageWithImageData(image, modelData.Image);
            }

        };

        // returns model
        var getModel = function (modelId) {
            /// <signature>
            /// <param name='modelId' type='int' />
            /// <returns type='ModelType'/>
            /// </signature>
            var version = _settings.getVersion();
            if (!(version in _models)) {
                return null;
            }
            if (!(modelId in _models[version])) {
                return null;
            }
            return _models[version][modelId];
        };

        // returns model by model id
        this.getModel = function (modelId) {
            /// <signature>
            /// <param name='modelId' type='int' />
            /// <returns type='ModelType'/>
            /// </signature>
            return getModel(modelId);
        };

        // stores equipment 
        var storeEquipment = function (equipmentData) {
            /// <signature>
            /// <param name='equipmentData' type='Object' />
            /// </signature>
            var model = thisConfigurationStorage.getModel(equipmentData.ModelId);

            var equipments = model.getEquipments();
            var equipment = model.getEquipment(equipmentData.Id);
            if (equipment == null) {
                equipment = new EquipmentType(model, equipmentData.Id);
                equipments.push(equipment);
            }

            equipment.setCode(equipmentData.Code);
            equipment.setDefaultMotorId(equipmentData.DefaultMotorId);
            equipment.setName(equipmentData.Name);
            equipment.setPriceFrom(equipmentData.PriceFrom);
            equipment.setPriceFromString(equipmentData.PriceFromString);
            equipment.setSort(equipmentData.Sort);

            $.each(equipmentData.MotorLookup, function (k, v) {
                storeMotorLookup(equipment, v);
            });

            if ('Description' in equipmentData) {
                equipment.setDescription(equipmentData.Description);
            }

            if ('Image' in equipmentData && equipmentData.Image != null) {
                var image = equipment.getImage();
                if (image == null) {
                    image = new HtmlCc.Api.ImageType();
                    equipment.setImage(image);
                }
                updateImageWithImageData(image, equipmentData.Image);
            }
        };

        // store motor lookup - the essential information about motor
        var storeMotorLookup = function (equipment, motorData) {
            /// <signature>
            /// <param name='equipment' type='EquipmentType' />
            /// <param name='motorData' type='Object' />
            /// </signature>

            if (!(equipment instanceof EquipmentType)) {
                throw new Error('Equipment is not instance of EquipmentType.');
            }

            var lookup;
            var version = _settings.getVersion();

            if (!(version in _motorLookups)) {
                _motorLookups[version] = {};
            }
            var lookups = _motorLookups[version];

            if (!(motorData.Id in lookups)) {
                lookups[motorData.Id] = new MotorType(equipment, motorData.Id);
                lookups[motorData.Id].setType('lookup');
            }
            lookup = lookups[motorData.Id];

            // try to set to equipment too
            var eqLookup = equipment.getMotorLookup(motorData.Id);
            if (eqLookup == null) {
                var eqLookups = equipment.getMotorLookups();
                eqLookups.push(lookup);
            }

            lookup.setCode(motorData.Code);
            if (motorData.FuelType.Code == 'benzin') {
                lookup.setFuelType(FuelTypeEnum.PETROL);
            } else if (motorData.FuelType.Code == 'diesel') {
                lookup.setFuelType(FuelTypeEnum.DIESEL);
            } else if (motorData.FuelType.Code == 'LPG') {
                lookup.setFuelType(FuelTypeEnum.LPG);
            } else if (motorData.FuelType.Code == 'CNG') {
                lookup.setFuelType(FuelTypeEnum.CNG);
            } else {
                lookup.setFuelType(FuelTypeEnum.UNKNOWN);
            }
            lookup.setFuelNameTranslated(motorData.FuelNameTranslated);
            lookup.setMotorCubicCapacity(motorData.MotorCubicCapacity);
            if ('ActionCode' in motorData && motorData.ActionCode != null && motorData.ActionCode != '') {
                lookup.setActionCode(motorData.ActionCode);
            } else {
                lookup.setActionCode('');
            }
            lookup.setGearboxLabel(motorData.GearboxLabel);
            lookup.setName(motorData.Name);
            lookup.setPower(motorData.Power);
            lookup.setPrice(motorData.Price);
            lookup.setPriceFrom(motorData.PriceFrom);
            lookup.setPriceString(motorData.PriceString);
            lookup.setPriceFromString(motorData.PriceFromString);
            lookup.setShortName(motorData.ShortName);
            lookup.setSort(motorData.Sort);
            lookup.setMbvKey(motorData.MbvKey);
            lookup.setYear(motorData.Year);
            lookup.setEnergyClass(motorData.EnergyClass);

            lookup.setEmission(motorData.EmissionComposed.Combined);
            lookup.setEmissionGas(motorData.EmissionComposed.Gas);

            lookup.setFuelConsumption(motorData.FuelConsumption);
            lookup.setFuelConsumptionGas(motorData.FuelConsumption);
            lookup.setEngineType(motorData.EngineType);
        };

        // returns motor lookup
        var getMotorLookup = function (motorId) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <returns type='MotorType'/>
            /// </signature>
            var version = _settings.getVersion();

            if (!(version in _motorLookups)) {
                return null;
            }

            if (!(motorId in _motorLookups[version])) {
                return null;
            }

            return _motorLookups[version][motorId];
        };

        // returns motor lookup by motor id
        this.getMotorLookup = function (motorId) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <returns type='MotorType'/>
            /// </signature>
            return getMotorLookup(motorId);
        };

        // store base motor - the basic information about motor
        var storeSimpleMotor = function (equipment, motorData) {
            /// <signature>
            /// <param name='equipment' type='EquipmentType' />
            /// <param name='motorData' type='Object' />
            /// </signature>
            if (!(equipment instanceof EquipmentType)) {
                throw new Error('Equipment is not instance of EquipmentType.');
            }

            var motor;
            var version = _settings.getVersion();
            if (!(version in _simpleMotors)) {
                _simpleMotors[version] = {};
            }
            var motors = _simpleMotors[version];

            if (!(motorData.Id in motors)) {
                motors[motorData.Id] = {};
            }
            var motorHashes = motors[motorData.Id];

            var pkgs = [];
            for (var i = 0; i < motorData.Packages.length; i++) {
                if (motorData.Packages[i].HasQuantity == true) {
                    pkgs.push('{0}({1})'.format(motorData.Packages[i].Code, motorData.Packages[i].Quantity));
                } else {
                    pkgs.push(motorData.Packages[i].Code);
                }
                
            }

            var hash = thisConfigurationStorage.computeHash(motorData.SelectedColor, motorData.SelectedInterior, pkgs);
            if (!(hash in motorHashes)) {
                // create new motor
                motorHashes[hash] = new MotorType(equipment, motorData.Id);
                motorHashes[hash].setType('simple');

                // try to store it to alternative hash if selected color or interior is default
                var altHash;
                if (motorData.SelectedColor == motorData.DefaultColor) {
                    altHash = thisConfigurationStorage.computeHash('', motorData.SelectedInterior, pkgs);
                    motorHashes[altHash] = motorHashes[hash];
                }
                if (motorData.SelectedInterior == motorData.DefaultInterior) {
                    altHash = thisConfigurationStorage.computeHash(motorData.SelectedColor, '', pkgs);
                    motorHashes[altHash] = motorHashes[hash];
                }
                if (motorData.SelectedColor == motorData.DefaultColor && motorData.SelectedInterior == motorData.DefaultInterior) {
                    altHash = thisConfigurationStorage.computeHash('', '', pkgs);
                    motorHashes[altHash] = motorHashes[hash];
                }
            }

            motor = motorHashes[hash];
            motor.setQueryString(motorData.QueryString);
            // this is an ugly copy&paste from lookup, sorry
            motor.setCode(motorData.Code);
            if (motorData.FuelType.Code == 'benzin') {
                motor.setFuelType(FuelTypeEnum.PETROL);
            } else if (motorData.FuelType.Code == 'diesel') {
                motor.setFuelType(FuelTypeEnum.DIESEL);
            } else if (motorData.FuelType.Code == 'LPG') {
                motor.setFuelType(FuelTypeEnum.LPG);
            } else if (motorData.FuelType.Code == 'CNG') {
                motor.setFuelType(FuelTypeEnum.CNG);
            } else {
                motor.setFuelType(FuelTypeEnum.UNKNOWN);
            }


            if ('ActionCode' in motorData && motorData.ActionCode != null && motorData.ActionCode != '') {
                motor.setActionCode(motorData.ActionCode);
            } else {
                motor.setActionCode('');
            }
            motor.setMbvKey(motorData.MbvKey);
            motor.setYear(motorData.Year);
            motor.setGearboxLabel(motorData.GearboxLabel);
            motor.setName(motorData.Name);
            motor.setPower(motorData.Power);

            

            motor.setMotorCubicCapacity(motor.MotorCubicCapacity);


            motor.setPriceFrom(motorData.Price);
            motor.setPriceFromString(motorData.PriceString);

            motor.setPrice(motorData.TotalPrice);
            motor.setPriceString(motorData.TotalPriceString);

            motor.setPriceExteriorString(motorData.ExteriorPriceString);
            motor.setPriceInteriorString(motorData.InteriorPriceString);
            motor.setPricePackagesString(motorData.PackagesPriceString);

            motor.setEmission(motorData.EmissionComposed.Combined);
            motor.setEmissionGas(motorData.EmissionComposed.Gas);

            motor.setEnergyClass(motorData.EnergyClass);
            motor.setEngineType(motorData.EngineType);
            motor.setFuelConsumption(motorData.FuelConsumption);

            motor.setFuelConsumptionGas(motorData.FuelConsumption);

            var motorExtraPrices = motor.getTotalExtraPrices();

            if (motorData.TotalExtraPrices != null) {
                for (var i = 0; i < motorData.TotalExtraPrices.length; i++) {
                    motorExtraPrices[i] =
                        new HtmlCc.Api.ExtraPrice(
                            motorData.TotalExtraPrices[i].Title,
                            motorData.TotalExtraPrices[i].PriceFromString);
                }
            }


            if ('ExteriorPrice' in motorData) {
                motor.setPriceExterior(motorData.ExteriorPrice);
            } else {
                motor.setPriceExterior(0.0);
            }
            if ('InteriorPrice' in motorData) {
                motor.setPriceInterior(motorData.InteriorPrice);
            } else {
                motor.setPriceInterior(0.0);
            }
            if ('PackagesPrice' in motorData) {
                motor.setPricePackages(motorData.PackagesPrice);
            } else {
                motor.setPricePackages(0.0);
            }


            motor.setShortName(motorData.ShortName);
            motor.setSort(motorData.Sort);
            // end of ugly copy&paste


            // fill packages
            var packages = motor.getPackages();
            var packageLength = packages.length;

            // keep existing packages
            for (var i = 0; i < packageLength; i++) {
                var packageX = packages.shift();
                var found = false;

                for (var j = 0; j < motorData.Packages.length; j++) {
                    if (motorData.Packages[j].Code == packageX.getCode()) {
                        found = true;
                        break;
                    }
                }
                if (found === true) {
                    packages.push(packageX);
                }
            }
            // add new packages
            packageLength = packages.length;
            for (var j = 0; j < motorData.Packages.length; j++) {
                var packageData = motorData.Packages[j];
                var found = false;
                for (var i = 0; i < packageLength; i++) {
                    if (packageData.Code == packages[i].getCode()) {
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    // was not been found, so add it
                    var packageX = motor.getAvailablePackage(packageData.Code);
                    if (packageX == null) {
                        packageX = new PackageType(packageData.Code);
                    }
                    updatePackage(packageX, packageData);
                    packages.push(packageX);
                }
            }

            // animation images
            var animationImages = motor.getAnimationImages();
            for (var i = 0; i < motorData.AnimationImages.length; i++) {
                var animationImageData = motorData.AnimationImages[i];
                var found = false;
                for (var j = 0; j < animationImages.length; j++) {
                    if (animationImages[j].getAngle() == animationImageData.Angle) {
                        // angle is the same, so UPDATE it
                        found = true;
                        animationImages[j].setQueryString(animationImageData.QueryString);
                        animationImages[j].setStatus(EnumTools.fromValue(HtmlCc.Api.ImageRenderingStatusEnum, animationImageData.Status));
                        if (animationImageData.Url != null) {
                            animationImages[j].setUrl(animationImageData.Url);
                        }
                        break;
                    }
                }
                if (found === false) {
                    // nothing found, INSERT it
                    var animationImage = new HtmlCc.Api.ImageType();
                    updateImageWithImageData(animationImage, animationImageData);
                    /*
                    animationImage.setAngle(animationImageData.Angle);
                    animationImage.setQueryString(animationImageData.QueryString);
                    animationImage.setStatus(EnumTools.fromValue(HtmlCc.Api.ImageRenderingStatusEnum, animationImageData.Status));
                    animationImage.setUrl(animationImageData.Url);*/
                    animationImages.push(animationImage);
                }
            }

            // viewpoint images
            var viewpointImages = motor.getViewpointImages();
            for (var i = 0; i < motorData.ViewpointImages.length; i++) {
                var viewpointImageData = motorData.ViewpointImages[i];
                var found = false;
                for (var j = 0; j < viewpointImages.length; j++) {
                    if (viewpointImages[j].getViewpoint() == viewpointImageData.ViewpointName) {
                        // viewpoint is the same, just update it
                        found = true;
                        viewpointImages[j].setQueryString(viewpointImageData.QueryString);
                        viewpointImages[j].setStatus(EnumTools.fromValue(HtmlCc.Api.ImageRenderingStatusEnum, viewpointImageData.Status));
                        viewpointImages[j].setUrl(viewpointImageData.Url);
                        if (viewpointImageData.PreviewUrl.Url != null) {
                            viewpointImages[j].setPreviewUrl(viewpointImageData.PreviewUrl.Url);
                        }
                        break;
                    }
                }
                if (found === false) {
                    // nothing found, INSERT it
                    var viewpointImage = new HtmlCc.Api.ImageType();
                    updateImageWithImageData(viewpointImage, viewpointImageData);
                    /*
                    viewpointImage.setQueryString(viewpointImageData.QueryString);
                    viewpointImage.setStatus(EnumTools.fromValue(HtmlCc.Api.ImageRenderingStatusEnum, viewpointImageData.Status));
                    viewpointImage.setUrl(viewpointImageData.Url);
                    viewpointImage.setViewpoint(viewpointImageData.ViewpointName);*/
                    viewpointImages.push(viewpointImage);
                }
            }

            if (motor.getViewpointImages().length == 0) {
                // try to get animation images of less equiped car
                var dummy = "dommy";
            }

            // image
            var image = motor.getImage();
            if (image == null) {
                image = new HtmlCc.Api.ImageType();
                motor.setImage(image);
            }
            updateImageWithImageData(image, motorData.Image);

            // wallpaper
            var wallpaperUrl = motorData.WallpaperUrl;
            if (wallpaperUrl != null) {
                motor.setWallpaperUrl(wallpaperUrl.Url);
            }

            // description 
            motor.setDescription(motorData.Description);

            // default values
            storeAvailableColorIntoMotor(motor, { Code: motorData.DefaultColor });
            motor.setDefaultColor(motor.getAvailableColor(motorData.DefaultColor));
            storeAvailableInteriorIntoMotor(motor, { Code: motorData.DefaultInterior });
            motor.setDefaultInterior(motor.getAvailableInterior(motorData.DefaultInterior));

            // selected values
            storeAvailableColorIntoMotor(motor, { Code: motorData.SelectedColor });
            motor.setSelectedColor(motor.getAvailableColor(motorData.SelectedColor));
            storeAvailableInteriorIntoMotor(motor, { Code: motorData.SelectedInterior });
            motor.setSelectedInterior(motor.getAvailableInterior(motorData.SelectedInterior));


            // conflicts
            var conflicts = motor.getConflicts();
            var conflictsAdd = conflicts.getAdd();
            var conflictsAddLength = conflictsAdd.length;
            // packages to add
            for (var i = 0; i < conflictsAddLength; i++) {
                // removes non existing packages
                var currentPackage = conflictsAdd.shift();  // removes package from current collection
                for (var j = 0; j < motorData.Conflicts.Add.length; j++) {
                    if (motorData.Conflicts.Add[j].Code == currentPackage.getCode()) {
                        conflictsAdd.push(currentPackage);  // push back the package into collection
                    }
                }
            }
            for (var i = 0; i < motorData.Conflicts.Add.length; i++) {
                // adds not existing packages into collection
                var found = false;
                for (var j = 0; j < conflictsAdd.length; j++) {
                    if (motorData.Conflicts.Add[i].Code == conflictsAdd[j].getCode()) {
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    // package has not been found, insert it
                    var newPackage = motor.getAvailablePackage(motorData.Conflicts.Add[i].Code);
                    if (newPackage == null) {
                        newPackage = new PackageType(motorData.Conflicts.Add[i].Code);
                    }
                    updatePackage(newPackage, motorData.Conflicts.Add[i]);
                    conflictsAdd.push(newPackage);
                }
            }

            // packages to remove
            var conflictsRemove = conflicts.getRemove();
            var conflictsRemoveLength = conflictsRemove.length;
            for (var i = 0; i < conflictsRemoveLength; i++) {
                // removes non existing packages
                var currentPackage = conflictsRemove.shift();  // removes package from current collection
                for (var j = 0; j < motorData.Conflicts.Remove.length; j++) {
                    if (motorData.Conflicts.Remove[j].Code == currentPackage.getCode()) {
                        conflictsRemove.push(currentPackage);  // push back the package into collection
                    }
                }
            }
            for (var i = 0; i < motorData.Conflicts.Remove.length; i++) {
                // adds not existing packages into collection
                var found = false;
                for (var j = 0; j < conflictsRemove.length; j++) {
                    if (motorData.Conflicts.Remove[i].Code == conflictsRemove[j].getCode()) {
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    // package has not been found, insert it
                    var newPackage = motor.getAvailablePackage(motorData.Conflicts.Remove[i].Code);
                    if (newPackage == null) {
                        newPackage = new PackageType(motorData.Conflicts.Remove[i].Code);
                    }
                    updatePackage(newPackage, motorData.Conflicts.Remove[i]);
                    conflictsRemove.push(newPackage);
                }
            }

            // color conflict
            if (motorData.Conflicts.ExteriorConflict != null) {
                conflicts.setExteriorConflict(motorData.Conflicts.ExteriorConflict);

                if (motorData.Conflicts.ConflictedColor != null) {
                    var conflictedExterior = new HtmlCc.Api.ColorType(motorData.Conflicts.ConflictedColor.Code);
                    conflictedExterior.setName(motorData.Conflicts.ConflictedColor.Name);

                    var exteriorImage = new HtmlCc.Api.ImageType();
                    exteriorImage.setUrl(motorData.Conflicts.ConflictedColor.Image.Url);

                    conflictedExterior.setImage(exteriorImage);
                    conflicts.setExteriorConflictModel(conflictedExterior);
                }
            }

            // interior conflict
            if (motorData.Conflicts.InteriorConflict != null) {
                conflicts.setInteriorConflict(motorData.Conflicts.InteriorConflict);

                if (motorData.Conflicts.ConflictedInterior != null) {
                    var conflictedInterior = new HtmlCc.Api.InteriorType(motorData.Conflicts.ConflictedInterior.Code);
                    conflictedInterior.setName(motorData.Conflicts.ConflictedInterior.Name);

                    var interiorImage = new HtmlCc.Api.ImageType();
                    interiorImage.setUrl(motorData.Conflicts.ConflictedInterior.Image.Url);

                    conflictedInterior.setImage(interiorImage);
                    conflicts.setInteriorConflictModel(conflictedInterior);
                }
            }         
        };

        // returns simple motor or null if simple motor is not yet returned
        var getSimpleMotor = function (motorId, colorCode, interiorCode, packages) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <returns type='MotorType' />
            /// </signature>

            var version = _settings.getVersion();
            if (!(version in _simpleMotors)) {      // notice _simpleMotors
                return null;
            }
            var motors = _simpleMotors[version];

            if (!(motorId in motors)) {
                return null;
            }
            var motorHashes = motors[motorId];

            var hash = thisConfigurationStorage.computeHash(colorCode, interiorCode, packages);
            if (!(hash in motorHashes)) {
                return null;
            }

            return motorHashes[hash];
        };

        // returns simple motor by motor id and configuration params
        this.getSimpleMotor = function (motorId, colorCode, interiorCode, packages) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <returns type='MotorType' />
            /// </signature>
            return getSimpleMotor(motorId, colorCode, interiorCode, packages);
        };

        // store full motor - the complete information about motor
        var storeFullMotor = function (equipment, motorData) {
            /// <signature>
            /// <param name='equipment' type='EquipmentType' />
            /// <param name='motorData' type='Object' />
            /// </signature>
            if (!(equipment instanceof EquipmentType)) {
                throw new Error('Equipment is not instance of EquipmentType.');
            }

            var pkgs = [];
            for (var i = 0; i < motorData.Packages.length; i++) {
                if (motorData.Packages[i].HasQuantity == true) {
                    pkgs.push('{0}({1})'.format(motorData.Packages[i].Code, motorData.Packages[i].Quantity));
                } else {
                    pkgs.push(motorData.Packages[i].Code);
                }
                
            }

            var motor = getFullMotor(motorData.Id, motorData.SelectedColor, motorData.SelectedInterior, pkgs);

            if (motor == null) {
                // motor is exists in full motor
                motor = getSimpleMotor(motorData.Id, motorData.SelectedColor, motorData.SelectedInterior, pkgs);

                if (motor == null) {
                    // motor is not even simple motor, create it first
                    storeSimpleMotor(equipment, motorData);
                    motor = getSimpleMotor(motorData.Id, motorData.SelectedColor, motorData.SelectedInterior, pkgs);
                    if (motor == null) {
                        // this shouldn't never happen
                        throw new Error('Serious error occurs.');
                    }
                }
                // motor could be marked as full, because it realy is
                motor.setType('full');

                // motor will be stored into _motor variable too
                var version = _settings.getVersion();
                if (!(version in _motors)) {
                    _motors[version] = {};
                }
                var motors = _motors[version];
                if (!(motor.getId() in motors)) {
                    motors[motor.getId()] = {};
                }
                var motorHashes = motors[motor.getId()];
                var hash = _carConfiguration.computeHash(motorData.SelectedColor, motorData.SelectedInterior, pkgs);
                if (!(hash in motorHashes)) {
                    motorHashes[hash] = {};
                }
                motorHashes[hash] = motor;

                // try to store it to alternative hash if selected color or interior is default
                var altHash;
                if (motorData.SelectedColor == motorData.DefaultColor) {
                    altHash = thisConfigurationStorage.computeHash('', motorData.SelectedInterior, pkgs);
                    motorHashes[altHash] = motorHashes[hash];
                }
                if (motorData.SelectedInterior == motorData.DefaultInterior) {
                    altHash = thisConfigurationStorage.computeHash(motorData.SelectedColor, '', pkgs);
                    motorHashes[altHash] = motorHashes[hash];
                }
                if (motorData.SelectedColor == motorData.DefaultColor && motorData.SelectedInterior == motorData.DefaultInterior) {
                    altHash = thisConfigurationStorage.computeHash('', '', pkgs);
                    motorHashes[altHash] = motorHashes[hash];
                }
            }

            // update emission value
            motor.setEmission(motorData.EmissionComposed.Combined);
            motor.setEmissionGas(motorData.EmissionComposed.Gas);

            // update energy class and fiel consumption
            motor.setEnergyClass(motorData.EnergyClass);
            motor.setEngineType(motorData.EngineType);
            motor.setFuelConsumption(motorData.FuelConsumption);
            motor.setFuelConsumptionGas(motorData.FuelConsumption);
            motor.setMotorCubicCapacity(motorData.MotorCubicCapacity);
            motor.setFuelNameTranslated(motorData.FuelNameTranslated);

            // update motor's attributes
            for (var i = 0; i < motorData.AvailableColors.length; i++) {
                storeAvailableColorIntoMotor(motor, motorData.AvailableColors[i]);
            }

            // sort available colors
            motor.getAvailableColors().sort(function (a, b) {
                if (a.getPrice() < b.getPrice()) {
                    return -1;
                } else if (a.getPrice() > b.getPrice()) {
                    return 1;
                } else {
                    return a.getCode().compare(b.getCode());
                }
            });

            for (var i = 0; i < motorData.AvailableInteriors.length; i++) {
                storeAvailableInteriorIntoMotor(motor, motorData.AvailableInteriors[i]);
            }

            // sort available interiors
            motor.getAvailableInteriors().sort(function (a, b) {
                if (a.getPrice() < b.getPrice()) {
                    return -1;
                } else if (a.getPrice() > b.getPrice()) {
                    return 1;
                } else {
                    return a.getCode().compare(b.getCode());
                }
            });

            var sortedPackageGroups = motorData.AvailablePackageGroups.sort(function(a, b) { return a.Sort - b.Sort });

            for (var i = 0; i < sortedPackageGroups.length; i++) {
                if (sortedPackageGroups[i] == null) {
                    // TODO, INVESTIGATE why it is happening
                    HtmlCc.Libs.Log.warn('Available package group is NULL! Why? MotorId = {0}'.format(motorData.Id));
                } else {
                    storeAvailablePackageGroupIntoMotor(motor, sortedPackageGroups[i]);
                }
            }           

            if (motorData.AvailableSkodaCareGroups != null && $.isArray(motorData.AvailableSkodaCareGroups)) {

                var sortedSkodaCareGroups = motorData.AvailableSkodaCareGroups.sort(function (a, b) { return a.Sort - b.Sort });

                for (var i = 0; i < sortedSkodaCareGroups.length; i++) {
                    storeAvailableSkodaCareGroupIntoMotor(motor, sortedSkodaCareGroups[i]);
                }
            }

            for (var i = 0; i < motorData.AvailableWheels.length; i++) {
                if (motorData.AvailableWheels[i] == null) {
                    // TODO, INVESTIGATE why it is happening
                    HtmlCc.Libs.Log.warn('Available wheel package is NULL! Why? MotorId = {0}'.format(motorData.Id));
                } else {
                    storeAvailableWheelIntoMotor(motor, motorData.AvailableWheels[i]);
                }
            }

            // try find available package or skoda care package by its code 
            var getAvailablePackage = function (code) {
                var item = motor.getAvailablePackage(code);
                if (item == null) {
                    item = motor.getAvailablePackageInSkodaCare(code);
                }

                return item;
            }

            // selected packages could be merged with availablePackage collection which contains more properties
            var packages = motor.getPackages();
            for (var i = 0; i < packages.length; i++) {
                var availablePackage = getAvailablePackage(packages[i].getCode());//motor.getAvailablePackage(packages[i].getCode());
                if (availablePackage != null) {
                    var quantity = packages[i].getQuantity();
                    packages[i] = availablePackage;
                    if (quantity != null) {
                        packages[i].setQuantity(quantity);
                    }
                }
            }

            if (motorData.SelectedWheel == null) {
                HtmlCc.Libs.Log.log('Selected wheel is not defined!');
            } else {
                var wheelPackage = motor.getAvailableWheel(motorData.SelectedWheel);
                if (wheelPackage != null) {
                    motor.setSelectedWheel(wheelPackage);
                } else {
                    HtmlCc.Libs.Log.warn('Selected wheel package {0} does not belongs to available wheels.'.format(motorData.SelectedWheel));
                }
            }
        };

        // returns full motor or null if full motor is not yet prefetched
        var getFullMotor = function (motorId, colorCode, interiorCode, packages) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <returns type='MotorType' />
            /// </signature>

            var version = _settings.getVersion();
            if (!(version in _motors)) {    // notice _motors
                return null;
            }
            var motors = _motors[version];

            if (!(motorId in motors)) {
                return null;
            }
            var motorHashes = motors[motorId];

            var hash = thisConfigurationStorage.computeHash(colorCode, interiorCode, packages);
            if (!(hash in motorHashes)) {
                return null;
            }

            return motorHashes[hash];
        }

        // returns full motor by motor id and configuration params
        this.getFullMotor = function (motorId, colorCode, interiorCode, packages) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <returns type='MotorType' />
            /// </signature>

            return getFullMotor(motorId, colorCode, interiorCode, packages);
        };

        // updates PackageType object using backend JSON data
        var updatePackage = function (packageObject, packageData) {
            /// <signature>
            /// <param name='packageObject' type='HtmlCc.Api.PackageType' />
            /// <param name='packageData' type='Object' />
            /// </signature>

            if (!(packageObject instanceof PackageType)) {
                throw new Error('Package object is not instance of PackageType.');
            }

            if ('Enabled' in packageData) {
                packageObject.setEnabled(packageData.Enabled);
            }
            if ('Price' in packageData) {
                packageObject.setPrice(packageData.Price);
            }
            if ('PriceString' in packageData) {
                packageObject.setPriceString(packageData.PriceString);
            }
            if ('Selectable' in packageData) {
                packageObject.setSelectable(packageData.Selectable);
            }
            if ('Description' in packageData) {
                packageObject.setDescription(packageData.Description);
            }
            if ('Image' in packageData && packageData.Image != null && 'Url' in packageData.Image) {
                var image = packageObject.getImage();
                if (image == null) {
                    image = new HtmlCc.Api.ImageType();
                    packageObject.setImage(image);
                }
                updateImageWithImageData(image, packageData.Image);
            } else if ('ImageUrl' in packageData) {
                var image = packageObject.getImage();
                if (image == null) {
                    image = new HtmlCc.Api.ImageType();
                    packageObject.setImage(image);
                }
                image.setUrl(packageData.ImageUrl);
            }
            if ('Name' in packageData) {
                if (packageData.Name != null && packageData.Name != '') {
                    packageObject.setName(packageData.Name);
                }
            }
            if ('ShortName' in packageData) {
                if (packageData.ShortName != null && packageData.ShortName != '') {
                    packageObject.setShortName(packageData.ShortName);
                }
            }
            if ('VideoUrl' in packageData) {
                if (packageData.VideoUrl != null && packageData.VideoUrl != '') {
                    packageObject.setVideoUrl(packageData.VideoUrl);
                }
            }
            if ('HasQuantity' in packageData) {
                packageObject.setHasQuantity(new Boolean(packageData.HasQuantity) == true);
            }
            if ('Quantity' in packageData && parseInt(packageData.Quantity) >= 0) {
                packageObject.setQuantity(packageData.Quantity);
            }
            if ('Recommended' in packageData && packageData.Recommended != null) {
                packageObject.setRecommended(packageData.Recommended);
            }
            if ('Suitable' in packageData && packageData.Suitable != null) {
                packageObject.setSuitable(packageData.Suitable);
            }
            if ('IsFromStandardEquipment' in packageData && packageData.IsFromStandardEquipment != null) {
                packageObject.setIsFromStandardEquipment(packageData.IsFromStandardEquipment);
            }
            if ('PackageType' in packageData && packageData.PackageType != null) {
                packageObject.setType(packageData.PackageType);
            }

            if ('Sort' in packageData && packageData.Sort != null) {
                packageObject.setSort(packageData.Sort);
            }
        };

        // stores available interior into motor (or updates it if interior already exists)
        var storeAvailableInteriorIntoMotor = function (motor, availableInteriorData) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='availableInteriorData' type='Object' />
            /// </signature>

            if (!(motor instanceof MotorType)) {
                throw new Error('Motor is not instance of MotorType.');
            }

            if (!('Code' in availableInteriorData)) {
                throw new Error('Available interior data doesn\'t contain Code property.');
            }

            var availableInteriors = motor.getAvailableInteriors();
            var availableInterior = null;
            $.each(availableInteriors, function (k, v) {
                if (v.getCode() == availableInteriorData.Code) {
                    availableInterior = v;
                    return;
                }
            });
            if (availableInterior == null) {
                // available interior was not found
                availableInterior = new HtmlCc.Api.InteriorType(availableInteriorData.Code);
                availableInteriors.push(availableInterior);
            }
            if ('Image' in availableInteriorData) {
                var image = availableInterior.getImage();
                if (image == null) {
                    image = new HtmlCc.Api.ImageType();
                    availableInterior.setImage(image);
                }
                updateImageWithImageData(image, availableInteriorData.Image);
            }
            if ('Name' in availableInteriorData) {
                availableInterior.setName(availableInteriorData.Name);
            }
            if ('Price' in availableInteriorData) {
                availableInterior.setPrice(availableInteriorData.Price);
            }
            if ('PriceString' in availableInteriorData) {
                availableInterior.setPriceString(availableInteriorData.PriceString);
            }
            if ('Selectable' in availableInteriorData) {
                availableInterior.setSelectable(availableInteriorData.Selectable);
            }
            if ('Sort' in availableInteriorData) {
                availableInterior.setSort(availableInteriorData.Sort);
            }
        };

        // update image object with imageData from server's response
        var updateImageWithImageData = function (image, imageData) {
            /// <signature>
            /// <param name='image' type='HtmlCc.Api.ImageType' />
            /// <param name='imageData' type='Object' />
            /// </signature>
            if (imageData == null) {
                // no data to update
                return;
            }
            if (!(image instanceof HtmlCc.Api.ImageType)) {
                throw new Error('Image is not instance of HtmlCc.Api.ImageType.');
            }

            if ('Url' in imageData && imageData.Url != null) {
                image.setUrl(imageData.Url);
            }
            if ('PreviewUrl' in imageData && imageData.PreviewUrl != null
                && 'Url' in imageData.PreviewUrl && imageData.PreviewUrl.Url != null) {
                image.setPreviewUrl(imageData.PreviewUrl.Url);
            }
            if ('Width' in imageData && imageData.Width != null) {
                image.setWidth(imageData.Width);
            }
            if ('Height' in imageData && imageData.Height != null) {
                image.setHeight(imageData.Height);
            }
            if ('Angle' in imageData && imageData.Angle != null) {
                image.setAngle(imageData.Angle);
            }
            if ('ViewpointName' in imageData && imageData.ViewpointName != null) {
                image.setViewpoint(imageData.ViewpointName);
            }
            if ('QueryString' in imageData && imageData.QueryString != null) {
                image.setQueryString(imageData.QueryString);
            }
            if ('Status' in imageData && imageData.Status != null) {
                image.setStatus(EnumTools.fromValue(HtmlCc.Api.ImageRenderingStatusEnum, imageData.Status));
            }
        };

        // stores (inserts or updates if exists) available color from json data into motor object
        var storeAvailableColorIntoMotor = function (motor, availableColorData) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='availableColorData' type='Object' />
            /// </signature>

            if (!('Code' in availableColorData)) {
                // Code is not a property of availableColorData so I can't work with it
                throw new Error('Available color data doesn\'t contain Code property.');
            }

            var availableColors = motor.getAvailableColors();
            var availableColor = null;
            $.each(availableColors, function (k, v) {
                if (v.getCode() == availableColorData.Code) {
                    availableColor = v;
                    return;
                }
            });
            if (availableColor == null) {
                // available color is not present, so add it
                availableColor = new HtmlCc.Api.ColorType(availableColorData.Code);
                availableColors.push(availableColor);
            }
            if ('CssColor' in availableColorData) {
                availableColor.setCssColor(availableColorData.CssColor);
            }
            if ('RoofCssColor' in availableColorData) {
                availableColor.setCssRoofColor(availableColorData.RoofCssColor);
            }
            if ('IsRoof' in availableColorData) {
                availableColor.setRoof(availableColorData.IsRoof);
            }
            if ('Name' in availableColorData) {
                availableColor.setName(availableColorData.Name);
            }
            if ('Price' in availableColorData) {
                availableColor.setPrice(availableColorData.Price);
            }
            if ('PriceString' in availableColorData) {
                availableColor.setPriceString(availableColorData.PriceString);
            }
            if ('Selectable' in availableColorData) {
                availableColor.setSelectable(availableColorData.Selectable);
            }
            if ('Type' in availableColorData) {
                availableColor.setType(EnumTools.fromValue(HtmlCc.Api.ColorTypeEnum , availableColorData.Type));
            }
            if ('Image' in availableColorData) {
                updateImageWithImageData(availableColor.getImage(), availableColorData.Image);
            }
        };

        // stores available wheel package into motor
        var storeAvailableWheelIntoMotor = function (motor, wheelData) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='wheelData' type='Object' />
            /// </signature>

            //var wheelPackage = motor.getAvailablePackage(wheelData.Code);
            //if (wheelPackage == null) {
                // craete it
            //var savedSelectable = wheelData.Selectable;
                wheelPackage = new PackageType(wheelData.Code);
            //wheelPackage.setSelectable(wheelData.Selectable);
            //}

            // update package

            //var savedSelectable = wheelData.Selectable;

            updatePackage(wheelPackage, wheelData);
            //wheelPackage.setSelectable(savedSelectable);

            // store it as a wheel package
            var availableWheels = motor.getAvailableWheels();
            var alreadyFound = false;
            for (var i = 0; i < availableWheels.length; i++) {
                if (availableWheels[i].getCode() == wheelPackage.getCode()) {
                    alreadyFound = true;
                    break;
                }
            }
            if (alreadyFound === false) {
                availableWheels.push(wheelPackage);
            }
        };

        // stores available package proup into motor
        var storeAvailablePackageGroupIntoMotor = function (motor, packageGroupData) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='packageGroupData' type='Object' />
            /// </signature>

            var packageGroups = motor.getAvailablePackageGroups();

            var packageGroup = null;
            // find existing package group, if it does already exist
            for (var i = 0; i < packageGroups.length; i++) {
                if (packageGroups[i].getId() == packageGroupData.Id) {
                    packageGroup = packageGroups[i];
                    break;
                }
            }

            if (packageGroup == null) {
                // it cannot been found so create it
                packageGroup = new PackageGroupType(packageGroupData.Id, packageGroupData.Name);
                packageGroups.push(packageGroup);
            }

            var sortedPackages =
                packageGroupData.AvailablePackages.sort(function (a, b) { return a.Sort - b.Sort });

            packageGroup.setSort(packageGroupData.Sort);
            packageGroup.setIsDefault(packageGroupData.IsDefault);

            $.each(sortedPackages, function (k, v) {
                storeAvailablePackageIntoAvailablePackageGroup(packageGroup, v);
            });
        };

        // stores available skoda care groups into motor
        var storeAvailableSkodaCareGroupIntoMotor = function (motor, careGroupData) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='careGroupData' type='Object' />
            /// </signature>

            // fake for special cases
            if (careGroupData.Id == 0) {
                // I need an ID at any cost
                var rnd = careGroupData.Name.hashCode();
                if (rnd > 0) {
                    rnd *= -1;
                } else if (rnd == 0) {
                    rnd = -1;
                }
                careGroupData.Id = rnd;
            }

            var careGroups = motor.getAvailableSkodaCareGroups()

            var careGroup = null;
            // find existing care group, if it does already exist
            for (var i = 0; i < careGroups.length; i++) {
                if (careGroups[i].getId() == careGroupData.Id) {
                    careGroup = careGroups[i];
                    break;
                }
            }

            if (careGroup == null) {
                // it cannot been found so create it
                careGroup = new PackageGroupType(careGroupData.Id, careGroupData.Name);
                careGroups.push(careGroup);
            }

            careGroup.setSort(careGroupData.Sort);
            careGroup.setIsDefault(careGroupData.IsDefault);

            var sortedCareAvailabelPackages =
                careGroupData.AvailablePackages.sort(function (a, b) { return a.Sort - b.Sort });

            $.each(sortedCareAvailabelPackages, function (k, v) {
                storeAvailablePackageIntoAvailablePackageGroup(careGroup, v);
            });
            
            if (careGroupData.PackageGroupType > 0) {
                careGroup.setGroupType(careGroupData.PackageGroupType);
            }

            // mobility insurance
            if (careGroup.getGroupType() == 1) {
                $.each(careGroup.getPackages(), function () {
                    var mobilityInsurancePackage = this;
                    mobilityInsurancePackage.mobilityInsurance = true;
                });
            }

            if (careGroup.getGroupType() == 4) {
                /*
                var insurancePackage = new PackageType('INSUREA');
                insurancePackage.setHasQuantity(false);
                insurancePackage.setName('Insurance');
                insurancePackage.setSelectable(true);
                insurancePackage.insurance = true;

                careGroup.getPackages().push(insurancePackage);
                */
                var insurancePdProxy = thisConfigurator.getInsurance();
                if (insurancePdProxy != null) {
                    // insurance is available for use
                    insurancePdProxy.getProductsAsync(motor, function (productsData) {
                        // clear all products at the begining for sure
                        while (careGroup.getPackages().pop());

                        if (productsData.Products != null && productsData.Products.Products != null && $.isArray(productsData.Products.Products)) {
                            $.each(productsData.Products.Products, function () {
                                var thisProduct = this;
                                if (thisProduct.Type == 'insurance') {
                                    var insurancePackage = new PackageType(thisProduct.ID);
                                    insurancePackage.setHasQuantity(false);
                                    insurancePackage.setName(thisProduct.Label.Value);
                                    insurancePackage.setDescription(thisProduct.Description);
                                    insurancePackage.setSelectable(true);
                                    insurancePackage.insurance = true;

                                    var insuraceImage = new HtmlCc.Api.ImageType();
                                    insuraceImage.setUrl(thisProduct.ImageUrl);
                                    insurancePackage.setImage(insuraceImage);

                                    careGroup.getPackages().push(insurancePackage);
                                }
                            });
                        }
                    }, function () {
                        // failed
                        HtmlCc.Libs.Log.error('FDProxy GetProducts call failed.');
                    });
                }
            }
        };

        // stores available package into available package group
        var storeAvailablePackageIntoAvailablePackageGroup = function (packageGroup, packageData) {
            /// <signature>
            /// <param name='packageGroup' type='PackageGroupType' />
            /// <param name='packageData' type='Object' />
            /// </signature>

            var packages = packageGroup.getPackages();
            var packageX = null;
            for (var i = 0; i < packages.length; i++) {
                if (packages[i].getCode() == packageData.Code) {
                    packageX = packages[i];
                    break;
                }
            }

            if (packageX == null) {
                // cannot been found yet, so create it
                packageX = new PackageType(packageData.Code);
                packages.push(packageX);
            }

            updatePackage(packageX, packageData);
        };

        // return package
        var getPackage = function (motor, packageCode) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='packageCode' type='String' />
            /// <returns type='Array' elementType='PackageType'/>
            /// </signature>

            if (!(motor instanceof MotorType)) {
                throw new Error('Motor is not instance of MotorType.');
            }

            var packages = motor.getPackages();
            for (var i = 0; i < packages.length; i++) {
                if (packages[i].getCode() == packageCode) {
                    return packages[i];
                }
            }

            return null;
        };

        // saves configuration data directly from Configure response
        this.saveConfiguration = function (cfgData) {
            /// <signature>
            /// <param name='cfgData' type='Object' />
            /// </signature>
            if (cfgData.SalesProgram.Version != _settings.getVersion()) {
                // version differs, restart needed
                HtmlCc.Libs.Log.warn('Sales program version is "{0}" but I have got "{1}".'.format(_settings.getVersion(), cfgData.SalesProgram.Version));
                alert('SalesProgramChanged'.resx());
                location.reload();
            }

            // store model
            storeModel(cfgData.Model);

            var sortedEquipments = 
                cfgData.Equipments.sort(function(a, b) { return a.Sort - b.Sort })

            // store equipment
            $.each(sortedEquipments, function (k, v) {
                storeEquipment(v);
            });

            // store simple motors
            $.each(cfgData.Motors, function (k, v) {
                var equipment = thisConfigurationStorage.getModel(cfgData.Model.Id).getEquipment(v.EquipmentId);
                storeSimpleMotor(equipment, v);
            });

            // store current motor
            var equipment = thisConfigurationStorage.getModel(cfgData.Model.Id).getEquipment(cfgData.CurrentMotor.EquipmentId);
            storeFullMotor(equipment, cfgData.CurrentMotor);
        };

        // returns AJAX timeout in miliseconds
        this.getTimeout = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _coreSettings.getTimeout();
        };
    };

    // type of financing - encapsulates stored parameters of financing
    var FinancingType = HtmlCc.Api.FinancingType = function (domain, instanceName, salesprogramName, culture, financingKind) {
        /// <signature>
        /// <param name='domain' type='String' />
        /// <param name='instanceName' type='String' />
        /// <param name='salesprogramName' type='String' />
        /// <param name='culture' type='String' />
        /// <param name='financingKind' type='String'>"financing" | "insurance"</param>
        /// <returns type='FinancingType'/>
        /// </signature>
        // this financing type object
        var thisFinancing = this;

        if (financingKind != 'financing' && financingKind != 'insurance') {
            throw new Error('Unsupported financing kind.');
        }

        // used domain - it is the same for everything in the same salesprogram
        var _domain = domain;

        // key - vehicle key, value is result of getProducts call
        var _products = {};


        var _partRatesCache = [];

        // key - dehicle key; key2 - product id, value is default params used at this product ad this vehicle
        var _defaultParams = {};

        // key - vehicle key, key2 - product key, value means saved params by user
        var _savedParams = {};

        // saved relevant parameters from calculate rate response
        var _saveCalculateRateParams = {};

        // current product id
        var _productId = null;
             
        // defaults leasing parameters are used
        var _userFinnacingApplies = {};

        var _lastGetRateTransactionId = null;
        var _lastGetDefaultsTransactionId = null;
        var _lastGetPartRatesTransactionId = null;
        var _lastGetProductsTransactionId = null;

        // determines whether insurance product exists
        //var _isInsuranceAvailable = false;

        // returns last get rate transaction guid
        this.getLastGetRateTransactionId = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _lastGetRateTransactionId;
        };

        // returns get last get defaults transaction id
        this.getLastGetDefaultsTransactionId = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _lastGetDefaultsTransactionId;
        };

        // get last part rates transaction id
        this.getLastPartRatesTransactionId = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _lastGetPartRatesTransactionId;
        };

        this.getLastProductsTransactionId = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _lastGetProductsTransactionId;
        };

        //this.getIsInsuraceAvailable = function () {
        //    /// <signature>
        //    /// <returns type='bool' />
        //    /// </signature>
        //    return _isInsuranceAvailable;
        //}

        this.addUserFinancingApply = function (motor) {
            var key = this.getParamsCacheKey(_productId, motor);//mbvKey + _productId;
            _userFinnacingApplies[key] = false;
        }

        this.removeUserFinancingApply = function (motor) {
            var key = this.getParamsCacheKey(_productId, motor);//mbvKey + _productId;
            _userFinnacingApplies[key] = true;
        }

        this.getHasFinancingDefaults = function (motor) {
            var key = this.getParamsCacheKey(_productId, motor); //mbvKey + _productId;
            if (key in _userFinnacingApplies) {
                return _userFinnacingApplies[key];
            }

            return true;
        }

        // sets vehicle from motor
        var getVehicleFromMotor = function (motor) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <returns type='HtmlCc.Financial.VehicleType' />
            /// </signature>
            if (!(motor instanceof MotorType) || motor == null) {
                throw new Error('Object motor is not instance of MotorType.');
            }

            var equipment = motor.getEquipment();
            var model = equipment.getModel();

            var motorActionCode = motor.getActionCode();
            var mbvkey = motor.getMbvKey();
            if (motorActionCode != null && motorActionCode != '') {
                mbvkey += '/' + motorActionCode.replace(/\\/g, "/");
            }

            var vehicle = new HtmlCc.Financial.VehicleType();
            vehicle.setKey(mbvkey);

            if (motor.getType() == 'lookup') {
                vehicle.setPriceTotal(motor.getPrice());
                vehicle.setPriceModel(motor.getPriceFrom());
            } else {
                // simple or full version
                vehicle.setPriceTotal(motor.getPrice());

                var lookup = equipment.getMotorLookup(motor.getId());
                vehicle.setPriceModel(motor.getPriceFrom());
            }

            vehicle.setYear(model.getModelYear());

            return vehicle;
        };

        // returns FD Proxy domain
        this.getDomain = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _domain;
        };

        this.isInsuraceAvailableAsync = function (motor, successCallback, errorCallback) {
            var vehicle = getVehicleFromMotor(motor);
            var hasInsurance = function (data) {
                var found = false;
                $.each(data.Products.Products, function () {
                    var prod = this;
                    if (prod.Type == 'insurance') {
                        found = true;
                        return true;
                    }
                });

                return found;
            };                
                
            if (_products == null || !(vehicle.getKey() in _products)) {
                HtmlCc.Financial.GetProducts(
                    thisFinancing.getDomain(), 
                    _coreSettings.getCulture(), 
                    vehicle, 
                    function (data) {
                        _products[vehicle.getKey()] = data;
                        successCallback(hasInsurance(data));
                    }, errorCallback);
            }
            else {
                successCallback(hasInsurance(_products[vehicle.getKey()]));               
            }
        }

        // returns products async way
        this.getProductsAsync = function (motor, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='successCallback' type='Function'>function(products)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            var vehicle = getVehicleFromMotor(motor);

            if (_products == null || !(vehicle.getKey() in _products)) {
                HtmlCc.Financial.GetProducts(thisFinancing.getDomain(),_coreSettings.getCulture(), vehicle, function (data) {
                    _products[vehicle.getKey()] = data;
                    if (_productId == null) {
                        // first filling of default product id
                        if (data.Products == null || data.Products.Products == null || !$.isArray(data.Products.Products)) {
                            HtmlCc.Libs.Log.warn('Get products failed due non-existing value in Products.Default.');
                            errorCallback();
                        }

                        $.each(data.Products.Products, function () {
                            var prod = this;

                            if (_productId == null) {
                                if (financingKind == 'financing') {
                                    if (prod.Type == 'credit' || prod.Type == 'lease' || prod.Type == 'cash') {
                                        _productId = prod.ID;
                                    }

                                } else if (financingKind == 'insurance') {
                                    if (prod.Type == 'insurance') {
                                        _productId = prod.ID;
                                    }
                                }
                            }
                        });
                    }
                    _lastGetProductsTransactionId = data.TransactionGuid;
                    successCallback(data);
                }, function () {
                    errorCallback()
                });
            } else {
                successCallback(_products[vehicle.getKey()]);
            }
        };

        // gets current product ID
        this.getProductId = function () {
            return _productId;
        }

        // sets product id
        this.setProductId = function (productId) {
            /// <signature>
            /// <param name='productId' type='String' />
            /// </signature>
            _productId = productId;
        };
      
        // returns product id asynchronously. If product id is not yet ready, it is fetched
        this.getProductIdAsync = function (motor, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='successCallback' type='Function'>function(productId)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>

            if (_productId == null) {
                thisFinancing.getProductsAsync(motor, function (productsData) {
                    // set default product id
                    if (productsData.Products != null) {
                        _productId = productsData.Products.Default;
                        successCallback(_productId);
                    }
                    else {
                        errorCallback();
                    }
                }, function () {
                    errorCallback();
                });
            } else {
                successCallback(_productId);
            }
        };

        // returns defaults of motor of product id; it is returned asynchronously in success callback
        this.getDefaultsAsync = function (motor, productId, parameters, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='productId' type='String' />
            /// <param name='parameters' type='Object' />
            /// <param name='successCallback' type='Function'>function(defaults)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            var vehicle = getVehicleFromMotor(motor);          
         
            HtmlCc.Financial.GetDefaults(
                thisFinancing.getDomain(),
                vehicle,
                productId,
                _coreSettings.getInstanceName(), _coreSettings.getSalesprogramName(), _coreSettings.getCulture(), _coreSettings.getVersion(), parameters,
                function (data) {
                    if (data.TransactionGuid != null) {
                    _lastGetDefaultsTransactionId = data.TransactionGuid;
                }
                successCallback(data);
            }, function () {
                errorCallback();
            });
        };

        // returns latest defaults; it is returned asynchronously in success callback
        this.getLatestDefaultsAsync = function (successCallback, errorCallback) {
            /// <signature>
            /// <param name='successCallback' type='Function'>function(defaults)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>

            HtmlCc.Financial.GetDefaultsByGuid(_lastGetDefaultsTransactionId, thisFinancing.getDomain(), successCallback, errorCallback);
        };

        // replaces all the given parameters values from current calculate rate parameters by ID
        this.applyCalculateRateParameters = function (productId, motor, parameters) {
            var cacheKey = this.getParamsCacheKey(productId, motor);
            if (_saveCalculateRateParams[cacheKey] != null) {
                $.each(_saveCalculateRateParams[cacheKey], function (key, value) {
                    if (parameters.hasOwnProperty(key)) {
                        var defaultParameter = parameters[key];
                        defaultParameter.setValue(value.getValue())
                    }
                });
            }

            return parameters;
        }

        // converts defaults data object into simple params object
        var default2Params = function (defaultData) {
            /// <signature>
            /// <param name='defaultData' type='Object' />
            /// <returns type='Object' />
            /// </signature>

            var params = {};

            if (defaultData.Parameters != null && $.isArray(defaultData.Parameters)) {
                $.each(defaultData.Parameters, function () {
                    var outerParamData = this;

                    if (outerParamData.Groups != null && $.isArray(outerParamData.Groups)) {
                        $.each(outerParamData.Groups, function () {
                            var groupData = this;

                            if (groupData.Parameters != null && $.isArray(groupData.Parameters)) {
                                $.each(groupData.Parameters, function () {
                                    var paramData = this;

                                    // skip irelevant parameters
                                    if (paramData.Relevant == 'no') {
                                        return true;
                                    }

                                    if (paramData.ID in params) {
                                        throw new Error('Redundant param IDs {0}.'.format(paramData.ID));
                                    }

                                    var setInput

                                    switch (paramData.Control.Type) {
                                        case 'label':
                                            // Label is no use
                                            break;
                                        case 'edit':
                                        case 'hidden':
                                            if (paramData.Data == null || !$.isArray(paramData.Data)) {
                                                HtmlCc.Libs.Log.warn('Financing input "{0}" has invalida data.'.format(paramData.ID));
                                            } else {
                                                var param = new HtmlCc.Financial.DataParameterType();
                                                
                                                var parameter = paramData.Data[0];

                                                if (paramData.Data.length > 1) {
                                                    $.each(paramData.Data, function (i, item) {
                                                        if (item.Default == 'yes') {
                                                            parameter = item;
                                                            return true;
                                                        }
                                                    });
                                                }

                                                if (parameter.TransferValue !== null) {
                                                    param.setTransferValue(parameter.TransferValue);
                                                }

                                                param.setValue(parameter.Value);
                                                params[paramData.ID] = param;

                                            }
                                            break;
                                        case 'select':
                                            var param = new HtmlCc.Financial.DataParameterType();
                                            // I'm using default value
                                            if (paramData.DefaultTransferValue !== null) {
                                                param.setTransferValue(paramData.DefaultTransferValue);
                                            }

                                            param.setValue(paramData.DefaultDataValue);
                                            params[paramData.ID] = param;

                                            break;
                                        default:
                                            HtmlCc.Libs.Log.warn('Financing type "{1}" is unnsupported at input "{0}".'.format(paramData.ID, paramData.Control.Type));
                                    }
                                });
                            }
                        });
                    }
                });
            }

            return params;
        };

        // converts defaults data object into simple params object
        var calculateRateToParams = function (calculateRateData) {
            var params = {};
            if (calculateRateData.Payments != null) {
                $.each(calculateRateData.Payments, function () {
                    var item = this;
                    if (item.Relevant == 'yes') {
                        var param = new HtmlCc.Financial.DataParameterType();
                        param.setValue(item.Value.UnformattedValue);
                        params[item.ID] = param;
                    }
                });
            }

            return params;
        }

        // get cache key for financing parameters based on sales program setting 
        this.getParamsCacheKey = function (productId, motor) {
            var cacheKeyTemplate = "{0}_{1}";
            var cacheKeyType = _coreSettings.getFdProxyParamsCaching();            

            if (HtmlCc.Api.FdProxyParamsCacheTypeEnum.PerCarline.name == cacheKeyType) {
                return cacheKeyTemplate.format(productId, thisConfigurator.getCarlineCode());
            }
            else if (HtmlCc.Api.FdProxyParamsCacheTypeEnum.PerModel.name == cacheKeyType) {
                return cacheKeyTemplate.format(productId, this.getModelCode());
            }
            
            return cacheKeyTemplate.format(productId, motor.getMbvKey());
        }

        // calls success callback with default params in argument
        this.getDefaultParamsAsync = function (motor, productId, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='productId' type='String' />
            /// <param name='successCallback' type='Function'>function(defaultParams)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            var vehicle = getVehicleFromMotor(motor);

            if (_defaultParams[vehicle.getKey()] == null) {
                _defaultParams[vehicle.getKey()] = {};
            }
            if (_defaultParams[vehicle.getKey()][productId] == null) {
                thisFinancing.getDefaultsAsync(motor, productId, {}, function (defaultData) {
                    // I have got defaults, save it for later use
                    var defaultParams = default2Params(defaultData);
                    _defaultParams[vehicle.getKey()][productId] = defaultParams;
                    successCallback(defaultParams);
                }, function () {
                    // failed to get defaults
                    errorCallback();
                });
            } else {
                successCallback(_defaultParams[vehicle.getKey()][productId]);
            }
        };

        // calls successCallback with savedParams in its argument
        this.getSavedParamsAsync = function (motor, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='successCallback' type='Function'>function(savedParams)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>           
            var that = this;
            var vehicle = getVehicleFromMotor(motor);
            this.getProductIdAsync(motor, function (productId) {
                var cacheKey = that.getParamsCacheKey(productId, motor); //"{0}_{1}".format(motor.getMbvKey(), productId);
                if (_savedParams != null && _savedParams[cacheKey] != null) {
                    _hasLeasingDefaults = false;
                    // we have saved params right here
                    successCallback(_savedParams[cacheKey]);
                } else {
                    _hasLeasingDefaults = true;
                    // saved params are get from defaultParams
                    if (_savedParams == null) {
                        _savedParams = {};
                    }

                    thisFinancing.getDefaultParamsAsync(motor, productId, function (defaultParams) {
                        _savedParams[cacheKey] = defaultParams;
                        successCallback(defaultParams);
                    }, function () {
                        errorCallback();
                    });
                }
            }, function () {
                errorCallback();
            });

        };

        // saves parameters; successCallback is called after successful set of params with new params (may be corrected) and new defaults which newly describes values
        this.setSavedParamsAsync = function (motor, productId, parameters, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='productId' type='String' />
            /// <param name='parameters' type='Object' />
            /// <param name='successCallback' type='Function'>function(newParams, newDefaults)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            var that = this;

            var vehicle = getVehicleFromMotor(motor);
            _productId = productId;

            thisFinancing.getDefaultsAsync(motor, productId, parameters, function (newDefaults) {
                if (_savedParams == null) {
                    _savedParams = {};
                }

                var cacheKey =  that.getParamsCacheKey(productId, motor);

                var newParams = default2Params(newDefaults);
                _savedParams[cacheKey] = newParams;

                thisFinancing.setProductId(productId);

                successCallback(newParams, newDefaults);
            }, function () {
                // failed to retrieve defaults
                errorCallback();
            });
        };

        // calls successCallback with returned data
        this.getRate = function (motor, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='successCallback' type='Function'>function(rateData)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>

            var vehicle = getVehicleFromMotor(motor);

            thisFinancing.getProductIdAsync(motor, function (productId) {
                thisFinancing.getSavedParamsAsync(motor, function (savedParams) {
                    HtmlCc.Financial.GetRate(thisFinancing.getDomain(), vehicle, productId, _coreSettings.getInstanceName(), _coreSettings.getSalesprogramName(), _coreSettings.getCulture(), _coreSettings.getVersion(), savedParams, function (rateData) {
                        // get rate successfuly returned some content
                        if (rateData.TransactionGuid != null) {
                            _lastGetRateTransactionId = rateData.TransactionGuid;
                        }
                        successCallback(rateData);
                    }, function () {
                        // GetData method failed
                        errorCallback();
                    });
                }, function () {
                    // fetch of saved params failed
                    errorCallback();
                });

            }, function () {
                //fetch of productId failed
                errorCallback();
            });
        };


        // calls successCallback with returned data
        this.getRateFromDefaults = function (motor, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='successCallback' type='Function'>function(rateData)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            var that = this;
            var vehicle = getVehicleFromMotor(motor);

            var getRateFromSummaries = function (data) {
                var result = data.Result.FinalFormattedRate;             
                successCallback(result);
            }

            thisFinancing.getProductIdAsync(motor, function (productId) {
                thisFinancing.getSavedParamsAsync(motor, function (savedParams) {
                    var updatedParameters =
                        that.applyCalculateRateParameters(productId, motor,savedParams);

                    that.getDefaultsAsync(motor, productId, updatedParameters, getRateFromSummaries, errorCallback);

                }, function () {
                    // fetch of saved params failed
                    errorCallback();
                });

            }, function () {
                //fetch of productId failed
                errorCallback();
            });
        };


        // returns monthly rates of vehicle parts
        this.getPartRates = function (motor, partRates, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// <param name='partRates' type='Object' />
            /// <param name='successCallback' type='Function'>function(rateData)</param>
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            var that = this;
            var vehicle = getVehicleFromMotor(motor);

            thisFinancing.getProductIdAsync(motor, function (productId) {
                thisFinancing.getSavedParamsAsync(motor, function (savedParams) {
                    var partRatesCachekey = JSON.stringify(vehicle.simplifyObject()) + productId + HtmlCc.Financial.ObjectParamsToHash(savedParams);

                    if (_partRatesCache != null && _partRatesCache[partRatesCachekey] != null && _partRatesCache[partRatesCachekey] != undefined) {
                        successCallback(_partRatesCache[partRatesCachekey]);
                        return;
                    }

                    HtmlCc.Financial.GetPartRates(
                        thisFinancing.getDomain(), vehicle, productId, _coreSettings.getInstanceName(), _coreSettings.getVersion(), _coreSettings.getSalesprogramName(), _coreSettings.getCulture(), savedParams, partRates, function (partRateData) {
                        // get part rate successfuly returned some content
                        if (partRateData.TransactionGuid != null) {
                            _lastGetPartRatesTransactionId = partRateData.TransactionGuid;
                        }

                        var calculateRateParams = calculateRateToParams(partRateData);
                        var cacheKey = that.getParamsCacheKey(productId, motor);

                        if (calculateRateParams != {}) {
                            _saveCalculateRateParams[cacheKey] = calculateRateParams;
                        }

                        _partRatesCache[partRatesCachekey] = partRateData;

                        successCallback(partRateData);
                    }, function () {
                        // GetData method failed
                        errorCallback();
                    });
                }, function () {
                    // fetch of saved params failed
                    errorCallback();
                });
            }, function () {
                //fetch of productId failed
                errorCallback();
            });
        };
    };

    // *************
    // Type of Car setting
    var CarConfigurationType = HtmlCc.Api.CarConfigurationType = function (settings) {
        /// <signature>
        /// <param name='settings' type='SettingsType' />
        /// <returns type='CarConfigurationType'/>
        /// </signature>
        var thisCarConfiguration = this;

        if (!(settings instanceof SettingsType)) {
            throw new Error("Settings is not an instance of SettingsType.");
        }

        // core settings
        var _settings = settings;

        // model code
        var _modelCode = null;
        // carline code
        var _carlineCode = null;

        // current car configuration
        // motor of configured motor, if not specified, default must be choosed
        var _currentMotor = null;

        // current car configuration without any extra equipment, except conflicts resolved on first 4 steps
        var _nonEquipedMotor = null;

        // creates configuration storage to save all fetched configuration to reuse
        var _configurationStorage = new ConfigurationStorageType(_settings, this);

        // stores information whether configuration has been changes and should be reconfigured against skoda server
        var _configurationChanged = false;

        // stores information whether modelcode and carlinecode changed
        var _skeletonChanged = false;

        // returns model code
        this.getModelCode = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _modelCode;
        };

        // returns carline code
        this.getCarlineCode = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _carlineCode;
        };

        // returns current configured motor
        this.getCurrentMotor = function () {
            /// <signature>
            /// <returns type='MotorType'/>
            /// </signature>
            return _currentMotor;
        };

        // returns the configuration from before 5th step
        // unfortunately user has to visit at least 4th step to set it up
        this.getNonEquipedMotor = function () {
            if (_nonEquipedMotor == null) {
                this.setNonEquipedMotor(_currentMotor);
                return this.getNonEquipedMotor();
            }

            return _nonEquipedMotor;
        }

        // returns instance name
        this.getInstanceName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _coreSettings.getInstanceName();
        };

        // returns instance id
        this.getInstanceId = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _coreSettings.getInstanceId();
        };

        // returns salesprogram name
        this.getSalesProgramName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _coreSettings.getSalesprogramName();
        };

        // returns salesprogram id
        this.getSalesProgramId = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _coreSettings.getSalesprogramId();
        };

        // returns AJAX request timeout in miliseconds
        this.getTimeout = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _coreSettings.getTimeout();
        };

        // returns true whether financing should be used
        this.isUseFdProxy = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _coreSettings.isUseFdProxy();
        };
        // returns domain of FD Proxy
        this.getFdProxyDomain = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _coreSettings.getFdProxyDomain();
        };

        // returns type of FD proxy parameters caching type
        this.getFdProxyParamsCaching = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _coreSettings.getFdProxyParamsCaching();
        };

        // returns culture name
        this.getCulture = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _coreSettings.getCulture();
        };

        // returns version
        this.getVersion = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _coreSettings.getVersion();
        };

        // returns version
        this.getVariantSetVersion = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _coreSettings.getVariantSetVersion();
        };

        // returns compare translation version
        this.getComparisonTranslVersion = function () {
            /// <signature>
            /// <returns type='Complex'/>
            /// </signature>
            return _coreSettings.getComparisonTranslVersion();
        };

        // returns disclamer settings from importer customization
        this.getImporterDisclamerSettings = function () {
            /// <signature>
            /// <returns type='Complex'/>
            /// </signature>
            return _coreSettings.getImporterDisclamerSettings();
        };

        this.getSummaryTechDataList = function () {
            /// <signature>
            /// <returns type='Complex'/>
            /// </signature>
            return _coreSettings.getSummaryTechDataList();
        }

        this.getColorTypeNameSettings = function () {
            /// <signature>
            /// <returns type='Complex'/>
            /// </signature>
            return _coreSettings.getColorTypeNameSettings();
        }


        // returns energy class setup settings from importer customization
        this.getEnergyClassSetupSettings = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            return _coreSettings.getEnergyClassSetupSettings();
        };

        // returns wheel display settings from importer customization
        this.getWheelDisplaySettings = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            return _coreSettings.getWheelDisplaySettings();
        };

        this.getEntryDialogSettings = function () {
            /// <signature>
            /// <returns type='complex'/>
            /// </signature>
            return _coreSettings.getEntryDialogSettings();
        };

        this.setNonEquipedMotor = function(motor) {
            if (motor !== null && !(motor instanceof MotorType)) {
                throw new Error("Motor is not instance of MotorType.");
            }
            _nonEquipedMotor = motor;
        }

        // sets motor to be configured
        this.setCurrentMotor = function (motor) {
            /// <signature>
            /// <param name='motor' type='MotorType' />
            /// </signature>
            if (motor !== null && !(motor instanceof MotorType)) {
                throw new Error("Motor is not instance of MotorType.");
            }
            _currentMotor = motor;
            _configurationChanged = true;
        };

        // returns true if model and carline is set
        this.isModelAndCarlineSet = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _modelCode != null && _carlineCode != null;
        };

        // sets modelCode and carlineCode and prepaires skeleton. calues will be finaly set after successful skeleton build
        this.setModelAndCarline = function (modelCode, carlineCode, successCallback, errorCallback) {
            /// <signature>
            /// <param name='modelCode' type='String' />
            /// <param name='carlineCode' type='String' />
            /// <param name='successCallback' type='Function' />
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            successCallback = successCallback || function () { };
            errorCallback = errorCallback || function () { };

            if (modelCode == null || modelCode.length != 3) {
                throw new Error('Model code is not properly set.');
            }

            if (carlineCode == null || carlineCode.length != 5) {
                throw new Error('Carline code is not properly set.');
            }

            modelCode = modelCode.toUpperCase();
            carlineCode = carlineCode.toUpperCase();

            if (_modelCode != modelCode || _carlineCode != carlineCode) {
                // prepair skeleton only if model or carline differs
                this.prepairSkeleton(modelCode, carlineCode, null, null, [], function (data, textStatus, jqXHR) {
                    _modelCode = modelCode;
                    _carlineCode = carlineCode;
                    var pkgs = [];
                    for (var i = 0; i < data.CurrentMotor.Packages.length; i++) {
                        if (data.CurrentMotor.Packages[i].HasQuantity == true) {
                            pkgs.push('{0}({1})'.format(data.CurrentMotor.Packages[i].Code, data.CurrentMotor.Packages[i].Quantity));
                        } else {
                            pkgs.push(data.CurrentMotor.Packages[i].Code);
                        }
                    }
                    var currentMotor = _configurationStorage.getFullMotor(data.CurrentMotor.Id, data.CurrentMotor.SelectedColor, data.CurrentMotor.SelectedInterior, pkgs)
                    thisCarConfiguration.setCurrentMotor(currentMotor);

                    successCallback(data, textStatus, jqXHR);
                }, errorCallback);
            } else {
                // just call success
                successCallback(null, 'model and carline change not needed', null);
            }
        };

        // calls raw ajax configure, everything is passed into success or error callback; returns function that returns current jqXHR object
        var ajaxConfigureCall = function (modelCode, carlineCode, colorCode, interiorCode, packages, renderingType, equipmentId, motorId, successCallback, errorCallback) {
            /// <signature>
            /// <param name='modelCode' type='String' />
            /// <param name='carlineCode' type='String' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <param name='renderingType' type='string' />
            /// <param name='equipmentId' type='int' />
            /// <param name='motorId' type='int' />
            /// <param name='successCallback' type='Function' />
            /// <param name='errorCallback' type='Function' />
            /// <returns type='XMLHttpRequest'/>
            /// </signature>

            // check for model code
            if (modelCode == null || modelCode.length != 3) {
                throw new Error('Model code is not properly set.');
            }

            // check for carline code
            if (carlineCode == null || carlineCode.length != 5) {
                throw new Error('Carline code is not properly set.');
            }

            
            // check for color
            if (colorCode == null) {
                // set to default if invalid
                colorCode = '';
            }
            else if (colorCode.length != 4 && colorCode.length != 0) {
                // color code is invalid
                colorCode = '';
                HtmlCc.Libs.Log.warn('Color code is invalid. Setting to model\'s default.');
            } else {
                // ensures that color code is upper case
                colorCode = colorCode.toUpperCase();
            }

            // check for interior
            if (interiorCode == null) {
                // set to default
                interiorCode = '';
            } else if (interiorCode.length != 2 && interiorCode.length != 0) {
                // color code is invalid
                interiorCode = '';
                HtmlCc.Libs.Log.warn('Interior code is invalid. Setting to model\'s default.');
            } else {
                // ensures that interior code is upper case
                interiorCode = interiorCode.toUpperCase();
            }

            // check for packages
            if ($.isArray(packages) === false) {
                // set to default if invalid
                packages = [];
                HtmlCc.Libs.Log.warn('Package array is invalid. Setting to model\'s default.');
            } else {
                // ensures that package codes are upper case
                for (var i = 0; i < packages.length; i++) {
                    packages[i] = packages[i].toUpperCase();
                }
                // sort package array
                packages.sort();
            }

            // ensures rendering type has only allowed values
            renderingType = renderingType.toLowerCase();
            switch (renderingType) {
                case 'standard':
                    break;
                case 'standard-ee-norender':
                    break;
                default:
                    renderingType = 'standard';
            }

            // ensure that callbacks are set
            successCallback = successCallback || function () { };
            errorCallback = errorCallback || function () { };

            // ensures that motorId and equipmentId is really integer or empty string
            motorId = parseInt(motorId) || '';
            equipmentId = parseInt(equipmentId) || '';
            if (motorId != '' && equipmentId != '') {
                // only one of them can be defined
                equipmentId = '';
            }

            var xhr = null;

            // calls ajax request
            var ajaxFunc = function () {
                return $.ajax(ajaxParams);
            };
            var ajaxErrCallback = function (jqXHR, textStatus, errorThrown) {
                errorCallback(jqXHR, textStatus, errorThrown);
            };
            var ajaxParams = {
                'url': _settings.getConfigureUrl(),
                'data': {
                    'version': _settings.getVersion(),
                    'instanceName': _settings.getInstanceName(),
                    'salesProgramName': _settings.getSalesprogramName(),
                    'language': _settings.getCulture(),
                    'modelCode': modelCode,
                    'carlineCode': carlineCode,
                    'color': colorCode,
                    'interior': interiorCode,
                    'packages': packages.join(','),
                    'renderingType': renderingType,
                    'equipmentId': equipmentId,
                    'motorId': motorId,
                    'protocol': _settings.getProtocolVersion(),
                    'variantSetVersion': _settings.getVariantSetVersion(),
                    'comparisonTranslVersion': _settings.getComparisonTranslVersion()
                    //'importerDisclamerSettings': _settings.getImporterDisclamerSettings()
                },
                'dataType': 'json',
                'type': 'GET',
                'success': function (data, textStatus, jqXHR) {

                    if (data.Error != null) {
                        var errMessage = data.Error.Description;
                        ajaxErrCallback(jqXHR, data.Error.Class, errMessage);
                        return;
                    }

                    if (data.CurrentMotor == null) {
                        // something goes wrong
                        var errMessage = 'Current motor is not present. Somethng goes wrong. Do model and carline code exist?';
                        ajaxErrCallback(jqXHR, errMessage, errMessage);
                        return;
                    }
                  
                    // save configuration into configuration storage
                    _configurationStorage.saveConfiguration(data);

                    // simple assertion; there should be always a current motor
                    var pkgs = [];
                    for (var i = 0; i < data.CurrentMotor.Packages.length; i++) {
                        if (data.CurrentMotor.Packages[i].HasQuantity == true) {
                            pkgs.push('{0}({1})'.format(data.CurrentMotor.Packages[i].Code, data.CurrentMotor.Packages[i].Quantity));
                        } else {
                            pkgs.push(data.CurrentMotor.Packages[i].Code);
                        }
                        
                    }
                    var currentMotor = _configurationStorage.getFullMotor(data.CurrentMotor.Id, data.CurrentMotor.SelectedColor, data.CurrentMotor.SelectedInterior, pkgs);
                    if (currentMotor == null) {
                        var errMessage = 'Received incomplete data from server. Press F5 for recover.';
                        ajaxErrCallback(jqXHR, errMessage, errMessage);
                        return;
                    }

                    // execution of success callback
                    successCallback(data, textStatus, jqXHR);
                },
                'error': ajaxErrCallback,
                'timeout': _settings.getTimeout()
            };
            return ajaxFunc();
        };

        // prepaires a skeleton of configuration tree model -> equipments -> motors (motor lookups)
        this.prepairSkeleton = function (modelCode, carlineCode, colorCode, interiorCode, packages, successCallback, errorCallback) {
            /// <signature>
            /// <param name='modelCode' type='String' />
            /// <param name='carlineCode' type='String' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <param name='successCallback' type='Function' />
            /// <param name='errorCallback' type='Function' />
            /// <returns type='XMLHttpRequest'/>
            /// </signature>

            var successConfigure = function (data, textStatus, jqXHR) {
                successCallback(data, textStatus, jqXHR);
            };
            var errorConfigure = function (jqXHR, textStatus, errorThrown) {
                ajaxErrorHandling(jqXHR, call, errorCallback, textStatus, errorThrown);
            };

            var call = function () {
                return ajaxConfigureCall(modelCode, carlineCode, colorCode, interiorCode, packages, 'standard', null, null,
                successConfigure,
                errorConfigure);
            };

            return call();
        };

        // prepaires a skeleton of configuration tree model -> equipments -> motors (motor lookups)
        this.prepairMotorsInEquipment = function (equipmentId, colorCode, interiorCode, packages, successCallback, errorCallback) {
            /// <signature>
            /// <param name='equipmentId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <param name='successCallback' type='Function' />
            /// <param name='errorCallback' type='Function' />
            /// <returns type='XMLHttpRequest'/>
            /// </signature>

            var successConfigure = function (data, textStatus, jqXHR) {
                successCallback(data, textStatus, jqXHR);
            };
            var errorConfigure = function (jqXHR, textStatus, errorThrown) {
                ajaxErrorHandling(jqXHR, call, errorCallback);
            };

            var call = function () {
                return ajaxConfigureCall(thisCarConfiguration.getModelCode(), thisCarConfiguration.getCarlineCode(), colorCode, interiorCode, packages, 'standard', equipmentId, null,
                successConfigure,
                errorConfigure);
            };

            return call();
        };

        // prepaires configuration
        this.prepairConfiguration = function (motorId, colorCode, interiorCode, packages, renderingType, successCallback, errorCallback) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <param name='renderingType' type='String' />
            /// <param name='successCallback' type='Function' />
            /// <param name='errorCallback' type='Function' />
            /// <returns type='XMLHttpRequest'/>
            /// </signature>

            var successConfigure = function (data, textStatus, jqXHR) {
                successCallback(data, textStatus, jqXHR);
            };
            var errorConfigure = function (jqXHR, textStatus, errorThrown) {
                ajaxErrorHandling(jqXHR, call, errorCallback,textStatus, errorThrown);
            };

            var call = function () {
                return ajaxConfigureCall(thisCarConfiguration.getModelCode(), thisCarConfiguration.getCarlineCode(), colorCode, interiorCode, packages, renderingType, null, motorId,
                successConfigure,
                errorConfigure);
            };

            return call();
        };

        // returns lookup motor by motor id
        this.getMotorLookup = function (motorId) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <returns type='MotorType'/>
            /// </signature>
            return _configurationStorage.getMotorLookup(motorId);
        };

        // returns simple version of motor
        this.getSimpleMotor = function (motorId, colorCode, interiorCode, packages) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <returns type='MotorType'/>
            /// </signature>
            return _configurationStorage.getSimpleMotor(motorId, colorCode, interiorCode, packages);
        };

        // returns full featured verion of motor object
        this.getFullMotor = function (motorId, colorCode, interiorCode, packages) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <param name='colorCode' type='String' />
            /// <param name='interiorCode' type='String' />
            /// <param name='packages' type='Array' elementType='String' />
            /// <returns type='MotorType'/>
            /// </signature>
            return _configurationStorage.getFullMotor(motorId, colorCode, interiorCode, packages);
        };

        // computes hash
        this.computeHash = function (color, interior, packages) {
            /// <signature>
            /// <param name='color' type='HtmlCc.Api.ColorType' />
            /// <param name='interior' type='HtmlCc.Api.InteriorType' />
            /// <param name='packages' type='Array' elementType='PackageType'  />
            /// <returns type='String'/>
            /// </signature>
            return _configurationStorage.computeHash(color, interior, packages);
        };

        // returns equipment of from current model
        this.getEquipment = function (equipmentId) {
            /// <signature>
            /// <param name='packages' type='int' />
            /// <returns type='EquipmentType'/>
            /// </signature>
            return thisCarConfiguration.getCurrentMotor().getEquipment().getModel().getEquipment(equipmentId);
        };

        // returns true whether motors in equipment are at least simple motors
        this.isEquipmentPrepaired = function (equipmentId) {
            /// <signature>
            /// <param name='equipmentId' type='int' />
            /// <returns type='bool'/>
            /// </signature>

            var equipment = this.getEquipment(equipmentId);

            if (equipment == null) {
                // something strange happend
                return undefined;
            }

            var currentMotor = thisCarConfiguration.getCurrentMotor();

            var lookups = equipment.getMotorLookups();

            var pkgs = [];
            $.each(currentMotor.getPackages(), function () {
                var pkg = this;
                if (pkg.hasQuantity() === true) {
                    pkgs.push('{0}({1})'.format(pkg.getCode(), pkg.getQuantity()));
                } else {
                    pkgs.push(pkg.getCode());
                }
            });

            var complete = true;
            $.each(lookups, function (k, v) {
                var simpleMotor = thisCarConfiguration.getSimpleMotor(v.getId(), currentMotor.getSelectedColor().getCode(), currentMotor.getSelectedInterior().getCode(), pkgs);
                if (simpleMotor == null) {
                    complete = false;
                    return;
                }
            });

            return complete;
        };
        
        // return true if sales program has defined extra prices
        this.hasExtraPrices = function () {
            return _coreSettings.getHasExtraPrices();
        };

        // to not use it unless you know what are you doing
        this._getSettings = function () {
            /// <signature>
            /// <returns type='SettingsType'/>
            /// </signature>
            return _settings;
        };

    };


    // ENUM tools
    var EnumTools = {
        fromValue: function (enumObject, intValue) {
            /// <signature>
            /// <param name='enumObject' type='Object' />
            /// <param name='intValue' type='int' />
            /// <returns type='Object'/>
            /// </signature>
            var retVal = null;
            $.each(enumObject, function (k, v) {
                if (v.value == intValue && v.value !== undefined) {
                    retVal = enumObject[k];
                }
            });
            return retVal;
        }
    };

    // ************
   
    

    // enumeration of fuel type
    var FuelTypeEnum = {
        DIESEL: {
            name: 'DIESEL',
            id: 0
        },
        PETROL: {
            name: 'PETROL',
            id: 1
        },
        LPG: {
            name: 'LPG',
            id: 2
        },
        CNG: {
            name: 'CNG',
            id: 3
        },
        UNKNOWN: {
            name: 'UNKNOWN',
            id: 99
        }
    };

   



    
    

    // type of package (extra equipment)
    var PackageType = HtmlCc.Api.PackageType = function (code, init) {
        /// <signature>
        /// <param name='code' type='String' />
        /// <param name='init' type='Object' />
        /// <returns type='PackageType'/>
        /// </signature>
        if (code === undefined && init === undefined) {
            // empty constructor
            return;
        }

        init = init || {};
        if (code === undefined) {
            throw new Error("Code is not defined.");
        }

        var _code = code;
        var _price = (init.price !== undefined && init.price !== null) ? parseFloat(init.price) : null;
        var _priceString = init.priceString || null;
        var _monthlyPrice = init.monthlyPrice || null;
        var _monthlyPriceAsyncGetters = [];
        var _monthlyPriceString = init.monthlyPriceString || null;
        var _monthlyPriceStringAsyncGetters = [];
        var _selectable = init.selectable == null ? true : (new Boolean(init.selectable) == true);
        var _enabled = init.enabled === undefined ? true : (new Boolean(init.enabled) == true);
        var _description = init.description || null;
        var _image = null;
        var _name = '';
        var _shortName = '';
        var _videoUrl = '';

        var _hasQuantity = false;
        var _quantity = null;
        var _suitable = false;
        var _recommended = false;
        var _isFromStandardEquipment = null;
        var _type = null;
        var _sort = 0;
        var _groupName;
        var _hasGroupName = false;


        
        this.setShortName = function (shortName) {
            _shortName = shortName;
        }

        this.getShortName = function () {
            return _shortName;
        }

        this.setGroupName = function (groupName) {
            _groupName = groupName
        };

        this.getGroupName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _groupName;
        };

        this.setHasGroupName = function (hasGroupName) {
            _hasGroupName = hasGroupName
        };

        this.getHasGroupName = function () {
            /// <signature>
            /// <returns type='Boolean'/>
            /// </signature>
            return _hasGroupName;
        };

        this.getGroupName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _groupName;
        };

        this.setHasGroupName = function (hasGroupName) {
            _hasGroupName = hasGroupName
        };

        this.getHasGroupName = function () {
            /// <signature>
            /// <returns type='Boolean'/>
            /// </signature>
            return _hasGroupName;
        };

        this.getCode = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _code;
        };
        this.getPrice = function () {
            /// <signature>
            /// <returns type='double'/>
            /// </signature>
            return _price;
        };
        this.setPrice = function (price) {
            /// <signature>
            /// <param name='price' type='double' />
            /// </signature>
            var tmp = price == null ? 0.0 : parseFloat(price);
            if (tmp == NaN) {
                tmp = 0.0;
            }
            _price = tmp;
        };
        this.getPriceString = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _priceString;
        };
        this.setPriceString = function (priceString) {
            /// <signature>
            /// <param name='priceString' type='String' />
            /// </signature>
            _priceString = priceString;
        };
        this.getMonthlyPrice = function () {
            /// <signature>
            /// <returns type='float'/>
            /// </signature>
            return _monthlyPrice;
        };
        this.getMonthlyPriceAsync = function (callback) {
            /// <signature>
            /// <param name='callback' type='Function'>function(monthlyPrice)</param>
            /// </signature>
            if (typeof callback !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_monthlyPrice == null) {
                _monthlyPriceAsyncGetters.push(callback);
            } else {
                callback(_monthlyPrice);
            }
        };
        this.setMonthlyPrice = function (monthlyPrice) {
            /// <signature>
            /// <param name='monthlyPrice' type='float' />
            /// </signature>
            var tmp = parseFloat(monthlyPrice);
            if (tmp == NaN) {
                _monthlyPrice = 0.0;
            } else {
                _monthlyPrice = tmp;
            }
            while (_monthlyPriceAsyncGetters.length > 0) {
                _monthlyPriceAsyncGetters.pop()(_monthlyPrice);
            }
        };
        this.getMonthlyPriceString = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _monthlyPriceString;
        }
        this.getMonthlyPriceStringAsync = function (callback) {
            /// <signature>
            /// <param name='callback' type='Function'>function(monthlyPriceString)</param>
            /// </signature>
            if (typeof callback !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_monthlyPriceString == null) {
                _monthlyPriceStringAsyncGetters.push(callback);
            } else {
                callback(_monthlyPriceString);
            }
        };
        this.setMonthlyPriceString = function (monthlyPriceString) {
            /// <signature>
            /// <param name='monthlyPriceString' type='String' />
            /// </signature>
            if (monthlyPriceString == null) {
                _monthlyPriceString = '';
            } else {
                _monthlyPriceString = monthlyPriceString;
            }
            while (_monthlyPriceStringAsyncGetters.length > 0) {
                _monthlyPriceStringAsyncGetters.pop()(_monthlyPriceString);
            }
        };
        this.isSelectable = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _selectable;
        };
        this.setSelectable = function (selectable) {
            /// <signature>
            /// <param name='selectable' type='bool' />
            /// </signature>
            _selectable = (new Boolean(selectable) == true);
        };
        this.isEnabled = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _enabled;
        };
        this.setEnabled = function (enabled) {
            /// <signature>
            /// <param name='enabled' type='bool' />
            /// </signature>
            _enabled = (new Boolean(enabled) == true);
        };
        this.getDescription = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _description;
        };
        this.setDescription = function (description) {
            /// <signature>
            /// <param name='description' type='String' />
            /// </signature>
            _description = description;
        };
        this.getImage = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.ImageType'/>
            /// </signature>
            return _image;
        };
        this.setImage = function (image) {
            /// <signature>
            /// <param name='image' type='HtmlCc.Api.ImageType' />
            /// </signature>
            if (!(image instanceof HtmlCc.Api.ImageType)) {
                throw new Error('Image is not instance of HtmlCc.Api.ImageType.');
            }
            _image = image;
        };
        this.getVideoUrl = function () {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            return _videoUrl;
        };
        this.setVideoUrl = function (url) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _videoUrl = url;
        };
        this.getName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _name;
        };
        this.setName = function (name) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _name = name;
        };

        this.getShortName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _shortName
        }

        this.setShortName = function (shortName) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _shortName = shortName;
        };

        this.getHasQuantity = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _hasQuantity;
        };
        // alias for getHasQuantity()
        this.hasQuantity = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return this.getHasQuantity();
        };
        this.setHasQuantity = function (quantity) {
            /// <signature>
            /// <param name='quantity' type='bool' />
            /// </signature>
            _hasQuantity = quantity;
        };
        this.getQuantity = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            if (this.getHasQuantity() == true && _quantity != null) {
                return _quantity;
            }
            return null;
        };

        this.getIsAccessories = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            /// 8 == PackageGroupTypeEnum.Accessories
            if (this.getType() == HtmlCc.Api.PackageGroupTypeEnum.ACCESSORIES.value) {
                return true;
            }
            else {
                return false;
            }
        }

        this.isSelectedAccesory = function (accessories) {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            if (accessories == undefined) {
                return false;
            }

            for (var i = 0; i < accessories.length; i++) {
                if (accessories[i] == this.getCode()) {
                    return true;
                }
            }
            return false;
            
        }

        this.setQuantity = function (quantity) {
            /// <signature>
            /// <param name='quantity' type='int' />
            /// </signature>
            var tmp = parseInt(quantity);
            if (tmp != NaN && tmp >= 0) {
                _quantity = tmp;
            } else {
                _quantity = null;
            }
        };
        this.getSuitable = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _suitable;
        };
        this.setSuitable = function (suitable) {
            /// <signature>
            /// <param name='suitable' type='bool' />
            /// </signature>
            _suitable = (new Boolean(suitable) == true);
        };
        // this.getSuitable() alias
        this.isSuitable = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return this.getSuitable();
        };
        this.getRecommended = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _recommended;
        };
        this.setRecommended = function (recommended) {
            /// <signature>
            /// <param name='recommended' type='bool' />
            /// </signature>
            _recommended = (new Boolean(recommended) == true);
        };
        // this.getSuitable() alias
        this.isRecommended = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return this.getRecommended();
        };
        // returns code with quantity param
        this.getFullCode = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>

            if (this.getQuantity() > 1) {
                return '{0}({1})'.format(this.getCode(), this.getQuantity());
            }
            return this.getCode();
        };
        // true if item is included in standard equipment - user for default wheel
        this.isFromStandardEquipment = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _isFromStandardEquipment;
        }
        // alias to this.isFromStandardEquipment()
        this.getIsFromStandardEquipment = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return this.isFromStandardEquipment();
        };
        // sets whether package (most likely standard wheel) is from standard equipment
        this.setIsFromStandardEquipment = function (isFromStandardEquipment) {
            /// <signature>
            /// <param name='isFromStandardEquipment' type='bool' />
            /// </signature>
            _isFromStandardEquipment = (new Boolean(isFromStandardEquipment) == true);
        };

        // get the particular type of package
        this.getType = function () {
            /// <signature>
            /// <returns type='string'/>
            /// </signature>
            return _type;
        }

        // set the particular type of package
        this.setType = function (type) {
            /// <signature>
            /// <param name='type' type='string' />
            /// </signature>
            return _type = type;
        }

        // get the order of the package
        this.sort = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _sort;
        }

        // set the order of the package
        this.setSort = function (sort) {
            /// <signature>
            /// <param name='type' type='sort' />
            /// </signature>
            return _sort = parseInt(sort);
        }

        // return true whether package belongs to skoda care products
        this.isSkodaCarePackage = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            var skodaCareType = ['1','2', '3', '4' ];
            for (var i = 0; i < skodaCareType.length; i++) {
                if (_type == skodaCareType[i]) {
                    return true;
                }
            }

            return false;
        }
    };


    // type of package group
    var PackageGroupType = HtmlCc.Api.PackageGroupType = function (id, name) {
        /// <signature>
        /// <param name='id' type='int' />
        /// <param name='name' type='String' />
        /// <returns type='PackageGroupType'/>
        /// </signature>
        if (id == null) {
            throw new Error("Argument id is not set.");
        }
        if (name == null) {
            throw new Error("Argument name is not set.");
        }

        var _id = id;
        var _name = name;
        var _sort = 0;
        var _packages = [];
        var _groupType = null;
        var _isDefault = false;

        this.getId = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _id;
        };
        this.getName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _name;
        };
        this.getSort = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _sort;
        };
        this.setSort = function (sort) {
            /// <signature>
            /// <param name='sort' type='int' />
            /// </signature>
            _sort = parseInt(sort);
        };
        this.getPackages = function () {
            /// <signature>
            /// <returns type='Array' elementType='PackageType' />
            /// </signature>
            return _packages;
        };
        this.getGroupType = function () {
            return _groupType;
        };
        this.setGroupType = function (groupType) {
            _groupType = groupType;
        };

        this.getIsDefault = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _isDefault;
        };
        this.setIsDefault = function (isDefault) {
            /// <signature>
            /// <param name='IsDefault' type='bool' />
            /// </signature>
            _isDefault = isDefault;
        };
    };



    // type of motor conflicts
    var ConflictsType = HtmlCc.Api.ConflictsType = function () {
        /// <signature>
        /// <returns type='ConflictsType'/>
        /// </signature>
        var _add = [];
        var _remove = [];
        var _exteriorConflict = false;
        var _interiorConflict = false;
        var _exteriorConflictModel;
        var _interiorConflictModel;

        this.getAdd = function () {
            /// <signature>
            /// <returns type='Array' elementType='PackageType' />
            /// </signature>
            return _add;
        };
        this.getRemove = function () {
            /// <signature>
            /// <returns type='Array' elementType='PackageType' />
            /// </signature>
            return _remove;
        };

        this.addAdd = function (packageToAdd) {
            /// <signature>
            /// <param name='packageToAdd' type='PackageType' />
            /// </signature>
            if (!(packageToAdd instanceof PackageType)) {
                throw new Error("Package to add is not instance of package.");
            }
            _add.push(packageToAdd);
        };
        this.addRemove = function (packageToRemove) {
            /// <signature>
            /// <param name='packageToRemove' type='packageType' />
            /// </signature>
            if (!(packageToRemove instanceof PackageType)) {
                throw new Error("Package to remove is not instance of package.");
            }
            _remove.push(packageToRemove);
        };
        this.getExteriorConflict = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _exteriorConflict;
        };
        // alias to this.getExteriorConflict()
        this.isExteriorConflict = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return this.getExteriorConflict();
        };
        this.setExteriorConflict = function (exteriorConflict) {
            /// <signature>
            /// <param name='exteriorConflict' type='bool' />
            /// </signature>
            _exteriorConflict = (new Boolean(exteriorConflict) == true);
        };
        this.getInteriorConflict = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return _interiorConflict;
        };
        // alias to this.getInteriorConflict()
        this.isInteriorConflict = function () {
            /// <signature>
            /// <returns type='bool'/>
            /// </signature>
            return this.getInteriorConflict();
        };
        this.setInteriorConflict = function (interiorConflict) {
            /// <signature>
            /// <param name='interiorConflict' type='bool' />
            /// </signature>
            _interiorConflict = (new Boolean(interiorConflict) == true);
        };

        this.getInteriorConflictModel = function () {
            /// <signature>
            /// <returns type='InteriorType'/>
            /// </signature>
            return _interiorConflictModel;
        };

        this.setInteriorConflictModel = function (interiorConflictModel) {
            /// <signature>
            /// <param name='interiorConflictModel' type='InteriorType' />
            /// </signature>
            _interiorConflictModel = interiorConflictModel;
        };

        this.getExteriorConflictModel = function () {
            /// <signature>
            /// <returns type='ExteriorType'/>
            /// </signature>
            return _exteriorConflictModel;
        };

        this.setExteriorConflictModel = function (exteriorConflictModel) {
            /// <signature>
            /// <param name='exteriorConflictModel' type='ColorType' />
            /// </signature>
            _exteriorConflictModel = exteriorConflictModel;
        };
    };

    // type of model
    var ModelType = HtmlCc.Api.ModelType = function (modelId) {
        /// <signature>
        /// <param name='modelId' type='int' />
        /// <returns type='ModelType'/>
        /// </signature>
        var _id = parseInt(modelId);
        var _code = null;
        var _renderedCode = null;
        var _defaultEquipmentId = null;
        var _description = null;
        var _name = null;
        var _priceFrom = null;
        var _priceFromString = null;
        var _image = null;
        var _modelYear = 2000;

        _co2Combined = new Co2Combined(0, 0, 0);
        _co2Gas = new Co2Gas(0, 0, 0);

        _fuelConsumptionCombined = new FuelConsumptionCalculationsType(0, 0, 0);
        _fuelConsumptionExtraUrban = new FuelConsumptionCalculationsType(0, 0, 0);
        _fuelConsumptionUrban = new FuelConsumptionCalculationsType(0, 0, 0);

        //CNG properties
        _fuelConsumptionCombinedGas = new FuelConsumptionCalculationsType(0, 0, 0);
        _fuelConsumptionExtraUrbanGas = new FuelConsumptionCalculationsType(0, 0, 0);
        _fuelConsumptionUrbanGas = new FuelConsumptionCalculationsType(0, 0, 0);

        var _equipments = [];

        this.getId = function () {
            /// <signature>
            /// <returns type='int' />
            /// </signature>
            return _id;
        };
        this.getCode = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _code;
        };
        this.setCode = function (code) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _code = code;
        };
        this.getRenderedCode = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _renderedCode;
        };
        this.setRenderedCode = function (renderedCode) {
            /// <signature>
            /// <param name='renderedcode' type='String' />
            /// </signature>
            _renderedCode = renderedCode;
        };
        this.getDefaultEquipmentId = function () {
            /// <signature>
            /// <returns type='int' />
            /// </signature>
            return _defaultEquipmentId;
        };
        this.setDefaultEquipmentId = function (defaultEquipmentId) {
            /// <signature>
            /// <param name='defaultEquipmentId' type='int' />
            /// </signature>
            var parsedValue = parseInt(defaultEquipmentId);
            if (parsedValue <= 0) {
                throw new Error("Invalid argument defaultEquipmentId.");
            }
            _defaultEquipmentId = parsedValue;
        };
        this.getDescription = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _description;
        };
        this.setDescription = function (description) {
            /// <signature>
            /// <param name='description' type='String' />
            /// </signature>
            _description = description;
        };
        this.getImage = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.ImageType' />
            /// </signature>
            return _image;
        };
        this.setImage = function (image) {
            /// <signature>
            /// <param name='image' type='HtmlCc.Api.ImageType' />
            /// </signature>
            if (!(image instanceof HtmlCc.Api.ImageType)) {
                throw new Error('Object image is not instance of HtmlCc.Api.ImageType.');
            }
            _image = image;
        };
        this.getName = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _name;
        };
        this.setName = function (name) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _name = name;
        };
        this.getPriceFrom = function () {
            /// <signature>
            /// <returns type='int' />
            /// </signature>
            return _priceFrom;
        };
        this.setPriceFrom = function (priceFrom) {
            /// <signature>
            /// <param name='priceFrom' type='int' />
            /// </signature>
            _priceFrom = parseFloat(priceFrom);
        };
        this.getPriceFromString = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _priceFromString;
        };
        this.setPriceFromString = function (priceFromString) {
            /// <signature>
            /// <param name='priceFromString' type='String' />
            /// </signature>
            _priceFromString = priceFromString;
        };

        this.getEquipments = function () {
            /// <signature>
            /// <returns type='Array' elementType='EquipmentType' />
            /// </signature>
            return _equipments;
        };
        this.getEquipment = function (equipmentId) {
            /// <signature>
            /// <param name='equipmentId' type='int' />
            /// <returns type='EquipmentType' />
            /// </signature>
            var equipment;
            for (var i = 0; i < _equipments.length; i++) {
                equipment = _equipments[i];
                if (equipment.getId() == equipmentId) {
                    return equipment;
                }
            }
            return null;
        };
        this.getModelYear = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _modelYear;
        };
        this.setModelYear = function (modelYear) {
            /// <signature>
            /// <param name='modelYear' type='String' />
            /// </signature>
            _modelYear = modelYear;
        };

        this.getFuelConsumptionCombined = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _fuelConsumptionCombined;
        };
        this.setFuelConsumptionCombined = function (fuelConsumption) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _fuelConsumptionCombined = new FuelConsumptionCalculationsType(fuelConsumption.Minimum, fuelConsumption.Maximum, fuelConsumption.Average);
        };


        this.getFuelConsumptionUrban = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _fuelConsumptionUrban;
        };
        this.setFuelConsumptionUrban = function (fuelConsumption) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _fuelConsumptionUrban = new FuelConsumptionCalculationsType(fuelConsumption.Minimum, fuelConsumption.Maximum, fuelConsumption.Average);
        };

        this.getFuelConsumptionExtraUrban = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _fuelConsumptionExtraUrban;
        };
        this.setFuelConsumptionExtraUrban = function (fuelConsumption) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _fuelConsumptionExtraUrban = new FuelConsumptionCalculationsType(fuelConsumption.Minimum, fuelConsumption.Maximum, fuelConsumption.Average);
        };

        this.getFuelConsumptionExtraUrbanGas = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _fuelConsumptionExtraUrbanGas;
        };
        this.setFuelConsumptionExtraUrbanGas = function (fuelConsumptionGas) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _fuelConsumptionExtraUrbanGas = new FuelConsumptionCalculationsType(fuelConsumptionGas.Minimum, fuelConsumptionGas.Maximum, fuelConsumptionGas.Average);
        };

        this.getFuelConsumptionUrbanGas = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _fuelConsumptionUrbanGas;
        };
        this.setFuelConsumptionUrbanGas = function (fuelConsumptionGas) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _fuelConsumptionUrbanGas = new FuelConsumptionCalculationsType(fuelConsumptionGas.Minimum, fuelConsumptionGas.Maximum, fuelConsumptionGas.Average);
        };

        this.getFuelConsumptionCombinedGas = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _fuelConsumptionCombinedGas;
        };
        this.setFuelConsumptionCombinedGas = function (fuelConsumptionGas) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _fuelConsumptionCombinedGas = new FuelConsumptionCalculationsType(fuelConsumptionGas.Minimum, fuelConsumptionGas.Maximum, fuelConsumptionGas.Average);
        };

        this.getCo2Combined = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _co2Combined;
        };
        this.setCo2Combined = function (co2Combined) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _co2Combined = new Co2Combined(co2Combined.Minimum, co2Combined.Maximum, co2Combined.Average);
        };

        this.getCo2Gas = function () {
            /// <signature>
            /// <returns type='Decimal' />
            /// </signature>
            return _co2Gas;
        };
        this.setCo2Gas = function (co2Gas) {
            /// <signature>
            /// <param name='fuelConsumption' type='structure' />
            /// </signature>
            _co2Gas = new Co2Gas(co2Gas.Minimum, co2Gas.Maximum, co2Gas.Average);
        };

        _co2Combined = new Co2Combined(0, 0, 0);
        _co2Gas = new Co2Gas(0, 0, 0);

    };

    // type of equipment
    var EquipmentType = HtmlCc.Api.EquipmentType = function (model, equipmentId) {
        /// <signature>
        /// <param name='model' type='ModelType' />
        /// <param name='equipmentId' type='int' />
        /// <returns type='EquipmentType'/>
        /// </signature>
        var _id = parseInt(equipmentId);

        if (!(model instanceof ModelType)) {
            throw new Error("Model is not instance of model.");
        }
        var _model = model;

        var _code = null;
        var _defaultMotorId = null;
        var _motorLookup = [];
        var _motors = [];
        var _name = null;
        var _priceFrom = null;
        var _priceFromString = null;
        var _image = null;
        var _description = null;
        var _order = 0;

        this.getId = function () {
            /// <signature>
            /// <returns type='int' />
            /// </signature>
            return _id;
        };
        this.getCode = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _code;
        };
        this.setCode = function (code) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _code = code;
        };
        this.getDefaultMotorId = function () {
            /// <signature>
            /// <returns type='int' />
            /// </signature>
            return _defaultMotorId;
        };
        this.setDefaultMotorId = function (defaultMotorId) {
            /// <signature>
            /// <param name='defaultMotorId' type='int' />
            /// </signature>
            var parsedVal = parseInt(defaultMotorId);
            if (parsedVal <= 0) {
                throw new Error("DefaultMotorId is not valid value.");
            }
            _defaultMotorId = defaultMotorId;
        };
        this.getModel = function () {
            /// <signature>
            /// <returns type='ModelType' />
            /// </signature>
            return _model;
        };
        this.getMotorLookups = function () {
            /// <signature>
            /// <returns type='Array' elementType='MotorType' />
            /// </signature>
            return _motorLookup;
        };
        this.getMotorLookup = function (motorId) {
            /// <signature>
            /// <param name='motorId' type='int' />
            /// <returns type='Array' elementType='MotorType' />
            /// </signature>
            var motor;
            for (var i = 0; i < _motorLookup.length; i++) {
                motor = _motorLookup[i];
                if (motor.getId() == motorId) {
                    return motor;
                }
            }
            return null;
        };
        this.getMotors = function () {
            /// <signature>
            /// <returns type='Array' elementType='MotorType' />
            /// </signature>
            return _motors;
        };
        this.getName = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _name;
        };
        this.setName = function (name) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _name = name;
        };
        this.getDescription = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _description;
        };
        this.setDescription = function (description) {
            /// <signature>
            /// <param name='description' type='String' />
            /// </signature>
            _description = description;
        };
        this.getImage = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.ImageType' />
            /// </signature>
            return _image;
        };
        this.setImage = function (image) {
            /// <signature>
            /// <param name='image' type='HtmlCc.Api.ImageType' />
            /// </signature>
            if (!(image instanceof HtmlCc.Api.ImageType)) {
                throw new Error('Object image is not instance of HtmlCc.Api.ImageType.');
            }
            _image = image;
        };
        this.getPriceFrom = function () {
            /// <signature>
            /// <returns type='int' />
            /// </signature>
            return _priceFrom;
        };
        this.setPriceFrom = function (priceFrom) {
            /// <signature>
            /// <param name='priceFrom' type='int' />
            /// </signature>
            _priceFrom = parseFloat(priceFrom);
        };
        this.getPriceFromString = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _priceFromString;
        };
        this.setPriceFromString = function (priceFromString) {
            /// <signature>
            /// <param name='priceFromString' type='String' />
            /// </signature>
            _priceFromString = priceFromString;
        };

        this.getSort = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _order;
        };
        this.setSort = function (sort) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _order = sort;
        };
    };

    function strToDecimal(strData) {
        var regx = /^(\d+([\.\,]\d+)?)/g;
        if (regx.test(strData)) {
            var strResult = strData.match(regx)[0].replace(",", ".");
            return parseFloat(strResult);
        }
        return 0;
    }

    var FuelConsumption = HtmlCc.Api.FuelConsumption = function (combined, extraUrban, urban) {

        var _combined = combined;
        var _extraUrban = extraUrban;
        var _urban = urban;

        var _combinedDecimal = strToDecimal(combined);
        var _extraUrbanDecimal = strToDecimal(extraUrban);
        var _urbanDecimal = strToDecimal(urban);

        this.getCombined = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _combined;
        };
        this.setCombined = function (combined) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _combined = combined;
            _combinedDecimal = strToDecimal(_combined);
        };

        this.getExtraUrban = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _extraUrban;
        };
        this.setExtraUrban = function (extraUrban) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _extraUrban = extraUrban;
            _extraUrbanDecimal = strToDecimal(_extraUrban);
        };

        this.getUrban = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _urban;
        };
        this.setUrban = function (urban) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _urban = urban;
            _urbanDecimal = strToDecimal(_urban);
        };

        this.getCombinedDecimal = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _combinedDecimal;
        };

        this.getExtraUrbanDecimal = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _extraUrbanDecimal;
        };

        this.getUrbanDecimal = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _urbanDecimal;
        };
    }

    var FuelConsumptionCalculationsType = HtmlCc.Api.FuelConsumptionCalculationsType = function (minimum, maximum, average) {

        var _minimum = minimum;
        var _maximum = maximum;
        var _average = average;

        this.getMinimum = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _minimum;
        };

        this.getMaximum = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _maximum;
        };

        this.getAverage = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _average;
        };
    }

    var Co2Combined = HtmlCc.Api.Co2Combined = function (minimum, maximum, average) {

        var _minimum = minimum;
        var _maximum = maximum;
        var _average = average;

        this.getMinimum = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _minimum;
        };

        this.getMaximum = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _maximum;
        };

        this.getAverage = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _average;
        };
    }

    var Co2Gas = HtmlCc.Api.Co2Gas = function (minimum, maximum, average) {

        var _minimum = minimum;
        var _maximum = maximum;
        var _average = average;

        this.getMinimum = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _minimum;
        };

        this.getMaximum = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _maximum;
        };

        this.getAverage = function () {
            /// <signature>
            /// <returns type='Decimal'/>
            /// </signature>
            return _average;
        };
    }


    // type of motor
    var MotorType = HtmlCc.Api.MotorType = function (equipment, motorId) {
        /// <signature>
        /// <param name='equipment' type='EquipmentType' />
        /// <param name='motorId' type='int' />
        /// <returns type='MotorType'/>
        /// </signature>
        var _id = parseInt(motorId);
        if (!(equipment instanceof EquipmentType)) {
            throw new Error("Equipment is not instance of equipment type.");
        }

        var thisMotor = this;
        var _queryString = null;
        var _equipment = equipment;
        var _actionCode = '';
        var _animationImages = [];
        var _availableColors = [];
        var _availableInteriors = [];
        var _availablePackageGroups = [];
        var _availableSkodaCareGroups = [];
        var _availableWheels = [];
        var _mbvKey = null;
        var _year = null;
        var _code = null;
        var _conflicts = new ConflictsType();
        var _defaultColor = null;
        var _defaultInterior = null;
        var _description = null;
        var _fuelType = null;
        var _fuelNameTranslated = null;
        var _motorCubicCapacity = null;
        var _gearboxLabel = null;
        var _image = null;
        var _name = null;
        var _packages = [];
        var _power = null;
        var _isOnRight = null;

        var _price = null;
        var _priceString = null;

        var _priceFrom = null;
        var _priceFromString = null;

        var _priceExterior = null;
        var _priceExteriorString = null;

        var _priceInterior = null;
        var _priceInteriorString = null;

        var _pricePackages = null;
        var _pricePackagesString = null;

        var _totalExtraPrices = [];

        var _selectedColor = null;
        var _selectedInterior = null;
        var _selectedWheel = null;
        var _shortName = null;
        var _sort = 0;
        var _viewpointImages = [];
        var _type = 'simple';
        var _wallpaperUrl = null;

        var _emission = null;
        var _emissionGas = null;

        var _energyClass = null;
        var _engineType = null;

        var _fuelConsumption = null;
        var _fuelConsumptionGas = null;

        this.getId = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _id;
        };
        this.getEquipment = function () {
            /// <signature>
            /// <returns type='EquipmentType'/>
            /// </signature>
            return _equipment;
        };
        this.getActionCode = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _actionCode;
        };
        this.setActionCode = function (actionCode) {
            /// <signature>
            /// <param name='actionCode' type='String' />
            /// </signature>
            _actionCode = actionCode;
        };

        this.getIsOnRight = function () {
            /// <signature>
            /// <returns type='Bool'/>
            /// </signature>
            if (_isOnRight === null) {
                var image = this.getAnimationImages()[0];
                if (image) {
                    _isOnRight = image.getQueryString().indexOf("l0r") === -1;
                }
            }

            return _isOnRight;
        };

        this.getAnimationImages = function () {
            /// <signature>
            /// <returns type='Array' elementType='HtmlCc.Api.ImageType' />
            /// </signature>
            return _animationImages;
        };
        this.getAvailableColors = function () {
            /// <signature>
            /// <returns type='Array' elementType='HtmlCc.Api.ColorType' />
            /// </signature>
            return _availableColors;
        };
        this.getAvailableColor = function (colorCode) {
            /// <signature>
            /// <param name='colorCode' type='String' />
            /// <returns type='HtmlCc.Api.ColorType' />
            /// </signature>
            var ret = null;
            $.each(this.getAvailableColors(), function (k, v) {
                if (v.getCode() == colorCode) {
                    ret = v;
                    return;
                }
            });
            return ret;
        };
        this.getAvailableInteriors = function () {
            /// <signature>
            /// <returns type='Array' elementType='HtmlCc.Api.InteriorType' />
            /// </signature>
            return _availableInteriors;
        };
        this.getAvailableInterior = function (interiorCode) {
            /// <signature>
            /// <param name='interiorCode' type='String' />
            /// <returns type='HtmlCc.Api.InteriorType' />
            /// </signature>
            var ret = null;
            $.each(this.getAvailableInteriors(), function (k, v) {
                if (v.getCode() == interiorCode) {
                    ret = v;
                    return;
                }
            });
            return ret;
        };
        this.getAvailablePackageGroups = function () {
            /// <signature>
            /// <returns type='Array' elementType='PackageGroupType' />
            /// </signature>
            return _availablePackageGroups;
        };
        this.getAvailableSkodaCareGroups = function () {
            /// <signature>
            /// <returns type='Array' elementType='PackageGroupType' />
            /// </signature>
            return _availableSkodaCareGroups;
        };

        // returns default item from availablePackageGroups
        this.getDefaultPackageGroup = function () {
            /// <signature>
            /// <returns type='PackageGroupType' />
            /// </signature>
            var ret = null;
            $.each(this.getAvailablePackageGroups(), function (k, v) {
                if (v.getIsDefault()) {
                    ret = v;
                    return;
                }                            
            });

            return ret;
        }

        // returns available package from availablePackageGroups
        this.getAvailablePackage = function (packageCode) {
            /// <signature>
            /// <param name='packageCode' type='String' />
            /// <returns type='PackageType' />
            /// </signature>
            var ret = null;
            $.each(this.getAvailablePackageGroups(), function (k, v) {
                $.each(v.getPackages(), function (k2, v2) {
                    if (v2.getCode() == packageCode) {
                        ret = v2;
                        return;
                    }
                });
                if (ret != null) {
                    return;
                }
            });
            return ret;
        };
        // returns available package from availableSkodaCareGroups
        this.getAvailablePackageInSkodaCare = function (packageCode) {
            /// <signature>
            /// <param name='packageCode' type='String' />
            /// <returns type='PackageType' />
            /// </signature>
            var ret = null;
            $.each(this.getAvailableSkodaCareGroups(), function (k, v) {
                $.each(v.getPackages(), function (k2, v2) {
                    if (v2.getCode() == packageCode) {
                        ret = v2;
                        return;
                    }
                });
                if (ret != null) {
                    return;
                }
            });
            return ret;
        };

        // returns default item from availableSkodaCareGroups
        this.getDefaultSkodaCareGroup = function () {
            /// <signature>
            /// <returns type='PackageGroupType' />
            /// </signature>
            var ret = null;
            $.each(this.getAvailableSkodaCareGroups(), function (k, v) {
                if (v.getIsDefault()) {
                    ret = value;
                    return;
                }
            });

            return ret;
        }

        this.getAvailableWheels = function () {
            /// <signature>
            /// <returns type='Array' elementType='PackageType'/>
            /// </signature>
            return _availableWheels;
        };
        this.getAvailableWheel = function (wheelCode) {
            /// <signature>
            /// <param name='wheelCode' type='String' />
            /// <returns type='PackageType' />
            /// </signature>
            for (var i = 0; i < _availableWheels.length; i++) {
                if (wheelCode == _availableWheels[i].getCode()) {
                    return _availableWheels[i];
                }
            }
            return null;
        };

        this.getMbvKey = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _mbvKey;
        };
        this.setMbvKey = function (mbvKey) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _mbvKey = mbvKey;
        };

        this.getYear = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _mbvKey;
        };
        this.setYear = function (year) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _year = year;
        };

        this.getCode = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _code;
        };
        this.setCode = function (code) {
            /// <signature>
            /// <param name='code' type='String' />
            /// </signature>
            _code = code;
        };
        this.getQueryString = function () {
            /// <signature>
            /// <returns type='string[]'/>
            /// </signature>
            return _queryString;
        };
        this.setQueryString = function (queryString) {
            /// <signature>
            /// <param name='queryString' type='string[]' />
            /// </signature>
            _queryString = queryString;
        };

        this.getConflicts = function () {
            /// <signature>
            /// <returns type='ConflictsType'/>
            /// </signature>
            return _conflicts;
        };
        this.getDefaultColor = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.ColorType'/>
            /// </signature>
            return _defaultColor;
        };
        this.setDefaultColor = function (defaultColor) {
            /// <signature>
            /// <param name='defaultColor' type='HtmlCc.Api.ColorType' />
            /// </signature>
            if (!(defaultColor instanceof HtmlCc.Api.ColorType)) {
                throw new Error("Default color is not instance of color type.");
            }
            _defaultColor = defaultColor;
        };
        this.getDefaultInterior = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.InteriorType'/>
            /// </signature>
            return _defaultInterior;
        };
        this.setDefaultInterior = function (defaultInterior) {
            /// <signature>
            /// <param name='defaultInterior' type='HtmlCc.Api.InteriorType' />
            /// </signature>
            if (!(defaultInterior instanceof HtmlCc.Api.InteriorType)) {
                throw new Error("Default interior is not instance of interior type.");
            }
            _defaultInterior = defaultInterior;
        };
        this.getDescription = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _description;
        };
        this.setDescription = function (description) {
            /// <signature>
            /// <param name='description' type='String' />
            /// </signature>
            _description = description;
        };
        this.getFuelType = function () {
            /// <signature>
            /// <returns type='Object'/>
            /// </signature>
            return _fuelType;
        };
        this.setFuelType = function (fuelType) {
            /// <signature>
            /// <param name='fuelType' type='Object,String' />
            /// </signature>
            if (fuelType in FuelTypeEnum) {
                _fuelType = FuelTypeEnum[fuelType];
            } else {
                var found = false;
                $.each(FuelTypeEnum, function (k, v) {
                    if (v === fuelType) {
                        _fuelType = fuelType;
                        found = true;
                        found = true;
                    }
                });
                if (found == false) {
                    throw new Error("FuelType is not value from fuel type enum.");
                }
            }
        };
        this.getFuelNameTranslated = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _fuelNameTranslated;
        };
        this.setFuelNameTranslated = function (fuelNameTranslated) {
            /// <signature>
            /// <param name='fuelNameTranslated' type='String' />
            /// </signature>
            _fuelNameTranslated = fuelNameTranslated;
        };
        this.getMotorCubicCapacity = function () {
            /// <signature>
            /// <returns type='Number'/>
            /// </signature>
            return _motorCubicCapacity;
        };
        this.setMotorCubicCapacity = function (motorCubicCapacity) {
            /// <signature>
            /// <param name='motorCubicCapacity' type='Number' />
            /// </signature>
            _motorCubicCapacity = motorCubicCapacity;
        };
        this.getGearboxLabel = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _gearboxLabel;
        };
        this.setGearboxLabel = function (gearboxLabel) {
            /// <signature>
            /// <param name='gearboxLabel' type='String' />
            /// </signature>
            _gearboxLabel = gearboxLabel;
        };
        this.getImage = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.ImageType'/>
            /// </signature>
            return _image;
        };
        this.setImage = function (image) {
            /// <signature>
            /// <param name='image' type='HtmlCc.Api.ImageType' />
            /// </signature>
            if (!(image instanceof HtmlCc.Api.ImageType)) {
                throw new Error("Image is not type of HtmlCc.Api.ImageType.");
            }
            _image = image;
        };
        this.getName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _name;
        };
        this.setName = function (name) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _name = name;
        };
        this.getPackages = function () {
            /// <signature>
            /// <returns type='Array' elementType='PackageType' />
            /// </signature>
            return _packages;
        };
        this.getPower = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _power;
        };
        this.setPower = function (power) {
            /// <signature>
            /// <param name='power' type='String' />
            /// </signature>
            _power = power;
        };
        this.getPrice = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _price;
        };
        this.setPrice = function (price) {
            /// <signature>
            /// <param name='price' type='int' />
            /// </signature>
            _price = parseFloat(price);
        };
        this.getPriceString = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _priceString;
        };
        this.setPriceString = function (priceString) {
            /// <signature>
            /// <param name='priceString' type='String' />
            /// </signature>
            _priceString = priceString;
        };
        this.getPriceFrom = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _priceFrom;
        };
        this.setPriceFrom = function (priceFrom) {
            /// <signature>
            /// <param name='priceFrom' type='int' />
            /// </signature>
            _priceFrom = parseFloat(priceFrom);
        };
        this.getPriceFromString = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _priceFromString;
        };
        this.setPriceFromString = function (priceFromString) {
            /// <signature>
            /// <param name='priceFromString' type='String' />
            /// </signature>
            _priceFromString = priceFromString;
        };
        this.getPriceExteriorString = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _priceExteriorString;
        };
        this.setPriceExteriorString = function (priceExteriorString) {
            /// <signature>
            /// <param name='priceExteriorString' type='String' />
            /// </signature>
            _priceExteriorString = priceExteriorString;
        };
        this.getPriceExterior = function () {
            /// <signature>
            /// <returns type='float'/>
            /// </signature>
            return _priceExterior;
        };
        this.setPriceExterior = function (priceExterior) {
            /// <signature>
            /// <param name='priceExteriorString' type='float' />
            /// </signature>
            _priceExterior = priceExterior;
        };
        this.getPriceInteriorString = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _priceInteriorString;
        };
        this.setPriceInteriorString = function (priceInteriorString) {
            /// <signature>
            /// <param name='priceInteriorString' type='String' />
            /// </signature>
            _priceInteriorString = priceInteriorString;
        };
        this.getPriceInterior = function () {
            /// <signature>
            /// <returns type='float'/>
            /// </signature>
            return _priceInterior;
        };
        this.setPriceInterior = function (priceInterior) {
            /// <signature>
            /// <param name='priceInterior' type='float' />
            /// </signature>
            _priceInterior = priceInterior;
        };
        this.getPricePackagesString = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _pricePackagesString;
        };
        this.setPricePackagesString = function (pricePackagesString) {
            /// <signature>
            /// <param name='pricePackagesString' type='String' />
            /// </signature>
            _pricePackagesString = pricePackagesString;
        };
        this.getPricePackages = function () {
            /// <signature>
            /// <returns type='float'/>
            /// </signature>
            return _pricePackages;
        };
        this.setPricePackages = function (pricePackages) {
            /// <signature>
            /// <param name='pricePackages' type='float' />
            /// </signature>
            _pricePackages = pricePackages;
        };
        this.getSelectedColor = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.ColorType'/>
            /// </signature>
            return _selectedColor;
        };
        this.setSelectedColor = function (selectedColor) {
            /// <signature>
            /// <param name='selectedColor' type='HtmlCc.Api.ColorType' />
            /// </signature>
            if (!(selectedColor instanceof HtmlCc.Api.ColorType)) {
                throw new Error("Selected color is not instance of HtmlCc.Api.ColorType.");
            }
            _selectedColor = selectedColor;
        };
        this.getSelectedInterior = function () {
            /// <signature>
            /// <returns type='HtmlCc.Api.InteriorType'/>
            /// </signature>
            return _selectedInterior;
        };
        this.setSelectedInterior = function (selectedInterior) {
            /// <signature>
            /// <param name='selectedInterior' type='HtmlCc.Api.InteriorType' />
            /// </signature>
            if (!(selectedInterior instanceof HtmlCc.Api.InteriorType)) {
                throw new Error("Selected interior is not instance of HtmlCc.Api.InteriorType.");
            }
            _selectedInterior = selectedInterior;
        };
        this.getSelectedWheel = function () {
            /// <signature>
            /// <returns type='PackageType'/>
            /// </signature>
            return _selectedWheel;
        };
        this.setSelectedWheel = function (selectedWheel) {
            /// <signature>
            /// <param name='selectedWheel' type='PackageType' />
            /// </signature>
            if (selectedWheel == null) {
                _selectedWheel = null;
                return;
            }
            if (!(selectedWheel instanceof PackageType)) {
                throw new Error("Selected wheel is not instance of PackageType.");
            }
            _selectedWheel = selectedWheel;
        };
        this.getShortName = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _shortName;
        };
        this.setShortName = function (shortName) {
            /// <signature>
            /// <param name='shortName' type='String' />
            /// </signature>
            _shortName = shortName;
        };
        this.getSort = function () {
            /// <signature>
            /// <returns type='int'/>
            /// </signature>
            return _sort;
        };
        this.setSort = function (sort) {
            /// <signature>
            /// <param name='sort' type='int' />
            /// </signature>
            _sort = parseInt(sort);
        };
        this.getViewpointImages = function () {
            /// <signature>
            /// <returns type='Array' elementType='HtmlCc.Api.ImageType' />
            /// </signature>
            return _viewpointImages;
        };
        this.getWallpaperUrl = function () {
            return _wallpaperUrl;
        };
        this.setWallpaperUrl = function (wallPaperUrl) {
            _wallpaperUrl = wallPaperUrl;
        };
        this.getTotalExtraPrices = function () {
            return _totalExtraPrices;
        }

        // type of motor - lookup | simple | full
        this.getType = function () {
            /// <signature>
            /// <returns type='String' />
            /// </signature>
            return _type;
        };
        // sets type of motor - lookup | simple | full
        this.setType = function (type) {
            /// <signature>
            /// <param name='type' type='String' />
            /// </signature>
            if (type == 'lookup' || type == 'simple' || type == 'full') {
                _type = type;
            } else {
                throw new Error('Invalid type.');
            }
        };

        this.getEmission = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _emission;
        };

        this.getEmissionDouble = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return strToDecimal(_emission);
        };

        this.setEmission = function (emission) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _emission = emission;
        };

        this.getEmissionGas = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _emissionGas;
        };

        this.getEmissionGasDouble = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return strToDecimal(_emissionGas);
        };

        this.setEmissionGas = function (emission) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _emissionGas = emission;
        };

        this.getEnergyClass = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _energyClass;
        };
        this.setEnergyClass = function (energyClass) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _energyClass = energyClass;
        };

        this.getFuelConsumption = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _fuelConsumption;
        };
        this.setFuelConsumption = function (fuelConsumption) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            // ctor - (combined, extraUrban, urban)
            _fuelConsumption = new HtmlCc.Api.FuelConsumption(fuelConsumption.Combined, fuelConsumption.ExtraUrban, fuelConsumption.Urban);
        };

        this.getFuelConsumptionGas = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _fuelConsumptionGas;
        };
        this.setFuelConsumptionGas = function (fuelConsumptionGas) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            // ctor - (combined, extraUrban, urban)
            _fuelConsumptionGas = new HtmlCc.Api.FuelConsumption(fuelConsumptionGas.CombinedGas, fuelConsumptionGas.ExtraUrbanGas, fuelConsumptionGas.UrbanGas);
        };

        this.getEngineType = function () {
            /// <signature>
            /// <returns type='String'/>
            /// </signature>
            return _engineType
        }

        this.setEngineType = function (engineType) {
            /// <signature>
            /// <param name='name' type='String' />
            /// </signature>
            _engineType = engineType
        }

        this.getExtraEquipmentByCode = function(eqCode){
            /// <signature>
            /// <param name='eqCode' type='String' />
            /// </signature>
            for (var i = 0; i < this.getAvailablePackageGroups().length; i++) {
                var packageGroup = this.getAvailablePackageGroups()[i];
                
                for (var j = 0; j < packageGroup.getPackages().length; j++) {
                    var eq = packageGroup.getPackages()[j];
                    if(eq.getCode() == eqCode){
                        return eq;
                    }
                }                
            }
            return null;
        }

        // executes financing at this motor; prepaires monthly prices at every equipment and price
        this.executeFinancing = function (financingObject, successCallback, errorCallback) {
            /// <signature>
            /// <param name='financingObject' type='FinancingType' />
            /// <param name='successCallback' type='Function' />
            /// <param name='errorCallback' type='Function' />
            /// </signature>
            if (!(financingObject instanceof FinancingType)) {
                throw new Error('Object financingObject is not an instance of FinancingType.');
            }
            if (typeof successCallback !== 'function') {
                throw new Error('Object successCallback is not a function.');
            }
            if (typeof errorCallback !== 'function') {
                throw new Error('Object errorCallback is not a function.');
            }

            _cacheExteriorMonthly = null;
            _cacheExteriorMonthlyString = null;
            _cacheInteriorMonthly = null;
            _cacheInteriorMonthlyString = null;
            _cacheExteriorMonthly = null;
            _cacheExteriorMonthlyString = null;
            _cacheMonthly = null;
            _cacheMonthlyString = null;

            var parts = {
                exterior: this.getPriceExterior(),
                interior: this.getPriceInterior(),
                packages: this.getPricePackages()
            };

            var settersUnformatted = {};
            var settersFormatted = {};
          
            var availablePackageGroups = 
                this.getAvailablePackageGroups().concat(this.getAvailableSkodaCareGroups());

            for (var i = 0; i < availablePackageGroups.length; i++) {
                var availablePackageGroup = availablePackageGroups[i];
                var availablePackages = availablePackageGroup.getPackages();
                for (var j = 0; j < availablePackages.length; j++) {
                    var availablePackage = availablePackages[j];

                    parts[availablePackage.getCode()] = availablePackage.getPrice();
                    settersUnformatted[availablePackage.getCode()] = availablePackage.setMonthlyPrice;
                    settersFormatted[availablePackage.getCode()] = availablePackage.setMonthlyPriceString;
                }
            }

            financingObject.getPartRates(this, parts, function (partRatesData) {
                if (partRatesData.Error != null && partRatesData.Error.Fatal == 'yes') {
                    errorCallback();
                    return;
                }

                if (partRatesData.PartRates == null || !$.isArray(partRatesData.PartRates) || partRatesData.Rate == null) {
                    HtmlCc.Libs.Log.warn('GetPartRates returned an errornous output.');
                    errorCallback();
                    return;
                }

               

                // sets part rates
                $.each(partRatesData.PartRates, function () {
                    var partRate = this;
                    if (partRate.ID in settersFormatted && partRate.ID in settersUnformatted) {
                        settersFormatted[partRate.ID](partRate.Rate.FormattedValueByCC);
                        settersUnformatted[partRate.ID](partRate.Rate.UnformattedValue);

                        SkodaAuto.Event.publish(
                            'event.partRateChanged',
                             { formattedRate: partRate.Rate.FormattedValueByCC, unformattedRate: partRate.Rate.UnformattedValue, id: partRate.ID });

                    } else {
                        switch (partRate.ID) {
                            case 'exterior':
                                setExteriorMonthly(partRate.Rate.UnformattedValue, partRate.Rate.FormattedValueByCC);
                                break;
                            case 'interior':
                                setInteriorMonthly(partRate.Rate.UnformattedValue, partRate.Rate.FormattedValueByCC);
                                break;
                            case 'packages':
                                setPackagesMonthly(partRate.Rate.UnformattedValue, partRate.Rate.FormattedValueByCC);
                                break;
                        }
                    }
                });

                // sets rate
                setMonthly(partRatesData.Rate.Value.UnformattedValue, partRatesData.Rate.Value.FormattedValueByCC);
                successCallback(partRatesData);
            }, function () {
                errorCallback();
            });
        };

        var _cacheExteriorMonthly = null;
        var _cacheExteriorMonthlyFilledCallbacks = [];

        var _cacheExteriorMonthlyString = null;
        var _cacheExteriorMonthlyStringFilledCallbacks = [];

        var _cacheInteriorMonthly = null;
        var _cacheInteriorMonthlyFilledCallbacks = [];

        var _cacheInteriorMonthlyString = null;
        var _cacheInteriorMonthlyStringFilledCallbacks = [];

        var _cachePackagesMonthly = null;
        var _cachePackagesMonthlyFilledCallbacks = [];

        var _cachePackagesMonthlyString = null;
        var _cachePackagesMonthlyStringFilledCallbacks = [];

        var _cacheMonthly = null;
        var _cacheMonthlyFilledCallbacks = [];

        var _cacheMonthlyString = null;
        var _cacheMonthlyStringFilledCallbacks = [];

        // sets monthly price
        var setMonthly = function (asFloat, asFormatted) {
            /// <signature>
            /// <param name='asFloat' type='float' />
            /// <param name='asFormatted' type='String' />
            /// </signature>

            _cacheMonthly = asFloat;
            _cacheMonthlyString = asFormatted;

            while (_cacheMonthlyFilledCallbacks.length > 0) {
                _cacheMonthlyFilledCallbacks.pop()(_cacheMonthly);
            }
            while (_cacheMonthlyStringFilledCallbacks.length > 0) {
                _cacheMonthlyStringFilledCallbacks.pop()(_cacheMonthlyString);
            }
        };

        // asynchronously calls callback with monthly rate in its argument
        this.getMonthlyAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cacheMonthly == null) {
                _cacheMonthlyFilledCallbacks.push(clbk);
            } else {
                clbk(_cacheMonthly);
            }
        };

        // asynchronously calls callback with formatted monthly rate in its argument
        this.getMonthlyStringAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cacheMonthlyString == null) {
                _cacheMonthlyStringFilledCallbacks.push(clbk);
            } else {
                clbk(_cacheMonthlyString);
            }
        };

        // sets interior monthly price
        var setPackagesMonthly = function (asFloat, asFormatted) {
            /// <signature>
            /// <param name='asFloat' type='float' />
            /// <param name='asFormatted' type='String' />
            /// </signature>

            _cachePackagesMonthly = asFloat;
            _cachePackagesMonthlyString = asFormatted;

            while (_cachePackagesMonthlyFilledCallbacks.length > 0) {
                _cachePackagesMonthlyFilledCallbacks.pop()(_cachePackagesMonthly);
            }
            while (_cachePackagesMonthlyStringFilledCallbacks.length > 0) {
                _cachePackagesMonthlyStringFilledCallbacks.pop()(_cachePackagesMonthlyString);
            }
        };

        // sets interior monthly price
        var setInteriorMonthly = function (asFloat, asFormatted) {
            /// <signature>
            /// <param name='asFloat' type='float' />
            /// <param name='asFormatted' type='String' />
            /// </signature>

            _cacheInteriorMonthly = asFloat;
            _cacheInteriorMonthlyString = asFormatted;

            while (_cacheInteriorMonthlyFilledCallbacks.length > 0) {
                _cacheInteriorMonthlyFilledCallbacks.pop()(_cacheInteriorMonthly);
            }
            while (_cacheInteriorMonthlyStringFilledCallbacks.length > 0) {
                _cacheInteriorMonthlyStringFilledCallbacks.pop()(_cacheInteriorMonthlyString);
            }
        };

        // sets exterior monthly price
        var setExteriorMonthly = function (asFloat, asFormatted) {
            /// <signature>
            /// <param name='asFloat' type='float' />
            /// <param name='asFormatted' type='String' />
            /// </signature>

            _cacheExteriorMonthly = asFloat;
            _cacheExteriorMonthlyString = asFormatted;

            while (_cacheExteriorMonthlyFilledCallbacks.length > 0) {
                _cacheExteriorMonthlyFilledCallbacks.pop()(_cacheExteriorMonthly);
            }
            while (_cacheExteriorMonthlyStringFilledCallbacks.length > 0) {
                _cacheExteriorMonthlyStringFilledCallbacks.pop()(_cacheExteriorMonthlyString);
            }
        };

        // asynchronously calls callback with monthly exterior rate in its argument
        this.getExteriorMonthlyAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cacheExteriorMonthly == null) {
                _cacheExteriorMonthlyFilledCallbacks.push(clbk);
            } else {
                clbk(_cacheExteriorMonthly);
            }
        };

        // asynchronously calls callback with formatted monthly exterior rate in its argument
        this.getExteriorMonthlyStringAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cacheExteriorMonthlyString == null) {
                _cacheExteriorMonthlyStringFilledCallbacks.push(clbk);
            } else {
                clbk(_cacheExteriorMonthlyString);
            }
        };

        // asynchronously calls callback with monthly interior rate in its argument
        this.getInteriorMonthlyAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cacheInteriorMonthly == null) {
                _cacheInteriorMonthlyFilledCallbacks.push(clbk);
            } else {
                clbk(_cacheInteriorMonthly);
            }
        };

        // asynchronously calls callback with formatted monthly interior rate in its argument
        this.getInteriorMonthlyStringAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cacheInteriorMonthlyString == null) {
                _cacheInteriorMonthlyStringFilledCallbacks.push(clbk);
            } else {
                clbk(_cacheInteriorMonthlyString);
            }
        };

        // asynchronously calls callback with monthly packages rate in its argument
        this.getPackagesMonthlyAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cachePackagesMonthly == null) {
                _cachePackagesMonthlyFilledCallbacks.push(clbk);
            } else {
                clbk(_cachePackagesMonthly);
            }
        };

        // asynchronously calls callback with formatted monthly packages rate in its argument
        this.getPackagesMonthlyStringAsync = function (clbk) {
            /// <signature>
            /// <param name='clbk' type='Function' />
            /// </signature>
            if (typeof clbk !== 'function') {
                throw new Error('Callback is not a function.');
            }
            if (_cachePackagesMonthlyString == null) {
                _cachePackagesMonthlyStringFilledCallbacks.push(clbk);
            } else {
                clbk(_cachePackagesMonthlyString);
            }
        };
    };


    if (ccSettings == null) {
        throw new Error("Configurator is not properly setted up.");
    }
    if (ccSettings.instanceName == null) {
        throw new Error("Configurator is not properly setted up. 'instanceName' is not set.");
    }
    if (ccSettings.salesprogramName == null) {
        throw new Error("Configurator is not properly setted up. 'salesprogramName' is not set.");
    }
    if (ccSettings.culture == null) {
        throw new Error("Configurator is not properly setted up. 'culture' is not set.");
    }
    if (ccSettings.versionUrl == null) {
        throw new Error("Configurator is not properly setted up. 'versionUrl' is not set.");
    }
    if (ccSettings.configureUrl == null) {
        throw new Error("Configurator is not properly setted up. 'configureUrl' is not set.");
    }

    // state of initialization
    var _initialized = false;
    // state of failure of initialization
    var _initFailed = false;
    // state of initialization callback
    var _initCallbackRunned = false;

    // after successful init callback
    var _afterInitSuccessCallback = ccSettings.afterInitSuccessCallback || function () { _initCallbackRunned = false; };
    this.setAfterInitSuccessCallback = function (afterInitSuccessCallback) {
        /// <signature>
        /// <param name='afterInitSuccessCallback' type='Function' />
        /// </signature>
        _afterInitSuccessCallback = afterInitSuccessCallback;
        if (_initialized == true && _initCallbackRunned == false) {
            _initCallbackRunned = true;
            _afterInitSuccessCallback();
        }
    };

    // after init failure callback (no connectivity, timeout, service unavailable)
    var _afterInitFailureCallback = ccSettings.afterInitFailureCallback || function () { _initCallbackRunned = false; };
    this.setAfterInitFailureCallback = function (afterInitFailureCallback) {
        /// <signature>
        /// <param name='afterInitFailureCallback' type='Function' />
        /// </signature>
        _afterInitFailureCallback = afterInitFailureCallback;
        if (_initFailed == true && _initCallbackRunned == false) {
            _initCallbackRunned = true;
            _afterInitFailureCallback();
        }
    };

    // sets model and carline; it prepaires skeleton and calls successCallback
    this.setModelAndCarline = function (modelCode, carlineCode, successCallback, errorCallback) {
        /// <signature>
        /// <param name='modelCode' type='String' />
        /// <param name='carlineCode' type='String' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>
        if (_initialized === false) {
            throw new Error('Configuratior is not initialized yet. Call this method in its successCallback.');
        }
        _carConfiguration.setModelAndCarline(modelCode, carlineCode, successCallback, errorCallback);
    };

    // returns carline code
    this.getCarlineCode = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getCarlineCode();
    };

    // returns model code
    this.getModelCode = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getModelCode();
    };

    this.getModelCodeShort = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getModelCode().substring(0, 2);
    };

    // returns culture name
    this.getCulture = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getCulture();
    };

    // returns sales program name
    this.getSalesProgramName = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getSalesProgramName();
    };

    // returns sales program id
    this.getSalesProgramId = function () {
        /// <signature>
        /// <returns type='int'/>
        /// </signature>
        return _carConfiguration.getSalesProgramId();
    };

    // returns instance name
    this.getInstanceName = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getInstanceName();
    };

    // returns instance id
    this.getInstanceId = function () {
        /// <signature>
        /// <returns type='int'/>
        /// </signature>
        return _carConfiguration.getInstanceId();
    };

    // returns version code
    this.getVersion = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getVersion();
    };

    // returns variantset version code
    this.getVariantSetVersion = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getVariantSetVersion();
    };

    this.getComparisonTranslVersion = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _carConfiguration.getComparisonTranslVersion();
    };

    this.getImporterDisclamerSettings = function () {
        return _carConfiguration.getImporterDisclamerSettings();
    };

    this.getSummaryTechDataList = function () {
        return _carConfiguration.getSummaryTechDataList();
    }

    this.getColorTypeNameSettings = function () {
        return _carConfiguration.getColorTypeNameSettings();
    }
   
    this.getEnergyClassSetupSettings = function () {
        return _carConfiguration.getEnergyClassSetupSettings();
    };

    this.getWheelDisplaySettings = function () {
        return _carConfiguration.getWheelDisplaySettings();
    };

    this.getEntryDialogSettings = function () {
        return _carConfiguration.getEntryDialogSettings();
    };
    
    this.isLoadingVredModel = function () {
        return _coreSettings.isLoadingVredModel();
    };

    this.setIsLoadingVredModel = function (isLoadingVredModel) {
        return _coreSettings.isLoadingVredModel();
    };

    // returns protocol version of comunication
    this.getProtocolVersion = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _coreSettings.getProtocolVersion();
    };

    // return facebook id
    this.getFacebookId = function () {
        return _coreSettings.getFacebookId();
    };

    this.getPageGroupName = function () {
        return _coreSettings.getPageGroupName();
    };

    this.getPageName = function (title, page) {
        return _coreSettings.getPageName(title, page);
    };

    this.getCCContext = function () {
        return _coreSettings.getCCContext();
    };

    // returns sales program setting by key
    this.getSalesProgramSetting = function (key) {
        return _coreSettings.getSalesProgramSetting(key);
    };

    // returns get version handler
    this.getVersionsUrl = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _coreSettings.getVersionsUrl();
    };

    // sets get version handler
    this.setVersionsUrl = function (versionsUrl) {
        /// <signature>
        /// <param name='versionsUrl' type='String' />
        /// </signature>
        _coreSettings.setVersionsUrl(versionsUrl);
    };

    // returns configure url handler
    this.getConfigureUrl = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _coreSettings.getConfigureUrl();
    };

    // sets configure url handler
    this.setConfigureUrl = function (configureUrl) {
        /// <signature>
        /// <param name='configureUrl' type='String' />
        /// </signature>
        _coreSettings.setConfigureUrl(configureUrl);
    };

    // return true if sales program has defined extra prices
    this.hasExtraPrices = function () {
        return _carConfiguration.hasExtraPrices();
    };

    // returns current configured motor
    this.getConfiguredMotor = function () {
        /// <signature>
        /// <returns type='MotorType'/>
        /// </signature>
        return _carConfiguration.getCurrentMotor();
    };

    // returns the configuration from before 5th step
    // unfortunately user has to visit at least 4th step to set it up
    this.getNonEquipedMotor = function () {
        return _carConfiguration.getNonEquipedMotor();
    }

    this.setNonEquipedMotor = function (motor) {
        _carConfiguration.setNonEquipedMotor(motor);
    }

    // returns simple motor by parameters or null if nothing ready yet
    this.getSimpleMotor = function (motorId, colorCode, interiorCode, packages) {
        /// <signature>
        /// <param name='motorId' type='int' />
        /// <param name='colorCode' type='String' />
        /// <param name='interiorCode' type='String' />
        /// <param name='packages' type='Array' elementType='String' />
        /// <returns type='MotorType'/>
        /// </signature>
        return _carConfiguration.getSimpleMotor(motorId, colorCode, interiorCode, packages);
    };

    // returns current configuration
    this.getCurrentConfigurationParams = function () {
        /// <signature>
        /// <returns type='HtmlCc.Api.Configurator.ConfigurationParams'/>
        /// </signature>
        var currentMotor = this.getConfiguredMotor();

        var cfgParams = new HtmlCc.Api.Configurator.ConfigurationParams(
            currentMotor.getId(),
            currentMotor.getSelectedColor().getCode(),
            currentMotor.getSelectedInterior().getCode(),
            HtmlCc.Libs.packagesToString(currentMotor.getPackages()));
        return cfgParams;
    };

    // precaches all motors from equipment
    this.prefetchEquipmentMotors = function (equipmentId, successCallback, errorCallback, settings) {
        /// <signature>
        /// <param name='equipmentId' type='int' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// <param name='settings' type='HtmlCc.Workflow.SettingsType'>Optional parameter settings. If it is set, color, interior and packages are covered from that.</param>
        /// <returns type='XMLHttpRequest'/>
        /// </signature>

        var currentMotor = this.getConfiguredMotor();

        equipmentId = parseInt(equipmentId);

        var pkgs = [];
        var colorCode = null;
        var interiorCode = null;
        if (HtmlCc.Workflow != null && HtmlCc.Workflow.SettingsType != null && settings instanceof HtmlCc.Workflow.SettingsType) {
            // we have got an optional setting so we get color, interior and params from that
            colorCode = settings.color;
            interiorCode = settings.interior;
            pkgs = settings.getPackagesArray();
        } else {
            colorCode = currentMotor.getSelectedColor().getCode();
            interiorCode = currentMotor.getSelectedInterior().getCode();
            $.each(currentMotor.getPackages(), function () {
                var v = this;
                if (v.hasQuantity() == true) {
                    pkgs.push('{0}({1})'.format(v.getFullCode(), v.getQuantity()));
                } else {
                    pkgs.push(v.getFullCode());
                }
            });
        }

        if (_carConfiguration.isEquipmentPrepaired(equipmentId)) {
            var equipment = _carConfiguration.isEquipmentPrepaired
            // equipment is already prepaired
            successCallback(null, null, null);
            return null;
        } else {
            // equipment will be fetched
            return _carConfiguration.prepairMotorsInEquipment(equipmentId, colorCode, interiorCode, pkgs,
                function (data, textStatus, jqXHR) {
                    successCallback(data, textStatus, jqXHR);
                }, function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                });
        }
    };

    // precaches skeleton with specific configuration params
    this.prefetchSkeleton = function (colorCode, interiorCode, packages, successCallback, errorCallback) {
        /// <signature>
        /// <param name='colorCode' type='String' />
        /// <param name='interiorCode' type='String' />
        /// <param name='packages' type='Array' elementType='String' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// <returns type='XMLHttpRequest'/>
        /// </signature>

        var modelCode = _carConfiguration.getModelCode();
        var carlineCode = _carConfiguration.getCarlineCode();

        return _carConfiguration.prepairSkeleton(modelCode, carlineCode, colorCode, interiorCode, packages,
            function (data, textStatus, jqXHR) {
                successCallback(data, textStatus, jqXHR);
            }, function (jqXHR, textStatus, errorThrown) {
                errorCallback(jqXHR, textStatus, errorThrown);
            });
    };

    // precaches motor with specified configuration; no notwork traffic if motor is already prefetched
    this.prefetchMotor = function (configurationParams, successCallback, errorCallback, motorType) {
        /// <signature>
        /// <param name='configurationParams' type='HtmlCc.Api.Configurator.ConfigurationParams' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// <param name='motorType' type='String'>"simple" | "full" | undefined == "full"</param>
        /// <returns type='XMLHttpRequest'/>
        /// </signature>

        var getMotorMethod = _carConfiguration.getFullMotor;
        if (motorType == 'simple') {
            getMotorMethod = _carConfiguration.getSimpleMotor;
        }

        var motor = getMotorMethod(configurationParams.motorId, configurationParams.colorCode, configurationParams.interiorCode, configurationParams.getPackageArray());

        if (motor == null) {
            // motor does not exists, fetch it
            return _carConfiguration.prepairConfiguration(configurationParams.motorId, configurationParams.colorCode, configurationParams.interiorCode, configurationParams.getPackageArray(),
                'standard',
                function (data, textStatus, jqXHR) {
                    var pkgs = [];
                    for (var i = 0; i < data.CurrentMotor.Packages.length; i++) {
                        if (data.CurrentMotor.Packages[i].HasQuantity == true) {
                            pkgs.push('{0}({1})'.format(data.CurrentMotor.Packages[i].Code, data.CurrentMotor.Packages[i].Quantity));
                        } else {
                            pkgs.push(data.CurrentMotor.Packages[i].Code);
                        }
                    }
                    motor = getMotorMethod(configurationParams.motorId, data.CurrentMotor.SelectedColor, data.CurrentMotor.SelectedInterior, pkgs);
                    if (motor == null) {
                        throw new Error('Something went wrong.');
                    }
                    successCallback(motor, textStatus, jqXHR);
                }, function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                });
        } else {
            // motor exists
            successCallback(motor, null, null);
            return null;
        }
    };

    // xhr of current configuration request
    var _configurationXhrRequest = null;
    // sets default motor of equipment
    this.setEquipment = function (equipmentId, successCallback, errorCallback) {
        /// <signature>
        /// <param name='equipmentId' type='int' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>

        var motor = thisConfigurator.getConfiguredMotor();
        var model = motor.getEquipment().getModel();
        var equipments = model.getEquipments();

        /// <field type='EquipmentType' />
        var equipment = null;
        equipment = new EquipmentType();
        for (var i = 0; i < equipments.length; i++) {
            if (equipments[i].getId() == equipmentId) {
                equipment = equipments[i];
                break;
            }
        }
        if (equipment == null) {
            // this should never happen
            var errorMessage = 'equipment id "{0}" is not found'.format(equipmentId);
            errorCallback(null, errorMessage, errorMessage);
            return null;
        }

        var pkgs = [];
        $.each(motor.getPackages(), function (k, v) {
            if (v.hasQuantity() == true) {
                pkgs.push('{0}({1})'.format(v.getFullCode(), v.getQuantity()));
            } else {
                pkgs.push(v.getFullCode());
            }
        });
        pkgs.sort();

        var defaultMotorId = equipment.getDefaultMotorId();

        // parameters to compare after successfuly ajax call to determine whether this params has been changed
        var selectedColor = motor.getSelectedColor();
        var selectedInterior = motor.getSelectedInterior();
        var selectedPkgs = HtmlCc.Libs.packagesToString(motor.getPackages());
        var motorId = motor.getId();

        var defaultMotor = _carConfiguration.getSimpleMotor(defaultMotorId, selectedColor, selectedInterior, pkgs);
        if (defaultMotor == null) {
            throw new Error('Default simple motor must be always present.');
        }

        var threading = new HtmlCc.Libs.MultiAsyncJoin();
        var fullMotorThread = threading.getHandler('fullMotor');
        var equipmentThread = threading.getHandler('equipment');
        threading.join(function (result) {
            successCallback(result);
        });

        var prepairEquipment = function () {
            if (_carConfiguration.isEquipmentPrepaired(equipmentId) == false) {
                // equipment is not prepaired, so prepair it
                _carConfiguration.prepairMotorsInEquipment(equipmentId, selectedColor, selectedInterior, pkgs, function (data, textStatus, jqXHR) {
                    // success, compare the previous parameters. if it matches, change current motor
                    var curParams = thisConfigurator.getCurrentConfigurationParams();
                    if (curParams.colorCode == selectedColor && curParams.interiorCode == selectedInterior && curParams.packageCodes == selectedPkgs && curParams.motorId == motorId) {
                        // ok, everything is the same, change the current motor
                        var fetchedPkgs = [];
                        $.each(data.CurrentMotor.Packages, function (k, v) {
                            if (v.HasQuantity == true) {
                                fetchedPkgs.push('{0}({1})'.format(v.Code, v.Quantity));
                            } else {
                                fetchedPkgs.push(v.Code);
                            }
                        });
                        var newMotor = _carConfiguration.getSimpleMotor(data.CurrentMotor.Id, data.CurrentMotor.SelectedColor, data.CurrentMotor.SelectedInterior, fetchedPkgs);
                        if (newMotor == null) {
                            // this must not be null
                            throw new Error('There must be always default SimpleMotor in equipment.');
                        }
                        _carConfiguration.setCurrentMotor(newMotor);
                        equipmentThread('ok');
                    } else {
                        // it does not matches so don't do anything
                        equipmentThread('interrupted');
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    ajaxErrorHandling(jqXHR, prepairEquipment, function () {
                        equipmentThread('canceled due errors ' + textStatus);
                    });
                });
            } else {
                equipmentThread('already fetched');
            }
        };

        var prepairFullMotor = function () {
            var fullMotor = _carConfiguration.getFullMotor(motorId, selectedColor, selectedInterior, pkgs);
            if (fullMotor == null) {
                // full motor is not present yet
                _carConfiguration.prepairConfiguration(motorId, selectedColor, selectedInterior, pkgs, 'standard', function (data, textStatus, jqXHR) {
                    // successfully fetched motor
                    var fetchedPkgs = [];
                    $.each(data.CurrentMotor.Packages, function (k, v) {
                        if (v.HasQuantity == true) {
                            fetchedPkgs.push('{0}({1})'.format(v.Code, v.Quantity));
                        } else {
                            fetchedPkgs.push(v.Code);
                        }
                    });

                    fullMotor = _carConfiguration.getFullMotor(data.CurrentMotor.Id, data.CurrentMotor.SelectedColor, data.CurrentMotor.SelectedInterior, fetchedPkgs);
                    if (fullMotor == null) {
                        throw new Error('At this point, motor must be already fetched.');
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    ajaxErrorHandling(jqXHR, prepairFullMotor, function () {
                        equipmentThread('canceled due errors ' + textStatus);
                    });
                });
            } else {
                fullMotorThread('already fetched');
            }
        };

        prepairEquipment();
        prepairFullMotor();
    };

    // configure motor with specified settings
    this.configureMotor = function (motorParams, renderingType, successCallback, errorCallback) {
        /// <signature>
        /// <param name='motorParams' type='HtmlCc.Api.Configurator.ConfigurationParams' />
        /// <param name='renderingType' type='String' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>
        var savedParams = thisConfigurator.getCurrentConfigurationParams();

        var fullMotor = _carConfiguration.getFullMotor(motorParams.motorId, motorParams.colorCode, motorParams.interiorCode, motorParams.getPackageArray());

        if (fullMotor == null) {
            // motor doesn't exists
            _carConfiguration.prepairConfiguration(motorParams.motorId,
                motorParams.colorCode,
                motorParams.interiorCode,
                motorParams.getPackageArray(),
                renderingType,
                function (data, textStatus, jqXHR) {
                    // success
                    //var newPkgs = [];
                    //$.each(data.CurrentMotor.Packages, function (k, v) {
                    //    if (v.HasQuantity == true) {
                    //        newPkgs.push('{0}({1})'.format(v.Code, v.Quantity));
                    //    } else {
                    //        newPkgs.push(v.Code);
                    //    }
                        
                    //});
                    fullMotor = _carConfiguration.getFullMotor(motorParams.motorId, motorParams.colorCode, motorParams.interiorCode, motorParams.getPackageArray());
                    if (fullMotor == null) {
                        var tmpPkgs = [];
                        $.each(data.CurrentMotor.Packages, function () {
                            tmpPkgs.push(this.Code);
                        });
                        fullMotor = _carConfiguration.getFullMotor(data.CurrentMotor.Id, data.CurrentMotor.SelectedColor, data.CurrentMotor.SelectedInterior, tmpPkgs);
                        HtmlCc.Libs.Log.warn('Called configuration with params motorId={0}; color={1}; interior={2}; params={3}. But server returned motorId={4}; color={5}; interior={6}; params={7}.'.format(
                                motorParams.motorId, motorParams.colorCode, motorParams.interiorCode, motorParams.getPackageArray().join(','),
                                fullMotor.getId(), fullMotor.getSelectedColor().getCode(), fullMotor.getSelectedInterior().getCode(), HtmlCc.Libs.packagesToString(fullMotor.getPackages())
                            ));
                    }

                    var currentParams = thisConfigurator.getCurrentConfigurationParams();

                    // if params differs, something changes configuration and we'll not change current motor
                    if (currentParams.motorId == savedParams.motorId
                        && currentParams.colorCode == savedParams.colorCode
                        && currentParams.interiorCode == savedParams.interiorCode
                        && currentParams.packageCodes == savedParams.packageCodes) {
                        // matches
                        _carConfiguration.setCurrentMotor(fullMotor);
                        HtmlCc.Libs.Log.log('Configuration changed. Current motor changed too.');
                    } else {
                        HtmlCc.Libs.Log.log('Configuration wasn\'t changed. Current motor wasn\'t changed.');
                    }
                    successCallback(fullMotor);
                },
                function (jqXHR, textStatus, errorThrown) {
                    // error
                    ajaxErrorHandling(jqXHR, function () {
                        thisConfigurator.configureMotor(motorParams, renderingType, successCallback, errorCallback);
                    }, function () {
                        errorCallback(jqXHR, textStatus, errorThrown);
                    });
                });

        } else {
            // motor exists
            _carConfiguration.setCurrentMotor(fullMotor);
            successCallback(fullMotor);
        }
    };

    // creates configurator settings object
    var _coreSettings = new SettingsType(ccSettings.instanceName, ccSettings.salesprogramName, ccSettings.culture, ccSettings.modelCode);
    _coreSettings.setVersionUrl(ccSettings.versionUrl);
    _coreSettings.setConfigureUrl(ccSettings.configureUrl);

    var _carConfiguration = new CarConfigurationType(_coreSettings);
    // it is not recommended use it
    this._getCarConfiguration = function () {
        /// <signature>
        /// <returns type='CarConfigurationType' />
        /// </signature>
        return _carConfiguration;
    };

    // init failed callback
    var _initFailedCallback = function () {
        _initFailed = true;
        _initCallbackRunned = true;
        _afterInitFailureCallback();
    };

    // makes core initialization
    _coreSettings.init(function () {
        // init succeded
        _initialized = true;
        _initCallbackRunned = true;

        // initializes financing object
        if (_coreSettings.isUseFdProxy() == true) {
                _financing = new FinancingType(_coreSettings.getFdProxyDomain(), _coreSettings.getInstanceName(), _coreSettings.getSalesprogramName(), _coreSettings.getCulture(), 'financing');
                _insurance = new FinancingType(_coreSettings.getFdProxyDomain(), _coreSettings.getInstanceName(), _coreSettings.getSalesprogramName(), _coreSettings.getCulture(), 'insurance');
        }

        _afterInitSuccessCallback();
    }, function () {
        // init failed
        _initFailedCallback();
    });

    // financing object
    var _financing = null;

    // returns financing object
    this.getFinancing = function () {
        /// <signature>
        /// <returns type='FinancingType'/>
        /// </signature>
        return _financing;
    };

    // insurance object
    var _insurance = null;

    // returns financing object
    this.getInsurance = function () {
        /// <signature>
        /// <returns type='FinancingType'/>
        /// </signature>   
        return _insurance;
    };

    // car storage (garage) object
    var _garage = new HtmlCc.Garage.GarageType();

    // returns car storage (garage) object
    this.getGarage = function () {
        /// <signature>
        /// <returns type='HtmlCc.Garage.GarageType'/>
        /// </signature>
        return _garage;
    }


    // saves configuration - no caching; it will always save connfiguration even it has been already saved
    this.saveConfiguration = function (successCallback, errorCallback, insuranceCode, garage) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function(savedConfiguraionData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// <param name='insuranceCode' type='String'></param>
        /// <param name='garage' type='boolean'>determines whether configuration is being saved to garage</param>
        /// </signature>

        var motor = this.getConfiguredMotor();
        var equipment = motor.getEquipment();
        var model = equipment.getModel();

        var dealerLogin = htmlcc.libs.LocalStorageProvider.getItem('findLogin');

        var saveMotor = motor.getId();
        var saveEquipment = equipment.getId();
        var savePackages = HtmlCc.Libs.packagesToString(motor.getPackages());
        var saveInterior = motor.getSelectedInterior().getCode();
        var saveColor = motor.getSelectedColor().getCode();

        var financialGuids = null;
        var financialDomain = null;
        var insuranceGuids = null;
        var insuranceDomain = null;
        var insuranceProduct = null;

        var leasingParametersChanged = false;
        var insuranceParametersChanged = false;

        var financing = thisConfigurator.getFinancing();
        if (financing != null) {
            financialGuids = {
                Default: financing.getLastGetDefaultsTransactionId(),
                Rate: financing.getLastPartRatesTransactionId(),
                Products: financing.getLastProductsTransactionId()
            }
            financialDomain = financing.getDomain();
            leasingParametersChanged = !financing.getHasFinancingDefaults(motor);          
        } else {
            financialGuids = {};
        }

        var insurance = thisConfigurator.getInsurance();
        if (insurance != null && insuranceCode != null) {
            insuranceGuids = {
                Default: insurance.getLastGetDefaultsTransactionId(),
                Rate: insurance.getLastGetRateTransactionId(),
                Products: financing.getLastProductsTransactionId()
            }
            insuranceDomain = insurance.getDomain();
            insuranceProduct = insuranceCode;
            insuranceParametersChanged =!insurance.getHasFinancingDefaults(motor);
        } else {
            insuranceGuids = {};
        }
     

        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };
        var ajaxParams = {
            url: HtmlCc.Api.GetUrl('/ConfigureRefactored/SaveCarConfiguration'),
            data: JSON.stringify({
                instanceName: this.getInstanceName(),
                salesProgramName: this.getSalesProgramName(),
                language: this.getCulture(),
                protocol: this.getProtocolVersion(),
                modelCode: this.getModelCode(),
                carlineCode: this.getCarlineCode(),
                version: this.getVersion(),
                color: saveColor,
                interior: saveInterior,
                packages: savePackages,
                addPackage: null,
                removePackage: null,
                renderingType: null,
                equipmentId: saveEquipment,
                motorId: saveMotor,
                variantSetVersion: this.getVariantSetVersion(),
                financingGuids: HtmlCc.Financial.ObjectParams2ArrayParams(financialGuids),
                insuranceGuids: HtmlCc.Financial.ObjectParams2ArrayParams(insuranceGuids),
                financingDomain: financialDomain,
                insuranceDomain: insuranceDomain,
                insuranceProduct: insuranceProduct,
                userChangeFinanceParams: leasingParametersChanged,
                userChangeInsuranceParams: insuranceParametersChanged,
                saveToGarage: garage,
                dealerLogin: dealerLogin
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    };

    // get the basic info about choosen configuration
    this.getFinancingInfo = function (successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function(savedConfiguraionData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// <param name='insuranceCode' type='String'></param>
        /// </signature>

        var financialGuids = null;
        var financialDomain = null;

        var financing = thisConfigurator.getFinancing();
        if (financing != null) {
            financialGuids = {
                Default: financing.getLastGetDefaultsTransactionId(),
                Rate: financing.getLastPartRatesTransactionId(),
                Products: financing.getLastProductsTransactionId()
            }
            financialDomain = financing.getDomain();
        } else {
            financialGuids = {};
        }


        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };
        var ajaxParams = {
            url: HtmlCc.Api.GetUrl('/Finance/GetFinancingInfo'),
            data: JSON.stringify({
                instanceName: this.getInstanceName(),
                financingGuids: HtmlCc.Financial.ObjectParams2ArrayParams(financialGuids),
                financingDomain: financialDomain
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    };



    this.getQueryString = function (motor, successCallback, errorCallback) {
        /// <signature>
        /// <param name='motorId' type='MotorType' />
        /// <param name='successCallback' type='Function'>function(savedConfiguraionData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// </signature>
        
        if (typeof successCallback !== 'function') {
            throw new Error('Param successCallback is not a function.');
        }
        if (typeof errorCallback !== 'function') {
            throw new Error('Param errorCallback is not a function.');
        }

        //var motor = this.getConfiguredMotor();
        var equipment = motor.getEquipment();
        var model = equipment.getModel();
        
        //var saveMotor = motor.getId();
        var saveEquipment = equipment.getId();
        var savePackages = HtmlCc.Libs.packagesToString(motor.getPackages());
        var saveInterior = null;
        if (motor.getSelectedInterior() != null) {
            saveInterior = motor.getSelectedInterior().getCode();
        }

        var saveColor = null;
        if (motor.getSelectedColor() != null) {
            saveColor = motor.getSelectedColor().getCode();
        }
        
        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };
        var ajaxParams = {
            url: HtmlCc.Api.GetUrl('/ConfigureRefactored/GetQueryString'),
            data: JSON.stringify({
                instanceName: this.getInstanceName(),
                salesProgramName: this.getSalesProgramName(),
                language: this.getCulture(),
                protocol: this.getProtocolVersion(),
                modelCode: this.getModelCode(),
                carlineCode: this.getCarlineCode(),
                version: this.getVersion(),
                color: saveColor,
                interior: saveInterior,
                packages: savePackages,
                motorId: motor.getId(),
                exterior: saveColor,
                variantSetVersion: this.getVariantSetVersion()
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    }

    this.checkAccessoriesSubstitution = function (motor, accessoryCode, successCallback, errorCallback) {
        /// <signature>
        /// <param name='motorId' type='MotorType' />
        /// <param name='successCallback' type='Function'>function(savedConfiguraionData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Param successCallback is not a function.');
        }
        if (typeof errorCallback !== 'function') {
            throw new Error('Param errorCallback is not a function.');
        }

        //var motor = this.getConfiguredMotor();
        var equipment = motor.getEquipment();
        var model = equipment.getModel();

        //var saveMotor = motor.getId();
        var saveEquipment = equipment.getId();
        var savePackages = HtmlCc.Libs.packagesToString(motor.getPackages());
        var saveInterior = null;
        if (motor.getSelectedInterior() != null) {
            saveInterior = motor.getSelectedInterior().getCode();
        }

        var saveColor = null;
        if (motor.getSelectedColor() != null) {
            saveColor = motor.getSelectedColor().getCode();
        }

        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };
        var ajaxParams = {
            url: HtmlCc.Api.GetUrl('/ConfigureRefactored/CheckAccessoriesSubstitution'),
            data: JSON.stringify({
                instanceName: this.getInstanceName(),
                salesProgramName: this.getSalesProgramName(),
                language: this.getCulture(),
                protocol: this.getProtocolVersion(),
                modelCode: this.getModelCode(),
                carlineCode: this.getCarlineCode(),
                version: this.getVersion(),
                color: saveColor,
                interior: saveInterior,
                packages: savePackages,
                motorId: motor.getId(),
                exterior: saveColor,
                variantSetVersion: this.getVariantSetVersion(),
                accessory: accessoryCode,
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    }


    this.getEnviroments = function(successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function(enviromentMenuData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// </signature>
        var modelCode = this.getConfiguredMotor().getEquipment().getModel().getRenderedCode();

        if (modelCode == undefined || modelCode == null) {
            modelCode = this.getModelCode();
        }
        
        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };
        var ajaxParams = {
            url: HtmlCc.Api.GetUrl('/ConfigureRefactored/GetVariantSetEnvironment'),
            data: JSON.stringify({
                instanceId: this.getInstanceId(),
                culture: this.getCulture(),
                modelCode: modelCode,
                version: this.getVariantSetVersion(),
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    }

    this.getVariantSetAnimation = function (successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function(variantSetMenuData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Param successCallback is not a function.');
        }
        if (typeof errorCallback !== 'function') {
            throw new Error('Param errorCallback is not a function.');
        }

        var modelCode = this.getConfiguredMotor().getEquipment().getModel().getRenderedCode()

        if (modelCode == undefined || modelCode == null) {
            modelCode = this.getModelCode();
        }

        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };
        var ajaxParams = {
            url: HtmlCc.Api.GetUrl('/ConfigureRefactored/GetVariantSetAnimation'),
            data: JSON.stringify({
                instanceId: this.getInstanceId(),
                culture: this.getCulture(),
                modelCode: modelCode,
                version: this.getVariantSetVersion(),
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    }

    this.getVariantSetViewPoint = function (successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function(variantSetMenuData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Param successCallback is not a function.');
        }
        if (typeof errorCallback !== 'function') {
            throw new Error('Param errorCallback is not a function.');
        }
        
        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };

        var modelCode = this.getConfiguredMotor().getEquipment().getModel().getRenderedCode()

        if (modelCode == undefined || modelCode == null) {
            modelCode = this.getModelCode();
        }

        var ajaxParams = {
            url: HtmlCc.Api.GetUrl('/ConfigureRefactored/GetVariantSetViewPoint'),
            data: JSON.stringify({
                instanceId: this.getInstanceId(),
                culture: this.getCulture(),
                modelCode: modelCode,
                version: this.getVariantSetVersion()
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    }

    this.getVehicleDescription = function (motor, actionCodeSeparator) {
        if (!(motor instanceof MotorType) || motor == null) {
            throw new Error('Object motor is not instance of MotorType.');
        }

        var equipment = motor.getEquipment();
        var model = equipment.getModel();

        var motorActionCode = motor.getActionCode();
        var mbvkey = motor.getMbvKey();
        //model.getCode() + equipment.getCode() + motor.getCode();

        if (motorActionCode != null && motorActionCode != '') {
            mbvkey += actionCodeSeparator + motorActionCode.replace(/\\/g, "/");
        }

        var vehicle = new HtmlCc.Financial.VehicleType();
        vehicle.setKey(mbvkey);

        if (motor.getType() == 'lookup') {
            vehicle.setPriceTotal(motor.getPrice());
            vehicle.setPriceModel(motor.getPriceFrom());
        } else {
            // simple or full version
            vehicle.setPriceTotal(motor.getPrice());

            var lookup = equipment.getMotorLookup(motor.getId());
            vehicle.setPriceModel(motor.getPriceFrom());
        }

        vehicle.setYear(model.getModelYear());

        return vehicle;
    }

    // get parametrized importer's links that are related to saved configuration
    this.loadImporterLinks = function (configuredCarData, successCallback, errorCallback) {
        /// <signature>
        /// <param name='configuredCarData' type='Json'>Data of saved configuration</param>
        /// <param name='successCallback' type='Function'>function(savedConfiguraionData)</param>
        /// <param name='errorCallback' type='Function'></param>
        /// </signature>
        var vehicleDescription = this.getVehicleDescription(this.getConfiguredMotor(), "/")
        
        var ajaxFunc = function () {
            $.ajax(ajaxParams);
        };
        var ajaxParams = {
            url:HtmlCc.Api.GetUrl('/ConfigureRefactored/GetImporterLinks'),
            data: JSON.stringify({
                instanceName: this.getInstanceName(),
                salesProgramName: this.getSalesProgramName(),
                configurationId: configuredCarData.Id,
                language: this.getCulture(),
                protocol: this.getProtocolVersion(),
                version: this.getVersion(),
                mbvKey: vehicleDescription.getKey(),
                modelYear: vehicleDescription.getYear(),
                modelName: this.getConfiguredMotor().getEquipment().getModel().getName(),
                price: vehicleDescription.getPriceModel(),
                totalPrice: vehicleDescription.getPriceTotal(),
                carlineCode: this.getCarlineCode()
            }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function (data, textStatus, jqXHR) {
                if (data != null) {
                    var _importerLinks = [];
                    for (var i = 0; i < data.length; i++) {
                        var link = data[i];
                        _importerLinks.push(new HtmlCc.Api.ImporterLinkType(link.Id, link.Text, link.Url, link.IconUrl, link.OpenInPopup, link.OnClick, link.Restrictions));
                    }

                    successCallback(_importerLinks);
                    return;
                }

                successCallback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback();
            },
            timeout: _carConfiguration.getTimeout()
        };
        ajaxFunc();
    };

    // returns all available model groups for current sales program and version
    this.loadModelGroups = function (successCallback, errorCallback) {

        var params = {};

        params.instanceName = this.getInstanceName();
        params.salesProgramName = this.getSalesProgramName();
        params.culture = this.getCulture();
        params.version = this.getVersion();

        $.ajax({
            url: HtmlCc.Api.GetUrl('/HomePage/ModelGroups'),
            data: {
                'instanceName': this.getInstanceName(),
                'salesProgramName': this.getSalesProgramName(),
                'culture': this.getCulture(),
                'version': this.getVersion(),
                'isDealer': true,
                'loadDetail': true,
            },// JSON.stringify(params),
            success: function (data) {
                successCallback(data);
            },
            error: errorCallback,
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            timeout: 30000
        });
    }


    this.getHomepageUrl = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _coreSettings.getHomepageUrl();
    };
    this.getConfiguratorHomepageUrl = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _coreSettings.getConfiguratorHomepageUrl();
    };

    this.getDealerConfiguratorHomepageUrl = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _coreSettings.getDealerConfiguratorHomepageUrl();
    }

    this.getQrCodeGeneratorUrlFormat = function () {
        /// <signature>
        /// <returns type='String'/>
        /// </signature>
        return _coreSettings.getQrCodeGeneratorUrlFormat();
    }
    this.getImporterLinks = function () {
        /// <signature>
        /// <returns type='List<HtmlCc.Api.ImporterLinkType>'/>
        /// </signature>
        return _coreSettings.getImporterLinks();
    }
};

HtmlCc.Api.ImporterLinkType = function (id, text, url, iconUrl, openInPopup, onClick, restrictions) {
    var _text = text;
    var _url = url;
    var _iconUrl = iconUrl;
    var _id = id;
    var _openInPopup = openInPopup;
    var _onClick = onClick;
    var _restrictions = restrictions;

    this.getId = function () {
        return _id;
    }

    this.getText = function () {
        return _text;
    }

    this.getUrl = function () {
        return _url;
    }

    this.getOnClick = function () {
        return _onClick;
    }

    this.getRestrictions = function () {
        return _restrictions;
    }

    this.getIconUrl = function () {
        return  _iconUrl;
    }

    this.getOpenInPopup = function () {
        return _openInPopup;
    }
}

HtmlCc.Api.ExtraPrice = function (label, value) {
    var _label = label;
    var _value = value;

    this.getLabel = function () {
        return _label;
    }

    this.getValue = function () {
        return _value;
    }
}

// simple cart for configuration of car
HtmlCc.Api.Configurator.ConfigurationParams = function (motorId, colorCode, interiorCode, packageCodes, insuranceCode) {
    /// <signature>
    /// <param name='motorId' type='int' />
    /// <param name='colorCode' type='String' />
    /// <param name='interiorCode' type='String' />
    /// <param name='packageCodes' type='String' />
    /// <param name='insuranceCode' type='String' />
    /// <returns type='HtmlCc.Api.Configurator.ConfigurationParams'/>
    /// </signature>
    this.motorId = parseInt(motorId);
    this.colorCode = colorCode;
    this.interiorCode = interiorCode;
    this.packageCodes = packageCodes;
    this.insurance = insuranceCode;
};
// returns packages as array of strings of package codes
HtmlCc.Api.Configurator.ConfigurationParams.prototype.getPackageArray = function () {
    /// <signature>
    /// <returns type='Array' elementType='String'/>
    /// </signature>
    if (this.packageCodes == '' || this.packageCodes == null) {
        return [];
    }
    return this.packageCodes.split(',');
};
// adds a package into package bag
HtmlCc.Api.Configurator.ConfigurationParams.prototype.addPackage = function (packageCode) {
    /// <signature>
    /// <param name='packageCode' type='String' />
    /// </signature>
    var packageArray = this.getPackageArray();
    var found = false;
    for (var i = 0; i < packageArray.length; i++) {
        if (packageArray[i] == packageCode) {
            found = true;
            break;
        }
    }
    if (found === false) {
        packageArray.push(packageCode);
        this.packageCodes = packageArray.sort().join(',');
    }
};
// removes a package from package bag
HtmlCc.Api.Configurator.ConfigurationParams.prototype.removePackage = function (packageCode) {
    /// <signature>
    /// <param name='packageCode' type='String' />
    /// </signature>
    var packageArray = this.getPackageArray();
    var resultArray = [];
    for (var i = 0; i < packageArray.length; i++) {
        if (packageArray[i] != packageCode) {
            resultArray.push(packageArray[i]);
        }
    }
    this.packageCodes = resultArray.join(',');
};
// sets default color
HtmlCc.Api.Configurator.ConfigurationParams.prototype.setDefaultColor = function () {
    this.colorCode = '';
};
// sets default interior
HtmlCc.Api.Configurator.ConfigurationParams.prototype.setDefaultInterior = function () {
    this.interiorCode = '';
};
// returns true whether both objects are the same
HtmlCc.Api.Configurator.ConfigurationParams.prototype.equals = function (other) {
    /// <signature>
    /// <param name='other' type='HtmlCc.Api.Configurator.ConfigurationParams' />
    /// <returns type='bool' />
    /// </signature>
    if (!(other instanceof HtmlCc.Api.Configurator.ConfigurationParams)) {
        return false;
    }

    return (this.motorId == other.motorId || ((this.motorId == '' || this.motorId == null) && (other.motorId == '' || other.motorId == null)))
        && (this.colorCode == other.colorCode || ((this.colorCode == '' || this.colorCode == null) && (other.colorCode == '' || other.colorCode == null)))
        && (this.interiorCode == other.interiorCode || ((this.interiorCode == '' || this.interiorCode == null) && (other.interiorCode == '' || other.interiorCode == null)))
        && (this.packageCodes == other.packageCodes || ((this.packageCodes == '' || this.packageCodes == null) && (other.packageCodes == '' || other.packageCodes == null)));
};

