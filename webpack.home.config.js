
const makeConfig = require('./webpack.make.config');

const entries = [
  'index',
];

module.exports = makeConfig(entries, {
  images: false,
});
