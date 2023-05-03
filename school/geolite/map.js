$(document).ready(function () {


//Mine
console.log("\n ██████╗ ██╗     ██╗████████╗ ██████╗██╗  ██╗     ██╗███████╗\n██╔════╝ ██║     ██║╚══██╔══╝██╔════╝██║  ██║     ██║██╔════╝\n██║  ███╗██║     ██║   ██║   ██║     ███████║     ██║███████╗\n██║   ██║██║     ██║   ██║   ██║     ██╔══██║██   ██║╚════██║\n╚██████╔╝███████╗██║   ██║   ╚██████╗██║  ██║╚█████╔╝███████║\n ╚═════╝ ╚══════╝╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝ ╚════╝ ╚══════╝\n");



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

  const marker = L.marker(L.latLng(parseFloat(latitude), parseFloat(longitude))).addTo(map);

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

    //Check if input is valid
    if (!longitudeInput.validity || !latitudeInput.validity) {
      correct = false
    }

    if (isNaN(longitude)) {
      correct = false;
    }

    if (isNaN(latitude)) {
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
      var latlng = L.latLng(latitude, longitude);
      map.flyTo(latlng, 13);
      marker.setLatLng(latlng);
    }
    else {
      jQuery("body > p").addClass('show');
      setTimeout(function() {
        jQuery(".show").removeClass('show');
        console.log("shown done");
      }, 2000);
    }
    console.log("clicked");
  }

  jQuery("body").on("click", "#updateButton", function() {
    newLoc();
  });
});
