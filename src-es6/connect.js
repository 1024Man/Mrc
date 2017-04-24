/**
 * Created by Crow on 2014/9/25.
 * Updated by Crow on 2015-1-22 10:20:33.
 * 加入 ajax 请求数组，解决 hashChange 时，停止之前相同的 ajax请求，
 * Updated by Crow on 2015-1-22 14:40:20.
 * Updated by Crow on 2015年10月13日19:59:15
 * 代码重构
 */


/**
 * params : {type, api, data, beforeSend, success, error, complete}
 * params : {
     *      type : get/post,
     *      api : name,
     *      data : ['param1', 'param2', 'param3'...],
     *      isRepeat: false,    // 是否重复请求
     *      beforeSend : function(){},
     *      success : function(){},
     *      error : function(){},
     *      complete : function(){}
     * }
 *
 * */

/**
 * Updated by Crow on 2015-1-22 10:20:33.
 * 使用 ajQueue 在 beforeSend 记录当前请求信息，在 complete 删除对应的请求信息，
 * 当在相同的请求多次发送时，abort 前一个请求，解决页面重复请求或者 hash 值改变出现之前请求返回问题。
 * */

import cache from './config';
import utils from './utils';
import $ from 'jquery';

/**
 * Updated by Crow on 2015-1-22 14:42:07.
 * 加入过滤添加，exceptUrl 数据包含不需要处理重复提交 ajax 类型，去掉过滤
 * */
var ajQueue = [];


/**
 * @desc 获得简单的JSON字符串
 * @param data
 * @private
 */
function _getJSONSingle(data = '') {
    return JSON.stringify(data);
}


/**
 * @desc 获得面向后端LIST风格的JSON字符串, 其中含有一个参数值为数组
 * @param data
 * @private
 */
function _getJSONList(data) {
    var result = [];
    for (let item in data) {
        if (data.hasOwnProperty(item)) {
            if (utils.isArray(data[item])) {
                let arr = data[item];
                for (let n = 0; n < arr.length; n++) {
                    data[item] = arr[n];
                    result.push(utils.clone(data));
                }

                if (arr.length === 0) {
                    data[item] = '';
                    result.push(utils.clone(data));
                }
                delete data[item];
            }
        }
    }
    return JSON.stringify(result);
}

/**
 * @desc 获得面向后端LIST风格的JSON字符串, 其中含有一个以及以上参数值为数组
 * @param data
 * @private
 */
function _getJSONLists(data) {
    var lastItem;
    var temp = {};
    var result = [];
    //先将对象中的多个数据存入 temp 对象中
    for (let item in data) {
        if (data.hasOwnProperty(item)) {
            if (utils.isArray(data[item])) {
                temp[item] = data[item];
                lastItem = item;
            }
        }
    }

    //遍历temp任意一个数据，这里遍历最后一个数据元素，在遍历对象中的元素，组合成 data 单数据元素，最后 push 到 adgroupIdArr 数组里面
    for (let n = 0; n < temp[lastItem].length; n++) {
        for (let str in temp) {
            if (temp.hasOwnProperty(str)) {
                data[str] = temp[str][n];
                if (temp[lastItem].length === 0) {
                    data[str] = '';
                }
            }

        }
        result.push(utils.clone(data));

    }
    return JSON.stringify(result);
}

/**
 * @desc 躲避浏览器广告插件
 * @param str
 * @return {string}
 * @private
 */
function _filterAd(str = '') {
    return str.replace(/adgroup/g, 'ddgroup');
}


/**
 * TODO 统一把arr改成list
 * @desc 根据数据和类型，返回可传输数据和协议
 * @param data
 * @param type
 * @return {{}}
 * @private
 */
function _getDataType(data = {}, type) {
    var result = {};
    if (utils.size(data) > 0) {
        switch (type) {
            case 'post':
                type = 'post';
                data = _getJSONSingle(data);
                break;
            case 'delete':
                type = 'delete';
                data = _getJSONSingle(data);
                break;
            case 'put':
                type = 'put';
                data = _getJSONSingle(data);
                break;
            case 'post-arr':
                type = 'post';
                data = _getJSONList(data);
                break;
            case 'delete-arr':
                type = 'delete';
                data = _getJSONList(data);
                break;
            case 'put-arr':
                type = 'put';
                data = _getJSONList(data);
                break;
            case 'post-arrs':
                type = 'post';
                data = _getJSONLists(data);
                break;
            case 'delete-arrs':
                type = 'delete';
                data = _getJSONLists(data);
                break;
            case 'put-arrs':
                type = 'put';
                data = _getJSONLists(data);
                break;
        }
    }

    result.type = type;
    result.data = data;
    return result;
}


/**
 * @desc 处理参数，由于接口是采用rest风格，所以这里有一部分处理api中参数
 *      支持data从缓存中取或者直接赋值
 * @param url {String}
 * @param arr {Array}
 * @param type {String}
 * @return {{url: *, data: {}, type: String}}
 * @private
 */
function _getUrlDataType(url, data, type) {
    var _data = {};
    var _url = url;

    if (utils.isArray(data)) {
        let len = data.length;
        // 判断是否有参数
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                let element = data[i];
                let value = cache.getParams('request', element);

                // 判断参数是否有值
                if (value !== 'undefined') {

                    // TODO 这个方法可以提出
                    // 处理url中的参数，否则放到json中
                    if (_url.indexOf('{' + element + '}') >= 0) {
                        _url = _url.replace('{' + element + '}', value);
                    } else {
                        /*
                         * Updated by Crow on 2015年4月7日15:22:56
                         * 躲避浏览器广告拦截插件
                         * */
                        if (element.indexOf('adgroup') >= 0 && type === 'get') {
                            let temp = _filterAd(data[i]);
                            _data[temp] = value;
                        } else {
                            _data[element] = value;
                        }

                    }
                }
            }
        }
    } else if (utils.isObject(data)) {
        for (let key in data) {
            if (utils.has(data, key)) {
                let element = data[key];
                if (_url.indexOf('{' + key + '}') >= 0) {
                    _url = _url.replace('{' + key + '}', element);
                } else {
                    /*
                     * Updated by Crow on 2015年4月7日15:22:56
                     * 躲避浏览器广告拦截插件
                     * */
                    if (key.indexOf('adgroup') >= 0 && type === 'get') {
                        let temp = _filterAd(key);
                        _data[temp] = data[key];
                    } else {
                        _data[key] = data[key];
                    }

                }
            }
        }
    }

    let dataType = _getDataType(_data, type);

    _data = dataType.data || '';
    type = dataType.type || type || 'get';

    // 目前只屏蔽get请求的广告拦截
    _url = _filterAd(_url);

    return {api: _url, data: _data, type: type};
}


/**
 * 删除对应的请求
 * @param cb
 * @private
 */
function _delQueue(params) {
    // 相同请求，abort() 之前请求并删除队列对应存储
    ajQueue.forEach(function (elem, index) {
        // update by dyy 增加 data 判断，有时候需要两个相同的 ajax 请求，但是 data 参数值不一样
        if (elem && elem.api === params.api && _.isEqual(elem.data, params.data) && elem.type === params.type) {
            ajQueue.splice(index, 1);
            return false;
        }
    });
}


/**
 * 判断队列中是否有相同的请求，并返回位置
 * @param params
 * @returns {number}
 * @private
 */
function _whereQueue(params) {
    var result = -1;
    // 相同请求，abort() 之前请求并删除队列对应存储
    ajQueue.forEach(function (elem, index) {
        // update by dyy 增加 data 判断，有时候需要两个相同的 ajax 请求，但是 data 参数值不一样
        if (elem && elem.api === params.api && _.isEqual(elem.data, params.data) && elem.type === params.type) {
            result = index;
        }
    });
    return result;
}

/**
 * 加入队列中
 * @param params
 * @param cb
 * @private
 */
function _addQueue(jqXHR, params, success) {
    var obj = {
        'xhr': jqXHR,
        'data': params.data,
        'api': params.api,
        'type': params.type,
        'cb': []
    };
    if (success) {
        obj.cb = [success];
    }
    ajQueue.push(obj);
}

/**
 * 加入回调队列
 * @param index
 * @param cb
 * @private
 */
function _addQueueCb(index, cb) {
    ajQueue[index].cb.push(cb);
}


var connect = {};

/**
 * @desc 调用后端统一接口
 * @param params
 */
connect.ajax = function (params) {
    var cache = true;
    // udt: url data type
    var udt = _getUrlDataType(params.api, params.data, params.type);

    if (udt.type === 'get') {
        cache = false;
    }

    $.ajax({
        type: udt.type,                         //String，默认：get, HTTP请求方法
        url: udt.api,                           //String，发送请求地址
        context: params.context,
        data: udt.data,                         //Object/String,发送到服务器的数据
        dataType: params.dataType || 'json',     //String，预期服务器返回的数据类型, 默认为json数据类型
        async: params.async || true,            //Boolean, 默认，true，是否异步
        headers: {
            'X-HTTP-Method-Override': udt.type,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        cache: cache,                           //Boolean，默认：true,是否从浏览器缓存中加载请求信息
        beforeSend: function (jqXHR) {

            // 检查队列中是否有这个请求
            var num = _whereQueue(udt);
            if (num != -1) {
                _addQueueCb(num, params.success);
                console.error('Biu~Abort掉一个请求：' + udt.api);
                jqXHR.abort();
            } else {
                _addQueue(jqXHR, udt, params.success);
            }

            if (params.beforeSend) {
                params.beforeSend();
            }
        },//Function，参数：XMLHttpRequest 发送请求前执行
        success: function (json) {
            //var sThis = this;
            // session超时跳转
            if (json.sessionTimeout) {
                window.location.href = "/www/home/index.html";
                return;
            }
            var num = _whereQueue(udt);
            ajQueue[num].cb.forEach(function (elem) {
                try {
                    if (elem) {
                        elem(json);
                    }
                } catch (e) {
                    throw e;
                }
            });
            // 完成删除队列请求
            _delQueue(udt);
        },//Function，参数：data,textStatus  请求成功后回调函数
        error: function (error, setts) {
            if (params.error) {
                params.error(error, setts);
            }
        },//Function，参数:XMLHttpRequest, textStatus, errorThrown
        complete: function (jqXHR) {
            // 完成删除队列请求
            _delQueue(udt);
            if (params.complete) {
                params.complete(jqXHR);
            }
        }
    });
};

connect.socket = {};

export default connect;
