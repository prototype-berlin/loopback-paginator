# Pagination mixin for LoopBack

Paginator adds an easy to use pagination to any of your models. See the [example](#usage) below.

## Installation

```
$ npm i loopback-paginator --save
```

## Config

### Server Config

With [loopback-boot@v2.8.0](https://github.com/strongloop/loopback-boot/) [mixinSources](https://github.com/strongloop/loopback-boot/pull/131) have been implemented in a way which allows for loading this mixin without changes to the server.js file previously required. Just add `"../node_modules/loopback-paginator"` to the `mixins` property of your `server/model-config.json`.

```javascript
{
  "_meta": {
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-paginator/lib",
      "../common/mixins"
    ]
  }
}
```
### Model Config

To use with your models just add `Paginator: true` to `mixins` in your model config and the default options will be used:

```javascript
{
  "name": "Model",
  "properties": {
    "name": {
      "type": "string",
    }
  },
  "mixins": {
    "Paginator": true
  }

  ...

  // you can also overide the default values:
  "mixins": {
    "Paginator": {
      "limit": 5    // items per page, default: 10
    }
  }
}
```

### Global Config

It is also possible to configure the mixin globally in your `config.json`. Just add `paginator` and use the same options as with the model above:

```javascript
{
  "paginator": {
    "limit": 20    // items per page, default: 10
  }
}
```

## Usage

When Paginator is added to a model, Model.find() will return an object with `data` and `meta`. `data` is an array with the queried items, limited to the number you defined in the mixin options (see [Model Config](#model-config)). `meta` contains information about the requested page (see example below). You can specify the page as an URL parameter (e.g. `?page=3`). If no page is specified it defaults to 1.

`/GET https://example.com/api/items?page=3`

```javascript
{
  "data": [
    {
      "title": "Item 1",
      "description": "Cool first item.",
      "id": "c5075168-abe0-41c6-8052-e07745eade48"
    },
    {
      "title": "Item 2",
      "description": "Cool second item.",
      "id": "0cad55df-c59d-4195-bb4f-7a252bd4bbe8",
    }

    ...

  ],
  "meta": {
    "totalItemCount": 95, // total number of items
    "totalPageCount": 10, // total number of all pages
    "itemsPerPage": 10,   // numberof items per page
    "currentPage": 3,     // the current page
    "nextPage": 4,        // the next page, only present if there is another page
    "previousPage": 2     // the previous page, only present if currentPage != 1
  }
}
```

## ToDo

- [ ] allow to override limit with an URL parameter

## License

[MIT](LICENSE)

## Changelog

### v0.9.6
- Add global config
