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
	 	defaultsTo: 'Sem nome'
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
		  defaultsTo: 'mutante.png'
	},

	grupos:{
		collection: 'group',
		via: 'dono'
	},
	
	grupos_segue: {
		collection: 'group',
		via: 'participantes'
	},

	
	me_segue: {
		collection: 'user',
		via: 'eu_sigo'
	},
	
	eu_sigo: {
		collection: 'user',
		via: 'me_segue',
		dominant: true
	},
	
	ativo : {
		type: 'boolean', 
		defaultsTo: true
	},
	
	eu_curti : {
		collection: 'post',
		via: 'quem_curtiu'
	},
	
	eu_nao_curti : {
		collection: 'post',
		via: 'quem_nao_curtiu'
	}
  }
};

