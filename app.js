var express = require('express');   //加载模块
var app=express();                  //启动web服务器
var port = process.env.PORT || 3000;    // 设置端口号：3000
// 引入path模块的作用：因为页面样式的路径放在了bower_components，告诉express，请求页面里所过来的请求中，如果有请求样式或脚本，都让他们去bower_components中去查找
var path = require('path');
var cookieParser = require('cookie-parser')
var session = require('express-session')
var mongoose=require('mongoose');              // 加载mongoose模块
var mongoStore = require('connect-mongo')(session);//会话持久
var dbUrl='mongodb://localhost:27017/imovie';


app.listen(port);                       // 监听 port[3000]端口
console.log('是否启动'+port);







//mongoose.connect('mongodb:localhost/film');    // 连接mongodb本地数据库imovie
mongoose.connect(dbUrl); // 连接mongodb本地数据库imovie
console.log('MongoDB connection success!');

/*  mongoose 简要知识点补充
* mongoose模块构建在mongodb之上，提供了Schema[模式]、Model[模型]和Document[文档]对象，用起来更为方便。
* Schema对象定义文档的结构（类似表结构），可以定义字段和类型、唯一性、索引和验证。
* Model对象表示集合中的所有文档。
* Document对象作为集合中的单个文档的表示。
* mongoose还有Query和Aggregate对象，Query实现查询，Aggregate实现聚合。
* */


//app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'public')));   // 路径：public


app.locals.moment = require('moment'); // 载入moment模块，格式化日期


var bodyParser = require('body-parser');
// 因为后台录入页有提交表单的步骤，故加载此模块方法（bodyParser模块来做文件解析），将表单里的数据进行格式化
app.use(bodyParser.urlencoded({extended: true}));


var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

//session依赖于cookies
app.use(cookieParser());
app.use(session({
    secret:'huang',
    store: new mongoStore({
        url :dbUrl,
        collection: 'sessions'
    }),
    resave:false,
    saveUninitialized:true
}));


app.set('views','./views/pages');       // 设置视图默认的文件路径
app.set('view engine','jade');          // 设置视图引擎：jade




var Movie=require('./models/movie.js');  // 载入mongoose编译后的模型movie
var User=require('./models/user.js');  // 载入mongoose编译后的模型user


// 编写主要页面路由

//signup
//post参数第一个路由，第二个回掉方法
//回掉方法参数request请求
//回掉方法参数response响应体
app.post('/user/signup',function(req,res){
    //获取表单数据
    var _user=req.body.user;
    //查找输入用户名是否已存在
    User.findOne({name:_user.name},function(err,user){
        if(err){
            console.log(err)
        }
        if(user){
            return res.redirect('/');
        }else{
            //生成用户数据
            var user=new User(_user);
            //保存数据方法
            user.save(function(err,user){
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
app.get('/admin/userlist', function (req, res) {
    User.fetch(function (err, users) {
        if (err) {
            console.log(err);
        }
        res.render('userlist', {//视图views
            title: '用户列表页',
            users: users
        });
    });
});

//signin
app.post('/user/signin',function(req,res){
    //拿到表单提交的user
    var _user=req.body.user;
    var name=_user.name;
    var password=_user.password;
    //查询数据库是否有该用户
    User.findOne({name:name},function(err,user){
        if(err){
            console.log(err)
        }
        if(!user){
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
app.get('/logout',function(req,res){
    delete req.session.user;
    delete app.locals.user;
    res.redirect('/')
})

// index page 首页
app.get('/', function (req, res)  {
    console.log('看看有没有session')
    console.log(req.session.user)
    var _user=req.session.user;
    if(_user){
        app.locals.user=_user;
    }
    Movie.fetch(function (err, movies) {
        if (err) {
            console.log(err);
        }
        res.render('index', {  // 渲染index 首页
            title: 'i_movie 首页',
            movies: movies
        });
    });
})


// detail page 详情页
app.get('/movie/:id', function (req, res) {
    var id = req.params.id;
    Movie.findById(id, function (err, movie) {
        res.render('detail', {
            title: 'i_movie' + movie.title,
            movie: movie
        });
    });
});

// admin page 后台录入页
app.get('/admin/movie', function (req, res) {
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
app.get('/admin/update/:id', function (req, res) {
    var id = req.params.id;
    if (id) {
        Movie.findById(id, function (err, movie) {
            res.render('admin', {
                title: 'imovie 后台更新页',
                movie: movie
            });
        });
    }
});



// admin post movie 后台录入提交
app.post('/admin/movie/new', function(req, res) {
	var id = req.body.movie._id||"";
	var movieObj = req.body.movie||"";
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
app.get('/admin/list', function (req, res) {
    Movie.fetch(function (err, movies) {
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
app.delete('/admin/list', function (req, res) {
    var id = req.query.id;
    if (id) {
        Movie.remove({_id: id}, function (err, movie) {
            if (err) {
                console.log(err);
            } else {
                res.json({success: 1});
            }
        });
    }
});



