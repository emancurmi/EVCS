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



        CarInfo.cords.lat = OpenMapsAPI.cords.lat = 40.7699456//parseFloat(position.coords.latitude);
        CarInfo.cords.lng = OpenMapsAPI.cords.lng = -73.98686719999999 //parseFloat(position.coords.longitude);

        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                "lat": CarInfo.cords.lat,
                "lng": CarInfo.cords.lng
            },
            zoom: 8
        });

 

        let fullurl = OpenMapsAPI.src  + '&latitude=40.7699456&longitude=-73.98686719999999&distance=10'
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
        GoogleMaps.stations = responseJson
        plotMarkers();
    }
}

//markers section

let markers;
let bounds;

function plotMarkers() {
    console.log(GoogleMaps.stations)
    markers = [];
    bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < GoogleMaps.stations.length; i++) {
        console.log(GoogleMaps.stations[i].AddressInfo.Latitude + " " + GoogleMaps.stations[i].AddressInfo.Longitude);
        let position = new google.maps.LatLng(GoogleMaps.stations[i].AddressInfo.Latitude, GoogleMaps.stations[i].AddressInfo.Longitude);

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
