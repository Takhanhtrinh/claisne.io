
import autoBind from 'auto-bind';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import parisBounds from './paris-bounds';

class Animation {
  constructor(element) {
    this.element = element;
    this.tileLayer =
      L.tileLayer('https://api.mapbox.com/styles/v1/claisne/cj4pbpalh9j9z2speseu4tkby/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2xhaXNuZSIsImEiOiJjajRpOWowemgwNW15MndtcWVtM3c3bjMxIn0.Cg5Lr8gOtg-k6EJpn2Gu4g');

    autoBind(this);
  }

  launch() {
    this.map = L.map(this.element, {
      zoomControl: false,
    });

    this.map.fitBounds(parisBounds);

    this.map.attributionControl.setPrefix('');

    this.tileLayer.addTo(this.map);
  }
}

export default Animation;
