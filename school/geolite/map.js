

//Get the longitude and latitude from the url.
var longitude = 0;
var latitude = 0;
const urlQuery = window.location.search;
const urlParams = new URLSearchParams(urlQuery);

if (urlParams.has('longitude')) {
  longitude = parseFloat(urlParams.get('longitude'));
}
if (urlParams.has('latitude')) {
  latitude = parseFloat(urlParams.get('latitude'));
}
console.log(longitude)
console.log(latitude)


const map = L.map('map').setView([latitude, longitude], 13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const marker = L.marker([latitude, longitude], 13).addTo(map);

//Update the location by generating a new url and redirecting
function newLoc() {
  var url = window.location.href; //Get the current url
  var urlParts = url.split('/'); //Split it into parts
  const longitudeInput = document.getElementById('longitude');
  const latitudeInput = document.getElementById('latitude');
  const longitude = parseFloat(longitudeInput.value);
  const latitude = parseFloat(latitudeInput.value);

  //Check if the values entered are correct
  var correct = true;

  if (isNaN(longitude)) {
    alert('invalid longitude');
    correct = false;
  }

  if (isNaN(latitude)) {
    alert('invalid latitude');
    correct = false;
  }

  if (correct) {
    urlParts[urlParts.length-1] = "map.html?longitude="+longitude.toString()+"&latitude="+latitude.toString();
    url = ""
    for (var i = 0; i < urlParts.length; i++) {
      url = url + urlParts[i]; //Rebuild the url with the new params
      if (i < urlParts.length-1) {
        url = url + "/";
      }
    }
    window.location = url; //Redirect to the new url
  }
}
