'use strict';


let STORE = {
    lang : "en",
    maps_src : 'https://maps.googleapis.com/maps/api/js?callback=initMap&signed_in=true&key=AIzaSyCqUuyEgb8KQ-sXs3nKkiSesNpGX4aROJw&language=',
    openmaps_src: 'https://api.openchargemap.io/v3/poi/?output=json',
    cords : [],
    currentcords : {},
    markercords : {},
    limit : 50,
    status : ""
};

document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelectorAll('#map').length > 0) {
        if (document.querySelector('html').lang)
            STORE.lang = document.querySelector('html').lang;


        let js_file = document.createElement('script');
        js_file.type = 'text/javascript';
        js_file.src = STORE.maps_src + STORE.lang;
        document.getElementsByTagName('head')[0].appendChild(js_file);
    }
});

//create map

let map;

function initMap() {

    //if current cords successfully loaded

    function success(position) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                "lat": position.coords.latitude,
                "lng": position.coords.longitude
            },
            zoom: 8
        });

        STORE.cords.push({ "lat": position.coords.latitude, "lng": position.coords.longitude });

        let fullurl = STORE.openmaps_src + "&latitued=" + STORE.cords[0].lat + "&longitude=" + STORE.cords[0].lng + "&distance=10";
        console.log(fullurl);
        fetch(fullurl)
            .then(response => response.json())
            .then(responseJson => renderResults(responseJson))
            .catch(error => alert(error));
    }

    //if current cords fail to load

    function error() {
        STORE.status = 'Unable to retrieve your location';
        console.log(status);
    }

    //current cords check
    if (!navigator.geolocation) {
        STORE.status = 'Geolocation is not supported by your browser';
        console.log(status);
    } else {
        STORE.status = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error);
        console.log(status);
    }
}


function renderResults(responseJson) {
    if (responseJson.code === 404) {
        alert('No parks found. Please try again');
    }
    else {
        renderCords(responseJson);
    }
}

function renderCords(responseJson) {
    if (parseInt(responseJson.limit) > parseInt(responseJson.total)) {
        resultno = parseInt(responseJson.total);
    }
    else {
        resultno = parseInt(responseJson.maxresults);
    }

    for (let i = 0; i < responseJson.length; i++) {
         STORE.reponsecords = {
            "lat": responseJson[i].AddressInfo.Latitude,
            "lng": responseJson[i].AddressInfo.Longitude
        }
        STORE.cords.push(STORE.reponsecords);
    }

    plotMarkers(STORE.cords);
}

//markers section

let markers;
let bounds;

function plotMarkers(cords) {

    markers = [];
    bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < cords.length; i++) {

        let position = new google.maps.LatLng(cords[i].lat, cords[i].lng);

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

//your position

function geoFindMe() {

    
    
}
