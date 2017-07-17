
// Default styles
import 'normalize.css';

// Fonts
import 'ionicons/dist/css/ionicons.css';
import 'roboto-fontface-woff/css/roboto/sass/roboto-fontface-light.scss';
import 'roboto-fontface-woff/css/roboto/sass/roboto-fontface-regular.scss';
import 'roboto-fontface-woff/css/roboto/sass/roboto-fontface-bold.scss';

import './index.css';

import Animation from './blog/pendulum/animation';

const animationEl = document.getElementById('pendulum', { fullscreen: true });
const animation = new Animation(animationEl);
animation.launch();
