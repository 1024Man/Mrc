/**
 * Created by crow on 2017/1/21.
 */


/**
 * id 唯一标识，元素id
 * prev 上级模块
 * next 下级模块
 * parent 父级模块
 * depend 依赖参数
 * template 模块模板
 *
 */
class Module {

    constructor(id, prev, next, parent, depend, template) {
        this._id = id;
        this._prev = prev;
        this._next = next;
        this._parent = parent;
        this._depend = depend;
        this._template = template;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get prev() {
        return this._prev;
    }

    set prev(value) {
        this._prev = value;
    }

    get next() {
        return this._next;
    }

    set next(value) {
        this._next = value;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }

    get depend() {
        return this._depend;
    }

    set depend(value) {
        this._depend = value;
    }

    get template() {
        return this._template;
    }

    set template(value) {
        this._template = value;
    }
}

export default Module;