
'use strict';
import {} from "./extended"
import config from "./config"
import cache from "./cache"
import route from "./route"
import monitor from "./monitor"

export var Mrc = {
    config: config,
    cache: cache,
    route: route,
    module: {},
    monitor: monitor
};