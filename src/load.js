/**
 * 通过配置concat的值判断是否请求合并
 * 请求合并逻辑
 * use 合并id路径
 * 初始化每一个id状态
 * 类似: www/??a.js,b.js,c.js
 * 当文件加载，执行define函数，设置每个模块的依赖id
 * 判断模块id是否有依赖id
 * 是：继续use
 * 否：执行回调函数
 */

var modMap = {};
var moduleMap = {};
var doMap = {};
var concatMap = {};

var slice = [].slice;

var doc = document;
var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var docCharset = doc.charset;
var docUrl = location.href.split('?')[0];//去除问号之后部分
var baseUrl = docUrl;

var gid = 0;
var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
var interactiveScript = null;
var currentlyAddingScript = null;
var curExecModName = null;
var concatPrefix = 'static/dest/??';

var idPrefix = 'load-js-';

var o = {
    mode: 'single'     // 默认不合并
};

function _getGid() {
    return gid++;
}

/**
 * id请求合并
 * @param ids
 * @returns {string}
 */
function getConcatId(ids) {
    var arr = [];
    ids.forEach(function (elem) {
        if (elem === 'require') {
            return -1;
        }
        if (elem === 'exports') {
            return -2;
        }
        if (elem === 'module') {
            return -3;
        }

        if (!doMap[elem]) {
            doMap[elem] = {
                status: 'concating'
            }
        } else {
            return -4;
        }

        arr.push(replacePath(elem) + '.js');
    });

    if (arr.length === 0) {
        return '';
    }

    return fixSuffix(getUrl(concatPrefix + arr.join(','), o.baseUrl), 'js');
}


/**
 * 处理类似IE11问题
 * http://www.cnblogs.com/diligenceday/p/4504160.html
 * @returns {*}
 */
function getCurrentNode() {
    /** @namespace document.currentScript */
    if (document.currentScript) {
        return document.currentScript
    }
    var arrScript = document.getElementsByTagName("script");
    var len = arrScript.length;
    var i;
    for (i = 0; i < len; i++) {
        if (arrScript[i].readyState === "interactive") {
            return arrScript[i];
        }
    }

    //IE11的特殊处理;
    var path = getCurrentPath();
    for (i = 0; i < len; i++) {
        if (path.indexOf(arrScript[i].src) !== -1) {
            return arrScript[i];
        }
    }
    throw new Error("getCurrentNode error");
}

function getCurrentPath() {
    var repStr = function (str) {
        return (str || "").replace(/[\&\?]{1}[\w\W]+/g, "") || "";
    };
    if (doc.currentScript) {
        return repStr(doc.currentScript.src);
    }

    //IE11没有了readyState属性， 也没有currentScript属性;
    // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
    var stack;
    try {
        a.b.c(); //强制报错,以便捕获e.stack
    } catch (e) { //safari的错误对象只有line,sourceId,sourceURL
        stack = e.stack;
        if (!stack && window.opera) {
            //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
            stack = (String(e).match(/of linked script \S+/g) || []).join(" ")
        }
    }
    if (stack) {
        /**e.stack最后一行在所有支持的浏览器大致如下:
         *chrome23:
         *firefox17:
         *opera12:http://www.oldapps.com/opera.php?system=Windows_XP
         *IE10:
         * //firefox4+ 可以用document.currentScript
         */
        stack = stack.split(/[@ ]/g).pop(); //取得最后一行,最后一个空格或@之后的部分
        stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, ""); //去掉换行符
        return stack.replace(/(:\d+)?:\d+$/i, ""); //去掉行号与或许存在的出错字符起始位置
    }
    //实在不行了就走这里;
    var node = getCurrentNode();
    //IE>=8的直接通过src可以获取，IE67要通过getAttribute获取src;
    return repStr(document.querySelector ? node.src : node.getAttribute("src", 4)) || "";

    throw new Error("getCurrentPath error!");
}

function getCurSrc() {
    if (doc.currentScript) {
        return doc.currentScript.src;
    }
    if (currentlyAddingScript) {
        return currentlyAddingScript.src;
    }
    // For IE6-9 browsers, the script onload event may not fire right
    // after the script is evaluated. Kris Zyp found that it
    // could query the script nodes and the one that is in "interactive"
    // mode indicates the current script
    // ref: http://goo.gl/JHfFW
    if (interactiveScript && interactiveScript.readyState === "interactive") {
        return interactiveScript.src;
    }

    var scripts = head.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
        var script = scripts[i];
        if (script.readyState === "interactive") {
            interactiveScript = script;
            return interactiveScript.src;
        }
    }

    return getCurrentPath();
}

function isUrl(url) {
    return url.search(/^(http:\/\/|https:\/\/|\/\/)/) !== -1;
}

function fixUrl(url) {
    return url.replace(/([^:])\/+/g, '$1/');
}

function getUrl(path, url) {
    //绝对网址
    if (isUrl(path)) {
        return fixUrl(path);
    }

    var rootUrl;
    //修复url
    if (rootUrl = url.match(/[^\/]*\/\/[^\/]*\//)) {
        //http://yanhaijing.com/abc
        url = url.slice(0, url.lastIndexOf('/') + 1);
        rootUrl = rootUrl[0];
    } else {
        //http://yanhaijing.com
        rootUrl = url = url + '/';
    }

    // /开头
    if (path.search(/^\//) !== -1) {
        return fixUrl(rootUrl + path);
    }

    // ../开头
    if (path.search(/^\.\.\//) !== -1) {
        while (path.search(/^\.\.\//) !== -1) {
            if (url.lastIndexOf('/', url.length - 2) !== -1) {
                path = path.slice(3);
                url = url.slice(0, url.lastIndexOf('/', url.length - 2) + 1);
            } else {
                throw new Error('url错误');
            }
        }

        return fixUrl(url + path);
    }
    // ./
    path = path.search(/^\.\//) !== -1 ? path.slice(2) : path;

    return fixUrl(url + path);
}

function fixSuffix(url, suffix) {
    var reg = new RegExp('\\.' + suffix + '$', 'i');
    return url.search(reg) !== -1 ? url : url + '.' + suffix;
}

function replacePath(id) {
    var ids = id.split('/');
    // id中不包含路径 并 查找路径失败
    if (ids.length < 2 && !(ids[0] in o.path)) {
        return id;
    }
    ids[0] = o.path[ids[0]];
    return ids.join('/');
}

function getDepUrl(id, url) {
    var pathId = replacePath(id);
    //找到path 基于baseUrl
    if (pathId !== id) {
        url = o.baseUrl;
    }
    return fixSuffix(getUrl(pathId, url || o.baseUrl), 'js');
}

function getIdUrl(id) {
    //没有id的情况
    if (!id) {
        return getCurSrc();
    }
    //id不能为相对路径,amd规定此处也不能带后缀，此处放宽限制。
    if (id.search(/^\./) !== -1) {
        throw new Error('资源路径：' + id + '必须是绝对定位');
    }
    return fixSuffix(getUrl(id, o.baseUrl), 'js');
}

function fixPath(path) {
    //path是网址
    if (isUrl(path)) {
        return getUrl('./', path).slice(0, -1);
    }
    return path;
}

function _loadJs(src, success, error, option) {
    var d = _.extend({
        charset: docCharset
    }, option);
    var node = doc.createElement('script');
    node.src = src;
    node.id = idPrefix + _getGid();
    node.charset = d.charset;
    if ('onload' in node) {
        node.onload = success;
        node.onerror = error;
    } else {
        node.onreadystatechange = function () {
            if (/loaded|complete/.test(node.readyState)) {
                success();
            }
        };
    }
    //currentlyAddingScript = node;
    head.appendChild(node);
}

function require(id, url) {
    var url = getDepUrl(id, url || curExecModName);
    return moduleMap[url] && moduleMap[url].exports;
}

function config(option) {
    if (!_.isObject(option)) {
        return _.extend({}, o);
    }

    //处理baseUrl
    if (option.baseUrl) {
        option.baseUrl = getUrl(option.baseUrl, docUrl);
    }

    //处理path
    if (_.isObject(option.path)) {
        for (var key in option.path) {
            option.path[key] = fixPath(option.path[key]);
        }
    }
    o = _.extend(o, option);

    //fix keywords
    o.path.BASEURL = fixPath(option.baseUrl || o.baseUrl);
    o.path.DOCURL = fixPath(docUrl);
    o.baseUrlMap = _.invert(o.path);
    return _.extend({}, o);
}

function execMod(modName, callback, params, n) {
    //判断定义的是函数还是非函数
    if (!params) {
        moduleMap[modName].exports = modMap[modName].callback;
    } else {
        curExecModName = modName;
        //commonjs
        var exp = modMap[modName].callback.apply(null, params);
        curExecModName = null;
        //amd和返回值的commonjs
        if (exp) {
            moduleMap[modName].exports = exp;
        }
    }
    //执行回调函数
    callback(moduleMap[modName].exports, n);

    //执行complete队列
    execComplete(modName);
}

function execComplete(modName) {
    //模块定义完毕 执行load函数,当加载失败时，会不存在module
    for (var i = 0; i < modMap[modName].oncomplete.length; i++) {
        modMap[modName].oncomplete[i](moduleMap[modName] && moduleMap[modName].exports);
    }
    //释放内存
    modMap[modName].oncomplete = [];
}

function loadModSingle(id, callback, option) {
    //commonjs
    if (id === 'require') {
        callback(require);
        return -1;
    }
    if (id === 'exports') {
        var exports = moduleMap[option.baseUrl].exports = null;
        callback(exports);
        return -2;
    }
    if (id === 'module') {
        callback(moduleMap[option.baseUrl]);
        return -3;
    }
    var modName = getDepUrl(id, option.baseUrl);
    //未加载
    if (!modMap[modName]) {
        modMap[modName] = {
            status: 'loading',
            oncomplete: []
        };
        //console.time('耗时：' + id);
        _loadJs(modName, function () {
            if (!_.isFunction(modMap[modName].callback)) {
                execMod(modName, callback);
                return 0;
            }
            //console.timeEnd('耗时：' + id);
            //define的是函数
            use(modMap[modName].deps, function () {
                execMod(modName, callback, slice.call(arguments, 0));
            }, {baseUrl: modName});
            return 1;
        }, function () {
            modMap[modName].status = 'error';
            callback();
            execComplete(modName);//加载失败执行队列
        });
        return 0;
    }

    //加载失败
    if (modMap[modName].status === 'error') {
        callback();
        return 1;
    }
    //正在加载
    if (modMap[modName].status === 'loading') {
        modMap[modName].oncomplete.push(callback);
        return 1;
    }

    //加载完成
    //尚未执行完成
    if (!moduleMap[modName].exports) {
        //如果define的不是函数
        if (!_.isFunction(modMap[modName].callback)) {
            execMod(modName, callback);
            return 2;
        }

        //define的是函数
        use(modMap[modName].deps, function () {
            execMod(modName, callback, slice.call(arguments, 0));
        }, {baseUrl: modName});
        return 3;
    }

    //已经执行过
    callback(moduleMap[modName].exports);
    return 4;
}

function loadModConcat(ids, callback, option) {


    var modName = getConcatId(ids);

    //未加载
    if (!concatMap[modName] && modName) {
        concatMap[modName] = {
            status: 'loading',
            oncomplete: []
        };

        _loadJs(modName, function () {

            concatMap[modName] = concatMap[modName] || {};
            concatMap[modName].status = 'loaded';

            (function (ids) {
                var id, n, elem;
                var len = ids.length;
                for (n = 0; n < len; n++) {
                    elem = ids[n];
                    if (elem === 'require') {
                        callback(require, n);
                        continue;
                    }
                    if (elem === 'exports') {
                        var exports = moduleMap[option.baseUrl].exports = null;
                        callback(exports, n);
                        continue;
                    }
                    if (elem === 'module') {
                        callback(moduleMap[option.baseUrl], n);
                        continue;
                    }

                    id = getDepUrl(elem, option.baseUrl);

                    //正在加载
                    if (modMap[id].status === 'loading') {
                        (function (n, id) {
                            modMap[id].oncomplete.push(function () {
                                callback(modMap[id].callback, n);
                            });
                        }(n, id));
                        continue;
                    }

                    if (!_.isFunction(modMap[id].callback)) {
                        execMod(id, callback);
                        return 0;
                    }

                    (function (n, id, callback) {
                        if (modMap[id].deps) {
                            use(modMap[id].deps, function () {
                                execMod(id, callback, slice.call(arguments, 0), n);
                            }, {baseUrl: id});
                        }
                    }(n, id, callback));
                }
            }(ids))

        }, function () {
            modMap[modName].status = 'error';
            callback();
            execComplete(modName);//加载失败执行队列
        });
    } else {
        (function (ids) {
            var id, n, elem;
            var len = ids.length;
            for (n = 0; n < len; n++) {
                elem = ids[n];
                if (elem === 'require') {
                    callback(require, n);
                    continue;
                }
                if (elem === 'exports') {
                    var exports = moduleMap[option.baseUrl].exports = null;
                    callback(exports, n);
                    continue;
                }
                if (elem === 'module') {
                    callback(moduleMap[option.baseUrl], n);
                    continue;
                }

                id = getDepUrl(elem, option.baseUrl);

                //加载失败
                if (doMap[elem].status === 'error') {
                    callback();
                    continue;
                }

                // 已经加载
                /*if (modMap[id].status === 'loaded') {
                 (function (n, id) {
                 callback(modMap[id].callback, n);
                 }(n, id));
                 continue;
                 }
                 */

                //正在加载
                if (modMap[id].status === 'loading') {
                    (function (n, id) {
                        modMap[id].oncomplete.push(function () {
                            callback(modMap[id].callback, n);
                        });
                    }(n, id));
                    continue;
                }

                callback(moduleMap[id].exports, n);
            }
        }(ids))
    }
}

function loadSingle(deps, callback, option) {
    var depsCount = deps.length;
    var params = [];
    for (var i = 0; i < deps.length; i++) {
        (function (j) {
            loadModSingle(deps[j], function (param) {
                depsCount--;
                params[j] = param;

                // 判断是否还有依赖模块
                if (depsCount === 0) {
                    // 得到所有的依赖模块，参数返回callback
                    callback.apply(null, params);
                }
            }, option);
        }(i));
    }
}

function loadConcat(deps, callback, option) {
    var depsCount = deps.length;
    var params = [];
    _.each(deps, function (elem) {
        var id = getDepUrl(elem, option.baseUrl);
        modMap[id] = modMap[id] || {
                status: 'loading',
                oncomplete: []
            };
    });
    loadModConcat(deps, function (param, n) {
        depsCount--;
        console.log(depsCount, deps);
        if (depsCount == 1) {
            console.log('剩余一个');
        }
        params[n] = param;
        if (depsCount === 0) {
            // 得到所有的依赖模块，参数返回callback
            callback.apply(null, params);
        }
    }, option);
}

/**
 * 使用模块
 * @param deps
 * @param callback
 * @param option
 * @returns {number}
 */
function use(deps, callback, option) {
    if (arguments.length < 2) {
        throw new Error('load.use arguments miss');
        return 0;
    }

    if (typeof deps === 'string') {
        deps = [deps];
    }

    if (!_.isArray(deps) || !_.isFunction(callback)) {
        throw new Error('load.use arguments type error');
        return 1;
    }
    //默认为当前脚本的路径或baseurl
    if (!_.isObject(option)) {
        option = {};
    }
    option.baseUrl = option.baseUrl || o.baseUrl;

    // 没有依赖模块，直接执行
    if (deps.length === 0) {
        callback();
        return 2;
    }

    if (o.mode === 'single') {
        loadSingle(deps, callback, option);
        return 3;
    }

    if (o.mode === 'concat') {
        loadConcat(deps, callback, option);
    }

}

function define(name, deps, callback) {
    //省略模块名

    if (typeof name !== 'string') {
        callback = deps;
        deps = name;
        name = null;
    }

    //无依赖
    if (!_.isArray(deps)) {
        callback = deps;
        deps = [];
    }

    //支持commonjs
    if (deps.length === 0 && _.isFunction(callback)) {
        callback
            .toString()
            .replace(commentRegExp, '')
            .replace(cjsRequireRegExp, function (match, dep) {
                deps.push(dep);
            });
        var arr = ['require'];
        if (callback.length > 1) {
            arr.push('exports');
        }
        if (callback.length > 2) {
            arr.push('module');
        }
        deps = arr.concat(deps);
    }

    var modName = getIdUrl(name).split('?')[0];//fix 后缀
    // doMap[o.baseUrlMap[name.replace('.js', '')]].status = 'loaded';
    modMap[modName] = modMap[modName] || {};
    modMap[modName].deps = deps;
    modMap[modName].callback = callback;
    modMap[modName].status = 'loaded';
    modMap[modName].oncomplete = modMap[modName].oncomplete || [];
    moduleMap[modName] = {};

    return 0;
}

function debug() {
    console.log(modMap, moduleMap);
}

function check() {
    _.each(doMap, function (elem, index) {
        if (elem.status !== 'loaded') {
            console.log(index);
        }
    })
}

function getData() {
    return o;
}

var load = {
    use: use,
    _loadJs: _loadJs,
    config: config,
    define: define,
    require: require,
    debug: debug,
    getData: getData,
    check: check
};

load.config({
    baseUrl: baseUrl,
    path: {}
});
window.define = define;
module.exports = load;