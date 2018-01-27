import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './map.html';

Template.Map.onCreated(function mapOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.Map.onRendered(function mapOnRendered() {
  mapboxgl.accessToken = 'pk.eyJ1IjoieWlua2VsbHkiLCJhIjoiY2lzdTQzbGR1MDFheDJvczhsMnhiNnU3MCJ9.KFVBh4CjEN4LBaZ2cYc7sA';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
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
