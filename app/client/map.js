import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './map.html';

Template.Map.onCreated(function mapOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
  const token = '<GLA TOKEN>';

  const URL = 'https://maps.london.gov.uk/gla/rest/services/apps/CityHack_aecom_Jan18_project_service01/MapServer/0/1';
  HTTP.call('GET', URL, {
    params:{"f":"json", "token": token}
  }, (error, result) => {
    if (!error) {
      console.log(JSON.parse(result.content));
    }
  });

});

Template.Map.onRendered(function mapOnRendered() {
  mapboxgl.accessToken = '<MAPBOX TOKEN>';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-0.140, 51.489],
    zoom: 9.4
  });
});

Template.Map.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.Map.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
