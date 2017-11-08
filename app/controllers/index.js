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

// search page
exports.search=function(req,res){
	//拿到分类id
	var catId=req.query.cat;
	//拿到页码
	var page = parseInt(req.query.p, 10) || 0;
	var count = 2
	//每一页只展示两条数据
	var index = page * count

	Category
		.find({
			_id: catId
		})
		.populate({
			path: 'movies',
			select: 'title poster',
			/*options: {
				limit: 2,
				skip:index
			}*/
		})
		.exec(function(err, categories) {
			if (err) {
				console.log(err)
			}
			var category = categories[0] || {}
	        var movies = category.movies || []
	        var results = movies.slice(index, index + count)

			res.render('results', {
				title: 'imooc 结果列表页面',
				keyword: category.name,
				currentPage: (page + 1),
				query: 'cat=' + catId,
				totalPage: Math.ceil(movies.length / count),
				movies: results
			})
		})
}


