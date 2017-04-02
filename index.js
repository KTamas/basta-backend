const express = require('express');
const app = express();
const stops = require('./stops');
const fetch = require('node-fetch');
const helpers = require('./helpers');

const bkkUrl = 'http://futar.bkk.hu/bkk-utvonaltervezo-api/ws/otp/api/where/arrivals-and-departures-for-stop.json?includeReferences=agencies,routes,trips,stops&minutesBefore=1&minutesAfter=30&key=bkk-web&version=3&appVersion=2.2.7-20170324232341&stopId=BKK_';

const loadStopData = (stopId) => {
    return fetch(bkkUrl + stopId).then(res => res.json());
};

const sendJSON = (res, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
    res.end();
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/getNearbyStops', function (req, res, next) {
    const coords = {
        lat: req.query.lat,
        lon: req.query.lon
    };
    const dt = req.query.dt;
    const nearbyStops = helpers.getNearbyStopsGrouped(coords, dt).map((item, i) => { return {id: i, name: item.name}; });
    sendJSON(res, nearbyStops);
});


app.get('/getDeparturesForStop/:name', function (req, res, next) {
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
        let finalData = {
            stopName: req.params.name,
            departures: []
        };

        allData.forEach(departureItem => {
            departureItem.departures.forEach(d => {
                finalData.departures.push({
                    direction: departureItem.direction,
                    comesIn: d.comesIn,
                    tripHeadSign: d.tripHeadSign,
                    vehicleName: d.vehicleName,
                    backgroundColor: d.backgroundColor,
                    color: d.color
                });
            });
        });

        finalData.departures.sort((a, b) => a.comesIn - b.comesIn);
        return finalData;
    }).then(finalData => {
        sendJSON(res, finalData);
    }).catch(err => {
      console.log(err);
    });
});

app.listen(3000);
