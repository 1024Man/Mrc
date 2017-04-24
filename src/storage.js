/**
 * @fileOverview
 * @author Crow
 * @version 0.0.1
 * @time 2015/7/23
 */

/*global window, jQuery, app*/
(function (win, $, app) {
    'use strict';

    /**
     * @description 本地储存
     * @constructor
     */
    var Stg = function () {
        this.cookieExpires = 30;
        this.isHasLocalStorage = win.localStorage || false;
    };

    /**
     * @description 增加数据
     * @param key
     * @param str   必须是字符串
     */
    Stg.prototype.add = function (key, str) {
        if (this.isHasLocalStorage) {
            win.localStorage.setItem(key, str);
        } else {
            // cookie 目前只是简单的存储30天
            $.cookie(key, str, {expires: this.cookieExpires});
        }
    };

    /**
     * @description 目前根据key，获得数据
     * @param key
     * @return {*}
     */
    Stg.prototype.get = function (key) {
        var result = null;
        if (this.isHasLocalStorage) {
            result = win.localStorage.getItem(key);
        } else {
            result = $.cookie(key);
        }

        // 处理 undefined
        if (result === 'undefined') {
            this.del(key);
            result = null;
        }

        // TODO  临时处理
        if (result == 'true' || result == 'false') {
            return JSON.parse(result);
        }
        return result;
    };

    /**
     * @description 目前根据key，删除数据
     * @param key
     */
    Stg.prototype.del = function (key) {
        if (this.isHasLocalStorage) {
            win.localStorage.removeItem(key);
        } else {
            // cookie 暂时设置空，将在浏览器关闭时处理
            $.cookie(key, '');
        }
    };

    app.storage = new Stg();

}(window, jQuery, app));