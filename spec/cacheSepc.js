/**
 * Created by crow on 2017/1/18.
 */

// import cache from "../src-es6/cache"
import Cache from "../src-es6/model/Cache"

describe("Cache", () => {
    it('new Cache', () => {
        let s = new Cache(1);
        s.value = 2;
        console.log(s);
        expect(s.count).toBe(2);
    })
});

/*
describe("Cache", () =>{
    it('add one value', () => {
        cache.addParams({"test": 1});
        let s = cache.getParams("test");
        console.log(s);
        expect(s).toBe(1);
    });

    it('add twe value', () => {
        cache.addParams({
            'test': 2,
            'id': 123
        });

        let s = cache.getParams("test");
        let id = cache.getParams("id");
        expect(s).toBe(2);
        expect(id).toBe(123);
    })
});*/
