/// <reference path="../json2.js" /> 
/// <reference path="../jquery-1.7.2.js" /> 
/// <reference path="strings.libs.js" /> 
/// <reference path="htmlcc.libs.js" /> 
/*
 *  JavaScript API for Car Configurator garage features.
 *
 *  Requires: jquery; string.libs.js
 *
 *  Date: 11/2012
 *  Author: jobratil @ Trask solutions a.s.
 *  © ŠKODA AUTO a.s. 2012
 */

var HtmlCc = HtmlCc || {};
HtmlCc.Garage = HtmlCc.Garage || {};
HtmlCc.Garage.Remote = HtmlCc.Garage.Remote || {};
HtmlCc.Garage.Local = HtmlCc.Garage.Local || {};

//Vrací Url + dealer, pokud local.href obsahuje řetězec dealer
HtmlCc.Garage.GetUrl = function (localUrl) {
    if (location != null && location.href != null && location.href.toLowerCase().indexOf('dealer') > 0) {
        return '/dealer{0}'.format(localUrl);
    }
    else {
        return localUrl;
    }
}


// returns user's cars in garage
HtmlCc.Garage.Remote.UserCarIds = function (dataSource, successCallback, errorCallback) {
    /// <signature>
    /// <param name='dataSource' type='String' />
    /// <param name='successCallback' type='Function' />
    /// <param name='errorCallback' type='Function' />
    /// </signature>

    if (typeof successCallback !== 'function') {
        throw new Error('Success callback is not type of function.');
    }

    if (typeof errorCallback !== 'function') {
        throw new Error('Error callback is not type of function.');
    }

    var params = {};
    params.dataSource = dataSource;

    $.ajax({
        url: HtmlCc.Garage.GetUrl('/garage/UserCarIds'),
        data: JSON.stringify(params),
        success: function (data) {
            if (data != null && data.Error != null) {
                HtmlCc.Libs.Log.error('Error calling {1}, reason: {0}'.format(data.Error.Description, HtmlCc.Garage.GetUrl('/garage/UserCarIds')));
                errorCallback(data);
            } else {
                successCallback(data);
            }
        },
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: HtmlCc.Api.AppSettings.get("GarageRequestTimeout")
    });
};

// assigns car with current user
HtmlCc.Garage.Remote.AssignConfigurationToUser = function (dataSource, carIds, successCallback, errorCallback) {
    /// <signature>
    /// <param name='dataSource' type='String' />
    /// <param name='carIds' type='Array' elementType='int' />
    /// <param name='successCallback' type='Function' />
    /// <param name='errorCallback' type='Function' />
    /// </signature>

    if (typeof successCallback !== 'function') {
        throw new Error('Success callback is not type of function.');
    }

    if (typeof errorCallback !== 'function') {
        throw new Error('Error callback is not type of function.');
    }
    
    var ids = [];
    if ($.isArray(carIds)) {
        $.each(carIds, function () {
            var parsedValue = parseInt(this);
            if (parsedValue > 0) {
                ids.push(parsedValue);
            }
        });
    }

    var params = {};
    params.dataSource = dataSource;
    params.configuredCarIds = ids;

    $.ajax({
        url: HtmlCc.Garage.GetUrl('/garage/AssignConfigurationToUser'),
        data: JSON.stringify(params),
        success: function(data) {
            if (data != null && data.Error != null) {
                HtmlCc.Libs.Log.error('Error calling {1}, reason: {0}'.format(data.Error.Description, HtmlCc.Garage.GetUrl('/garage/UserCarIds')));
                errorCallback(data);
            } else {
                successCallback(data);
            }   
        },
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: HtmlCc.Api.AppSettings.get("GarageRequestTimeout")
    });
};

HtmlCc.Garage.Remote.RemoveCars = function (dataSource, carIds, successCallback, errorCallback) {
    /// <signature>
    /// <param name='dataSource' type='String' />
    /// <param name='carIds' type='Array' elementType='int' />
    /// <param name='successCallback' type='Function' />
    /// <param name='errorCallback' type='Function' />
    /// </signature>

    if (typeof successCallback !== 'function') {
        throw new Error('Success callback is not type of function.');
    }

    if (typeof errorCallback !== 'function') {
        throw new Error('Error callback is not type of function.');
    }

    var sanitizedCarIds = [];
    if ($.isArray(carIds)) {
        $.each(carIds, function () {
            var sanitizedInt = parseInt(this);
            if (sanitizedInt > 0) {
                sanitizedCarIds.push(sanitizedInt);
            }
        });
    } else {
        throw new Error('Object carIds is not an array.');
    }

    var params = {};
    params.dataSource = dataSource;
    params.configuredCarIds = sanitizedCarIds;

    $.ajax({
        url: HtmlCc.Garage.GetUrl('/garage/RemoveCars'),
        data: JSON.stringify(params),
        success: function(data) {
            if (data != null && data.Error != null) {
                HtmlCc.Libs.Log.error('Error calling {1}, reason: {0}'.format(data.Error.Description, HtmlCc.Garage.GetUrl('/garage/UserCarIds')));
                errorCallback(data);
            } else {
                successCallback(data);
            }
        },
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: HtmlCc.Api.AppSettings.get("GarageRequestTimeout")
    });
};

// returns info about saved cars
HtmlCc.Garage.Remote.ConfiguredCars = function (configuredCarIds, isDealer, successCallback, errorCallback) {
    /// <signature>
    /// <param name='configuredCarIds' type='Array' elementType='int' />
    /// <param name='dataSource' type='String' />
    /// <param name='successCallback' type='Function'>function(data)</param>
    /// <param name='errorCallback' type='Function' />
    /// </signature>
    if (typeof successCallback !== 'function') {
        throw new Error('Success callback is not type of function.');
    }

    if (typeof errorCallback !== 'function') {
        throw new Error('Error callback is not type of function.');
    }

    var sanitizedCarIds = [];
    if ($.isArray(configuredCarIds)) {
        $.each(configuredCarIds, function () {
            var sanitizedInt = parseInt(this);
            if (sanitizedInt > 0) {
                sanitizedCarIds.push(sanitizedInt);
            }
        });
    } else {
        throw new Error('Object configuredCarIds is not an array.');
    }

    var params = {};
    params.isDealer = isDealer;
    params.configuredCarIds = sanitizedCarIds;

    $.ajax({
        url: HtmlCc.Garage.GetUrl('/garage/ConfiguredCars'),
        data: JSON.stringify(params),
        success: function(data) {
            if (data != null && data.Error != null) {
                HtmlCc.Libs.Log.error('Error calling {1}, reason: {0}'.format(data.Error.Description,HtmlCc.Garage.GetUrl('/garage/UserCarIds')));
                errorCallback(data);
            } else {
                successCallback(data);
            }
        },
        error: errorCallback,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: HtmlCc.Api.AppSettings.get("GarageRequestTimeout")
    });
};

// saves/upgrades a note of configured car
HtmlCc.Garage.Remote.SaveNote = function (configuredCarId, note, dataSource, successCallback, errorCallback) {
    /// <signature>
    /// <param name='configuredCarId' type='int' />
    /// <param name='note' type='String' />
    /// <param name='dataSource' type='String' />
    /// <param name='successCallback' type='Function'>function(data)</param>
    /// <param name='errorCallback' type='Function' />
    /// </signature>

    if (typeof successCallback !== 'function') {
        throw new Error('Success callback is not type of function.');
    }

    if (typeof errorCallback !== 'function') {
        throw new Error('Error callback is not type of function.');
    }

    var parsedCarId = parseInt(configuredCarId);
    if (!(parsedCarId > 0)) {
        throw new Error('Configurec car id is not a number.');
    }

    var params = {};
    params.dataSource = dataSource;
    params.configuredCarId = parsedCarId;
    params.note = note;

    $.ajax({
        url: HtmlCc.Garage.GetUrl('/garage/SaveNote'),
        data: JSON.stringify(params),
        success: function (data) {
            if (data != null && data.Error != null) {
                HtmlCc.Libs.Log.error('Error calling {1}, reason: {0}'.format(data.Error.Description, HtmlCc.Garage.GetUrl('/garage/SaveNote')));
                errorCallback(data);
            } else {
                successCallback(data);
            }
        },
        error: function () {
            HtmlCc.Libs.Log.error('Error calling /garage/SaveNote');
            errorCallback();
        },
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        timeout: HtmlCc.Api.AppSettings.get("GarageRequestTimeout")
    });

};

// returns array of ints (carIds) that is stored in parking
HtmlCc.Garage.Local.GetCarIds = function() {
    /// <signature>
    /// <returns type='Array' elementType='int' />
    /// </signature>
    if(typeof(Storage) !== 'undefined')
    {
        // local storage support exists

        var storageArray = htmlcc.libs.LocalStorageProvider.getItem('parking');
        if(storageArray == null) {
            storageArray = [];
        } else {
            storageArray = JSON.parse(storageArray);
        }

        return storageArray;
    }
    else
    {
        // no local storage support, using object fake
        if(HtmlCc.Garage.Local.noSupportFallback === undefined) {
            HtmlCc.Garage.Local.noSupportFallback = [];
        }
        return HtmlCc.Garage.Local.noSupportFallback.slice();
    }
};

// stores car id into local storage
HtmlCc.Garage.Local.StoreCarId = function(carId) {
    /// <signature>
    /// <param name='carId' type='int' />
    /// </signature>

    var sanitizedId = parseInt(carId);
    if(!(sanitizedId > 0)) {
        // it is not usable integer!
        return;
    }

    if(typeof(Storage) !== 'undefined')
    {
        // local storage support exists
            var storageArray = htmlcc.libs.LocalStorageProvider.getItem('parking');
            if (storageArray == null) {
                storageArray = [];
            } else {
                storageArray = JSON.parse(storageArray);
            }

            if (!$.isArray(storageArray)) {
                storageArray = [];
            }

            storageArray.push(sanitizedId);

            htmlcc.libs.LocalStorageProvider.setItem('parking', JSON.stringify(storageArray));
    }
    else
    {
        // no local storage support, using object fake
        if(HtmlCc.Garage.Local.noSupportFallback === undefined) {
            HtmlCc.Garage.Local.noSupportFallback = [];
        }
        HtmlCc.Garage.Local.noSupportFallback.push(sanitizedId);
    }
};

// removes car id into local storage
HtmlCc.Garage.Local.RemoveCarId = function (carId) {
    /// <signature>
    /// <param name='carId' type='int' />
    /// </signature>

    var sanitizedId = parseInt(carId);
    if (!(sanitizedId > 0)) {
        // it is not usable integer!
        return;
    }

    if (typeof (Storage) !== 'undefined') {
        // local storage support exists

        var storageArray = htmlcc.libs.LocalStorageProvider.getItem('parking');
        if (storageArray == null) {
            storageArray = [];
        } else {
            storageArray = JSON.parse(storageArray);
        }

        if (!$.isArray(storageArray)) {
            storageArray = [];
        }

        var newArray = [];
        $.each(storageArray, function () {
            if (this != sanitizedId) {
                newArray.push(this);
            }
        });

        htmlcc.libs.LocalStorageProvider.setItem('parking', JSON.stringify(newArray));
    }
    else {
        // no local storage support, using object fake
        if (HtmlCc.Garage.Local.noSupportFallback === undefined) {
            HtmlCc.Garage.Local.noSupportFallback = [];
        }

        var newArray = [];
        $.each(HtmlCc.Garage.Local.noSupportFallback, function () {
            if (this != sanitizedId) {
                newArray.push(this);
            }
        });

        HtmlCc.Garage.Local.noSupportFallback = newArray;
    }
};

// clears all cars from local storage (parking)
HtmlCc.Garage.Local.ClearLocalStorage = function () {
    if (typeof (Storage) !== 'undefined') {
        // local storage support exists
        localStorage.removeItem('parking');
    }
    else {
        // no local storage support, using object fake
        HtmlCc.Garage.Local.noSupportFallback = undefined;
    }
};

// type of garage functionality; combines parking with garaging
HtmlCc.Garage.GarageType = function (dataSource) {
    /// <signature>
    /// <param name='dataSource' type='String' />
    /// <returns type='HtmlCc.Garage.GarageType' />
    /// </signature>
    var thisGarage = this;
    var _logged = null;
    var _carIdsGarage = [];
    var _carIdsParking = [];
    var _initialized = false;
    var _dataSource = dataSource;
    var _username = null;
    var _initialized = false;
    var _initializedCallback = [];
    var _cachedCarInfos = {};
    var _translations = {};
    var _modelGroupAggregatedValues = {};


    // returns true whether it is initialized
    this.isInitialized = function () {
        /// <signature>
        /// <returns type='bool' />
        /// </signature>
        return _initialized;
    };

    // returns true whether user is logged
    this.isLogged = function () {
        /// <signature>
        /// <returns type='bool' />
        /// </signature>
        return _logged;
    };

    // returns translations for comparison
    this.getTranslations = function () {
        return _translations;
    };


    // returns model group agregate values - only in success callback 
    this.getModelGroupAggregatedValues = function (instance, salesprogram, culture, version, successCallback, errorCallback) {

        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }
        
        if (Object.keys(_modelGroupAggregatedValues).length !== 0) {
            successCallback(_modelGroupAggregatedValues);
        }
        else{
            this.getRemoteModelGroupAggregatedValues(instance, salesprogram, culture, version, function () {
                // success 
                successCallback(_modelGroupAggregatedValues);
                HtmlCc.Libs.Log.log('Garage disclamer was obtained');
            }, function () {
                // fail
                errorCallback();
                HtmlCc.Libs.Log.error('Cannot obtain garage disclamer.');
            });
        }
        return _modelGroupAggregatedValues;
    };

    // returns car ids asynchrnously - it touches server so results are fresh
    this.getCarIdAsync = function (successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function'>function(carIds)</param>
        /// <param name='errorCallback' type='Function' />
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }

        this.refreshGarage(function () {
            // success
            successCallback(thisGarage.getCarIds());
        }, function () {
            // fail
            HtmlCc.Libs.Log.error('Cannot obtain content of garage.');
            errorCallback();
        });
    };

    // returns stored car ids (no matter the source)
    this.getCarIds = function () {
        var result = [];
        var indexedResult = {};

        $.each(_carIdsParking, function () {
            if (indexedResult[this] === undefined) {
                result.push(this);
                indexedResult[this] = true;
            }
        });

        $.each(_carIdsGarage, function () {
            if (indexedResult[this] === undefined) {
                result.push(this);
                indexedResult[this] = true;
            }
        });

        return result;
    };

    // returns content of parking
    this.getParkingIds = function () {
        /// <signature>
        /// <returns type='Array' elementType='int' />
        /// </signature>
        return _carIdsParking.slice();
    };

    // returns content of garage (cached value)
    this.getGarageIds = function () {
        /// <signature>
        /// <returns type='Array' elementType='int' />
        /// </signature>
        return _carIdsGarage.slice();
    };

    this.getUsername = function () {
        /// <signature>
        /// <returns type='String' />
        /// </signature>
        return _username;
    };

    this.getDataSource = function () {
        /// <signature>
        /// <returns type='String' />
        /// </signature>
        return _dataSource;
    };

    // removes car id
    this.removeCarId = function (carId, successCallback, errorCallback) {
        /// <signature>
        /// <param name='carId' type='int' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }

        var sanitizedCarId = parseInt(carId);
        if(!(sanitizedCarId > 0)) {
            HtmlCc.Libs.Log.error('Car id is not a positive integer.');
            errorCallback();
            return;
        }

        thisGarage.refreshGarage(function () {
            // success
            if (thisGarage.isLogged()) {
                // logged, so remove it remotely
                HtmlCc.Garage.Remote.RemoveCars(thisGarage.getDataSource(), [sanitizedCarId], function () {
                    // removed remotely, remove it from cached collection
                    var newOne = [];
                    $.each(_carIdsGarage, function () {
                        if (this != sanitizedCarId) {
                            newOne.push(this);
                        }
                    });
                    _carIdsGarage = newOne;
                    
                    HtmlCc.Libs.Log.log('Car has been successfuly removed from car storage (garage).');

                    successCallback();
                }, function () {
                    // something failed
                    HtmlCc.Libs.Log.error('Removing car from car storage failed');

                    errorCallback();
                });
            } else {
                // not logged, co remove it from parking
                HtmlCc.Garage.Local.RemoveCarId(sanitizedCarId);

                // remove it even from local cache
                var newOne = [];
                $.each(_carIdsParking, function () {
                    if (this != sanitizedCarId) {
                        newOne.push(this);
                    }
                });
                _carIdsParking = newOne;

                HtmlCc.Libs.Log.log('Car has been successfuly removed from car storage (parking).');

                successCallback();
            }
        }, function () {
            // fail
            HtmlCc.Libs.Log.error('Error during removing car from storage.');
            errorCallback();
        });
    };

    // adds car id
    this.addCarId = function (carId, successCallback, errorCallback) {
        /// <signature>
        /// <param name='carId' type='int' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }

        var sanitizedCarId = parseInt(carId);
        if (!(sanitizedCarId > 0)) {
            HtmlCc.Libs.Log.error('Car id is not a positive integer.');
            errorCallback();
            return;
        }

        thisGarage.refreshGarage(function () {
            // success
            if (thisGarage.isLogged()) {
                // logged, so remove it remotely
                HtmlCc.Garage.Remote.AssignConfigurationToUser(thisGarage.getDataSource(), [sanitizedCarId], function () {
                    // added remotely, add it into cached collection
                    _carIdsGarage.push(sanitizedCarId);

                    HtmlCc.Libs.Log.log('Car has been successfuly added into car storage (garage).');

                    successCallback();
                }, function () {
                    // something failed
                    HtmlCc.Libs.Log.error('Adding car into car storage failed');

                    errorCallback();
                });
            } else {
                // not logged, so add it into parking
                HtmlCc.Garage.Local.StoreCarId(sanitizedCarId);

                // add it even into local cache
                _carIdsParking.push(sanitizedCarId);

                HtmlCc.Libs.Log.log('Car has been successfuly added into car storage (parking).');

                successCallback();
            }
        }, function () {
            // fail
            HtmlCc.Libs.Log.error('Error during adding car into storage.');
            errorCallback();
        });
    };

    // refreshes state of garage and login info
    this.refreshGarage = function (successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }

        HtmlCc.Garage.Remote.UserCarIds(_dataSource, function (data) {
            // success
            if (data.cars == null || $.isArray(data.cars) == false && data.userLogged == null) {
                // that shouldn't happen
                HtmlCc.Libs.Log.error('Unexpected content in response.');
                errorCallback();
                return;
            }
            _logged = new Boolean(data.userLogged) == true;
            _username = data.username;
            _carIdsGarage = data.cars;
            _carIdsParking = HtmlCc.Garage.Local.GetCarIds();
            if (_carIdsParking.length > 0 && _logged == true) {
                // transfer cars from parking to garage
                HtmlCc.Garage.Remote.AssignConfigurationToUser(thisGarage.getDataSource(), _carIdsParking, function (data) {
                    // successfuly transfered
                    HtmlCc.Libs.Log.log('Cars transfered from parking into garage.');

                    // remove all items from parking
                    HtmlCc.Garage.Local.ClearLocalStorage();

                    // refresh garage for sure
                    thisGarage.refreshGarage(function () {
                        HtmlCc.Libs.Log.log('Refresh after moving parking into garage.');
                        successCallback();
                    }, function () {
                        HtmlCc.Libs.Log.error('Failed refreshing after moving cars from parking into garage.');
                        errorCallback();
                    });
                }, function () {
                    HtmlCc.Libs.Log.log('Transfer into garage failed.');
                    errorCallback();
                });
            } else {
                _initialized = true;
                // everything is clear
                HtmlCc.Libs.Log.log('Refreshing of garage status complete.');
                successCallback();
            }
        }, function () {
            // failure
            HtmlCc.Libs.Log.error('Garage call failed.');
            errorCallback();
        });
    };

    // adds callback that is triggered after object initialization complete; if it is already completed initialization, callback is triggered immediately
    this.addAfterInitCallback = function (clbk) {
        /// <signature>
        /// <param name='errorCallback' type='Function' />
        /// </signature>
        if (typeof clbk !== 'function') {
            throw new Error('Callback is not type of function.');
        }
        if (_initialized == true) {
            clbk();
        } else {
            _initializedCallback.push(clbk);
            this.init();
        }
    };

    // returns more info about stored cars
    this.getCarInfos = function (isDealer,successCallback, errorCallback) {
        /// <signature>
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>
        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }

        var toReturn = [];
        var idsToFetch = [];

        $.each(thisGarage.getCarIds(), function () {
            if (_cachedCarInfos[this] != null) {
                toReturn.push(_cachedCarInfos[this]);
            } else {
                idsToFetch.push(this);
            }
        });
        if (idsToFetch.length > 0) {
            HtmlCc.Garage.Remote.ConfiguredCars(idsToFetch, isDealer, function (data) {
                $.each(data, function () {
                    _cachedCarInfos[this.Id] = this;
                    toReturn.push(this);
                });
                successCallback(toReturn);
            }, function () {
                // failed to fetch infos
                HtmlCc.Libs.Log.error('Fetching of more infos about stored cars failed.');
                errorCallback();
            });
        } else {
            // just return cached values
            successCallback(toReturn);
        }
        
    };

    this.getRemoteModelGroupAggregatedValues = function (instance, salesprogram, culture, version, successCallback, errorCallback) {
        
        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }
        
        var params = {};

        params.instancename = instance
        params.salesprogramname = salesprogram
        params.culture = culture;
        params.version = version;
        

        $.ajax({
            url: HtmlCc.Garage.GetUrl('/ConfigureRefactored/GetModelGroupAggregatedValues'),
            data: params,
            success: function (data) {
                if (data != null && data.Error != null) {
                    HtmlCc.Libs.Log.error('Error calling {1}, reason: {0}'.format(data.Error.Description, HtmlCc.Garage.GetUrl('/ConfigureRefactored/GetModelGroupAggregatedValues')));
                    errorCallback(data);
                } else {
                    _modelGroupAggregatedValues = data;
                    successCallback(data);
                }
            },
            error: errorCallback,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            timeout: HtmlCc.Api.AppSettings.get("GarageRequestTimeout")
        });
    };

    this.getCompareTranslations = function (settings, version, successCallback, errorCallback) {
        /// <signature>
        /// <param name='carsToCompare' type='String' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }
        
        var params = {};

        params.instance = settings.instance
        params.salesprogram = settings.salesprogram
        params.culture = settings.culture;
        params.version = version;

        $.ajax({
            url: HtmlCc.Garage.GetUrl('/garage/GetCompareTranslations'),
            data: JSON.stringify(params),
            success: function (data) {
                if (data != null && data.Error != null) {
                    HtmlCc.Libs.Log.error('Error calling {1}, reason: {0}'.format(data.Error.Description, HtmlCc.Garage.GetUrl('/garage/GetCompareTranslations')));
                    errorCallback(data);
                } else {
                    _translations = data;
                    successCallback(data);
                }
            },
            error: errorCallback,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            timeout: HtmlCc.Api.AppSettings.get("GarageRequestTimeout")
        });
    };

    // saves/updates a note into car
    this.saveNote = function (carId, newNote, isDealer, successCallback, errorCallback) {
        /// <signature>
        /// <param name='carId' type='int' />
        /// <param name='newNote' type='String' />
        /// <param name='successCallback' type='Function' />
        /// <param name='errorCallback' type='Function' />
        /// </signature>

        if (typeof successCallback !== 'function') {
            throw new Error('Success callback is not type of function.');
        }

        if (typeof errorCallback !== 'function') {
            throw new Error('Error callback is not type of function.');
        }

        thisGarage.getCarInfos(isDealer, function (infos) {
            // find the right info
            var found = null;
            $.each(infos, function () {
                var info = this;
                if (info.Id == carId) {
                    found = info;
                }
            });

            if (found == null) {
                HtmlCc.Libs.Log.error('Changing note of unknown car.');
            } else {
                HtmlCc.Garage.Remote.SaveNote(found.Id, newNote, thisGarage.getDataSource(), successCallback, errorCallback);
            }
        }, function () {
            HtmlCc.Libs.Log.error('Get car infos failed. Note cannot been saved.');
        });

    };

    this.init = function () {
        this.refreshGarage(function () {
            // initialization successfuly complete
            HtmlCc.Libs.Log.log('Car storage initialization complete.');

            _initialized = true;
            var clbk;
            while (clbk = _initializedCallback.shift()) {
                clbk();
            }
        }, function () {
            // failed initialization
            HtmlCc.Libs.Log.error('Car storage initialization failed!');
        });
    }

    this.init();

    // init
    //this.refreshGarage(function () {
    //    // initialization successfuly complete
    //    HtmlCc.Libs.Log.log('Car storage initialization complete.');
    //    _initialized = true;
    //    var clbk;
    //    while (clbk = _initializedCallback.shift()) {
    //        clbk();
    //    }
    //}, function () {
    //    // failed initialization
    //    HtmlCc.Libs.Log.error('Car storage initialization failed!');
    //});
};
