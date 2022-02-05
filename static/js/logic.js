// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Create the base layers.
var street = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1IjoicGFqZXNoOTgiLCJhIjoiY2t6M2hzcHgwMDZ3ZzJ3bXo3OXp6bWV6ZSJ9.9nNxSyI_pBV36zLRlvVz-A");

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1IjoicGFqZXNoOTgiLCJhIjoiY2t6M2hzcHgwMDZ3ZzJ3bXo3OXp6bWV6ZSJ9.9nNxSyI_pBV36zLRlvVz-A");

var satelite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1IjoicGFqZXNoOTgiLCJhIjoiY2t6M2hzcHgwMDZ3ZzJ3bXo3OXp6bWV6ZSJ9.9nNxSyI_pBV36zLRlvVz-A");


// Initialize & Create Two Separate LayerGroups: earthquakes & tectonicPlates
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// Create a baseMaps object.
var baseMaps = {
  "Street Map": street,
  "Outdoor Map": outdoors,
  "Satellite Map": satelite
};

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup("Magnitude: " + feature.properties.mag +
      "<br>Location: " + feature.properties.place);
  }

  // Define function to create the circle radius based on the magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Define function to set the circle color based on the magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#ccff33"
    }
    else if (magnitude < 2) {
      return "#ffff33"
    }
    else if (magnitude < 3) {
      return "#ffcc33"
    }
    else if (magnitude < 4) {
      return "#ff9933"
    }
    else if (magnitude < 5) {
      return "#ff6633"
    }
    else {
      return "#ff3333"
    }
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
     pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });
  
  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  
  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [street,outdoors,satelite, earthquakes]
  });

  // Create a layer control.
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  // Retrieve platesURL (Tectonic Plates GeoJSON Data) with D3

  d3.json(platesURL, function(plateData) {
    L.geoJson(plateData, {
      style: function() {
        return {color: "orange", fillOpacity: 0}
      }
    }).addTo(tectonicPlates)
    tectonicPlates.addTo(myMap);
  });

  // Set Up Legend
  var legend = L.control({position: "bottomright"});
  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#ccff33",
      "#ffff33",
      "#ffcc33",
      "#ff9933",
      "#ff6633",
      "#ff3333"
    ];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);


}
