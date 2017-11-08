var Index = require('../app/controllers/index');
var Movie = require('../app/controllers/movie');
var User = require('../app/controllers/user');
var Comment = require('../app/controllers/comment');
var Category = require('../app/controllers/category');

module.exports = function(app) {
    //pre handel user
    app.use(function(req, res, next) {
        var _user = req.session.user;
        app.locals.user = _user;
        return next();
    })

    // Index
    app.get('/', Index.index)

    //User
    app.post('/user/signup', User.signup);
    app.post('/user/signin', User.signin)
    app.get('/logout', User.logout)
    app.get('/signin', User.showSignin)
    app.get('/signup',User.showSignup)
    app.get('/admin/user/list',User.signinRequired, User.adminRequired, User.list);

    // Movie
    app.get('/movie/:id', Movie.detail);//查看视频页
    app.get('/admin/movie/new',User.signinRequired, User.adminRequired, Movie.new);//后台录入页
    app.get('/admin/movie/update/:id',User.signinRequired, User.adminRequired, Movie.update);//修改视频信息页
    app.post('/admin/movie',User.signinRequired, User.adminRequired, Movie.save);//后台录入页提交
    app.get('/admin/movie/list',User.signinRequired, User.adminRequired, Movie.list);//管理视频列表页
    app.delete('/admin/movie/list',User.signinRequired, User.adminRequired, Movie.del);//删除视频列表页


    // Comment
    app.post('/user/comment', User.signinRequired, Comment.save)

    // Category
    app.get('/admin/category/new', User.signinRequired, User.adminRequired, Category.new)
    app.post('/admin/category', User.signinRequired, User.adminRequired, Category.save)
    app.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)


    // results
    app.get('/results', Index.search)
}