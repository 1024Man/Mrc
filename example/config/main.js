/**
 * Created by crow on 2016/8/18.
 */


app.load.config({
    baseUrl: '/example/module/',
    path: {
        'A': 'view/a',
        'B': 'view/b',
        'C': 'view/c',
        "TT": 'view/taye',
        'print': 'writePage'
    }
});


app.route.add('a', ['A']);
app.route.add('ab', ['A', 'B']);
app.route.add('abc', ['A', 'B', 'C']);
app.route.add('test', ['A', 'C']);
app.route.add('tt', ["TT"]);
app.route.add('t', ["TT", "A"]);

// 127.0.0.1/index.html#ab??a.js&b.js
// nginx-concat