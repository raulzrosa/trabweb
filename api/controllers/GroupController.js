/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	associarPessoa : function (request, response) {
		var login = request.param("login");
		var id = request.param("id");
		
		User.findOne({login:login}).exec (function(erro, user) {
			if(erro) {
				return response.json({erro: erro});
			}
			else if (!user) {
				return response.json({erro: 'Usuário Inexistente '});
			}
			else {
				Group.findOne({id:id}).exec (function (erro, grupo) {
					if(erro) {
						return response.json({erro: erro});
					}
					else if (!grupo) {
						return response.json({erro: 'Grupo Inexistente '});
					}
					else {
						grupo.participantes.add(user.id);
						grupo.save (function (erro) {
							if(erro) {
								return response.json({erro: 'Usuario ja esta associado!'});
							}
							return response.json ({sucess: 'Usuario adicionado', user : user});
						});
						
					}
				});
			}
		});
	},
	
	desassociargrupo : function (request, response) {
		var login = request.param("login");
		var id = request.param("id");
		var user = request.session.userId;
		Group.findOne ({id: id}).exec (function (erro, grupo) {
			if(erro) {
				return response.json ({ erro: erro});
			}
			else if (!grupo) {
				return response.json ({ erro:"Grupo não existe!"});
			}
			else if (grupo.dono = user) {
				
				return response.json ({ erro:"Você nao pode sair de um grupo que é dono!"});
			}
			else {
				grupo.participantes.remove (user);
				grupo.save (function (erro) {
					if(erro) {
						return response.json ({ erro: erro});
					}
					return response.json ({success: 'Você saiu do grupo!'});
				});
			}
		});
	},
	
	achargrupo : function (request, response) {
		var id = request.param("id");
		Group.findOne({id:id}).populate ('participantes').exec (function(erro, grupoAchado) {
			if (erro){
				return response.json ({erro: 'grupo não encontrado'});
			}
			else if(!grupoAchado) {
				return response.json ({erro: "Post não foi achado"})	
			}
			return response.json (grupoAchado);
		})
	},
	pegaGrupos : function (request, response){
		Group.find({ativo:true}).populate ('participantes').exec (function(erro, gruposAtivos){
			if (erro){
				return response.json ({erro: 'nenhum grupo encontrado'});
			}
			return response.json (gruposAtivos);
		})
	},
	
	criaGrupo : function (request, response){
		var dono = request.session.userId;
		var nome = request.param ("nome");
		if (!nome){
			return response.json ({erro: "grupo precisa de um nome"});
		}
		Group.findOne ({ nome: nome }).exec (function (erro, grupo) {
			if (grupo) {
				return response.json ({ erro: 'Grupo "' + nome + '" já existe!' });
			}
			else {
				Group.create ({nome: nome, dono: dono}).exec (function (erro, createdGroup){
					if (erro){
						return response.json ({erro: erro});
					}
					createdGroup.participantes.add(dono);
					createdGroup.save();
					return response.json ("grupo criado");
				})
			}
		})
	},
	
	deletagrupo: function(request, response){
		
		var dono = request.session.userId;
		var nome = request.param ("nome");
		
		if (!nome){
			return response.json ({erro: "Digite um grupo válido!"});
		}
		Group.destroy({nome:nome, dono:dono, ativo:true}).exec(function(erro, deletedGroup){
			if (erro){
				return response.json ({erro: erro});
			}
			
			return response.json ("grupo deletado");
		})
	}

		
};

