/**
 * @fileOverview 公共函数，没有依赖库
 * @author Crow
 * @version 0.0.1
 *
 * url:
 *
 *      window.location.href : 整个URL
 *      window.location.protocol : URL 协议
 *      window.location.host : URL的主机部分
 *      window.location.port : URL端口
 *      window.location.pathname : URL文件路径
 *      window.location.hash : 锚点
 */
'use strict';
class url {
    /*static obj = {
        'href': '',             //整个URL
        'protocol': '',         //URL 协议
        'host': '',             //URL的主机部分
        'hostName': '',         //URL的主机名
        'port': '',             //URL端口
        'pathname': '',         //URL文件路径
        'hash': '',             //锚点
        'search': ''
    };*/

    /**
     * 获得当前完整的 URL
     * @extends {Url}
     * @returns {string|string}
     */
    static getHref() {
        return decodeURI(window.location.href) || '';
    }

    /**
     * 获得当前 URL 的协议
     * @extends {Url}
     * @returns {string|string}
     */
    static getProtocol() {
        return decodeURI(window.location.protocol) || '';
    }

    /**
     * 获得当前 URL 的主机名和端口号
     * @extends {Url}
     * @returns {string|string}
     */
    static getHost() {
        return decodeURI(window.location.host) || '';
    }

    /**
     * 获得当前 URL 的主机名
     * @extends {Url}
     * @returns {string|string}
     */
    static getHostName() {
        return decodeURI(window.location.hostname) || '';
    }

    /**
     * 获得当前 URL 的端口号
     * @extends {Url}
     * @returns {string|string}
     */
    static getPort() {
        return encodeURI(window.location.port) || '';
    }

    /**
     * 获得当前 URL 的路径
     * @extends {Url}
     * @returns {string|string}
     */
    static getPathname() {
        return decodeURI(window.location.pathname) || '';
    }

    /**
     * 获得当前 URL hash
     * @extends {Url}
     * @returns {string|string}
     */
    static getHash() {
        return decodeURI(window.location.hash) || '';
    }

    /**
     * 获得当前 URL 的查询字串
     * @extends {Url}
     * @returns {string|string}
     */
    static getSearch() {
        return decodeURI(window.location.search) || '';
    }

    /**
     * 获得当前 URL 的对象
     * @extends {Url}
     * @returns {{}}
     */
    static getAll() {
        var i = '',
            o = {}

        o = this.obj || {}

        for (i in o) {
            if (o.hasOwnProperty(i)) {
                o[i] = window.location[i] || '';
            }
        }
        return o;
    }

    /**
     * 获得当前 URL 的 hash path
     * @extends {Url}
     * @returns {*}
     */
    static getHashPath(str) {
        var _hash = str || this.getHash(),
            hashPath = null;

        if (_hash) {
            _hash = _hash.split('?')[0];
            hashPath = _hash.replace('#', '');
        } else {
            hashPath = '';
        }

        return hashPath;
    }

    /**
     * 获得当前 URL hash search的某一个值
     * @extends {Url}
     * @param key
     * @returns {*}
     */
    static getHashSearchObj(key) {
        var hash = this.getHash(),
            result = {},
            arr = [];

        var i, temp, search;

        if (/\?/.test(hash)) {
            search = hash.split('?')[1];
            arr = search.split('&');

            for (i = 0; i < arr.length; i++) {
                temp = arr[i].split('=');
                if (key) {
                    if (temp[0] === key) {
                        result = temp[1];
                        break;
                    }
                } else {
                    result[temp[0]] = temp[1];
                }
            }
        } else {
            result = '';
        }

        return result;
    }

    static getSearchObj(o) {
        var hash = o,
            result = {},
            arr = [];

        var i, temp, search;

        if (/\?/.test(hash)) {
            search = hash.split('?')[1];
            arr = search.split('&');

            for (i = 0; i < arr.length; i++) {
                temp = arr[i].split('=');
                result[temp[0]] = temp[1];
            }
        } else {
            result = '';
        }

        return result;
    }

    /**
     * 设置当前 URL
     * @extends {Url}
     * @param str
     */
    static setHref(str) {
        window.location.href = encodeURI(str);
    }

    /**
     * 设置当前 URL 协议
     * @extends {Url}
     * @param str
     */
    static setProtocol(str) {
        window.location.protocol = encodeURI(str);
    }

    static setHost(str) {
        window.location.host = encodeURI(str);
    }

    static setHostName(str) {
        window.location.hostname = encodeURI(str);
    }

    static setPort(str) {
        window.location.port = encodeURI(str);
    }

    static setPathname(str) {
        window.location.pathname = encodeURI(str);
    }

    static setHash(str) {
        window.location.hash = encodeURI(str);
    }

    static setSearch(str) {
        window.location.search = encodeURI(str);
    }


    /**
     * 设置当前 URL hash search值
     * @extends {Url}
     * @param object
     */
    static setHashSearch(object) {
        var hashSearch = this.getHash(),
            search = '',
            hash = '',
            obj = {},
            i = 0,
            key = null,
            temp = null,
            str = null,
            arr = [],
            hashArr = [];
        if (/\?/.test(hashSearch)) {
            hashArr = hashSearch.split('?');
            search = hashArr[1];
            if (object.HASH) {
                hash = object.HASH;
                delete object.HASH;
            } else {
                hash = hashArr[0];
            }


            arr = search.split('&');

            for (i = 0; i < arr.length; i++) {
                temp = arr[i].split('=');
                obj[temp[0]] = temp[1];
            }
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    obj[key] = object[key];
                }
            }
            hash += '?';
            for (str in obj) {
                if (obj.hasOwnProperty(str)) {
                    hash += (str + '=' + obj[str] + '&');
                }
            }
            hash = hash.replace(/&$/, '');
            url.setHash(hash);
        } else {
            if (object.HASH) {
                hash = object.HASH;
                delete object.HASH;
            } else {
                hash = hashSearch;
            }

            hash = hash + '?';
            for (i in object) {
                if (object.hasOwnProperty(i)) {
                    hash = hash + i + '=' + object[i] + '&';
                }
            }
            hash = hash.replace(/&$/, '');
            url.setHash(hash);
        }


    }

    static delHashSearch(arg) {
        var hashSearch = this.getHash(),
            obj = {};

        var hashArr = hashSearch.split('?');
        var search = hashArr[1];
        var hash = hashArr[0];
        var arr = search.split('&');

        for (let i = 0; i < arr.length; i++) {
            let temp = arr[i].split('=');
            obj[temp[0]] = temp[1];
        }

        if (_.isArray(arg)) {
            for (let i = 0; i < arg.length; i++) {
                if (obj[arg[i]]) {
                    delete obj[arg[i]];
                }
            }
        } else {
            if (obj[arg]) {
                delete obj[arg];
            }
        }
        hash += '?';
        for (let str in obj) {
            if (obj.hasOwnProperty(str)) {
                hash += (str + '=' + obj[str] + '&');
            }
        }
        hash = hash.replace(/&$/, '');
        url.setHash(hash);
    }


    /**
     * 格式化字符串url
     * @param url
     * @returns {{}}
     */
    static parseUrl(url) {
        var res = {},
            r = {
                protocol: /([^\/]+:)\/\/(.*)/i,
                host: /(^[^\:\/]+)((?:\/|:|$)?.*)/,
                port: /\:?([^\/]*)(\/?.*)/,
                pathname: /([^\?#]+)(\??[^#]*)(#?.*)/
            };
        res.href = url;
        for (let p in r) {
            if (r.hasOwnProperty(p)) {
                let tmp = r[p].exec(url);
                res[p] = tmp ? tmp[1] : '';
                url = tmp ? tmp[2] : '';
                if (url === "") {
                    url = "/";
                }
                if (p === "pathname") {
                    res.pathname = tmp[1];
                    res.search = tmp[2];
                    res.hash = tmp[3];
                }
            }
        }
        return res;
    }

    /**
     * 比较两个域名是否相同
     * @param i {String}    url 必须是合理的url，或者只是pathname,eq: http://www.e.com/sdf
     * @param j {String}    url 必须是合理的url，或者只是pathname, eq: /sdfs/asdf/sdf?sdfsdf=123。有host必须带有protocol
     * @param m {boolean}   是否判断端口、和协议
     * @returns {boolean}
     */
    static isEqualHost(i, j, m) {
        var b = true,
            iO = parseUrl(i),
            jO = parseUrl(j);

        iO.protocol = iO.protocol || window.location.protocol;
        iO.host = iO.host || window.location.host;
        iO.port = iO.port || window.location.port;
        jO.protocol = jO.protocol || window.location.protocol;
        jO.host = jO.host || window.location.host;
        jO.port = jO.port || window.location.port;

        // 针对localhost 处理
        if (iO.host === '127.0.0.1') {
            iO.host = 'localhost';
        }
        if (jO.host === '127.0.0.1') {
            iO.host = 'localhost';
        }

        // 是否判断端口
        if (m) {
            b = iO.protocol === jO.protocol && iO.host === jO.host && iO.port === jO.port;
        } else {
            b = iO.host === jO.host;
        }

        return b;
    }
}

export default url;