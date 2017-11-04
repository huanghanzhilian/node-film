var Movie = require('../models/movie.js'); // 载入mongoose编译后的模型movie
// index page 首页
exports.index = function(req, res) {
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
}