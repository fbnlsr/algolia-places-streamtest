import Vue from 'vue';
import App from './App.vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import VueHighlightJS from 'vue-highlight.js';
import json from 'highlight.js/lib/languages/json';
import 'leaflet/dist/leaflet.css';
import 'highlight.js/styles/dracula.css';

// Install BootstrapVue
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

Vue.use(VueHighlightJS, {
  languages: {
    json,
  },
});

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
