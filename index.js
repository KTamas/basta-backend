var express = require('express');
var app = express();
var stops = require('./stops');
var fetch = require('node-fetch');

const bkkUrl = 'http://futar.bkk.hu/bkk-utvonaltervezo-api/ws/otp/api/where/arrivals-and-departures-for-stop.json?includeReferences=agencies,routes,trips,stops&minutesBefore=1&minutesAfter=30&key=bkk-web&version=3&appVersion=2.2.7-20170324232341&stopId=BKK_';

const loadStopData = (stopId) => {
    return fetch(bkkUrl + stopId).then(res => res.json());
};

app.get('/:stopId', function (req, res) {
    loadStopData(req.params.stopId).then(data => res.send(data));
});

app.listen(3000);
