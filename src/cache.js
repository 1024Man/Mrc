/**
 * Created by Crow on 2014/9/25.
 *
 * QC._cache 缓存区
 *
 * QC.cache 有三个方法
 * addParams : 向缓存区增加参数
 * getParams : 从缓存区获得参数
 * removeParams : 从缓存区删除参数
 */

var CONFIG = require('./config');
var DEFAULT_TYPE = CONFIG.CACHE_DEFAULT_REQUEST_TYPE;

/*变量缓存区*/
var _cache = {};

module.exports = {
    /**
     * 向缓存区增加参数
     * @Deprecated
     * @param type
     * @param params
     */
    addParams: function (type, params) {
        if (arguments.length === 1) {
            params = arguments[0];
            type = DEFAULT_TYPE;
        }
        var i;
        _cache[type] = !_cache[type] ? {} : _cache[type];
        for (i in params) {
            if (params.hasOwnProperty(i)) {
                _cache[type][i] = params[i];
            }
        }
    },

    /**
     * 从缓存区获得参数
     * @Deprecated
     * @param type
     * @param key
     * @returns {*}
     */
    getParams: function (type, key) {
        if (arguments.length === 1) {
            key = arguments[0];
            type = DEFAULT_TYPE;
        }
        var result = null;
        if (_.isUndefined(key) || key == null) {
            result = _cache[type];
        } else {
            result = _.isUndefined(_cache[type]) ? undefined : _.isUndefined(_cache[type][key]) ? undefined : _cache[type][key];
        }
        return result;
    },

    /**
     * 从缓存区删除参数
     * @Deprecated
     * @param type
     * @param params
     * @returns {number}
     */
    removeParams: function (type, params) {
        if (arguments.length === 1) {
            params = arguments[0];
            type = DEFAULT_TYPE;
        }
        var i = 0;
        if (_.isUndefined(_cache[type])) {
            return 0;
        }
        if (params === 'all') {
            for (i in _cache[type]) {
                if (_cache[type].hasOwnProperty(i)) {
                    delete _cache[type][i];
                }
            }
        } else {
            if (!_.isArray(params)) {
                params = [params];
            }
            for (i in params) {
                if (params.hasOwnProperty(i)) {
                    delete _cache[type][params[i]];
                }
            }
        }
    },

    addCache: function (type, value) {
        var result = false;
        var i;

        if (arguments.length === 1) {
            value = arguments[0];
            type = DEFAULT_TYPE;
        }

        _cache[type] = _cache[type] || {};

        for (i in value) {
            if (value.hasOwnProperty(i)) {
                _cache[type][i] = value[i];
            }
        }

        return result;
    }
};