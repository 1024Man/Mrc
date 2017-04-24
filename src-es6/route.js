/**
 *
 * Created by Crow on 2014/9/27.
 *
 * Recently by Crow on 2014/12/22.
 *
 */

import url from "./url"
import controller from "./controller"

export default {
    cb: null,
    routes: {},     //缓存以保存当前已经注册的路由
    mode: null,     //取值有两项： hash和history，用来判断是否使用history URL_PATH
    root: '/',      //应用的根路径
    config: function (options) {
        this.cb = options.cb;
        this.mode = options && options.mode && options.mode === 'history' && !!(window.history.pushState) ? 'history' : 'hash';
        this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
        return this;
    },
    clearSlashes: function (path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },
    add: function (re, mols, handler) {
        if (_.isArray(re)) {
            mols = re;
            handler = mols;
        }
        if (_.isFunction(re)) {
            console.log('请指定模块');
            return false;
        }
        if (this.routes[re]) {
            console.log('路由已被注册');
            return false;
        }

        this.routes[re] = {
            modules: mols,
            handler: handler || new Function()
        };
        return this;
    },
    remove: function (key) {
        if (this.routes[key]) {
            delete this.routes[key];
        }
        return this;
    },
    flush: function () {
        this.routes = {};
        this.mode = null;
        this.root = '/';
        return this;
    },
    check: function (f) {
        // 处理路径是否改变，默认改变
        var diffPath = true;

        var _path = url.getHashPath();
        var _search = f ? url.getSearchObj(f) : url.getHashSearchObj();

        if (f) {
            diffPath = _path !== url.getHashPath(f);

            if (diffPath) {
                if (this.cb) {
                    this.cb(_path);
                }
            }
        }

        controller.load(this.routes[_path], _search, diffPath);
        /*// 加入百度统计
        if (url.getPathname().indexOf('/index.html') >= 0) {
            _hmt.push(['_trackPageview', '/' + _path]);
        }*/
        return this;
    },
    /**
     * revise by Crow on 2014/12/18
     * 将计时器改为 hashchange 事件监听
     * */
    listen: function () {
        var self = this;
        var current = url.getHash();

        // 绑定前先检查当前路由
        self.check('original');
        window.onhashchange = function () {
            if (current !== url.getHash()) {
                self.check(current);
                current = url.getHash();
            }
        };
        return self;
    },
    navigate: function (path) {
        path = path || '';
        if (this.mode === 'history') {
            window.history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href.match(/#(.*)$/);
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        this.check();
        return this;
    }
};