import _debug from './debug';

const debug = _debug();
const warn = _debug(); // create a namespaced warning
warn.log = console.warn.bind(console); // eslint-disable-line no-console

export default (Model, options = {}) => {
  debug('Pagintor mixin for Model %s', Model.modelName);

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
      _meta: {
        totalItemCount: totalItemCount,
        totalPageCount: totalPageCount,
        itemsPerPage: options.limit,
        currentPage: currentPage,
      }
    }

    if (nextPage <= totalPageCount) {
      context.result._meta.nextPage = nextPage;
    }

    if (previousPage > 0) {
      context.result._meta.previousPage = previousPage;
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