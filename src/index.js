import { deprecate } from 'util';
import paginator from './paginator';

export default deprecate((app) => {
  app.loopback.modelBuilder.mixins.define('Paginator', paginator);
}, 'DEPRECATED: Use mixinSources, see https://github.com/clarkbw/loopback-ds-timestamp-mixin#mixinsources');

module.exports = exports.default;