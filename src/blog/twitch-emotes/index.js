
import highlight from 'highlight.js/lib/highlight';
import highlightElixir from 'highlight.js/lib/languages/elixir';

import 'highlight.js/styles/tomorrow.css';

import '../defaults';

import Feed from './feed';

highlight.registerLanguage('elixir', highlightElixir);
highlight.initHighlightingOnLoad();

document.querySelectorAll('.inline-code').forEach(highlight.highlightBlock);

(new Feed(document.getElementById('twitch-emotes-article'))).launch();
