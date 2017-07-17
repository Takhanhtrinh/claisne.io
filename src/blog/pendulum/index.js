
import highlight from 'highlight.js/lib/highlight';
import highlightJavascript from 'highlight.js/lib/languages/javascript';

import katex from 'katex';
import 'katex/dist/katex.css';

import 'highlight.js/styles/tomorrow.css';

import '../defaults';

import Animation from './animation';

katex.render('\\ddot{\\theta_1} = \\frac{m_2 l_1 \\omega_1^2 sin\\Delta cos\\Delta + m_2 g sin\\theta_2 cos\\Delta + m_2 l_2 \\omega_2^2 sin\\Delta - M g sin\\theta_1}{Ml_1 - m_2 l_1 cos^2 \\Delta}',
  document.getElementById('equations_1'));
katex.render('\\ddot{\\theta_1} = \\frac{m_2 l_1 \\omega_1^2 sin\\Delta cos\\Delta + m_2 g sin\\theta_2 cos\\Delta + m_2 l_2 \\omega_2^2 sin\\Delta - M g sin\\theta_1}{Ml_1 - m_2 l_1 cos^2 \\Delta}',
  document.getElementById('equations_2'));
katex.render('\\theta_1',
  document.getElementById('equations_3'));
katex.render('\\theta_2',
  document.getElementById('equations_4'));
katex.render('\\dot{\\theta}(t + \\Delta t) \\approx \\dot{\\theta}(t) + \\Delta t \\ddot{\\theta}(t)',
  document.getElementById('equations_5'));
katex.render('\\theta(t + \\Delta t) \\approx \\theta(t) + \\Delta t \\dot{\\theta}(t)',
  document.getElementById('equations_6'));


highlight.registerLanguage('javascript', highlightJavascript);
highlight.initHighlightingOnLoad();

const animationEl = document.getElementById('pendulum-article');
const animation = new Animation(animationEl, { trail: false, fullL: true });
animation.launch();
