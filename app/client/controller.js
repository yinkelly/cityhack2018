import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";

import './controller.html';

const LAYERS = [{
  name: 'tfl',
  label: 'TFL',
  isVisible: true,
  file: 'tfl-disruption-collection.json'
}, {
  name: 'gla',
  label: 'GLA',
  isVisible: true,
  file: 'gla.json'
}, {
  name: 'borough',
  label: 'Borough',
  isVisible: true,
  file: ''
}];

Session.setDefault('visibleLayers', LAYERS);

Template.Controller.helpers({
  layers: LAYERS,
  checked() {
    return this.isVisible ? 'checked' : '';
  }
});

Template.Controller.events({
  "click input"(event, instance) {
    console.log(Session.get('visibleLayers'));
    const name = this.name;
    const updatedVisLayers = Session.get('visibleLayers').map((layer) => {
      if (name === layer.name) {
        return {
          ...layer,
          isVisible: !layer.isVisible
        };
      }
      return layer;
    });
    Session.set('visibleLayers', updatedVisLayers);
  },
});
