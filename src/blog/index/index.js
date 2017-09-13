
import '../defaults';

import PendulumAnimation from '../pendulum/animation';
import TwitchEmotesAnimation from '../twitch-emotes/animation';
import ParisRentalsAnimation from '../paris-rentals/animation';
import ioGame from '../io-game/game';
import ProgrammingSubredditsAnimation from '../programming-subreddits/animation';

const pendulum = document.getElementById('pendulum');
(new PendulumAnimation(pendulum, { trailColor: false })).launch();

const twitchEmotes = document.getElementById('picture-twitch');
(new TwitchEmotesAnimation(twitchEmotes)).launch();

const parisRentals = document.getElementById('picture-paris-rentals');
(new ParisRentalsAnimation(parisRentals)).launch();

const ioGameCanvas = document.getElementById('picture-io-game');
ioGame(ioGameCanvas);

const programmingSubreddits = document.getElementById('picture-programming-subreddits');
(new ProgrammingSubredditsAnimation(programmingSubreddits)).launch();
