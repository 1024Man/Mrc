/**
 * Created by crow on 2016/12/30.
 */


class ResourceInfo {
    constructor() {
        this.count = 0;
        this.duration = 0;
        this.resource = [];
    }

    get count() {
        return this.resource.length;
    }

    set count(count) {
        this.count = count;
    }

    get duration() {
        return this.duration;
    }

    set duration (duration) {
        this.duration = duration;
    }

    get resource () {
        return this.resource;
    }

    set resource (resource) {
        this.resource = resource;
    }

    setResourceInfo (o) {
        this.duration += o.duration;
        this.resource.put(o);
    }
}

export default ResourceInfo;