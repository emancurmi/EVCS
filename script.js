'use strict';

let STORE = {
    lang: "en",
    status: ""
};

let GoogleMaps = {
    src: "https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyCqUuyEgb8KQ-sXs3nKkiSesNpGX4aROJw&language=",
    markers: []
};

let CarInfo = {
    carbrand: "",
    carmodel: "",
    connectiontype: "",
    cords: {
        lat: 0,
        lng: 0
    }
};

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
    queryurl: ""
};

let CarsDB = [
    {
        brand: "Fiat",
        model: "500e",
        chargingport:[22, 9]
    },
    {
        brand: "Honda",
        model: "Clarity",
        chargingport: [22]
    },
    {
        brand: "Nissan",
        model: "Leaf",
        chargingport: [9]
    },
    {
        brand: "Tesla",
        model: "Model-X",
        chargingport: [30, 27]
    },
    {
        brand: "BMW",
        model: "i3",
        chargingport: [9]
    },
    {
        brand: "Kia",
        model: "Niro",
        chargingport: [1,2]
    },
    {
        brand: "Volkswagen",
        model: "e-Golf",
        chargingport: [2]
    },
    {
        brand: "Hyundai",
        model: "ioniq",
        chargingport: [1]
    },
    {
        brand: "Chevrolet",
        model: "Bolt",
        chargingport: [22,9]
    },
    {
        brand: "Hyundai",
        model: "Kona",
        chargingport: [22,9]
    },
    {
        brand: "Audi",
        model: "e-tron",
        chargingport: [9]
    },
    {
        brand: "Jaguar",
        model: "I-Pace",
        chargingport: [9]
    },
    {
        brand: "Tesla",
        model: "Model-3",
        chargingport: [30, 27]
    },
    {
        brand: "Kia",
        model: "Soul",
        chargingport: [9]
    },
    {
        brand: "Tesla",
        model: "Model-S",
        chargingport: [30, 27]
    }
];

let ChargingPortDB = [
    {
        connectiontypeid: "22",
        connectionname : "NEMA 5-15R"
    },
    {
        connectiontypeid : "1",
        connectionname : "SAE J1772-2009"
    },
    {
        connectiontypeid : "30",
        connectionname : "Tesla Charging Station"
    },
    {
        connectiontypeid : "9",
        connectionname : "NEMA 5-20R"
    },
    {
        connectiontypeid : "27",
        connectionname : "Tesla Supercharger"
    },
    {
        connectiontypeid : "2",
        connectionname : "CHAdeMO"
    }
];

document.addEventListener('DOMContentLoaded', function () {
    generateform();
});

function generateform() {
    generatebrands();
};

function generatebrands() {
    let jsselbrands = document.getElementById('jsselbrands');
    jsselbrands.innerHTML = "";

    for (let i = 0; i < CarsDB.length; i++)
    {
        jsselbrands.innerHTML += "<option value=" + CarsDB[i].brand + ">" + CarsDB[i].brand + "</option>"
    }
    generatemodels()
};

function generatemodels() {
    let jsselbrands = document.getElementById('jsselbrands');
    CarInfo.brand = jsselbrands.value;
    let jsselmodels = document.getElementById('jsselmodels');
    jsselmodels.innerHTML = "";

    for (let i = 0; i < CarsDB.length; i++)
    {
        if (CarsDB[i].brand == CarInfo.brand) {
            
            jsselmodels.innerHTML += "<option value=" + CarsDB[i].model + ">" + CarsDB[i].model + "</option>";
        }
    }
    generateconnections();
}

function generateconnections() {
    let jsselmodels = document.getElementById('jsselmodels');
    CarInfo.model = jsselmodels.value;
    let jsselconnectors = document.getElementById('jsselconnectors');
    jsselconnectors.innerHTML = "";

    for (let i = 0; i < CarsDB.length; i++) {
        if (CarsDB[i].model == CarInfo.model) {
            for (let j = 0; j < CarsDB[i].chargingport.length; j++) {
                for (let k = 0; k < ChargingPortDB.length; k++) {
                    if (ChargingPortDB[k].connectiontypeid == CarsDB[i].chargingport[j]) {
                        jsselconnectors.innerHTML += "<option value=" + CarsDB[i].chargingport[j] + ">" + ChargingPortDB[k].connectionname + "</option>";
                    }
                }
            }
        }
    }
};

document.getElementById("jsselbrands").onchange = generatemodels;

document.getElementById("jsselmodels").onchange = generateconnections;

document.getElementById("btnsubmit").addEventListener("click", updateMap);

function updateMap() {
    let jsselconnectors = document.getElementById('jsselconnectors');
    CarInfo.connectiontype = jsselconnectors.value;

    OpenMapsAPI.queryurl = '&latitude=' + CarInfo.cords.lat + '&longitude=' + CarInfo.cords.lng + '&distance=10';
    startlocating();
}


function startlocating() {

    function success(position) {

        CarInfo.cords.lat = OpenMapsAPI.cords.lat = parseFloat(position.coords.latitude);
        CarInfo.cords.lng = OpenMapsAPI.cords.lng = parseFloat(position.coords.longitude);

        fetch(OpenMapsAPI.src + OpenMapsAPI.queryurl)
            .then(response => response.json())
            .then(responseJson => renderResults(responseJson))
            .catch(error => alert(error));
    }

    //if current cords fail to load

    function error() {
        STORE.status = 'Unable to retrieve your location';
        alert(STORE.status);
    }

    //current cords check
    if (!navigator.geolocation) {
        STORE.status = 'Geolocation is not supported by your browser';
    } else {
        STORE.status = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error);
    }
};

var map;
var markers = [];

function renderResults(responseJson) {
    if (responseJson.code === 404) {
        alert('No parks found. Please try again');
    }
    else {
        GoogleMaps.markers = responseJson
    }
    initMap();
}



function initMap() {
    var haightAshbury = { lat: CarInfo.cords.lat, lng: CarInfo.cords.lng };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: haightAshbury,
        mapTypeId: 'terrain'
    });

    // This event listener will call addMarker() when the map is clicked.

    //map.addListener('click', function (event) {
    //    addMarker(event.latLng);
    //});

    // Adds a marker at the center of the map.

    addMarker(haightAshbury);
    for (let i = 0; i < GoogleMaps.markers.length; i++) {
        console.log(GoogleMaps.markers.length);
        var location = { lat: GoogleMaps.markers[i].AddressInfo.Latitude, lng: GoogleMaps.markers[i].AddressInfo.Longitude };
        addMarker(location);
    }
}

// Adds a marker to the map and push to the array.

function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}