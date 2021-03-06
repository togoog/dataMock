'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var url = _interopDefault(require('url'));

var store = {
    target: '',
    watchTarget: [],
    apidocTarget: ''
};

var proxy = require('express-http-proxy');
var chalk = require('chalk');

/**
 *
 * 修正windon路径问题
 *
 * @param {*} path
 */
var winPath = function winPath(path) {
    return path.replace(/\\/g, '/');
};

var createMockHandler = function createMockHandler(method, path, value) {
    return function () {
        var res = arguments.length <= 1 ? undefined : arguments[1];
        if (typeof value === 'function') {
            value.apply(undefined, arguments);
        } else {
            res.json(value);
        }
    };
};

var createProxy = function createProxy(method, path, target) {
    return proxy(target, {
        filter: function filter(req) {
            return method ? req.method.toLowerCase() === method.toLowerCase() : true;
        },
        forwardPath: function forwardPath(req) {
            var matchPath = req.originalUrl;
            var matches = matchPath.match(path);
            if (matches.length > 1) {
                matchPath = matches[1];
            }
            return winPath(path.join(url.parse(target).path, matchPath));
        }
    });
};

/**
 *
 * 提取方法以及路径
 *
 * @param {*} key
 */
var dealPath = function dealPath(key) {
    return key.split(' ').slice(0, 2).reverse().map(function (v) {
        return v.toLowerCase();
    });
};

var outputError = function outputError(error) {
    if (!error) return;

    var filePath = error.message.split(': ')[0];
    var relativeFilePath = filePath;
    var errors = error.stack.split('\n').filter(function (line) {
        return line.trim().indexOf('at ') !== 0;
    }).map(function (line) {
        return line.replace(filePath + ': ', '');
    });
    errors.splice(1, 0, ['']);

    console.log(chalk.red('Failed to parse mock config.'));
    console.log();
    console.log('Error in ' + relativeFilePath);
    console.log(errors.join('\n'));
    console.log();
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

// import chokidar from 'chokidar';

var chokidar = require('chokidar');
var chalk$1 = require('chalk');

var createWatcher = function createWatcher(_ref) {
    var server = _ref.server,
        _ref$applyBefore = _ref.applyBefore,
        applyBefore = _ref$applyBefore === undefined ? function (f) {
        return f;
    } : _ref$applyBefore;

    var watcher = chokidar.watch([store.target].concat(toConsumableArray(store.watchTarget)), {
        persistent: true,
        ignored: /(^|[\/\\])\..*(?<!\.js)$/, //忽略点文件
        cwd: '.', //表示当前目录
        depth: 99 //到位了....
    });
    watcher.on('change', function (path) {
        console.log(chalk$1.bgCyan(chalk$1.white(' DM ')), chalk$1.cyan('CHANGED'), path);
        watcher.close();
        applyBefore();
        bindServer({ server: server });
    });
};

var path = require('path');
var which = require('which');
var chalk$2 = require('chalk');
var fs = require('fs');
var fs2 = require('fs-extra');

var commitParser = require('comment-parser');
var chokidar$1 = require('chokidar');

var zh = function zh(data) {
    return Object.entries(data).reduce(function (r, _ref) {
        var _ref2 = slicedToArray(_ref, 2),
            method = _ref2[0],
            apis = _ref2[1];

        return _extends({}, r, Object.entries(apis).reduce(function (r2, _ref3) {
            var _ref4 = slicedToArray(_ref3, 2),
                name = _ref4[0],
                path = _ref4[1];

            return _extends({}, r2, defineProperty({}, name, [method, path]));
        }, {}));
    }, {});
};

var createApiDoc = function createApiDoc(data, apis, options) {
    var isGroup = false;

    var cc = data.reduce(function (r, _ref5) {
        var tags = _ref5.tags,
            description = _ref5.description;

        // 如果没有标注 则返回空
        if ((tags[0] || {}).tag !== 'api') {
            return '';
        }
        var mockTpl = '';
        var title = '';
        var mockInterface = [];

        var docs = tags.reduce(function (r2, o) {
            if (o.tag === 'apiName') {
                mockInterface = apis[o.name];
                title = o.description;
            }

            if (o.tag === 'apiGroup') {
                isGroup = true;
            }

            if (o.tag === 'api') return r2;

            if (o.tag === 'example') {
                mockTpl = ('' + o.name + o.description).replace(/\n| /g, '').replace(/\$/g, '@');

                return r2;
            }

            return r2 + '\n        * ' + o.source;
        }, '');

        var _mockInterface = mockInterface,
            _mockInterface2 = slicedToArray(_mockInterface, 2),
            method = _mockInterface2[0],
            path = _mockInterface2[1];

        return '\n        /**\n        * @api {' + method + '} ' + path + ' ' + title + '\n            ' + (!isGroup ? '* @apiGroup: ' + options.filename : '') + '\n        ' + docs + '\n        @apiSampleRequest ' + path + '\n        */\n        [\'' + method + ' ' + path + '\']:(req, res) => res.json(Mock.mock(' + mockTpl + ')),\n        ';
    }, '');

    if (cc === '') {
        return '';
    }

    return '\nconst Mock = require(\'mockjs\')\n\nmodule.exports = {\n    ' + cc + '\n}\n    ';
};

var createMockFile = function createMockFile(filepath, outputDir) {
    fs.readFile(filepath, 'utf8', function (err, data) {
        if (err) throw err;

        var formatData = commitParser(data) || {};

        // 没有注释 返回
        if (!formatData.length) return;

        var result = require(path.resolve(process.cwd(), filepath));
        var text = createApiDoc(commitParser(data), zh(result), { filename: path.basename(filepath, '.js') });

        var tempPath = path.join(outputDir, path.basename(filepath));

        // 没有标准注释 则返回并且删除
        if (text === '') {
            fs2.remove(tempPath, function (err) {
                if (err) throw err;
            });
            return;
        }

        fs2.outputFile(tempPath, text, function (err) {
            if (err) throw err;
        });
    });
};

var createMock = function createMock(inputDir, outputDir) {
    var watcher = chokidar$1.watch([inputDir], {
        persistent: true,
        ignored: /(^|[\/\\])\..*(?<!\.js)$/, //忽略点文件
        cwd: '.', //表示当前目录
        depth: 99 //到位了....
    });
    watcher.on('add', function (filepath) {
        console.log(chalk$2.bgGreen(chalk$2.white(' Watch Mock ')), chalk$2.green('ADD'), filepath);
        createMockFile(filepath, outputDir);
        // watcher.close();
    }).on('unlink', function (filepath) {
        console.log(chalk$2.bgRed(chalk$2.white(' Watch Mock ')), chalk$2.red('REMOVE'), filepath);

        var tempPath = path.join(outputDir, path.basename(filepath));
        fs2.remove(tempPath, function (err) {
            if (err) throw err;
        });
        // watcher.close();
    }).on('change', function (filepath) {
        console.log(chalk$2.bgCyan(chalk$2.white(' Watch Mock ')), chalk$2.cyan('CHANGED'), filepath);
        createMockFile(filepath, outputDir);
        // watcher.close();
    });
};

var assert = require('assert');
var glob = require('glob');
var path$1 = require('path');
var bodyParser = require('body-parser');
var which$1 = require('which');
var express = require('express');
var chalk$3 = require('chalk');
var fs$1 = require('fs');
var apidoc = require('apidoc');

var debug = require('debug')('DM');

var dmStart = function dmStart() {
    for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
        arg[_key] = arguments[_key];
    }

    return arg[2]();
};
var dmEnd = function dmEnd() {
    for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        arg[_key2] = arguments[_key2];
    }

    return arg[2]();
};

var requireFile = function requireFile(files) {
    var count = {};

    var result = files.reduce(function (r, v) {
        var result = require(v);

        if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
            Object.entries(result).forEach(function (_ref) {
                var _ref2 = slicedToArray(_ref, 2),
                    key = _ref2[0],
                    fn = _ref2[1];

                count[key] = [].concat(toConsumableArray(count[key] || []), [v]);
            });

            return _extends({}, r, (typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object' && result);
        } else {
            console.log(chalk$3.bgRed(chalk$3.white(' ' + v + ' ')) + ' \u6587\u4EF6\u683C\u5F0F\u4E0D\u7B26\u5408\u8981\u6C42\uFF0C\u5DF2\u8FC7\u6EE4\uFF01');

            return r;
        }
    }, {});

    Object.entries(count).filter(function (_ref3) {
        var _ref4 = slicedToArray(_ref3, 2),
            k = _ref4[0],
            v = _ref4[1];

        return v.length > 1;
    }).forEach(function (_ref5) {
        var _ref6 = slicedToArray(_ref5, 2),
            k = _ref6[0],
            v = _ref6[1];

        var _dealPath = dealPath(k),
            _dealPath2 = slicedToArray(_dealPath, 2),
            path = _dealPath2[0],
            method = _dealPath2[1];

        console.log('');
        console.log(chalk$3.bgYellow(chalk$3.white('' + method)), chalk$3.yellow(path), '出现次数：', chalk$3.bgRed(chalk$3.white(chalk$3.bold(' ' + v.length + ' '))));
        v.forEach(function (o) {
            console.log('  ' + chalk$3.bgCyan(chalk$3.white(' ' + o + ' ')));
        });
        console.log('');
    });

    return result;
};

var bindMockServer = function bindMockServer(app) {
    var db = store.target;

    apidoc.createDoc({
        src: [store.target],
        dest: store.apidocTarget || './public/dm-apidoc'
    });

    // 清除缓存
    Object.keys(require.cache).forEach(function (file) {
        if ([].concat(toConsumableArray(store.watchTarget), [db]).some(function (v) {
            return file.includes(v);
        })) {
            debug('delete cache ' + file);
            delete require.cache[file];
        }
    });

    // 注入store
    global.DM = requireFile(glob.sync(db + '/.*.js'));

    app.use(bodyParser.json({ limit: '5mb', strict: false }));
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '5mb'
    }));
    app.use(dmStart);
    // 添加路由
    Object.entries(requireFile(glob.sync(db + '/!(.)*.js'))).forEach(function (_ref7) {
        var _ref8 = slicedToArray(_ref7, 2),
            key = _ref8[0],
            fn = _ref8[1];

        var _dealPath3 = dealPath(key),
            _dealPath4 = slicedToArray(_dealPath3, 2),
            path = _dealPath4[0],
            method = _dealPath4[1];

        // 非本地路径过滤


        if (path && method && /^\//.test(path)) {
            assert(!!app[method], 'method of ' + key + ' is not valid');
            assert(typeof fn === 'function' || (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) === 'object' || typeof fn === 'string', 'mock value of ' + key + ' should be function or object or string, but got ' + (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)));
            if (typeof fn === 'string') {
                if (/\(.+\)/.test(path)) {
                    path = new RegExp('^' + path + '$');
                }
                app.use(path, createProxy(method, path, fn));
            } else {
                app[method](path, createMockHandler(method, path, fn));
            }
        }
    });

    app.use(dmEnd);

    var indexArr = app._router.stack.reduce(function (r, _ref9, index) {
        var name = _ref9.name;
        return ['dmStart', 'dmEnd'].includes(name) ? [].concat(toConsumableArray(r), [index]) : r;
    }, []);

    createWatcher({
        server: app,
        applyBefore: function applyBefore() {
            // 删除旧的mock
            if (indexArr.length) {
                var min = Math.min.apply(Math, toConsumableArray(indexArr));
                var max = Math.max.apply(Math, toConsumableArray(indexArr));
                app._router.stack.splice(min, max - min + 1);
            }
        }
    });
};

var bindServer = function bindServer(_ref10) {
    var server = _ref10.server,
        _ref10$target = _ref10.target,
        target = _ref10$target === undefined ? store.target : _ref10$target,
        _ref10$watchTarget = _ref10.watchTarget,
        watchTarget = _ref10$watchTarget === undefined ? store.watchTarget : _ref10$watchTarget,
        _ref10$apidocTarget = _ref10.apidocTarget,
        apidocTarget = _ref10$apidocTarget === undefined ? store.apidocTarget : _ref10$apidocTarget;

    store.target = target;
    store.watchTarget = Array.isArray(watchTarget) ? watchTarget : [watchTarget];
    store.apidocTarget = apidocTarget;

    try {
        bindMockServer(server);
    } catch (e) {
        console.log(e);
        console.log();
        outputError(e);
        createWatcher({ server: server });
    }
};

var server = require('../server');

exports.default = server;
exports.bindServer = bindServer;
exports.createMock = createMock;
