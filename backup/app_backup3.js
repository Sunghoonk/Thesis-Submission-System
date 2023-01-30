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

var config = require('./config');
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



/*** 라우팅 설정***/
var router = express.Router();
route_loader.init(app, router);



/*** Passport 라우팅 ***/

// 홈 화면(Get)
router.route('/').get(function(req, res) {
	console.log('request path: /');
	res.render('index.ejs');
});

// 로그인 화면(Get)
router.route('/login').get(function(req, res) {
	console.log('request path: /login');
	res.render('login.ejs', {message: req.flash('loginMessage')});
});

// 사용자 인증(Post)
// 성공 시 /profile로 리다이렉트, 실패 시 /login으로 리다이렉트함
router.route('/login').post(passport.authenticate('local-login', {
    successRedirect : '/profile', 
    failureRedirect : '/login', 
    failureFlash : true 
}));

// 회원가입 화면(Get)
router.route('/signup').get(function(req, res) {
	console.log('request path: /signup.');
	res.render('signup.ejs', {message: req.flash('signupMessage')});
});

// 회원 정보 인증(Post)
// 인증 확인 후, 성공 시 /profile 리다이렉트, 실패 시 /signup으로 리다이렉트함
// 인증 실패 시 검증 콜백에서 설정한 플래시 메시지가 응답 페이지에 전달되도록 함
router.route('/signup').post(passport.authenticate('local-signup', {
    successRedirect : '/profile', 
    failureRedirect : '/signup', 
    failureFlash : true 
}));

// 프로필 화면
router.route('/profile').get(function(req, res) {
	console.log('request path: /profile');
    
    // 인증된 경우, req.user 객체에 사용자 정보 있으며, 인증안된 경우 req.user는 false값임
    console.log('req.user 객체의 값');
	console.dir(req.user);
    
    // 인증 안된 경우
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.redirect('/');
        return;
    }
	
    // 인증된 경우
    console.log('사용자 인증된 상태임.');
	if (Array.isArray(req.user)) {
		res.render('profile.ejs', {user: req.user[0]._doc});
	} else {
		res.render('profile.ejs', {user: req.user});
	}
});

// 로그아웃 - 로그아웃 요청 시 req.logout() 호출함
router.route('/logout').get(function(req, res) {
	console.log('request path: /logout');
    
	req.logout();
	res.redirect('/');
});



/*** 패스포트 strategy 설정 ***/

var LocalStrategy = require('passport-local').Strategy;

/* 패스포트 로그인 설정 */
passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true   // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, email, password, done) { 
		console.log('passport의 local-login 호출됨 : ' + email + ', ' + password);
		
		var database = app.get('database');
	    database.UserModel.findOne({ 'email' :  email }, function(err, user) {
	    	if (err) { return done(err); }

	    	// 등록된 사용자가 없는 경우
	    	if (!user) {
	    		console.log('계정이 일치하지 않음.');
	    		return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
	    	}
	    	
	    	// 비밀번호 비교하여 맞지 않는 경우
			var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
			if (!authenticated) {
				console.log('비밀번호 일치하지 않음.');
				return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
			} 
			
			// 정상인 경우
			console.log('계정과 비밀번호가 일치함.');
			return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
	    });

	}));


/* 패스포트 회원가입 설정 */
passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, email, password, done) {
        // 요청 파라미터 중 name 파라미터 확인
        var paramName = req.body.name || req.query.name;
	 
		console.log('passport의 local-signup 호출됨 : ' + email + ', ' + password + ', ' + paramName);
		
	    // findOne 메소드가 blocking되지 않도록 하고 싶은 경우, async 방식으로 변경
	    process.nextTick(function() {
	    	var database = app.get('database');
		    database.UserModel.findOne({ 'email' :  email }, function(err, user) {
		        // 에러 발생 시
		        if (err) {
		            return done(err);
		        }
		        
		        // 기존에 사용자 정보가 있는 경우
		        if (user) {
		        	console.log('기존에 계정이 있음.');
		            return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
		        } else {
		        	// 모델 인스턴스 객체 만들어 저장
		        	var user = new database.UserModel({'email':email, 'password':password, 'name':paramName});
		        	user.save(function(err) {
		        		if (err) {
		        			throw err;
		        		}
		        		
		        	    console.log("사용자 데이터 추가함.");
		        	    return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
		        	});
		        }
		    });    
	    });

	}));


/* 사용자 정보 세션에 저장 및 복원 */
// 세션에 저장
passport.serializeUser(function(user, done) {
	console.log('serializeUser() 호출됨.');
	console.dir(user);
	
    done(null, user);  // 이 인증 콜백에서 넘겨주는 user 객체의 정보를 이용해 세션 생성
});

// 세션으로부터 정보 복원: 사용자(user 객체) 인증 성공 시 serializeUser 메소드를 이용해 만들었던 세션 정보가 파라미터로 넘어온 것임
passport.deserializeUser(function(user, done) {
	console.log('deserializeUser() 호출됨.');
	console.dir(user);
	
	// 사용자 정보 중 id나 email만 있는 경우 사용자 정보 조회 필요 - 여기에서는 user 객체 전체를 패스포트에서 관리
    // 두 번째 파라미터로 지정한 사용자 정보는 req.user 객체로 복원됨
    // 여기에서는 파라미터로 받은 user를 별도로 처리하지 않고 그대로 넘겨줌
	done(null, user);  
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

