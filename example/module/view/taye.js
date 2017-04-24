/**
 * Created by crow on 2016/8/18.
 */


define(function (require, exports, module) {


    var Module = function () {
        this.text = '塔爷衣服';
        this.count = 0;
        this.$body = $('body');
        this.dependence = 'hash';
    };

    Module.prototype.render = function () {
        this.$body.append(this.text + '穿了 </br>');
    };

    Module.prototype.update = function () {
        this.$body.append(this.text + '换一套 </br>');
    };

    Module.prototype.destroy = function () {
        this.$body.append(this.text + '脱了 </br>');
    };

    module.exports = Module;
});