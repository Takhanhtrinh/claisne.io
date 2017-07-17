
import highlight from 'highlight.js/lib/highlight';
import highlightGo from 'highlight.js/lib/languages/go';

import 'leaflet/dist/leaflet.css';
import 'highlight.js/styles/tomorrow.css';
import '../defaults';

import './map';
import './graph';

highlight.registerLanguage('golang', highlightGo);
highlight.initHighlightingOnLoad();
