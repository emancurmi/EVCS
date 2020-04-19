'use strict';

let STORE = {
    lang: "en",
    status: "",

    GoogleMaps: {
        src: "https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyCqUuyEgb8KQ-sXs3nKkiSesNpGX4aROJw&language=",
        map,
        markers: [],
        InforObj: []
    },

    GoogleLocation: {
        src: "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCqUuyEgb8KQ-sXs3nKkiSesNpGX4aROJw&address=",
        quieryurl: "",
        cords: {
            lat: 0,
            lng: 0
        }
    },

    CarInfo: {
        carbrand: "",
        carmodel: "",
        connectiontype: "",
        cords: {
            lat: 0,
            lng: 0
        }
    },

    OpenMapsAPI : {
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
    },

    CarsDB :[
        {
            brand: "Fiat",
            model: "500e",
            chargingport: [22, 9]
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
            chargingport: [1, 2]
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
            chargingport: [22, 9]
        },
        {
            brand: "Hyundai",
            model: "Kona",
            chargingport: [22, 9]
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
    ],

    ChargingPortDB :[
        {
            connectiontypeid: "22",
            connectionname: "NEMA 5-15R"
        },
        {
            connectiontypeid: "1",
            connectionname: "SAE J1772-2009"
        },
        {
            connectiontypeid: "30",
            connectionname: "Tesla Charging Station"
        },
        {
            connectiontypeid: "9",
            connectionname: "NEMA 5-20R"
        },
        {
            connectiontypeid: "27",
            connectionname: "Tesla Supercharger"
        },
        {
            connectiontypeid: "2",
            connectionname: "CHAdeMO"
        }
    ]
};


function start() {
    generatebrands();
};

function checkboxstatechage() {
    console.log("state changed");
    if (document.getElementById("jschklocation").checked === true) {
        console.log("true");
        
        $('#jstxtaddress').attr('disabled', true).attr("disabled", true).css("background-color", "#ddd");
    }
    else {
        console.log("false");
        $('#jstxtaddress').attr('disabled', true).attr("disabled", false).css("background-color", "#FFF");
    }
}

function generatebrands() {
    let jsselbrands = document.getElementById('jsselbrands');
    jsselbrands.innerHTML = "";

    let tempbrandarray = [];
    
    for (let x = 0; x < STORE.CarsDB.length; x++) {

        if (tempbrandarray.indexOf(STORE.CarsDB[x].brand) == -1) {
            tempbrandarray.push(STORE.CarsDB[x].brand);
        }
    }
    tempbrandarray.sort();
    for (let i = 0; i < tempbrandarray.length; i++) {
        jsselbrands.innerHTML += "<option value=" + tempbrandarray[i] + ">" + tempbrandarray[i] + "</option>"
    }
    generatemodels()
};

function generatemodels() {
    let jsselbrands = document.getElementById('jsselbrands');
    STORE.CarInfo.brand = jsselbrands.value;
    let jsselmodels = document.getElementById('jsselmodels');
    jsselmodels.innerHTML = "";

    for (let i = 0; i < STORE.CarsDB.length; i++)
    {
        if (STORE.CarsDB[i].brand == STORE.CarInfo.brand) {
            
            jsselmodels.innerHTML += "<option value=" + STORE.CarsDB[i].model + ">" + STORE.CarsDB[i].model + "</option>";
        }
    }
    generateconnections();
}

function generateconnections() {
    let jsselmodels = document.getElementById('jsselmodels');
    STORE.CarInfo.model = jsselmodels.value;
    let jsselconnectors = document.getElementById('jsselconnectors');
    jsselconnectors.innerHTML = "";

    for (let i = 0; i < STORE.CarsDB.length; i++) {
        if (STORE.CarsDB[i].model == STORE.CarInfo.model) {
            for (let j = 0; j < STORE.CarsDB[i].chargingport.length; j++) {
                for (let k = 0; k < STORE.ChargingPortDB.length; k++) {
                    if (STORE.ChargingPortDB[k].connectiontypeid == STORE.CarsDB[i].chargingport[j]) {
                        jsselconnectors.innerHTML += "<option value=" + STORE.CarsDB[i].chargingport[j] + ">" + STORE.ChargingPortDB[k].connectionname + "</option>";
                    }
                }
            }
        }
    }
};

function updateMap() {
    $(".mapplaceholder").show(1000);

    let jsselconnectors = document.getElementById('jsselconnectors');

    STORE.CarInfo.connectiontype = jsselconnectors.value;
   
    if (document.getElementById("jschklocation").checked === false) {

        STORE.GoogleLocation.queryurl = (document.getElementById("jstxtaddress").value).split(' ').join('+');

        if (STORE.GoogleLocation.queryurl == "") {
            alert("Please enter Address or Check box for automatic location");
        }
        else {
            getusersaddressinfo();
        }
    }

    else {
        startlocating();
    }
};

function startlocating() {

    function success(position) {
        STORE.CarInfo.cords.lat = STORE.OpenMapsAPI.cords.lat = parseFloat(position.coords.latitude);
        STORE.CarInfo.cords.lng = STORE.OpenMapsAPI.cords.lng = parseFloat(position.coords.longitude);

        STORE.OpenMapsAPI.queryurl = '&latitude=' + STORE.CarInfo.cords.lat + '&longitude=' + STORE.CarInfo.cords.lng + '&connectiontypeid=' + STORE.CarInfo.connectiontype + '&distance=10';
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

function getusersaddressinfo() {
    console.log(STORE.GoogleLocation.src + STORE.GoogleLocation.queryurl);
    fetch(STORE.GoogleLocation.src + STORE.GoogleLocation.queryurl)
        .then(response => response.json())
        .then(responseJson => storecoords(responseJson))
        .catch(error => alert("We have encountered an error loading the data. Please try again."));
};

function storecoords(responseJson) {

    STORE.CarInfo.cords.lat = STORE.OpenMapsAPI.cords.lat = STORE.GoogleLocation.cordslat = responseJson.results[0].geometry.location.lat;
    STORE.CarInfo.cords.lng = STORE.OpenMapsAPI.cords.lng = STORE.GoogleLocation.cords.lng = responseJson.results[0].geometry.location.lng;

    STORE.OpenMapsAPI.queryurl = '&latitude=' + STORE.CarInfo.cords.lat + '&longitude=' + STORE.CarInfo.cords.lng + '&connectiontypeid=' + STORE.CarInfo.connectiontype + '&distance=10';
    initMap();
};

function getcharginstationsinfo() {
    fetch(STORE.OpenMapsAPI.src + STORE.OpenMapsAPI.queryurl)
        .then(response => response.json())
        .then(responseJson =>  renderResults(responseJson))
        .catch(error => alert("We have encountered an error loading the data. Please try again."));
};

async function renderResults(responseJson) {

    if (responseJson.code === 404) {

        alert('No charging stations found. Please try again');
    }
    else {
        
        STORE.GoogleMaps.markers = responseJson;
        
        for (var i = 0; i < STORE.GoogleMaps.markers.length; i++) {

            let contentString = '<div id="mapcontent">';
            
            if (STORE.GoogleMaps.markers[i].OperatorInfo && STORE.GoogleMaps.markers[i].OperatorInfo.Title){
                contentString += '<h3>' + STORE.GoogleMaps.markers[i].OperatorInfo.Title + '</h3>';
            }
            if (STORE.GoogleMaps.markers[i].OperatorInfo && STORE.GoogleMaps.markers[i].OperatorInfo.PhonePrimaryContact){
                contentString += 'Contact Number: ' + STORE.GoogleMaps.markers[i].OperatorInfo.PhonePrimaryContact + '<br/>';
            }

            if (STORE.GoogleMaps.markers[i].UsageType && STORE.GoogleMaps.markers[i].UsageType.IsMembershipRequired) {
                contentString += 'Requires Membership <br/>';
            }
            if (STORE.GoogleMaps.markers[i].UsageType && STORE.GoogleMaps.markers[i].UsageType.IsPayAtLocation) {
                contentString += 'Pay at location <br/>';
            }
            if (STORE.GoogleMaps.markers[i].Connections) {
                contentString += STORE.GoogleMaps.markers[i].Connections[0].Level.Comments;
            }

            if (STORE.GoogleMaps.markers[i].AddressInfo && STORE.GoogleMaps.markers[i].AddressInfo.distance) {
                contentString += 'Distance: ' + STORE.GoogleMaps.markers[i].AddressInfo.distance + ' Miles <br/>';
            }

            contentString += '</p>';
            contentString += '<p>';

            if (STORE.GoogleMaps.markers[i].Connections[0].NumberOfPoints) {
                contentString += '<i class="fas fa-gas-pump"></i>';
            }
            if (STORE.GoogleMaps.markers[i].Connections[0].Level.IsFastChargeCapable) {
                contentString += '<i class="fas fa-bolt"></i>';
            }
            
            contentString += '</p>';
            contentString += '</div>';


            const marker = new google.maps.Marker({
                position: { lat: STORE.GoogleMaps.markers[i].AddressInfo.Latitude, lng: STORE.GoogleMaps.markers[i].AddressInfo.Longitude },
                map: STORE.GoogleMaps.map
            });

            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 200
            });

            marker.addListener('click', function () {
                closeOtherInfo();
                infowindow.open(marker.get('map'), marker);
                STORE.GoogleMaps.InforObj[0] = infowindow;
            });
        }
    }
};

function closeOtherInfo() {
    if (STORE.GoogleMaps.InforObj.length > 0) {
        /* detach the info-window from the marker ... undocumented in the API docs */
        STORE.GoogleMaps.InforObj[0].set("marker", null);
        /* and close it */
        STORE.GoogleMaps.InforObj[0].close();
        /* blank the array */
        STORE.GoogleMaps.InforObj.length = 0;
    }
}

function initMap() {
    
    let marker = { lat: STORE.CarInfo.cords.lat, lng: STORE.CarInfo.cords.lng };
    STORE.GoogleMaps.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: marker
    });
    getcharginstationsinfo();
};

$(document).ready(function () {
    start();
    $("#jsselbrands").change(generatemodels);
    $("#jsselmodels").change(generateconnections);
    $("#jschklocation").change(checkboxstatechage);
    $("#btnsubmit").click(updateMap);
});