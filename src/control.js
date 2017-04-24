/**
 * Created by Crow on 2014/9/26.
 * control 组件控制模块
 */

//初始化control
var url = require('./url');
var load = require('./load');
var cache = require('./cache');

var _cache = null;

function addCache(arr) {
    var n;
    _cache = _cache || {};
    for (n = 0; n < arr.length; n++) {
        _cache[arr[n]] = _cache[arr[n]] || {};
        _cache[arr[n]].status = 1;
    }
}

function reduceCache(arr) {
    var n;
    _cache = _cache || {};
    for (n = 0; n < arr.length; n++) {
        delete _cache[arr[n]];
    }
}

function getRender(arr) {
    var n;
    var result = [];
    if (!_cache) {
        return arr;
    }

    _cache = _cache || {};
    for (n = 0; n < arr.length; n++) {
        if (_cache[arr[n]] === undefined) {
            result.push(arr[n]);
        }
    }
    return result;
}

function getDestroy(arr) {
    var i;
    var result = [];
    if (!_cache) {
        return result;
    }

    _cache = _cache || {};
    for (i in _cache) {
        if (_cache.hasOwnProperty(i)) {
            if (_.indexOf(arr, i) < 0) {
                result.push(i);
            }
        }
    }
    return result;
}

function getHas(arr) {
    var n;
    var result = [];
    if (!_cache) {
        return result;
    }

    _cache = _cache || {};
    for (n = 0; n < arr.length; n++) {
        if (_cache[arr[n]]) {
            result.push(arr[n]);
        }
    }
    return result;
}

module.exports = {
    updateModules: function (route, hashSearch, diffPath) {
        var arr = route.modules;
        var cb = route.handler;
        var _render = getRender(arr);
        var _destroy = getDestroy(arr);
        var _has = getHas(arr);
        var _temp = url.getHashSearchObj();

        // 如果路径没有改变，则不删除全部的参数
        if (diffPath) {
            cache.removeParams('all');
            cb();
        }

        cache.addParams(_temp);

        //销毁
        if (_destroy.length) {
            _destroy.forEach(function (elem) {
                if (_cache[elem].status) {
                    _cache[elem].fn.destroy();
                    //delete _cache[elem];
                }
            });
        }

        //初次渲染模块
        var _renderHandler = function (arr) {
            for (var i = 0; i < arr.length; i++) {
                _cache[_render[i]] = _cache[_render[i]] || {};
                if (!_cache[_render[i]].fn) {
                    _cache[_render[i]].fn = new arr[i];
                }
                _cache[_render[i]].fn.render();
            }
        };
        load.use(_render, function () {
            if (load.beforePageInit) {
                load.beforePageInit(_renderHandler.bind(this, arguments));
            } else {
                _renderHandler(arguments);
            }
        });

        //更新
        if (_has.length) {
            load.use(_has, function () {
                var i, j, str, isUpdate;
                var _dependence = [];
                for (i in arguments) {
                    if (arguments.hasOwnProperty(i)) {
                        isUpdate = false;
                        if (_.isArray(_cache[_has[i]].fn.dependence)) {
                            for (j = 0; j < _cache[_has[i]].fn.dependence.length; j++) {

                                str = _cache[_has[i]].fn.dependence[j];

                                // 是否有依赖参数、是否有搜索参数、是否等于上一次、这个参数是否在依赖参数里面
                                if (_cache[_has[i]].fn.dependence && (!hashSearch || hashSearch[str] !== _temp[str]) && _.indexOf(_cache[_has[i]].fn.dependence, str) > -1) {
                                    isUpdate = true;
                                    _dependence.push(str);
                                }
                            }
                        }

                        if (_cache[_has[i]].fn.dependence === 'hash') {
                            isUpdate = true;
                        }

                        if (isUpdate) {
                            _cache[_has[i]].fn.update(_dependence);           // 更新模块
                        }
                    }
                }
            });
        }

        // 这边先执行
        addCache(_render);
        reduceCache(_destroy);
    },
    load: function (route, hashSearch, diffPath) {
        if (route) {
            this.updateModules(route, hashSearch, diffPath);
        }
    }
};
