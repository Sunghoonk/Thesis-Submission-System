// html-entities module is required in showpost.ejs
var Entities = require('html-entities').AllHtmlEntities;

var add_thesis = function(req, res) {
	console.log('thesis 모듈 안에 있는 add_thesis 호출.');
 
	var param_writer = req.user.email;

    var param_name_kor = req.body.name_kor || req.query.name_kor;
    var param_name_eng = req.body.name_eng || req.query.name_eng;
    var param_depart = req.body.department || req.query.department;
    var param_email = req.body.email || req.query.email;
    var param_phone = req.body.phone || req.query.phone;
    var param_zip = req.body.zip || req.query.zip;
    var param_address = req.body.address || req.query.address;
    var param_address_detail = req.body.address_detail || req.query.address_detail;
	
    var param_title_kor = req.body.title_kor || req.query.title_kor;
    var param_title_eng = req.body.title_eng || req.query.title_eng;
    var param_abstract_kor = req.body.abstract_kor || req.query.abstract_kor;
    var param_abstract_eng = req.body.abstract_eng || req.query.abstract_eng;
    var param_keyword_kor = req.body.keyword_kor || req.query.keyword_kor;
    var param_keyword_eng = req.body.keyword_eng || req.query.keyword_eng;
	
    console.log('req 요청');
    
	var database = req.app.get('database');
	
	if (database.db) {
		
		database.UserModel.findByEmail(param_writer, function(err, results) {
			if (err) {
                console.error('[ERROR] 논문 업로드 과정에서 에러가 발생했습니다. : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2> 논문 업로드 과정에서 에러가 발생했습니다. </h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }

			if (results == undefined || results.length < 1) {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>회원(writer) [' + param_writer + '] 을 찾을 수 없습니다.</h2>');
				res.end();
				
				return;
			}
			
			var userObjectId = results[0]._doc._id;
			console.log('사용자 ObjectId : ' + param_writer +' -> ' + userObjectId);
			
			// save()로 저장
			// ThesisModel 인스턴스 생성
			var Thesis = new database.ThesisModel({

				writer: userObjectId,
	    		name_kor: param_name_kor,
	    		name_eng: param_name_eng,
	    		email: param_email,
	    		phone: param_phone,
	    		zip: param_zip,
	    		address: param_address,
	    		address_detail: param_address_detail,
		
	    		title_kor: param_title_kor,
	    		title_eng: param_title_eng,
	    		abstract_kor: param_abstract_kor,
	    		abstract_eng: param_abstract_eng,
	    		keyword_kor: param_keyword_kor,
	    		keyword_eng: param_keyword_eng

			});

			Thesis.saveThesis(function(err, result) {
				if (err) {
                    if (err) {
                        console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                }
				
			    console.log("투고된 논문을 성공적으로 DB에 저장하였습니다.");
			    console.log('Thesis ObjectID : ' + Thesis._id);
			    
			});

				req.app.render('upload_file', function(err, html) {
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
		
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};

var eval_thesis = function(req, res) {
	console.log('thesis 모듈 안에 있는 eval_thesis 호출.');
 
	var param_writer = req.user.email;
    
    // URL 파라미터로 전달됨
    var paramId = req.body.item;

    // 요청 파라미터: thesis index
    console.log(paramId);

	var database = req.app.get('database');
	
	if (database.db) {
		
		// findByIndex
		database.ThesisModel.findByIndex(paramId, function(err, results) {
			if (err) {
                console.error('심사 과정에서 에러가 발생했습니다. : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2> 심사 과정에서 에러가 발생했습니다. </h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }

			if (results) {
				console.log(results);
				console.log(results[0].index);
  
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				// 뷰 템플릿을 통해  렌더링 후 전송
				
				var date_ = results[0].created_at.getFullYear() + '-' + results[0].created_at.getMonth() + '-' + results[0].created_at.getDate();
				var r_date_ = results[0].request_date.getFullYear() + '-' + results[0].request_date.getMonth() + '-' + results[0].request_date.getDate();

				var context = {
					index: results[0].index,
			 		date: date_,
			 		title: results[0].title_kor,
			 		request_date: r_date_,
			 		state: results[0].state,
			 		result: results[0].result
				};
				
				req.app.render('eval_thesis', context, function(err, html) {
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
			 
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회  실패</h2>');
				res.end();
			}
		});
			
		
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};

var show_thesis = function(req, res) {
	console.log('thesis 모듈 안에 있는 show_thesis 호출');
  
    // URL 파라미터로 전달됨
    var paramId = req.user._id;

    // 요청 파라미터: ObjectId  
    console.log('요청 파라미터 : ' + paramId);
    
    
	var database = req.app.get('database');
	
	if (database.db) {

		database.ThesisModel.findById(paramId, function(err, results) {
			if (err) {
                console.error('논문 조회 중 에러가 발생했습니다.: ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회 중 에러가 발생했습니다.</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
			if (results) {
				console.log(results);
				console.log(results[0].index);
  
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				// 뷰 템플릿을 통해  렌더링 후 전송
				/*
				var context = {
					title: '논문 조회 ',
					posts: results,
					Entities: Entities
				};
				*/
				
				var date_ = results[0].created_at.getFullYear() + '-' + results[0].created_at.getMonth() + '-' + results[0].created_at.getDate();
				var r_date_;

				if(results[0].request_date.getMonth() == 0){
					r_date_ = "미정"

				}else{
					r_date_ = results[0].request_date.getFullYear() + '-' + results[0].request_date.getMonth() + '-' + results[0].request_date.getDate();
				}

				var context = {
					index: results[0].index,
			 		date: date_,
			 		title: results[0].title_kor,
			 		request_date: r_date_,
			 		state: results[0].state,
			 		result: results[0].result
				};
				
				req.app.render('show_thesis', context, function(err, html) {
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
			 
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회  실패</h2>');
				res.end();
			}
		});
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};

var list_thesis = function(req, res) {
	console.log('thesis 모듈 안에 있는 list_thesis 호출');
  
    console.log('심사 가능한 논문 조회');

    // 요청 파라미터: name
    var param_name = req.user.name;

	var database = req.app.get('database');
	
    // 데이터베이스 객체가 초기화된 경우
	if (database.db) {
		
		database.ThesisModel.findByReviewer(param_name, function(err, results) {
			if (err) {
                console.error('논문 목록 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 목록 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
			if (results) {
				console.log(results);

					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					
					// 뷰 템플레이트를 이용하여 렌더링한 후 전송
					var context = {
						title: '논문 조회 ',
						posts: results
					};
					
					req.app.render('list_thesis', context, function(err, html) {
                        if (err) {
                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                            res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();
							
							return;
                        }
                        
						res.end(html);
					});
					
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 목록 조회  실패</h2>');
				res.end();
			}
		});

	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};

var listAll_thesis = function(req, res) {
	console.log('thesis 모듈 안에 있는 listAll_thesis 호출');
  
    // 요청 파라미터: ObjectId  
    console.log('모든 논문 조회');

	var database = req.app.get('database');
	
    // 데이터베이스 객체가 초기화된 경우
	if (database.db) {
		
        console.log('호출 1');
		database.ThesisModel.findAll(function(err, results) {
        	console.log('호출 2');
			if (err) {
                console.error('논문 목록 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 목록 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
			if (results) {
				console.log(results);
 

					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					
					// 뷰 템플레이트를 이용하여 렌더링한 후 전송
					var context = {
						title: '논문 조회 ',
						posts: results
					};
					
					req.app.render('listAll_thesis', context, function(err, html) {
                        if (err) {
                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                            res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();
							
							return;
                        }
                        
						res.end(html);
					});
					
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 목록 조회  실패</h2>');
				res.end();
			}
		});

	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};

var edit_thesis = function(req, res) {
	console.log('thesis 모듈 안에 있는 edit_thesis 호출');
  
    // URL 파라미터로 전달됨
    var paramId = req.body.item;

    // 요청 파라미터: thesis index
    console.log(paramId);
    
    
	var database = req.app.get('database');
	
	if (database.db) {

		// findByIndex
		database.ThesisModel.findByIndex(paramId, function(err, results) {
			if (err) {
                console.error('논문 편집 중 에러가 발생했습니다.: ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 편집 중 에러가 발생했습니다.</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
			if (results) {
				console.log(results);
				console.log(results[0].index);
  
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				// 뷰 템플릿을 통해  렌더링 후 전송
				
				var date_ = results[0].created_at.getFullYear() + '-' + results[0].created_at.getMonth() + '-' + results[0].created_at.getDate();
				var r_date_ = results[0].request_date.getFullYear() + '-' + results[0].request_date.getMonth() + '-' + results[0].request_date.getDate();

				var context = {
					index: results[0].index,
			 		date: date_,
			 		title: results[0].title_kor,
			 		request_date: r_date_,
			 		state: results[0].state,
			 		result: results[0].result
				};
				
				req.app.render('edit_thesis', context, function(err, html) {
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
			 
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회  실패</h2>');
				res.end();
			}
		});
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};

var add_reviewer = function(req, res) {
	console.log('thesis 모듈 안에 있는 add_reviewer 호출.');
	console.log(req.body);
 
    var param_index = req.body.index;
    var param_A = req.body.reviewer_A;
    var param_B = req.body.reviewer_B;
    var param_C = req.body.reviewer_C;
    var param_due = req.body.due;
	var state_ = "심사중";
	
	var cur_date = Date.now();
	var params = { rv1: param_A, rv2: param_B, rv3: param_C, created_at: cur_date, due: param_due, state: state_ };
    
	var database = req.app.get('database');
	
	if (database.db) {
		
		// update
		database.ThesisModel.updateOne(param_index, params, function(err, results) {
			if (err) {
                console.error('심사위원 추가 과정에서 에러가 발생했습니다. : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>심사위원 추가 과정에서 에러가 발생했습니다. </h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }

			if (results) {
				console.log(results);
				console.log('심사위원 정보를 성공적으로 업데이트하였습니다.');
 
			 
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회 실패</h2>');
				res.end();
			}
		});
		
		// findByIndex -> show
		database.ThesisModel.findByIndex(param_index, function(err, results) {
			if (err) {
                console.error('논문 조회 중 에러가 발생했습니다.: ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회 중 에러가 발생했습니다.</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
			if (results) {
				console.log(results);
				console.log(results[0].index);
  
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				var date_ = results[0].created_at.getFullYear() + '-' + results[0].created_at.getMonth() + '-' + results[0].created_at.getDate();
				var r_date_ = results[0].request_date.getFullYear() + '-' + results[0].request_date.getMonth() + '-' + results[0].request_date.getDate();

				console.log(results[0].request_date);

				var context = {
					index: results[0].index,
			 		date: date_,
			 		title: results[0].title_kor,
			 		request_date: r_date_,
			 		state: results[0].state,
			 		result: results[0].result
				};
				
				req.app.render('edit_success', context, function(err, html) {
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
			 
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회  실패</h2>');
				res.end();
			}
		});

	}	
};

var add_comments = function(req, res) {
	console.log('thesis 모듈 안에 있는 add_comments 호출.');
	console.log(req.user);
	console.log(req.body);
 
    var param_index = req.body.index;
    var param_point = req.body.point;
    var param_contents = req.body.contents;
    var param_judge = req.body.judge;
	
	var params = {
		           point: param_point,
		           contents: param_contents,
		           judge: param_judge,
				 };

	var database = req.app.get('database');
	console.log(database.ThesisModel.comments);

	if (database.db) {
	    console.log('database.db 호출');
		
		
		// findByIndex
		database.ThesisModel.findByIndex(param_index, function(err, results) {
			if (err) {
                console.error('논문 조회 중 에러가 발생했습니다.: ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회 중 에러가 발생했습니다.</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
			if (results) {
  
			// push comment
			results[0].comments.push({
				writer: req.user._id,
				point: param_point,
				contents: param_contents,
				judge: param_judge,
			});

			results[0].save();

			console.log(results[0]);
			console.log(typeof(results[0]));

			let keysOfresult = [ "_id", "index", "writer", "name_kor", "name_eng", "email", "phone", "zip", "address", "address_detatil", "title_kor", "title_eng", "abstract_korea", "abstravt_eng", "keyword_kor", "keyword_end", "reviewer_a", "reviewer_b", "reviewer_c", "state_a", "state_b", "state_c", "request_date", "due_date", "result", "created_at", "updated_at", "comments", "depenses", "_v"];
			console.log(keysOfresult);

			var key = keysOfresult.find((key) => results[0][key] == req.user.name); // state_a
			console.log(key);

			var i = "state_" + key.slice(-1)
			console.log(i);
		
			results[0][i] = "1";

				//
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				var date_ = results[0].created_at.getFullYear() + '-' + results[0].created_at.getMonth() + '-' + results[0].created_at.getDate();
				var r_date_ = results[0].request_date.getFullYear() + '-' + results[0].request_date.getMonth() + '-' + results[0].request_date.getDate();

				console.log(results[0].request_date);

				var context = {
					index: results[0].index,
			 		date: date_,
			 		title: results[0].title_kor,
			 		request_date: r_date_,
			 		state: results[0].state,
			 		result: results[0].result
				};
				
				req.app.render('eval_success', context, function(err, html) {
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
			 
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>논문 조회  실패</h2>');
				res.end();
			}
		});
		

	}	
};

module.exports.add_thesis = add_thesis;
module.exports.show_thesis = show_thesis;
module.exports.list_thesis = list_thesis;
module.exports.listAll_thesis = listAll_thesis;
module.exports.edit_thesis = edit_thesis;
module.exports.eval_thesis = eval_thesis;
module.exports.add_reviewer = add_reviewer;
module.exports.add_comments = add_comments;
