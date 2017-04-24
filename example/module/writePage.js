/**
 * Created by crow on 2016/8/18.
 */



define(function (require, exports, module) {
    var $body = $('body');
    module.exports = {
        put: function (str) {
            $body.append(str + '</br></br>');
        },
        clear: function () {
            $body.html('');
        }
    };
});