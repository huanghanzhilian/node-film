var Movie = require('../models/movie.js'); // 载入mongoose编译后的模型movie
var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段
var Comment = require('../models/comment'); // 载入mongoose编译后的模型comment


// detail page 详情页
exports.detail = function(req, res) {
    var id = req.params.id;
    Movie.findById(id, function(err, movie) {
        Comment
        .find({movie: id})
        .populate('from', 'name')
        .populate('reply.to reply.from', 'name')
        .exec(function(err, comments) {
            console.log(comments)
            res.render('detail', {
                title: 'i_movie' + movie.title,
                movie: movie,
                comments: comments
            });
        })
    });
};

// admin new page 后台录入页
exports.new = function(req, res) {
    res.render('admin', {
        title: 'i_movie 后台录入页',
        movie: {
            title: '',
            doctor: '',
            country: '',
            year: '',
            poster: '',
            flash: '',
            summary: '',
            language: ''
        }
    });
};



// admin update movie 后台更新页
exports.update = function(req, res) {
    var id = req.params.id;
    if (id) {
        Movie.findById(id, function(err, movie) {
            res.render('admin', {
                title: 'imovie 后台更新页',
                movie: movie
            });
        });
    }
};



// admin post movie 后台录入提交  电影的保存
exports.save = function(req, res) {
    var id = req.body.movie._id || "";
    var movieObj = req.body.movie || "";
    var _movie = null;
    if (id !== 'undefined') { // 已经存在的电影数据
        Movie.findById(id, function(err, movie) {
            if (err) {
                console.log(err);
            }
            _movie = _underscore.extend(movie, movieObj); // 用新对象里的字段替换老的字段
            _movie.save(function(err, movie) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/movie/' + movie._id);
            });
        });
    } else { // 新加的电影
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });
        _movie.save(function(err, movie) {
            if (err) {
                console.log(err);
            }
            res.redirect('/movie/' + movie._id);
        });
    }
};


// list page 列表页
exports.list = function(req, res) {
    Movie.fetch(function(err, movies) {
        if (err) {
            console.log(err);
        }
        res.render('list', {
            title: 'i_movie 列表页',
            movies: movies
        });
    });
};


// list delete movie data 列表页删除电影
exports.del = function(req, res) {
    var id = req.query.id;
    if (id) {
        Movie.remove({
            _id: id
        }, function(err, movie) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    success: 1
                });
            }
        });
    }
};