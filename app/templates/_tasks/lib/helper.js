var lodash = require('lodash')
var ejshelper = require('xbt-ejs-helper');

var host = 'http://mat1.gtimg.com/xian/libs';
var cdnJsList = [
    {'name': 'flexible', 'url': 'flexible/0.3.2/flexible.min.js'},
    {'name': 'zepto', 'url': 'zepto/1.2.0/zepto.min.js'}
]

var cdnHelper = {
    cjs: function(name) {
        var exist = lodash.find(cdnJsList, {'name': name});
        var url = exist?
            [host, exist.url].join('/')
            :['../js', name].join('/');

        return '<script src="'+ url+'"></script>';
    }
}

module.exports = function () {
    return lodash.assign(ejshelper(), cdnHelper)
}
