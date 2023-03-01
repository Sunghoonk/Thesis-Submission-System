var mongoose = require('mongoose');
mongoose.set('strictQuery',true);

// database 객체에 db, schema, model 모두 추가
var database = {};

// 초기화를 위해 호출하는 함수
database.init = function(app, config) {
	console.log('\n');
	console.log('데이터 베이스를 초기화합니다.');
	console.log('DB/ database.init() 호출.');
	
	connect(app, config);
}

//데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connect(app, config) {
	console.log('DB/ connect() 호출.');
	
	// 데이터베이스 연결
    mongoose.Promise = global.Promise; 
	mongoose.connect(config.db_url);
	database.db = mongoose.connection;
	
	database.db.on('error', console.error.bind(console, 'mongoose connection error.'));	
	database.db.on('open', function () {
		console.log('DB/ 서버와 데이터베이스 연결 완료: ' + config.db_url);
		
		// config에 등록된 스키마 및 모델 객체 생성
		createSchema(app, config);
		
	});
	database.db.on('disconnected', connect);

}

// config에 정의된 스키마 및 모델 객체 생성
function createSchema(app, config) {
	var schemaLen = config.db_schemas.length;
	console.log('DB/ 스키마를 생성 및 설정합니다.');
	console.log('DB/ 설정에 정의된 스키마의 수 : %d', schemaLen);
	
	for (var i = 0; i < schemaLen; i++) {
		var curItem = config.db_schemas[i];
		
		// 모듈 파일에서 모듈 불러온 후 createSchema() 함수 호출하기
		var curSchema = require(curItem.file).createSchema(mongoose);
		console.log('DB/ %s 모듈을 불러들인 후 스키마 정의.', curItem.file);
		
		// User 모델 정의
		var curModel = mongoose.model(curItem.collection, curSchema);
		console.log('DB/ %s 컬렉션을 위한 모델 정의.', curItem.collection);
		
		// database 객체에 속성으로 추가
		database[curItem.schemaName] = curSchema;
		database[curItem.modelName] = curModel;
		console.log('DB/ 스키마 이름 [%s], 모델 이름 [%s] 이 database 객체의 속성으로 추가.', curItem.schemaName, curItem.modelName);
	}
	
	app.set('database', database);
	console.log('DB/ database 설정 완료(app 속성 추가 완료)');
	console.log('********************' + '웹 서비스를 시작합니다.' + '********************');
}
 

// database 객체를 module.exports에 할당
module.exports = database;
