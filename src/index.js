import { deprecate } from 'util';
import paginator from './paginator';

export default deprecate((app) => {
  app.loopback.modelBuilder.mixins.define('Paginator', paginator);
}, 'DEPRECATED: Use mixinSources, see https://github.com/prototype-berlin/loopback-paginator#server-config');

module.exports = exports.default;