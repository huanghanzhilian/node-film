var Movie = require('../models/movie.js'); // 载入mongoose编译后的模型movie
var User = require('../models/user.js'); // 载入mongoose编译后的模型user
var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

module.exports = function(app) {
    // 编写主要页面路由
    //pre handel user
    app.use(function(req, res, next) {
        var _user = req.session.user;
        if (_user) {
            app.locals.user = _user;
        }
        return next();
    })

    //signup
    //post参数第一个路由，第二个回掉方法
    //回掉方法参数request请求
    //回掉方法参数response响应体
    app.post('/user/signup', function(req, res) {
        //获取表单数据
        var _user = req.body.user;
        //查找输入用户名是否已存在
        User.findOne({
            name: _user.name
        }, function(err, user) {
            if (err) {
                console.log(err)
            }
            if (user) {
                return res.redirect('/');
            } else {
                //生成用户数据
                var user = new User(_user);
                //保存数据方法
                user.save(function(err, user) {
                    if (err) {
                        console.log(err)
                    }
                    //重定向到首页
                    res.redirect('/admin/userlist');
                })
            }
        })
    })

    // userlist 列表页
    app.get('/admin/userlist', function(req, res) {
        User.fetch(function(err, users) {
            if (err) {
                console.log(err);
            }
            res.render('userlist', { //视图views
                title: '用户列表页',
                users: users
            });
        });
    });

    //signin
    app.post('/user/signin', function(req, res) {
        //拿到表单提交的user
        var _user = req.body.user;
        var name = _user.name;
        var password = _user.password;
        //查询数据库是否有该用户
        User.findOne({
            name: name
        }, function(err, user) {
            if (err) {
                console.log(err)
            }
            if (!user) {
                return res.redirect('/');
            }
            //匹配密码
            //用户提交的密码是明文的数据库是加密后的密码所以这个时候需要调用这个user实例上的方法
            //传入当前密码，拿到一个回掉的方法
            //isMatch通过他看是否匹配正确
            user.comparePassword(password, function(err, isMatch) {
                if (err) {
                    console.log(err)
                }
                if (isMatch) {
                    req.session.user = user;
                    return res.redirect('/')
                } else {
                    console.log('不匹配')
                        //return res.redirect('/signin')
                }
            })
        })
    })

    //logout
    app.get('/logout', function(req, res) {
        delete req.session.user;
        delete app.locals.user;
        res.redirect('/')
    })

    // index page 首页
    app.get('/', function(req, res) {
        console.log('看看有没有session')
        console.log(req.session.user)

        Movie.fetch(function(err, movies) {
            if (err) {
                console.log(err);
            }
            res.render('index', { // 渲染index 首页
                title: 'i_movie 首页',
                movies: movies
            });
        });
    })


    // detail page 详情页
    app.get('/movie/:id', function(req, res) {
        var id = req.params.id;
        Movie.findById(id, function(err, movie) {
            res.render('detail', {
                title: 'i_movie' + movie.title,
                movie: movie
            });
        });
    });

    // admin page 后台录入页
    app.get('/admin/movie', function(req, res) {
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
    });



    // admin update movie 后台更新页
    app.get('/admin/update/:id', function(req, res) {
        var id = req.params.id;
        if (id) {
            Movie.findById(id, function(err, movie) {
                res.render('admin', {
                    title: 'imovie 后台更新页',
                    movie: movie
                });
            });
        }
    });



    // admin post movie 后台录入提交
    app.post('/admin/movie/new', function(req, res) {
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
    });


    // list page 列表页
    app.get('/admin/list', function(req, res) {
        Movie.fetch(function(err, movies) {
            if (err) {
                console.log(err);
            }
            res.render('list', {
                title: 'i_movie 列表页',
                movies: movies
            });
        });
    });


    // list delete movie data 列表页删除电影
    app.delete('/admin/list', function(req, res) {
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
    });
}