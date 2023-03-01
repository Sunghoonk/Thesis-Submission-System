module.exports = function(router, passport) {
	console.log('user_passport 호출');

// 홈 화면(Get)
router.route('/').get(function(req, res) {
	console.log('request path: /');
	console.log(__dirname);
	res.render('index_.ejs');
});

// 로그인 화면(Get)
router.route('/login').get(function(req, res) {
	console.log('request path: /login');
	res.render('login_.ejs', {message: req.flash('loginMessage')});
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
		res.render('home.ejs', {user: req.user[0]._doc});
	} else {
		res.render('home.ejs', {user: req.user});
	}
});

// 로그아웃 - 로그아웃 요청 시 req.logout() 호출함
router.route('/logout').get(function(req, res) {
	console.log('request path: /logout');
    
	req.logout((err) => {
		if(err) { return next(err); }
		req.session.destroy();
		res.redirect('/');
	});
});

};
