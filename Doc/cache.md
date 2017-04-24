## 软件缓存机制
*简单的key-value存储机制*

> 其中`connect`模块会根据配置文件中`CACHE_DEFAULT_REQUEST_TYPE`获得请求参数，所以我们一般请求需要的参数值，只需要传`value`

### `addCache(type, value)`
增加一个存储，如果type不传，默认保存配置文件`CACHE_DEFAULT_REQUEST_TYPE`下面。返回true/false

> example
```
addCache('example', {id, 30});
addCache({id: 30});
```


### `getCache(type, value)`
根据key获得值，如果type不传，默认取配置文件`CACHE_DEFAULT_REQUEST_TYPE`下面。没有返回`undefined`类型

> example
```
getCache('example', {id, 30});
getCache({id: 30});
```

### `delCache(type, value)`
根据key获得值，如果type不传，默认删除配置文件`CACHE_DEFAULT_REQUEST_TYPE`下面的值，返回被删除的值。没有返回`undefined`类型

> example
```
delCache('example', 'id');
// return 30;
delCache('id');
// return 30;
```

### `updateCache(type, value)`
根据key获得值，如果type不传，默认更新（如果没有直接新建）配置文件`CACHE_DEFAULT_REQUEST_TYPE`下面的值，返回被删除的值。没有返回`undefined`类型

> example
```
updateache('example', {id: 40});
// return 30;
delCache({'id': 40});
// return 30;
```
