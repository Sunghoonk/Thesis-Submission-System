/*** 미들웨어 설정 ***/
// middleware enroll
app.use(function(req, res, next) {
	
	console.log("첫번째 미들웨어.");

	/* 클라이언트로 받은 요청으로부터 기본 정보 추출 */
	var UserAgent = req.header('User-Agent');
	//var paramName = req.query.name || req.body.name; // get or post

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
	res.write('<h1> Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param ID: ' + paramId + '</p></div>');
	res.write('<div><p>Param password: ' + paramPassword + '</p></div>');

	// move to next middleware
	// next();

	// move to another page
	//res.redirect('http://google.co.kr');

	res.end();
});


app.use(function(req, res, next) {

	console.log('두번째 미들웨어.');

	/* 서버에서 클라이언트로 데이터를 넘기는 방법 */
/*
	// 1. 
	res.send('<h1>Response for the request.' + req.user + '<h1>');

	// 2: (json)object
	var person = {name: 'sunghoonk', age: 20};
    res.send(person); // JS object

	// 3: string type
	var personStr = JSON.stringify(person); // object to string
	res.send(personStr);

	// 4: write instead sent
	res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
	res.write(personStr);
*/

