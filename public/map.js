async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    loadMap()
}

function loadMap() {

var map = L.map('map').setView([window.config.lat, window.config.long], window.config.zoom);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

try{
    token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
} catch(e) {
    console.log(e)
    location.href = "/login.html"
}

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};
  
function success(pos) {
    const crd = pos.coords;
  
    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    window.posmarker = L.marker([crd.latitude, crd.longitude], {icon: L.divIcon({className: 'poi', html: '<b>🔴</b>'})}).addTo(map)
  }

function success_update(pos) {
    const crd = pos.coords;
    window.posmarker.remove()
    window.posmarker = L.marker([crd.latitude, crd.longitude], {icon: L.divIcon({className: 'poi', html: '<b>🔴</b>'})}).addTo(map)
}
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}
  
navigator.geolocation.getCurrentPosition(success, error, options);
navigator.geolocation.watchPosition(success_update, error, options);

fetch(window.config.address + "/map_places", {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token : token,
    })
}).then( async (response) => {
    if (response.status == 200) {
        jsonData = await response.json()
        console.log(jsonData)
        for (var i = 0; i < jsonData.length; i++) {
            L.marker([jsonData[i].lat, jsonData[i].longi]).addTo(map)
                .bindPopup("<b>" + jsonData[i].name + "</b><br />" + jsonData[i].description)
        }
    } else {
        response.json().then((json) => {
        location.href = "/login.html"
        })
    }
})

}