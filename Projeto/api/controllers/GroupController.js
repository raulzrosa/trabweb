/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

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
		Group.create ({nome: nome, dono: dono}).exec (function (erro, createdGroup){
			if (erro){
				return response.json ({erro: erro});
			}
			createdGroup.participantes.add(dono);
			createdGroup.save();
			return response.json ("grupo criado");
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

