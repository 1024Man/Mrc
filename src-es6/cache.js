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
import config from "./config";
import utils from "./utils";
import Cache from "./model/Cache";

var DEFAULT_TYPE = config.CACHE_DEFAULT_REQUEST_TYPE;

/*变量缓存区*/
var _cache = {};

export default {
    /**
     * 向缓存区增加参数
     * @param type
     * @param value
     */
    addParams: function (type, value) {
        if (arguments.length === 1) {
            value = arguments[0];
            type = DEFAULT_TYPE;
        }

        _cache[type] = _cache[type] || {};

        for (let key in value) {
            let _v = value[key];
            if (value.hasOwnProperty(key)) {

                if (_cache[type][key]) {
                    _cache[type][key].value = _v;
                } else {
                    _cache[type][key] = new Cache(_v);
                }

                config.debug && console.info('add {%s: %s} in cache', key, _v);
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
        var result = undefined;
        if (utils.isUndefined(key) || key == null) {
            result = _cache[type];
        } else {
            result = utils.isUndefined(_cache[type]) ? undefined : utils.isUndefined(_cache[type][key]) ? undefined : _cache[type][key].value;
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
        if (utils.isUndefined(_cache[type])) {
            return 0;
        }

        switch (params) {
            case 'all':
                for (let key in _cache[type]) {
                    if (_cache[type].hasOwnProperty(key)) {
                        config.debug && console.warn('delete {%s: %s} from cache', key, _cache[type][key]);
                        delete _cache[type][key];
                    }
                }
                break;
            default:
                params = utils.isArray(params) ? params : [params];
                for (let key in params) {
                    if (params.hasOwnProperty(key)) {
                        config.debug && console.warn('delete {%s: %s} from cache', params[key], _cache[type][params[key]]);
                        delete _cache[type][params[key]];
                    }
                }
                break;
        }
        return 1;
    }
};