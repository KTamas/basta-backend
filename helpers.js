const stops = require('./stops');
const _ = require('lodash');

// http://stackoverflow.com/a/21623256/6541
const calculateDistanceInKm = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (lat2 - lat1) * Math.PI / 180; // deg2rad below
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

const getDistancesFromStops = function (stops, location) {
    let distances = [];
    stops.forEach(stop => {
        const distance = calculateDistanceInKm(location.lat, location.lon, stop.lat, stop.lon);
        distances.push({'id': stop.id, 'name': stop.name, 'distance': distance, 'parent': stop.parent});
    });
    return distances;
};

const getNearbyStops = (location, distanceThreshold) => {
    const distances = getDistancesFromStops(stops, location);
    return distances.filter(d => d.parent !== '').filter(d => d.distance < distanceThreshold).sort((a, b) => a.distance - b.distance);
};

var exports = module.exports = {};

exports.getNearbyStopsGrouped = (location, distanceThreshold) => {
    const nearbyStops = getNearbyStops(location, distanceThreshold);
    return  _(nearbyStops)
        .groupBy(x => x.name.replace(/ \[.+?\]/g, '').replace(/ M \(.+?\)/g, '').replace(/ M$/, ''))
        .toPairs()
        .value()
        .map(item => {
            let tmp = {};
            tmp.name = item[0];
            tmp.departures = item[1];
            return tmp;
    });
};
