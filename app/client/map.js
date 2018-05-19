import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { HTTP } from "meteor/http";

import "./map.html";

const ROUTE_URL = "https://api.mapbox.com/directions/v5/"; //"{profile}/{coordinates}"
const MAPBOX_TOKEN = Meteor.settings.public.MAPBOX_TOKEN;

const PROFILE = "mapbox/walking";
const COORDINATES = "0.059,51.564;-0.173,51.428";

Template.Map.onCreated(function mapOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);

  HTTP.call("GET", `${ROUTE_URL}${PROFILE}/${COORDINATES}?access_token=${MAPBOX_TOKEN}`, (error, result) => {
    if (!error) {
      console.log(result);
    }
  });

});

Template.Map.onRendered(function mapOnRendered() {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v9",
    center: [-0.140, 51.489],
    zoom: 9.4
  });

  map.on("load", () => {

    // Load TFL data, add to map
    HTTP.get(Meteor.absoluteUrl("/tfl-disruption-collection.json"), function(err,result) {
      console.log('Adding tfl layer');
      map.addLayer({
          "id": "tfl-layer",
          "type": "fill",
          "source": {
            "type": "geojson",
            "data": result.data
          },
          'layout': {
            'visibility': 'visible'
          },
          'paint': {
              'fill-color': '#088',
              'fill-opacity': 0.8
          }
      });
    });

    // Load GLA data, add to map
    HTTP.get(Meteor.absoluteUrl("/gla-paths.json"), function(err,result) {
      console.log('Adding gla layer');
      map.addLayer({
          "id": "gla-layer",
          "type": "line",
          "source": {
            "type": "geojson",
            "data": result.data
          },
          'layout': {
            'visibility': 'visible'
          },
          'paint': {
              'line-color': '#088',
              'line-opacity': 0.8
          }
      });
    });

    // Load random points
    HTTP.get(Meteor.absoluteUrl("/locations.json"), function(err,result) {
      console.log('Adding locations layer');
      map.addLayer(result.data);
    });

    // Add building layer
    var layers = map.getStyle().layers;
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }
    HTTP.get(Meteor.absoluteUrl("/buildings.json"), function(err,result) {
      console.log('Adding building layer');
      map.addLayer(result.data, labelLayerId);
    });


    // MAP INTERACTIONS
    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'tfl-layer', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Set popup location based on mouse coordinates
        popup.setLngLat(e.lngLat)
            .setHTML(propertiesToHTML(e.features[0].properties))
            .addTo(map);
    });

    map.on('mouseleave', 'tfl-layer', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });


    // Rerun when visibility changes
    let visibleLayers;
    this.autorun(() => {
      console.log('autorun');
      visibleLayers = Session.get('visibleLayers');
      visibleLayers.forEach((layer) => {
          map.setLayoutProperty(`${layer.name}-layer`, 'visibility', layer.isVisible ? "visible":"none")
      });
    });

  });

});

function propertiesToHTML(obj) {
  let str = '<ul>';
  Object.entries(obj).forEach(([key, val]) => {
    str = str.concat(`<li><span>${key}</span>: ${val}</li>`);
  });
  return str.concat('</ul>');
}

Template.Map.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.Map.events({
  "click button"(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
