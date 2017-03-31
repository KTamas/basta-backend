var express = require('express');
var app = express();
var stops = require('./stops');
var fetch = require('node-fetch');
var helpers = require('./helpers');

const bkkUrl = 'http://futar.bkk.hu/bkk-utvonaltervezo-api/ws/otp/api/where/arrivals-and-departures-for-stop.json?includeReferences=agencies,routes,trips,stops&minutesBefore=1&minutesAfter=30&key=bkk-web&version=3&appVersion=2.2.7-20170324232341&stopId=BKK_';

const loadStopData = (stopId) => {
    return fetch(bkkUrl + stopId).then(res => res.json());
};

app.get('/getNearbyStops', function (req, res) {
    //Lat: 47.515318099999995, Lon: 19.0529387
    const coords = {
        lat: req.query.lat,
        lon: req.query.lon
    };

    const dt = req.query.dt;

    res.send(helpers.getNearbyStopsGrouped(coords, dt));
});


app.get('/getDeparturesForStop/:name', function (req, res) {
    const stops = helpers.getStop(req.params.name);
    let reqIds = [];
    stops.forEach(stop => reqIds.push(loadStopData(stop.id)));
    Promise.all(reqIds).then(results => {
        const allData = [];
        results.forEach(result => {
            if (typeof result !== 'undefined') {
                allData.push(helpers.processData(result));
            }
        });
        return allData;
    }).then(allData => {
        res.send(JSON.stringify(allData));
    });
});

app.listen(3000);
