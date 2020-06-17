<template>
  <div id="app">
    <b-container fluid>
      <h1 class="mb-5">Algolia Places search:</h1>
      <b-row>
        <b-col>
          <b-form-group>
            <b-form-input
              type="search"
              v-model="search"
              placeholder="Where do you want to go today?"
              id="algoliaPlacesSearch"
            >
            </b-form-input>
          </b-form-group>
          <b-form-group>
            <b-button variant="danger" @click="resetForm">Reset</b-button>
          </b-form-group>
          <highlight-code lang="json" id="jsonResponse">
            {{ jsonResponse }}
          </highlight-code>
        </b-col>
        <b-col>
          <l-map
            id="myMap"
            ref="myMap"
            :zoom="origin.zoom"
            :center="origin.center"
          >
            <l-tile-layer :url="url" :attribution="attribution" />
          </l-map>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import places from 'places.js';
import L from 'leaflet';
import { Icon } from 'leaflet';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'App',
  data() {
    return {
      search: null,
      origin: {
        zoom: 2,
        center: L.latLng(47.41322, -1.219482),
      },
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      markers: [],
      jsonResponse: '',
    };
  },
  mounted() {
    const placesAutocomplete = places({
      appId: null,
      apiKey: null,
      container: document.querySelector('#algoliaPlacesSearch'),
    });

    placesAutocomplete.on('change', e => {
      let zoom = 17;
      if (e.suggestion.hit.is_highway === true) {
        zoom = 24;
      } else if (e.suggestion.hit.is_city === true) {
        zoom = 10;
      } else if (e.suggestion.hit.is_suburb === true) {
        zoom = 17;
      }

      const latLng = L.latLng(e.suggestion.latlng.lat, e.suggestion.latlng.lng);

      const response = {
        query: e.suggestion.query,
        suggestion: {
          name: e.suggestion.name,
          administrative: e.suggestion.administrative,
          country: e.suggestion.country,
          coutryCode: e.suggestion.countryCode,
          latlng: {
            lat: e.suggestion.latlng.lat,
            lng: e.suggestion.latlng.lng,
          },
          postcode: e.suggestion.postcode,
          value: e.suggestion.value,
        },
      };

      this.jsonResponse = JSON.stringify(response, undefined, 2);

      // Remove all markers and add the one that the use has selected
      this.removeMarkers();
      this.addMarker(latLng);

      // Move map
      this.$refs.myMap.mapObject.setView(latLng, zoom);
    });

    placesAutocomplete.on('suggestions', e => {
      this.handleOnSuggestions(e);
    });
  },
  methods: {
    resetForm() {
      this.search = null;
      this.removeMarkers();
      this.$refs.myMap.mapObject.setView(this.origin.center, this.origin.zoom);
      this.jsonResponse = null;
    },
    removeMarkers() {
      this.markers.forEach(marker => {
        this.$refs.myMap.mapObject.removeLayer(marker);
      });
      this.markers = [];
    },
    addMarker(latLng, options = {}) {
      this.markers.push(
        L.marker(latLng, options).addTo(this.$refs.myMap.mapObject),
      );
    },
    handleOnSuggestions(e) {
      this.jsonResponse = null;

      if (e.suggestions.length > 0) {
        // Display suggestions

        // Delete all markers
        this.removeMarkers();

        // Add new markers
        e.suggestions.forEach((suggestion, i) => {
          let opacity = 0.4;
          // Add markers for all suggestions
          if (i === 0) {
            opacity = 1;
            // this.jsonResponse = JSON.stringify(e.suggestions[i].name, undefined, 2);
          } else {
            // this.jsonResponse += '\n\n' + JSON.stringify(e.suggestions, undefined, 2);
          }
          this.addMarker(
            L.latLng(suggestion.latlng.lat, suggestion.latlng.lng),
            { opacity: opacity },
          );
        });

        // Zoom to fit all markers
        const group = new L.featureGroup(this.markers);
        this.$refs.myMap.mapObject.fitBounds(group.getBounds());
      }
    },
  },
};
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#jsonResponse {
  text-align: left;
}

#myMap {
  height: 700px;
  z-index: 99;
}
</style>
