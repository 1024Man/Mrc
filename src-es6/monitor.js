/**
 * Created by crow on 2016/12/30.
 */

import config from "./config"
import ResourceInfo from "./model/ResourceInfo"

/**
 * SyntaxError 语法错误
 * ReferenceError 引用一个不存在的变量时发生的错误
 * RangeError 一个值超出有效范围时发生的错误
 * TypeError 变量或参数不是预期类型时发生的错误
 * URIError URI相关函数的参数不正确时抛出的错误
 * EvalError eval函数没有被正确执行
 */

class Monitor {
    static send(e) {
        let info = JSON.stringify(e);
        config.debug && console.error('send error :' + info);
    }

    static resourceHandler () {
        if (!performance) {
            return 0;
        }

        let len = resource.length;
        let resource = performance.getEntries();
        let js = new ResourceInfo();
        let css = new ResourceInfo();
        let img = new ResourceInfo();

        for (let i = 0; i < len; i++) {
            let item = resource[i];
            switch (item.initiatorType) {
                case 'img':
                    img.setResourceInfo(item);
                    break;
                case 'script':
                    js.setResourceInfo(item);
                    break;
                case 'css':
                    css.setResourceInfo(item);
                    break;
                case 'link':
                    css.setResourceInfo(item);
                    break;
            }
        }


    }
}


if (config.monitor && addEventListener) {
    // onerror 由于在浏览器上面表现不一样，导致 chrome 的列序列不准，所以不用 onerror
    addEventListener("error", Monitor.send);
}


export default Monitor;