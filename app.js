/**
 * Created by Drobenyuk.A on 09.07.16.
 */
var express    = require('express'),
    bodyParser = require('body-parser'),
    car        = require('./models/CarConstructor.js'),
    credit     = require('./models/CreditCalculator.js'),
    app        = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/cars', function (req, res) {
    res.send(car.getModels());
});

app.get('/complectations', function (req, res){
    res.send(car.getComplectations(req.query));
});

app.get('/engines', function (req, res){
    res.send(car.getEngines(req.query));
});

app.get('/colors', function (req, res){
    res.send(car.getColors(req.query));
});

app.get('/options', function (req, res){
    res.send(car.getOptions(req.query));
});

app.get('/bank', function (req, res){
    res.send(credit.getBanks());
});

app.get('/payments', function (req, res){
    res.send(credit.getPayments(req.query));
});

app.get('/period', function (req, res){
    res.send(credit.getPeriods(req.query));
});

app.get('/interest', function (req, res){
    res.send(credit.getInterest(req.query));
});

app.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});