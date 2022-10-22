// The URL of JSON to pull in the data of "All Earthquakes from the Past 7 Days" for the visualization. 
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Create 2 layergroups: earthquakes & tectonicPlates
var earthquakes = new L.LayerGroup();


// Create the base layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

var esri = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }); 

// Define basemaps object to hold layers
let baseMaps = {
    street:street,
    topo: topo,
    esri:esri
};

// Create overlay object
let overlayMaps = {
    "Earthquakes": earthquakes,
    
  }
  

  // Create a map, give it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 6,
    layers: [street,topo ]
  });


// Retrieve earthquakesURL

d3.json(earthquakesURL).then(function(earthquakeData){

    // Determine size of marker based on mgnitude of earthquakes
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 5;
    }

    // Determine color of marker
    function chooseColor(depth) {
        
        if (depth > 90)
            return "#1f306e";
        else if (depth > 70)
            return "#553772";
        else if (depth > 50)
            return "#8f3b76";
        else if (depth > 30)
            return "#c7417b";
        else if (depth > 10)
            return "#f5487f";
        else
            return "#fa9ebb";
        
    }

    // Determine style of marker
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 1.6
        };
    }

    L.geoJson(earthquakeData,{
        pointToLayer:function(feature,latlang){
            return L.circleMarker(latlang);
        },
        style:styleInfo,
    
    }).addTo(earthquakes);

    // Set the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), 
        depthLevels = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += "<h3>Depth</h3>"

        for (var i = 0; i < depthLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(depthLevels[i] + 1) + '"></i> ' +
                depthLevels[i] + (depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add th legend to map
    legend.addTo(myMap);
});

earthquakes.addTo(myMap)  


L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);








    
  



  