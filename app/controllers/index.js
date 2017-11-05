var Movie = require('../models/movie'); // 载入mongoose编译后的模型movie
var Category = require('../models/category');

// index page 首页
exports.index = function(req, res) {
	Category
		.find({})
		.populate({
			path: 'movies',
			select: 'title poster',
			options: {
				limit: 6
			}
		})
		.exec(function(err, categories) {
			if (err) {
				console.log(err)
			}
			console.log(categories)
			res.render('index', {
				title: 'imooc 首页',
				categories: categories
			})
		})
	/*console.log('看看有没有session')
	console.log(req.session.user)

	Movie.fetch(function(err, movies) {
		if (err) {
			console.log(err);
		}
		res.render('index', { // 渲染index 首页
			title: 'i_movie 首页',
			movies: movies
		});
	});*/
}