/**
 * Created by Administrator on 2016/5/17.
 */

var utils = {};

var connect = require('./connect');

utils.ajaxGroup = function (config) {
    // 缓存json数据
    var obj = {},
        que = [].concat(config.ajax),
        wait = que.length,
        timeoutHandler = 0,
        // 默认超时60秒
        timeout = config.hasOwnProperty('timeout') ? config.timeout : 60 * 1000,
        isFinish = false,
        onSuccess = function (callback) {
            return function (json) {
                if (callback) {
                    callback(json);
                }
                // 数据合并
                $.extend(true, obj, json);
            };
        },
        onComplete = function (callback, id) {
            return function () {
                if (callback) {
                    callback();
                }
                if (id) {
                    obj.load[id] = true;
                }
                if (isFinish) {
                    return;
                }
                wait--;
                if (wait === 0 && config.onComplete) {
                    config.onComplete(obj);
                    isFinish = true;
                    clearTimeout(timeoutHandler);
                } else {
                    checkQue();
                }
            };
        };
    obj.load = {};
    function checkQue() {
        if (que.length) {
            for (var i = 0; i < que.length; i++) {
                var ajaxData = que[i];
                if (ajaxData.check && ajaxData.check(obj) === false) {
                    // 暂不执行，保留在队列中
                    continue;
                }
                ajaxData.success = onSuccess(ajaxData.success);
                ajaxData.complete = onComplete(ajaxData.complete, ajaxData.id);
                connect.ajax(ajaxData);
                que.splice(i, 1);
                console.log(i);
                i--;
            }
        }
    }

    if (config.onBeforeSend) {
        config.onBeforeSend();
    }
    checkQue();
    // 超时 强制结束
    if (timeout) {
        timeoutHandler = setTimeout(function () {
            if (config.onComplete) {
                config.onComplete(obj);
            }
            isFinish = true;
        }, timeout);
    }
};
/**
 * js加法 解决精度问题  http://www.cnblogs.com/tugenhua0707/p/3511453.html
 */
utils.mathAdd = function (arg1, arg2) {
    var firstArg,
        lastArg,
        differ,
        dm,
        m;
    try {
        firstArg = arg1.toString().split('.')[1].length;
    } catch (e) {
        firstArg = 0;
    }
    try {
        lastArg = arg2.toString().split('.')[1].length;
    } catch (e) {
        lastArg = 0;
    }
    differ = Math.abs(firstArg - lastArg);
    m = Math.pow(10, Math.max(firstArg, lastArg));
    if (differ > 0) {
        dm = Math.pow(10, differ);
        if (firstArg > lastArg) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * dm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * dm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
};

// 除
utils.mathDiv = function (arg1, arg2) {
    var firstArg,
        lastArg,
        r1,
        r2;

    try {
        firstArg = arg1.toString().split(".")[1].length;
    } catch (e) {
        firstArg = 0;
    }

    try {
        lastArg = arg2.toString().split('.')[1].length;
    } catch (e) {
        lastArg = 0;
    }
    r1 = Number(arg1.toString().replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));

    return (r1 / r2) * Math.pow(10, lastArg - firstArg);
};

// 乘
utils.mathMul = function (arg1, arg2) {
    var m = 0,
        firstArg,
        lastArg;
    firstArg = arg1.toString();
    lastArg = arg2.toString();

    try {
        m += firstArg.split('.')[1].length;
    }
    catch (e) {
    }

    try {
        m += lastArg.split('.')[1].length;
    }
    catch (e) {
    }

    return Number(firstArg.replace(".", "")) * Number(lastArg.replace(".", "")) / Math.pow(10, m);
};

// 减
utils.mathSub = function (arg1, arg2) {
    var firstArg,
        lastArg,
        differ,
        m;
    try {
        firstArg = arg1.toString().split('.')[1].length;
    } catch (e) {
        firstArg = 0;
    }

    try {
        lastArg = arg2.toString().split('.')[1].length;
    }
    catch (e) {
        lastArg = 0;
    }
    differ = Math.pow(10, Math.max(firstArg, lastArg));
    m = (firstArg > lastArg) ? firstArg : lastArg;
    return ((arg1 * differ - arg2 * differ) / differ).toFixed(m);
};

// 兼容问题 辣鸡
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) {
                return 0;
            }
            if (number === 0 || !isFinite(number)) {
                return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}