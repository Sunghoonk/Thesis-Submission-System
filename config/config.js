module.exports = {
	server_port: 3000,
	// db_url: 'mongodb://localhost:27017/local',
	db_url: 'mongodb://svc.sel3.cloudtype.app:30992',
	db_schemas: [
	    {file:'./user_schema', collection:'users5', schemaName:'UserSchema', modelName:'UserModel'},
	    {file:'./thesis_schema', collection:'thesis', schemaName:'ThesisSchema', modelName:'ThesisModel'}
	],
	route_info: [

	    /* User.js */
	    {file:'./user', path:'/process/login', method:'login', type:'post'}	// user.login 
	    ,{file:'./user', path:'/process/adduser', method:'adduser', type:'post'} // user.adduser 
	    ,{file:'./user', path:'/process/listuser', method:'listuser', type:'post'} // user.listuser 

		/* Thesis.js */
        ,{file:'./thesis', path:'/process/add_thesis', method:'add_thesis', type:'post'}
        ,{file:'./thesis', path:'/process/show_thesis', method:'show_thesis', type:'get'}
        ,{file:'./thesis', path:'/process/list_thesis', method:'list_thesis', type:'post'}
        ,{file:'./thesis', path:'/process/list_thesis', method:'list_thesis', type:'get'}
        ,{file:'./thesis', path:'/process/listAll_thesis', method:'listAll_thesis', type:'post'}
        ,{file:'./thesis', path:'/process/listAll_thesis', method:'listAll_thesis', type:'get'}
        ,{file:'./thesis', path:'/process/eval_thesis', method:'eval_thesis', type:'post'}
        ,{file:'./thesis', path:'/process/edit_thesis', method:'edit_thesis', type:'post'}
        ,{file:'./thesis', path:'/process/add_reviewer', method:'add_reviewer', type:'post'}
        ,{file:'./thesis', path:'/process/add_comments', method:'add_comments', type:'post'}
	]
}
