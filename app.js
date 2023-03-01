/*** 모듈 설정 ***/
var express = require('express');
var http = require('http');
var path = require('path');

var static = require('serve-static');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var errorHandler = require('errorhandler');
var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');

var config = require('./config/config');
var database = require('./database/database');
var route_loader = require('./routes/route_loader');

/* MongoDB 모듈 */
var mongoose = require('mongoose');

/* 패스포트 모듈*/
var passport = require('passport');
var flash = require('connect-flash');

/* 파일 업로드 모듈 */
var multer = require('multer');
var fs = require('fs');
var cors = require('cors');



/*** Express 객체 생성 ***/
var app = express();



/*** 뷰 엔진 설정 ***/
app.set('views', __dirname + '/views');
//app.set('view engine', 'pug');
//console.log('뷰 엔진이 pug로 설정되었습니다.');
app.set('view engine', 'ejs');
console.log('뷰 엔진 설정 완료(app 속성 추가 완료): ejs.');



/*** 기본 설정 ***/
app.set('port', config.server_port || 3000);
console.log('포트 설정 완료(app 속성 추가 완료): 3000.');



/*** 미들웨어 설정 ***/
// setting bodyparser(POST 방식)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cookie parser 설정
app.use(cookieParser());

// setting path(GET 방식), public, upload file open
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));
console.log('path 설정 완료: /public, /uploads.');

// Session 
app.use(expressSession({
	secret: 'my key',
	resave: true,
	saveUninitialized: true
}));
console.log('미들웨어 설정 완료(등록 완료): bodyparser, cookie parser, session.');



/*** 패스포트 초기화 ***/
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var config_passport = require('./config/passport');
config_passport(app, passport);

/*** multer 설정 ***/
// CORS 설정
app.use(cors());

var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, 'uploads');
	},
	filename: function (req, file, callback) {
		// callback(null, file.originalname + Date.now());
		callback(null, file.originalname);
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
route_loader.init(app, router);

var user_passport = require('./routes/user_passport');
user_passport(router, passport);


/*** 논문 제출/심사/현황 조회 요청 처리 ***/
router.route('/upload').get(function(req, res){
	console.log('request path: /upload');
	res.render('upload.ejs');
});

router.route('/upload_file').get(function(req, res){
	console.log('request path: /upload_file');
	res.render('upload_file.ejs');
});

router.route('/edit').get(function(req, res){
	console.log('request path: /edit');
	res.render('edit.ejs');
});

router.route('/eval').get(function(req, res){
	console.log('request path: /eval');
	res.render('eval.ejs');
});

router.route('/show_thesis').get(function(req, res){
	console.log('request path: /show_thesis');
	res.redirect('/process/show_thesis');
});

router.route('/list_thesis').get(function(req, res){
	console.log('request path: /list_thesis');
	res.redirect('/process/list_thesis');
});

router.route('/listAll_thesis').get(function(req, res){
	console.log('request path: /listAll_thesis');
	res.redirect('/process/listAll_thesis');
});

router.route('/upload/doc').post(upload.array('doc', 1), function(req, res) {
	console.log('라우팅: /upload/doc');
	

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
				req.app.render('upload_success', function(err, html) {
					if (err) {
                        console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);
                
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
					
					console.log('응답 웹문서 : ' + html);
					res.end(html);
				});

});



/*** 404 에러 페이지 처리 ***/
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );



/*** 서버 부팅 ***/

// 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	
	console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
	console.log("프로세스가 종료됩니다.");
	app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});

// 시작된 서버 객체를 리턴
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('********************' + '서버 부팅이 완료되었습니다(포트: ' + app.get('port') + ')********************');

	// 데이터베이스 초기화
	database.init(app, config);
	console.log('\n');
   
});

