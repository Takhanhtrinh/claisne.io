
const makeConfig = require('./webpack.make.config');

const entries = [
  'index',
  'pendulum',
  'twitch-emotes',
  'paris-rentals',
  'io-game',
  'programming-subreddits',
];

module.exports = makeConfig(entries, {
  directory: 'blog',
  images: true,
});
