// 依赖库

window.$ = require('jquery');
window._ = require('underscore');

/**
 * @fileOverview
 * @author Crow
 * @version 0.0.1
 * @time 2015/11/3
 */
window.app = {
    version: '4.0.0',
    load: require('./load'),            // 加载
    cache: require('./cache'),          // 缓存
    route: require('./route'),          // 路由
    control: require('./control'),      // 控制器
    connect: require('./connect'),      // 通信
    utils: require('./utils'),          // 通用
    url: require('./url')
};