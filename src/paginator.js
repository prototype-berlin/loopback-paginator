import _debug from './debug';

const debug = _debug();
const warn = _debug(); // create a namespaced warning
warn.log = console.warn.bind(console); // eslint-disable-line no-console

const DEFAULT_LIMIT = 10;

export default async (Model, options = {}) => {
  debug('Pagintor mixin for model %s', Model.modelName);

  Model.getApp((error, app) => {
    if (error) {
      debug(`Error getting app: ${error}`);
    }

    let globalOptions = (app.get('paginator')) && (app.get('paginator')).limit ? (app.get('paginator')).limit : DEFAULT_LIMIT;
    options.limit = options.limit || globalOptions;
  });

  Model.beforeRemote('find', async (context, next) => {
    const page = context.req.query.page || 1;
    context.args.filter = modifyFilter(context.args.filter, page);
  });

  Model.afterRemote('find', async (context, next) => {
    const where = context.args.filter.where || null;
    const totalItemCount = await Model.count(where);
    const totalPageCount = Math.ceil(totalItemCount / options.limit);
    const currentPage = parseInt(context.req.query.page) || 1;
    const previousPage = currentPage - 1;
    const nextPage = currentPage + 1;

    context.result = {
      data: context.result,
      meta: {
        totalItemCount: totalItemCount,
        totalPageCount: totalPageCount,
        itemsPerPage: options.limit,
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
    const skip = (page - 1) * options.limit;
    const limit = options.limit;

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

};

module.exports = exports.default;
