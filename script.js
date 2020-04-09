/*file:///Users/emancurmi/Documents/Thinkful/EVCS/index.html*/

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
    startlocating();
};


function startlocating() {

    function success(position) {
        CarInfo.cords.lat = OpenMapsAPI.cords.lat = parseFloat(position.coords.latitude);
        CarInfo.cords.lng = OpenMapsAPI.cords.lng = parseFloat(position.coords.longitude);
        OpenMapsAPI.queryurl = '&latitude=' + CarInfo.cords.lat + '&longitude=' + CarInfo.cords.lng + '&connectiontypeid=' + CarInfo.connectiontype + '&distance=10';
        initMap();
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


let map;
let markers = [];
let InforObj = [];


function getcharginstationsinfo() {
    console.log(OpenMapsAPI.src + OpenMapsAPI.queryurl);
    fetch(OpenMapsAPI.src + OpenMapsAPI.queryurl)
        .then(response => response.json())
        .then(responseJson =>  renderResults(responseJson))
        .catch(error => alert(error));
};

async function renderResults(responseJson) {

    if (responseJson.code === 404) {
        if (responseJson.code === 404) {
            alert('No charging stations found. Please try again');
            console.log("code 404");
        }
        else {
            await sleep(300);

        }
    }
    else {
        
        GoogleMaps.markers = responseJson;

        console.log(GoogleMaps.markers.length);
        
        for (var i = 0; i < GoogleMaps.markers.length; i++) {

            let contentString = '<div id="content">';
            
            if (GoogleMaps.markers[i].OperatorInfo && GoogleMaps.markers[i].OperatorInfo.Title){
               contentString += '<h3>' + GoogleMaps.markers[i].OperatorInfo.Title + '</h3>';
            }
            if (GoogleMaps.markers[i].OperatorInfo && GoogleMaps.markers[i].OperatorInfo.PhonePrimaryContact){
               contentString += 'Contact Number: ' + GoogleMaps.markers[i].OperatorInfo.PhonePrimaryContact + '<br/>';
            }
             /*
            try {
                contentString += '<h3>' + GoogleMaps.markers[i].OperatorInfo.Title + '</h3>';
            }
            catch (error) {
                console.log(error);
            }

            contentString += '<p>';

            try {
                contentString += 'Contact Number: ' + GoogleMaps.markers[i].OperatorInfo.PhonePrimaryContact + '<br/>';
            }
            catch (error) {
                console.log(error);
            }*/
            

            try {
                (GoogleMaps.markers[i].UsageType.IsMembershipRequired != null) ? contentString += 'Requires Membership <br/>' : console.log("membership is null");
            }
            catch (error) {
                console.log(error);
            }

            try {
                (GoogleMaps.markers[i].UsageType.IsPayAtLocation != null) ? contentString += 'Pay at location <br/>' : console.log("Pay at location is null");
            }
            catch (error) {
                console.log(error);
            }

            //try {
            //    (GoogleMaps.markers[i].Connections[0].Level.Comments != null) ? contentString += 'Comments: ' + GoogleMaps.markers[i].Connections[0].Level.Comments + '<br/>' : console.log("Pay at location is null");
            //}
            //catch (error) {
            //    console.log(error);
            //}

            try {
                contentString += 'Distance: ' + GoogleMaps.markers[i].AddressInfo.distance + ' Miles <br/>';
            }
            catch (error) {
                console.log(error);
            }

            contentString += '</p>';
            contentString += '<p>';

            //try {
            //    for (let i = 0; i < GoogleMaps.markers[i].Connections[0].NumberOfPoints; i++) {
            //        contentString += '<i class="fas fa-gas-pump"></i>';
            //    }
            //}
            //catch (error) {
            //    console.log(error);
            //}
            //contentString += '</br>';
            //try {
            //    (GoogleMaps.markers[i].Connections[0].Level.IsFastChargeCapable == true) ? contentString += '<i class="fas fa-bolt"></i>' : console.log("Fast Charging is disabled");
            //}
            //catch (error) {
            //    console.log(error);
            //}
            contentString += '</p>';
            contentString += '</div>';


            const marker = new google.maps.Marker({
                position: { lat: GoogleMaps.markers[i].AddressInfo.Latitude, lng: GoogleMaps.markers[i].AddressInfo.Longitude },
                map: map
            });

            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 200
            });

            marker.addListener('click', function () {
                closeOtherInfo();
                infowindow.open(marker.get('map'), marker);
                InforObj[0] = infowindow;
            });
        }
    }
};

function closeOtherInfo() {
    if (InforObj.length > 0) {
        /* detach the info-window from the marker ... undocumented in the API docs */
        InforObj[0].set("marker", null);
        /* and close it */
        InforObj[0].close();
        /* blank the array */
        InforObj.length = 0;
    }
}


function initMap() {
    let marker = { lat: CarInfo.cords.lat, lng: CarInfo.cords.lng };
    console.log(marker);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: marker
    });
    getcharginstationsinfo();
};
