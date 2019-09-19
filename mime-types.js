const { extname } = require('path');

const mime = filename =>
  mime[extname(`${filename || ''}`).toLowerCase()];

mime[''] = 'text/plain',
  mime['.js'] =
  mime['.ts'] =
  mime['.mjs'] = 'text/javascript',
  mime['.html'] =
  mime['.htm'] = 'text/html',
  mime['.json'] = 'application/json',
  mime['.css'] = 'text/css',
  mime['.svg'] = 'application/svg+xml';

module.exports = mime;