'use strict';

let STORE = {
    lang : "en",
    status: ""
};

let GoogleMaps = {
    src: "https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyCqUuyEgb8KQ-sXs3nKkiSesNpGX4aROJw&language=",
    stations: []
}

let CarInfo = {
    carbrand: "",
    carmodel: "",
    connectiontype: "",
    cords: {
        lat: 0,
        lng: 0
    }
}

let OpenMapsAPI = {
    src: "https://api.openchargemap.io/v3/poi/?output=json",
    cords: {
        lat: 0,
        lng: 0
    },
    distance: "",
    countrycode: "",
    connectiontypeid: "",
    limit: 10,
}

document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelectorAll('#map').length > 0) {
        if (document.querySelector('html').lang)
            STORE.lang = document.querySelector('html').lang;


        let js_file = document.createElement('script');
        js_file.type = 'text/javascript';
        js_file.src = GoogleMaps.src;
        document.getElementsByTagName('head')[0].appendChild(js_file);
    }
});

//create map

let map;

function initMap() {

    //if current cords successfully loaded
    function success(position) {

        CarInfo.cords.lat = OpenMapsAPI.cords.lat = parseFloat(position.coords.latitude);
        CarInfo.cords.lng = OpenMapsAPI.cords.lng = parseFloat(position.coords.longitude);

        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                "lat": CarInfo.cords.lat,
                "lng": CarInfo.cords.lng
            },
            zoom: 8
        });

        GoogleMaps.stations.push()

        let fullurl = OpenMapsAPI.src + "&countrycode=US" + "&latitude=" + OpenMapsAPI.cords.lat + "&longitude=" + OpenMapsAPI.cords.lng + "&distance=" + OpenMapsAPI.limit;
        fetch(fullurl)
            .then(response => response.json())
            .then(responseJson => renderResults(responseJson))
            .catch(error => alert(error));
    }

    //if current cords fail to load

    function error() {
        STORE.status = 'Unable to retrieve your location';
    }

    //current cords check
    if (!navigator.geolocation) {
        STORE.status = 'Geolocation is not supported by your browser';
    } else {
        STORE.status = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error);
    }
};


function renderResults(responseJson) {
    if (responseJson.code === 404) {
        alert('No parks found. Please try again');
    }
    else {
        renderCords(responseJson);
    }
}

function renderCords(responseJson) {
    
    for (let i = 0; i < responseJson.length; i++) {

        let stationcord = {
            lat : parseFloat(responseJson[i].AddressInfo.Latitude),
            lon : parseFloat(responseJson[i].AddressInfo.Longitude)
        };

        console.log(stationcord);

        GoogleMaps.stations.push(stationcord);
    }

    plotMarkers(GoogleMaps.stations);

}

//markers section

let markers;
let bounds;

function plotMarkers(stations) {

    markers = [];
    bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < stations.length; i++) {
        console.log(stations[i].lat + " " + stations[i].lng);
        let position = new google.maps.LatLng(stations[i].lat, stations[i].lng);

        markers.push(
            new google.maps.Marker({
                position: position,
                map: map,
                animation: google.maps.Animation.DROP
            })
        );

        bounds.extend(position);
    }
    map.fitBounds(bounds);
}