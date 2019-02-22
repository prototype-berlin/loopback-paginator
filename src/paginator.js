import _debug from './debug';

const debug = _debug();
const warn = _debug(); // create a namespaced warning
warn.log = console.warn.bind(console); // eslint-disable-line no-console

const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_LIMIT = 100;
const DEFAUL_NO_MAX_LIMIT = false;

export default async (Model, options = {}) => {
  debug('Pagintor mixin for model %s', Model.modelName);

  Model.getApp((error, app) => {
    if (error) {
      debug(`Error getting app: ${error}`);
    }
    
    let globalOptions = app.get('paginator') || {};
    options.limit = options.limit || globalOptions.limit || DEFAULT_LIMIT;
    options.maxLimit = options.maxLimit || globalOptions.maxLimit || DEFAULT_MAX_LIMIT;
    options.noMaxLimit = options.noMaxLimit || globalOptions.noMaxLimit || DEFAUL_NO_MAX_LIMIT;
  });

  Model.beforeRemote('find', async (context) => {
    if (!context.req.query.page) { return; }

    context.args.filter = modifyFilter(context.args.filter, context.req.query.page);
  });

  Model.afterRemote('find', async (context) => {
    if (!context.req.query.page) { return; }

    const limit = getLimit(context.args.filter);
    const where = context.args.filter.where || null;
    const totalItemCount = await Model.count(where);
    const totalPageCount = Math.ceil(totalItemCount / limit);
    const currentPage = parseInt(context.req.query.page) || 1;
    const previousPage = currentPage - 1;
    const nextPage = currentPage + 1;

    context.result = {
      data: context.result,
      meta: {
        totalItemCount: totalItemCount,
        totalPageCount: totalPageCount,
        itemsPerPage: limit,
        currentPage: currentPage,
      }
    }

    if (nextPage <= totalPageCount) {
      context.result.meta.nextPage = nextPage;
    }

    if (previousPage > 0) {
      context.result.meta.previousPage = previousPage;
    }
  });

  function modifyFilter(filter, page) {
    const limit = getLimit(filter);
    const skip = (page - 1) * limit;

    if (!filter) {
      filter = {
        skip: skip,
        limit: limit,
      }
      return filter;
    }

    filter.skip = skip;
    filter.limit = limit;

    return filter;
  }

  function getLimit(filter) {
    if (filter && filter.limit) {
      let limit = parseInt(filter.limit);

      if (options.maxLimit && !options.noMaxLimit) {
        limit = limit > options.maxLimit ? options.maxLimit : limit;
      }

      return limit;
    }
  
    return options.limit;
  }

};

module.exports = exports.default;
