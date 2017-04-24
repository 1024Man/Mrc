/**
 * Created by crow on 2016/8/18.
 */


define(function (require, exports, module) {
    var print = require('print');


    var Module = function () {
        this.text = 'c模块';
        this.count = 0;
    };

    Module.prototype.render = function () {
        print.put(this.text + '建立');
    };

    Module.prototype.update = function () {
        this.count++;
        print.put(this.text + '更新' + this.count);
    };

    Module.prototype.destroy = function () {
        this.count = 0;
        print.put(this.text + '销毁');
    };

    module.exports = Module;
});