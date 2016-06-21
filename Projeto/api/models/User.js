/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

attributes: {
	login: {
		type: 'string',
		required: true,
		unique: true
	},
	senha: {
		type: 'string',
		required: true		  
	},
	nome : {
	 	type: 'string',
	 	
	},
	 posts : {
		collection: 'post',
		via: 'user'
	},

	description : {
		type : 'text',
		
	},

	birthdate : {
		type : 'date',
		
	},

	foto: {
		  type: 'string',
		  defaultsTo: 'fofao.jpg'
	},

	grupos:{
		collection: 'group',
		via: 'dono'
	},
	
	grupos_segue: {
		collection: 'group',
		via: 'participantes'
	},

	//follow: {
		//collection: 'user',
		//via: 'id'
	//},
	ativo : {
		type: 'boolean', 
		defaultsTo: true,
	},

  }
};

