/**
 * Created by crow on 2017/1/18.
 */



class Cache {
    constructor(value, path = '/', expired) {
        // 属性值
        this._count = 1;                    // 赋值几次
        this._createTime = new Date();      // 创建时间
        this._value = value;                // 属性值
        this._path = path;                  // 路径， 越高的路径权限越高
        this._expired = expired;            // 过期时间
    }


    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.count++;
    }

    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }

    get expired() {
        return this._expired;
    }

    set expired(value) {
        this._expired = value;
    }

    get count() {
        return this._count;
    }

    set count(value) {
        this._count = value;
    }

    get createTime() {
        return this._createTime;
    }

    set createTime(value) {
        this._createTime = value;
    }
}

export default Cache