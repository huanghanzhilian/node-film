var express = require('express'); //加载模块
var app = express(); //启动web服务器
var port = process.env.PORT || 3000; // 设置端口号：3000
// 引入path模块的作用：因为页面样式的路径放在了bower_components，告诉express，请求页面里所过来的请求中，如果有请求样式或脚本，都让他们去bower_components中去查找
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var session = require('express-session')
var mongoose = require('mongoose'); // 加载mongoose模块
var mongoStore = require('connect-mongo')(session); //会话持久
var dbUrl = 'mongodb://localhost:27017/imovie';
var logger = require('morgan');


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



// 因为后台录入页有提交表单的步骤，故加载此模块方法（bodyParser模块来做文件解析），将表单里的数据进行格式化
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('views', './views/pages'); // 设置视图默认的文件路径
app.set('view engine', 'jade'); // 设置视图引擎：jade
//session依赖于cookies
app.use(cookieParser());
app.use(session({
    secret: 'huang',
    store: new mongoStore({
        url: dbUrl,
        collection: 'sessions'
    }),
    resave: false,
    saveUninitialized: true
}));

if('development'===app.get('env')){
    app.set('showStackError',true);//打印错误信息
    app.use(logger(':method :url :status'))//中间件
    app.locals.pretty=true;//格式化代码
    mongoose.set('debug',true)//数据库日志
}


require('./config/routes')(app);

app.listen(port); // 监听 port[3000]端口
app.locals.moment = require('moment'); // 载入moment模块，格式化日期
app.use(express.static(path.join(__dirname, 'public'))); // 路径：public

console.log('是否启动' + port);