'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');
const koaStatic = require('koa-static');
const CWD = process.cwd();

function *elasticsearchProxy(next) {
  if (/^\/elasticsearch\b/.test(this.url)) {
    this.url = this.url.replace(/^\/elasticsearch/, '');
    var remote = 'http://192.168.1.28:9200' + this.url;
    console.log('Proxy => ' + remote);
    let res = this.res;
    this.req.pipe(request(remote).on('error',  function (err) {
      console.error(err);
      res.statusCode = 404;
      res.end('Elasticsearch Connection Error.\n' + err.message);
    })).pipe(res);
    this.response = false;
  } else {
    yield next;
  }
}
module.exports = {
  middlewares: [
    elasticsearchProxy,
    koaStatic(path.join(CWD, 'node_modules', 'antd', 'dist')),
    koaStatic(path.join(CWD, 'node_modules', 'react', 'dist')),
    koaStatic(path.join(CWD, 'node_modules', 'react-dom', 'dist')),
    koaStatic(path.join(CWD, 'node_modules', 'react-router', 'umd')),
    koaStatic(path.join(CWD, 'node_modules', 'less', 'dist')),
    koaStatic(path.join(CWD, 'node_modules', 'd3'))
  ]
};
