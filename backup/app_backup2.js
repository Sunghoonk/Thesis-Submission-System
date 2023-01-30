/*** 모듈 설정 ***/
var express = require('express');
var http = require('http');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');
// var errorHandler = require('errorhandler');
var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');

/* 파일 업로드 모듈 */
var multer = require('multer');
var fs = require('fs');
var cors = require('cors');

/* MongoDB 모듈 */
var MongoClient = require('mongodb').MongoClient;

/*** 객체 생성 ***/
var app = express();
var database;

/*** 기본 설정 ***/
app.set('port', process.env.PORT || 3000);

/*** 미들웨어 설정 ***/

// setting path(GET 방식), public, upload file open
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

// setting bodyparser(POST 방식)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cookie parser 설정
app.use(cookieParser());

// CORS 설정
app.use(cors());

// multer 설정: body-parser -> multer -> router
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, 'uploads');
	},
	filename: function (req, file, callback) {
		callback(null, file.originalname + Date.now());
	}
});

var upload = multer({
	storage: storage,
	limits: {
		files: 10,
		fileSize: 1024 * 1024 * 1024
	}
});

/*** 라우팅 설정***/
var router = express.Router();

/*쿠키 요청 처리*/
router.route('/process/setUserCookie').get(function(req, res) {
	console.log('라우팅: /process/setUserCookie');

	// 쿠키 설정
	res.cookie('user', {
		id: 'mike',
		name: '소녀시대',
		authorized: true
	});

	// redirect
	res.redirect('/process/showCookie');

});


router.route('/process/showUserCookie').get(function(req, res) {
	console.log('라우팅: /process/showUserCookie');

	res.send(req.cookie);
});

/* 라우팅 기본 응답 처리 */
router.route('/process/login').post(function(req, res){
	console.log('라우팅: /process/login');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
	res.write('<h1> Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param ID: ' + paramId + '</p></div>');
	res.write('<div><p>Param password: ' + paramPassword + '</p></div>');
	res.end();

});

/* 파일 업로드 요청 처리 */
router.route('/process/doc').post(upload.array('doc', 1), function(req, res) {
	console.log('라우팅: /process/doc');
	
	try {

	var files = req.files;
	console.dir('#==첫번째 파일 정보==#');	
	console.dir(req.files[0]);
	console.dir('#====#');

	var originalname ='';
	var filename ='';
	var mimetype ='';
	var size =0;

	if(Array.isArray(files)){
		console.log("파일 갯수: %d", files.length);

		for(var i=0; i<files.length; i++){
			originalname = files[i].originalname;
			filename = files[i].filename;
			size = files[i].size;
        }	
	}
	
	console.log('파일 정보: ' + originalname + ', ' + filename + ', ' + mimetype + ',' + size);

	// 응답 전송
	res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
	res.write('<h1>파일 업로드 성공</h1>');
	res.end();
	
	} catch(err){
		console.dir(err.stack);
	}
});

/*** 라우터 등록 ***/
app.use('/', router);

/*** 오류 처리 ***/
var errorHandler = expressErrorHandler({
	static: {
		'404': './public/404.html'
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

/*** DB 연결 ***/
function connectDB() {
	var databaseUrl = 'mongodb://localhost:27017/local';

	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) throw err;

		console.log('데이터 베이스에 성공적으로 연결되었습니다. :' + databaseUrl);

		database = db;
	});
}

/*** 서버 부팅 ***/
http.createServer(app).listen(3000, function() {
	console.log('Start Server: port(' + app.get('port') + ')');

	connectDB();
});

