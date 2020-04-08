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

    if (document.querySelectorAll('#map').length > 0) {
        if (document.querySelector('html').lang)
            STORE.lang = document.querySelector('html').lang;


        let js_file = document.createElement('script');
        js_file.type = 'text/javascript';
        js_file.src = GoogleMaps.src;
        document.getElementsByTagName('head')[0].appendChild(js_file);
    }
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
    let brand = jsselbrands.value;
    let jsselmodels = document.getElementById('jsselmodels');
    jsselmodels.innerHTML = "";

    for (let i = 0; i < CarsDB.length; i++)
    {
        if (CarsDB[i].brand == brand) {
            
            jsselmodels.innerHTML += "<option value=" + CarsDB[i].model + ">" + CarsDB[i].model + "</option>";
        }
    }
    generateconnections();
}

function generateconnections() {
    let jsselmodels = document.getElementById('jsselmodels');
    let model = jsselmodels.value;
    let jsselconnectors = document.getElementById('jsselconnectors');
    jsselconnectors.innerHTML = "";

    for (let i = 0; i < CarsDB.length; i++) {
        if (CarsDB[i].model == model) {
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

    let fullurl = OpenMapsAPI.src + '&latitude=' + CarInfo.cords.lat + '&longitude=' + CarInfo.cords.lng + '&distance=10'
    fetch(fullurl)
        .then(response => response.json())
        .then(responseJson => renderResults(responseJson))
        .catch(error => alert(error));
}


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

        let x = "";
        if (x == "") {
            
        }
        else {
            let fullurl = OpenMapsAPI.src;
            fetch(fullurl)
                .then(response => response.json())
                .then(responseJson => renderResults(responseJson))
                .catch(error => alert(error));
        }
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
    markers = [];
    bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < GoogleMaps.stations.length; i++) {
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