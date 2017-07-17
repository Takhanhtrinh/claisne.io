
import mapValues from 'lodash/mapValues';
import each from 'lodash/each';
import find from 'lodash/find';
import min from 'lodash/min';
import max from 'lodash/max';

import L from 'leaflet';

import arrondissements from './data/arrondissements.json';
import postalCodesStatsRaw03 from './data/postal-codes-stats-2017-07-03.csv';
import postalCodesStatsRaw07 from './data/postal-codes-stats-2017-07-07.csv';

import parisBounds from './paris-bounds';

const element = document.getElementById('map-1');

const tileLayer =
  L.tileLayer('https://api.mapbox.com/styles/v1/claisne/cj4qqbc3r1a2v2spotvvvpky4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2xhaXNuZSIsImEiOiJjajRpOWowemgwNW15MndtcWVtM3c3bjMxIn0.Cg5Lr8gOtg-k6EJpn2Gu4g');

const map = L.map(element, {
  zoomControl: false,
  minZoom: 11,
  maxBounds: parisBounds,
});

map.fitBounds(parisBounds);

map.attributionControl.setPrefix('');
tileLayer.addTo(map);

const bounds = (postalCodesStats) => {
  const postalCodesBounds = {};

  Object.keys(postalCodesStats[0]).forEach((key) => {
    const values = postalCodesStats.map(s => s[key]);

    postalCodesBounds[key] = {
      min: min(values),
      max: max(values),
    };
  });

  return postalCodesBounds;
};

const postalCodesStats03 = postalCodesStatsRaw03.map(d => mapValues(d, parseFloat));
const postalCodesBounds03 = bounds(postalCodesStats03);

const postalCodesStats07 = postalCodesStatsRaw07.map(d => mapValues(d, parseFloat));
const postalCodesBounds07 = bounds(postalCodesStats07);

const layer = (attr, postalCodesStats, postalCodesBounds) => {
  const geoJSON =
    L.geoJSON(arrondissements, {
      style: ({ properties }) => {
        const values = find(postalCodesStats,
          ['postal_code', properties.postal_code]);

        const value = values[attr];
        const minValue = postalCodesBounds[attr].min;
        const maxValue = postalCodesBounds[attr].max;

        let fillOpacity = (value - minValue) / (maxValue - minValue);
        fillOpacity = (fillOpacity * 0.6) + 0.2;

        return {
          fillOpacity,
          opacity: 0.5,
          weight: 2,
        };
      },
    });

  const markers =
    postalCodesStats.map((postalCodeStats) => {
      const lay = find(geoJSON.getLayers(),
        ['feature.properties.postal_code', postalCodeStats.postal_code]);

      return L.marker(lay.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'map-label',
          iconSize: [100, 100],
          html: `<small>${lay.feature.properties.name}</small><span>${Math.floor(postalCodeStats[attr])}</span>`,
        }),
      });
    });

  return { geoJSON, markers };
};

const addLayer = (lay) => {
  lay.geoJSON.addTo(map);
  lay.markers.forEach(marker => marker.addTo(map));
};

const hideLayer = (lay) => {
  map.removeLayer(lay.geoJSON);
  lay.markers.forEach(marker => map.removeLayer(marker));
};

const layers03 = {
  count: layer('count', postalCodesStats03, postalCodesBounds03),
  price: layer('price', postalCodesStats03, postalCodesBounds03),
  surface: layer('surface', postalCodesStats03, postalCodesBounds03),
  priceSurface: layer('price_per_square_meter', postalCodesStats03, postalCodesBounds03),
};

const layers07 = {
  count: layer('count', postalCodesStats07, postalCodesBounds07),
  price: layer('price', postalCodesStats07, postalCodesBounds07),
  surface: layer('surface', postalCodesStats07, postalCodesBounds07),
  priceSurface: layer('price_per_square_meter', postalCodesStats07, postalCodesBounds07),
};

const layerControls = {
  count: document.getElementById('map-control-count'),
  price: document.getElementById('map-control-price'),
  surface: document.getElementById('map-control-surface'),
  priceSurface: document.getElementById('map-control-price-surface'),
};

let currentLayers = layers03;

let currentLayer = 'priceSurface';
addLayer(currentLayers[currentLayer]);
layerControls[currentLayer].classList.toggle('map-control-selected');

const render = lay =>
  () => {
    each(layers03, l => hideLayer(l));
    each(layers07, l => hideLayer(l));
    addLayer(currentLayers[lay]);
    layerControls[lay].classList.toggle('map-control-selected');
    layerControls[currentLayer].classList.toggle('map-control-selected');
    currentLayer = lay;
  };

Object.keys(layerControls).forEach((lay) => {
  const control = layerControls[lay];
  control.addEventListener('click', render(lay));
});

const control03 = document.getElementById('map-control-03');
const control07 = document.getElementById('map-control-07');

control03.addEventListener('click', () => {
  if (currentLayers !== layers03) {
    control03.classList.toggle('map-control-title-selected');
    control07.classList.toggle('map-control-title-selected');
    currentLayers = layers03;
    render(currentLayer, layers07)();
  }
});

control07.addEventListener('click', () => {
  if (currentLayers !== layers07) {
    control03.classList.toggle('map-control-title-selected');
    control07.classList.toggle('map-control-title-selected');
    currentLayers = layers07;
    render(currentLayer, layers03)();
  }
});
