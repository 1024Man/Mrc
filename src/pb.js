/**
 * @fileOverview
 * @author Crow
 * @version 0.0.1
 * @time 2015/11/11
 */


/*global app, _, console*/
(function (app) {
    'use strict';

    /**
     * @desc 盒子
     * @type {Object}
     */
    var PB = {};

    /**
     * @desc 存储 不公开
     * @type {Object}
     */
    var _storage = {};

    /**
     * @desc 订阅者（观察者）
     * @param  {String|Array}   types     订阅类型
     * @param  {Function|Array} functions 订阅者
     * @return {void}
     */
    PB.subscribe = function (types, functions) {
        if (_.isString(types)) {
            types = [types];
        }
        if (_.isFunction(functions)) {
            functions = [functions];
        }

        types.forEach(function (name) {
            if (!_storage[name]) {
                _storage[name] = [];
            }
            functions.forEach(function (fn) {
                if (_.isFunction(fn)) {
                    _storage[name].push(fn);
                }
            });
        });
    };

    /**
     * @desc 取消订阅
     * @param  {String|Array}   types     订阅的类型
     * @param  {Function|Array} functions 订阅者
     * @return {void}
     */
     // TODO unSubscribe 一个单词 unsubscribe
    PB.unSubscribe = function (types, functions) {
        var index;

        if (_.isString(types)) {
            types = [types];
        }
        if (_.isFunction(functions)) {
            functions = [functions];
        }

        types.forEach(function (name) {
            if (!_storage[name]) {
                console.log('订阅' + name + '不存在');
            } else {
                if (functions) {
                    functions.forEach(function(fn) {
                        index = _storage[name].indexOf(fn);
                        _storage[name].splice(index, 1);
                    });
                } else {
                    _storage[name] = [];
                }
            }
        });
    };

    /**
     * @desc 订阅(被观察者)
     * @param  {String|Array} types 类型
     * @param  {Object}       data  数据
     * @return {void}
     */
    PB.publish = function (types, data) {

        if (_.isString(types)) {
            types = [types];
        }

        types.forEach(function (name) {
            if (!_storage[name] || _storage[name].constructor !== Array) {
                _storage[name] = [];
            }

            _storage[name].forEach(function (fn) {
                fn(data);
            });
        });
    };

    PB.get = function () {
        return _storage;
    };

    app.pb = PB;
}(app, _));