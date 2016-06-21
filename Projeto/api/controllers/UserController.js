/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	saveposts : function (request, response){
		var post = request.param ("posts");
		Post.create ({text: post, user: request.session.userId}).exec (function (erro, postcriado){
			if (erro){
				return response.json ({erro: "Post não foi salvo" + erro});
			}
			else if (!postcriado) {
				return response.json ({erro: "Post não foi criado"});
			}
			else {
				postcriado.save();
				console.log (postcriado);
				return response.json(postcriado);
			}			
				
		});		
		
	},
	retornapost : function (request, response) {
		var id = request.param("id");
		Post.findOne ({id: id}).exec(function (erro, postachado) {
			if (erro){
				return response.json ({erro: "Post não foi achado" + erro});
			}
			else if (!postachado) {
				return response.json ({erro: "Post não foi achado"})
			}
			else {
				return response.json({post: postachado});
			}
		});
	},
	editapost : function (request, response) {
		var text = request.param("text");
		var id = request.param("id");
		Post.update ({id: id},{text: text}).exec(function (erro, postatualizado) {
			if (erro){
				return response.json ({erro: "Post não foi atualizado" + erro});
			}
			else if (!postatualizado[0]) {
				return response.json ({erro: "Post não foi atualizado"})
			}
			else {
				return response.json();
			}
		});
	},
	
	deletapost : function(request, response){
		var id = request.param("id");
		Post.destroy({id:id}).exec(function(erro, deletedPost){
			if (erro){
					return response.json ({erro: erro});
				}
			
			return response.json ("post deletado");	
		})
	},
	
	listausers : function (request, response){
		User.find({ativo:true}).exec (function(erro, usersAtivos){
			if (erro){
				return response.json ({erro: 'nenhum user foi encontrado'});
			}
			return response.json (usersAtivos);
		})

	},
	
	acharusuario : function (request, response) {
		var id = request.param("id");
		User.findOne ({id: id}).populate ('grupos_segue').exec(function (erro, usuarioachado) {
			if (erro){
				return response.json ({erro: "Usuario não foi achado" + erro});
			}
			else if (!usuarioachado) {
				return response.json ({erro: "Usuario não foi achado"})
			}
			else {
				return response.json(usuarioachado);
			}
		});
	}
};

