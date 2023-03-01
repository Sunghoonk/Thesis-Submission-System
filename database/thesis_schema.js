var utils = require('../utils/utils');

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose) {
	console.log('thesis schema 생성');

	var current = new Date();
	let idx = current.getFullYear() + '_' + current.getMonth() + current.getDay() + '_' + Math.floor(Math.random()*100);
	console.log('index: ' + idx);
	

	// define schema
	var Thesis_Schema = mongoose.Schema({
	    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    updated_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    index: {type: String, index: {unique: false}, 'default': idx},

		// 투고자 정보
	    writer: {type: mongoose.Schema.ObjectId, ref: 'users5'}, 
	    name_kor: {type: String, trim: true, 'default':''},
	    name_eng: {type: String, trim: true, 'default':''},
	    email: {type: String, 'default':''},
	    phone: {type: String, 'default':''},
	    zip: {type: String, trim: true, 'default':''},
	    address: {type: String, trim: true, 'default':''},
	    address_detail: {type: String, trim: true, 'default':''},
		
		// 논문 정보
	    title_kor: {type: String, trim: true, 'default':''},
	    title_eng: {type: String, trim: true, 'default':''},
	    abstract_kor: {type: String, trim:true, 'default': ''},
	    abstract_eng: {type: String, trim:true, 'default': ''},
	    keyword_kor: {type: String, trim:true, 'default': ''},
	    keyword_eng: {type: String, trim:true, 'default': ''},

		// 심사정보
	    reviewer_a:{type: String, 'default':'NAN'},
	    reviewer_b:{type: String, 'default':'NAN'},
	    reviewer_c:{type: String, 'default':'NAN'},
	    state_a:{type: String, 'default':'0'},
	    state_b:{type: String, 'default':'0'},
	    state_c:{type: String, 'default':'0'},
	    request_date: {type: Date, 'default':0},
	    due_date: {type: Number, 'default': -1},
	    state: {type: String, 'default':'심사요청중'},  
		result: {type: String, 'default':'미정'}, 
		
		// 심사 코멘트
	    comments: [{		                                          
	    	writer: {type: mongoose.Schema.ObjectId, ref: 'users5'},
			point: {type: Number, 'default': -1},
	    	contents: {type: String, trim:true, 'default': ''},					
		    judge: {type: String, 'default':'미정'}, 
	    	created_at: {type: Date, 'default': Date.now}
	    }],

		// 투고자 답변
	    depenses: [{		                                          
	    	writer: {type: mongoose.Schema.ObjectId, ref: 'users5'},
	    	contents: {type: String, trim:true, 'default': ''},					
	    	created_at: {type: Date, 'default': Date.now}
	    }],
		
	});

	// 스키마에 인스턴스 메소드 추가
	Thesis_Schema.methods = {
		saveThesis: function(callback) {		
			var self = this;
			
			this.validate(function(err) {
				if (err) return callback(err);
				
				self.save(callback);
			});
		},

		addComment: function(user, comments, callback) {		
			this.comments.push({
				writer: user._id,
				point: comments.point,
				contents: comments.contents,
				judge: comments.judge,
			});
			
			this.save(callback);
		},

		removeComment: function(id, callback) {		
			var index = utils.indexOf(this.comments, {id: id});
			if (~index) {
				this.comments.splice(index, 1);
			} else {
				return callback('ID [' + id + '] 를 가진 댓글 객체를 찾을 수 없습니다.');
			}
			
			this.save(callback);
		}
	}
	

	// 작성자(ObjectID)로 논문 탐색
	Thesis_Schema.static('findById', function(id, callback){
		return this.find({writer : id}, callback);
	});

	// 접수번호(index)로 논문 탐색
	Thesis_Schema.static('findByIndex', function(index, callback){
		return this.find({index : index}, callback);
	});

	// 심사자(reviewer)로 논문 탐색
	Thesis_Schema.static('findByReviewer', function(name, callback){
		return this.find({
			$or: [ {reviewer_a: name}, {reviewer_b: name }, {reviewer_c: name } ] },	
		    callback);
	});

	// 제출된 모든 논문 탐색
	Thesis_Schema.static('findAll', function(callback){
		return this.find({}, callback);
	});

	// 심사위원 정보 업데이트
	Thesis_Schema.static('updateOne', function(index, input, callback){
		return this.update({index : index}, 
			               { reviewer_a: input.rv1, 
							 reviewer_b: input.rv2, 
							 reviewer_c: input.rv3,
						     request_date: input.created_at,
						     due_date: input.due,
						     state: input.state},
			                 callback);
	});

	// 심사 내용 업로드
	Thesis_Schema.static('addComment', function(user, comments, callback) {		// 심사평 추가
			console.log('static. addComment');
			console.log(comments);

			this.comments.push({
				writer: user._id,
				point: comments.point,
				contents: comments.contents,
				judge: comments.judge,
			});
			
			this.save(callback);
			
			return 1
	
	});

	console.log('Thesis_Schema 정의함.');

	return Thesis_Schema;
};

module.exports = SchemaObj;
