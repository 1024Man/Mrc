/**
 * Created by crow on 2016/12/22.
 */

'use strict';
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;


var eq = (a, b, aStack, bStack) => {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
};

var deepEq = (a, b, aStack, bStack) => {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
        case '[object RegExp]':
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
        case '[object String]':
            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
            // equivalent to `new String("5")`.
            return '' + a === '' + b;
        case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive.
            // Object(NaN) is equivalent to NaN.
            if (+a !== +a) return +b !== +b;
            // An `egal` comparison is performed for other numeric values.
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a === +b;
        case '[object Symbol]':
            return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
        if (typeof a != 'object' || typeof b != 'object') return false;

        // Objects with different constructors are not equivalent, but `Object`s or `Array`s
        // from different frames are.
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
            _.isFunction(bCtor) && bCtor instanceof bCtor)
            && ('constructor' in a && 'constructor' in b)) {
            return false;
        }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
        // Compare array lengths to determine if a deep comparison is necessary.
        length = a.length;
        if (length !== b.length) return false;
        // Deep compare the contents, ignoring non-numeric properties.
        while (length--) {
            if (!eq(a[length], b[length], aStack, bStack)) return false;
        }
    } else {
        // Deep compare objects.
        var keys = _.keys(a), key;
        length = keys.length;
        // Ensure that both objects contain the same number of properties before comparing deep equality.
        if (_.keys(b).length !== length) return false;
        while (length--) {
            // Deep compare each member
            key = keys[length];
            if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
};

class utils {

    /**
     * js加法 解决精度问题  http://www.cnblogs.com/tugenhua0707/p/3511453.html
     * 加减乘除
     */
    static mathAdd(arg1, arg2) {
        let firstArg, lastArg, differ, m;

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
            let dm = Math.pow(10, differ);
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
    }

    static mathSub(arg1, arg2) {
        let firstArg, lastArg, differ, m;
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
    }

    static mathMul(arg1, arg2) {
        let m = 0, firstArg, lastArg;
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
    }

    static mathDiv(arg1, arg2) {
        let firstArg, lastArg, r1, r2;

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
    }

    /**
     * 判断
     * @param o
     * @returns {boolean}
     */
    static isUndefined(o) {
        return o === void 0;
    }

    static isArray(o) {
        return toString.call(o) === '[object Array]';
    }

    static isObject(o) {
        var type = typeof o;
        return type === 'function' || type === 'object' && !!o;
    }

    static isFunction(o) {
        return typeof o == 'function' || false;
    }

    /**
     * 判断对象是否有key属性
     * @param o
     * @param key
     * @returns {boolean|*}
     */
    static has(o, key) {
        return o != null && hasOwnProperty.call(o, key);
    }


    static isArrayLike(collection) {
        var length = collection.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }

    /**
     * 对象个数
     * @param o
     * @returns {*}
     */
    static size(o) {
        if (o == null) return 0;
        return this.isArrayLike(o) ? o.length : _.keys(o).length;
    }

    /**
     * 获得对象的所有key值
     * @param o
     * @returns {Array}
     */
    static keys(o) {
        if (!this.isObject(o)) return [];
        if (Object.keys) return Object.keys(o);
        var keys = [];
        for (let key in o) if (this.has(o, key)) keys.push(key);
        return keys;
    }

    /**
     * 克隆
     * @param obj
     * @returns {*}
     */
    static clone(obj) {
        var o;
        if (this.isObject(obj)) {
            if (obj === null) {
                o = null;
            } else {
                if (this.isArray(obj)) {
                    o = [];
                    for (let i = 0, len = obj.length; i < len; i++) {
                        o.push(this.clone(obj[i]));
                    }
                } else {
                    o = {};
                    for (let j in obj) {
                        o[j] = this.clone(obj[j]);
                    }
                }
            }
        } else {
            o = obj;
        }
        return o;
    }

    /**
     * 是否相等
     * @param a
     * @param b
     */
    static isEqual(a, b) {
        return eq(a, b);
    }


}


export default utils;