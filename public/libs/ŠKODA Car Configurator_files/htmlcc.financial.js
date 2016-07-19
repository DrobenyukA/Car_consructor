/// <reference path="../json2.js" /> 
/// <reference path="../jquery-1.7.2.js" /> 
/// <reference path="strings.libs.js" /> 
/// <reference path="htmlcc.libs.js" /> 
/*
 *  JavaScript API for Car Configurator financial services.
 *
 *  Requires: jquery; string.libs.js
 *
 *  Date: 9/2012
 *  Author: jobratil @ Trask solutions a.s.
 *  © ŠKODA AUTO a.s. 2012
 */
var HtmlCc = HtmlCc || {};
HtmlCc.Financial = HtmlCc.Financial || {};

var financialResponseCache = [];

//Vrací Url + dealer, pokud local.href obsahuje řetězec dealer
HtmlCc.Financial.GetUrl = function (localUrl) {
    if (location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0)
    {
        return '/dealer{0}'.format(localUrl);
    }
    else
    {
        return localUrl;
    }
}

// type of vehicle
HtmlCc.Financial.VehicleType = function () {

    var _key = null;
    var _year = null;
    var _priceModel = null;
    var _priceTotal = null;

    // returns key
    this.getKey = function () {
        return _key;
    };
    // sets key
    this.setKey = function (key) {
        _key = key;
    };

    // returns model year
    this.getYear = function () {
        /// <signature>
        /// <returns type='int' />
        /// </signature>
        return _year;
    };
    // sets model year
    this.setYear = function (year) {
        /// <signature>
        /// <param name='year' type='int' />
        /// </signature>
        var parsedValue = parseInt(year);
        if(isNaN(parsedValue)) {
            throw new Error('Year is not a number.');
        }
        _year = parsedValue;
    };

    // returns price model
    this.getPriceModel = function () {
        /// <signature>
        /// <returns type='float' />
        /// </signature>
        return _priceModel;
    };
    // sets price model
    this.setPriceModel = function (priceModel) {
        /// <signature>
        /// <param name='priceModel' type='float' />
        /// </signature>
        var parsedValue = parseFloat(priceModel);
        if (isNaN(parsedValue)) {
            throw new Error('PriceModel is not a float.');
        }
        _priceModel = parsedValue;
    };

    // returns price total
    this.getPriceTotal = function () {
        /// <signature>
        /// <returns type='float' />
        /// </signature>
        return _priceTotal;
    };
    // sets price total
    this.setPriceTotal = function (priceTotal) {
        /// <signature>
        /// <param name='priceTotal' type='float' />
        /// </signature>
        var parsedValue = parseFloat(priceTotal);
        if (isNaN(parsedValue)) {
            throw new Error('PriceTotal is not a float.');
        }
        _priceTotal = parsedValue;
    }
};

// type of DataParameterType
HtmlCc.Financial.DataParameterType = function () {
    var _value = null;
    var _transferValue = null;

    // returns value
    this.getValue = function () {
        return _value;
    };
    // sets value
    this.setValue = function (value) {
        _value = value;
    };

    // returns transfer value
    this.getTransferValue = function () {
        return _transferValue;
    };
    // sets transfer value
    this.setTransferValue = function (value) {
        _transferValue = value;
    };

    this.hasTransferValue = function () {
        return _transferValue != null;
    };
}

// extracts simple object usable for ajax request
HtmlCc.Financial.VehicleType.prototype.simplifyObject = function () {
    /// <signature>
    /// <returns type='Object' />
    /// </signature>

    return {
        Key: this.getKey(),
        Year: this.getYear(),
        PriceModel: this.getPriceModel(),
        PriceTotal: this.getPriceTotal()
    };
};

// returns available products
HtmlCc.Financial.GetProducts = function (domain, culture, vehicle, successCallback, errorCallback) {
    /// <signature>
    /// <param name='domain' type='String' />
    /// <param name='vehicle' type='HtmlCc.Financial.VehicleType' />
    /// <param name='successCallback' type='Function' />
    /// <param name='errorCallback' type='Function' />
    /// </signature>

    if (!(vehicle instanceof HtmlCc.Financial.VehicleType)) {
        throw new Error('Object vehicle is not an instance of HtmlCc.Financial.VehicleType.');
    }

    if (typeof successCallback !== 'function') {
        throw new Error('Object successCallback is not a function.');
    }
    if (typeof errorCallback !== 'function') {
        throw new Error('Object errorCallback is not a function.');
    }
    
    $.ajax({
        url: HtmlCc.Financial.GetUrl('/finance/GetProducts'),
        data: JSON.stringify({ domain: domain, vehicle: vehicle.simplifyObject(), language: culture }),
        success: successCallback,
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: 10000
    });
};

// returns defaults of selected product
HtmlCc.Financial.GetDefaults = function (domain, vehicle, productId, instanceName, salesprogramName, culture,version, parameters, successCallback, errorCallback) {
    /// <signature>
    /// <param name='domain' type='String' />
    /// <param name='vehicle' type='HtmlCc.Financial.VehicleType' />
    /// <param name='productId' type='String' />
    /// <param name='instanceName' type='String' />
    /// <param name='salesprogramName' type='String' />
    /// <param name='culture' type='String' />
    /// <param name='version' type='String' />
    /// <param name='parameters' type='Object' />
    /// <param name='successCallback' type='Function' />
    /// <param name='errorCallback' type='Function' />
    /// </signature>
    if (!(vehicle instanceof HtmlCc.Financial.VehicleType)) {
        throw new Error('Object vehicle is not an instance of HtmlCc.Financial.VehicleType.');
    }

    if (typeof successCallback !== 'function') {
        throw new Error('Object successCallback is not a function.');
    }
    if (typeof errorCallback !== 'function') {
        throw new Error('Object errorCallback is not a function.');
    }

    var jsonParams =
        HtmlCc.Financial.ObjectParams2ArrayParams(
            parameters, 
            function (v) { return v.getValue(); });

    $.ajax({
        url: HtmlCc.Financial.GetUrl('/finance/GetDefaults'),
        data: JSON.stringify({ domain: domain, vehicle: vehicle.simplifyObject(), productId: productId, parameters: jsonParams, salesProgramName: salesprogramName, instanceName: instanceName, version: version, language: culture }),
        success: successCallback,
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: 10000
    });
};

// returns rate of selected product using product parameters
HtmlCc.Financial.GetRate = function (domain, vehicle, productId, instanceName, salesprogramName, culture, version, parameters, successCallback, errorCallback) {
    /// <signature>
    /// <param name='domain' type='String' />
    /// <param name='vehicle' type='HtmlCc.Financial.VehicleType' />
    /// <param name='productId' type='String' />
    /// <param name='instanceName' type='String' />
    /// <param name='salesprogramName' type='String' />
    /// <param name='culture' type='String' />
    /// <param name='parameters' type='Object' />
    /// <param name='successCallback' type='Function'>function(data)</param>
    /// <param name='errorCallback' type='Function' />
    /// </signature>
    if (!(vehicle instanceof HtmlCc.Financial.VehicleType)) {
        throw new Error('Object vehicle is not an instance of HtmlCc.Financial.VehicleType.');
    }
    
    if (typeof parameters !== 'object') {
        throw new Error('Object parameters is not an object.');
    }
    if (typeof successCallback !== 'function') {
        throw new Error('Object successCallback is not a function.');
    }
    if (typeof errorCallback !== 'function') {
        throw new Error('Object errorCallback is not a function.');
    }

    var jsonParams =
        HtmlCc.Financial.ObjectParams2ArrayParams(
            parameters,
            function (v) {
                if (v.hasTransferValue()) {
                    return v.getTransferValue();
                }
                else {
                    return v.getValue();
                }               
            });

    $.ajax({
        url: HtmlCc.Financial.GetUrl('/finance/GetRate'),
        data: JSON.stringify({ domain: domain, vehicle: vehicle.simplifyObject(), productId: productId, parameters: jsonParams, salesProgramName: salesprogramName, instanceName: instanceName, language: culture, version: version }),
        success: successCallback,
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: 10000
    });
};

HtmlCc.Financial.GetPartRates = function (domain, vehicle, productId, instanceName, version, salesprogramName, culture, parameters, partRates, successCallback, errorCallback) {
    /// <signature>
    /// <param name='domain' type='String' />
    /// <param name='vehicle' type='HtmlCc.Financial.VehicleType' />
    /// <param name='productId' type='String' />
    /// <param name='instanceName' type='String' />
    /// <param name='salesprogramName' type='String' />
    /// <param name='culture' type='String' />
    /// <param name='parameters' type='Object' />
    /// <param name='partRates' type='Object' />
    /// <param name='successCallback' type='Function'>function(data)</param>
    /// <param name='errorCallback' type='Function' />
    /// </signature>
    if (!(vehicle instanceof HtmlCc.Financial.VehicleType)) {
        throw new Error('Object vehicle is not an instance of HtmlCc.Financial.VehicleType.');
    }
    if (typeof parameters !== 'object') {
        throw new Error('Object parameters is not an object.');
    }
    if (typeof partRates !== 'object') {
        throw new Error('Object partRates is not an object.');
    }
    if (typeof successCallback !== 'function') {
        throw new Error('Object successCallback is not a function.');
    }
    if (typeof errorCallback !== 'function') {
        throw new Error('Object errorCallback is not a function.');
    }

    var jsonParams =
        HtmlCc.Financial.ObjectParams2ArrayParams(
            parameters,
            function (v) {
                if (v.hasTransferValue()) {
                    return v.getTransferValue();
                }
                else {
                    return v.getValue();
                }
            });

    var jsonPartRates = HtmlCc.Financial.ObjectPartRates2ArrayParams(partRates);

    $.ajax({
        url: HtmlCc.Financial.GetUrl('/finance/GetPartRates'),
        data: JSON.stringify({ domain: domain, vehicle: vehicle.simplifyObject(), productId: productId, productParameters: jsonParams, partRateParameters: jsonPartRates, salesProgramName: salesprogramName, instanceName: instanceName, version: version, language: culture }),
        success: successCallback,
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: 10000
    });
};

// converts motor to vehicle object
HtmlCc.Financial.Motor2Vehicle = function (motor) {
    /// <signature>
    /// <param name='motor' type='MotorType' />
    /// <returns type='HtmlCc.Financial.VehicleType' />
    /// </signature>
    
    var equipment = motor.getEquipment();
    var model = equipment.getModel();

    var motorActionCode = motor.getActionCode();
    var mbvkey = model.getCode() + equipment.getCode() + motor.getCode();
    if (motorActionCode != null && motorActionCode != '') {
        mbvkey += '/' + motorActionCode;
    }

    var vehicle = new HtmlCc.Financial.VehicleType();
    vehicle.setKey(mbvkey);

    vehicle.setPriceModel(0.0); // this should be altered later
    vehicle.setPriceTotal(0.0); // this should be altered later
    vehicle.setYear(2012);      // this should be altered later

    return vehicle;
};

// converts params into key -> value object usable for MVC routing
HtmlCc.Financial.ObjectParams2ArrayParams = function (paramsAsObject, getValueFunc) {
    /// <signature>
    /// <param name='paramsAsObject' type='Object' />
    /// <returns type='Array' elementType='Object' />
    /// </signature>
    var result = [];

    if (paramsAsObject == null) {
        return result;
    }

    $.each(paramsAsObject, function (k, v) {
        var value = v;

        if (getValueFunc != null) {
            value = getValueFunc(v);
        }

        result.push({ Key: k, Value: value });
    });
    return result;
};

// converts params into string
HtmlCc.Financial.ObjectParamsToHash = function (paramsAsObject) {
    /// <signature>
    /// <param name='paramsAsObject' type='Object' />
    /// <returns type='Array' elementType='Object' />
    /// </signature>
    var result = '';

    if (paramsAsObject == null) {
        return result;
    }

    $.each(paramsAsObject, function (k, v) {
        var value = v;

        if (v.hasTransferValue()) {
            value = v.getTransferValue();
        }
        else {
            value = v.getValue();
        }

        result +=  k.substr(0,2) + ':' + value + '_';
    });
    return result;
};

// converts part rates into key -> value object usable for MVC routing
HtmlCc.Financial.ObjectPartRates2ArrayParams = function (partRatesAsObject) {
    /// <signature>
    /// <param name='partRatesAsObject' type='Object' />
    /// <returns type='Array' elementType='Object' />
    /// </signature>
    var result = [];

    if (partRatesAsObject == null) {
        return result;
    }

    $.each(partRatesAsObject, function (k, v) {
        var price = parseFloat(v);
        if (price == NaN) {
            price = 0.0;
        }
        result.push({ Key: k, Price: price });
    });
    return result;
};

// returns formatted price
HtmlCc.Financial.FormatPrice = function (formattedPrice, units) {
    /// <signature>
    /// <param name='formattedPrice' type='String' />
    /// <param name='units' type='Object' />
    /// <returns type='String' />
    /// </signature>

    if (!('Symbol' in units)) {
        throw new Error('Symbol is not in Units');
    }
    if (!('Value' in units)) {
        throw new Error('Value is not in Units');
    }

    var priceValue = '';
    var unitsValue = '';
    var failed = false;
    if (units.Symbol != null) {
        unitsValue = units.Symbol;
    } else if (units.Value != null) {
        unitsValue = units.Value;
    } else {
        failed = true;
    }

    priceValue = formattedPrice;

    if (failed == true) {
        return 'no value';
    } else {
        return 'MonthlyRateFormat'.resx().format(unitsValue, priceValue);
    }
};

// returns defaults of selected product
HtmlCc.Financial.GetDefaultsByGuid = function (guid, domain, successCallback, errorCallback) {
    /// <signature>
    /// <param name='guid' type='String' />
    /// <param name='domain' type='String' />
    /// <param name='successCallback' type='Function' />
    /// <param name='errorCallback' type='Function' />
    /// </signature>
    
    if (typeof successCallback !== 'function') {
        throw new Error('Object successCallback is not a function.');
    }
    if (typeof errorCallback !== 'function') {
        throw new Error('Object errorCallback is not a function.');
    }
        
    $.ajax({
        url: HtmlCc.Financial.GetUrl('/finance/GetDefaultByGuid'),
        data: JSON.stringify({ domain: domain, guid: guid}),
        success: successCallback,
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: 10000
    });
};