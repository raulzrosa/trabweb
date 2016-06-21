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
		User.find().exec (function(erro, usersAtivos){
			if (erro){
				return response.json ({erro: 'nenhum user foi encontrado'});
			}
			return response.json (usersAtivos);
		})

	},
	
	acharusuario : function (request, response) {
		var login = request.param("login");
		User.findOne ({login: login}).populate (['grupos_segue', 'me_segue','eu_sigo','eu_curti','eu_nao_curti']).exec(function (erro, usuarioachado) {
			if (erro){
				return response.json ({erro: "Usuario não foi achado" + erro});
			}
			else if (!usuarioachado) {
				return response.json ({erro: "Usuario não foi achado"})
			}
			Post.find({user: usuarioachado.id}).populate(['quem_curtiu','quem_nao_curtiu']).exec(function (erro, posts) {
				if (erro){
					return response.json ({erro: 'nenhum post foi encontrado'});
				}
				
				return response.json ({usuario: usuarioachado, posts: posts});
			});

		});
	},
	
	deletauser: function(request, response){
		var id = request.session.userId;
		User.destroy({id: id}).exec(function(erro){	
			if (erro){
				return response.json ({erro: erro});
			}
			Group.destroy ({ dono: id }).exec (function (erro) {
				if (erro) {
					response.json ({ erro: erro});
				}
				Post.destroy ({ user: id }).exec (function (erro) {
					if (erro) {
						response.json ({ erro: erro});
					}
					
					return response.json ("usuario deletado");
				});
			});
		});
	},
	
	segueusuario: function(request, response){
		var meu_id = request.session.userId;
		var vou_seguir = request.param("vou_seguir");
		
		User.findOne({login: vou_seguir}).exec (function (erro, usuario) {
			if(erro) {
				return response.json({erro: erro});
			}
			else if (!usuario) {
				return response.json({erro: 'Usuario Inexistente!'});
			}
			else {
				if(meu_id == usuario.id) {
					return response.json({erro: 'Você não pode seguir a si mesmo!'});
				}
				else {
					usuario.me_segue.add(meu_id);
					usuario.save (function (erro) {
						if(erro) {
							return response.json({erro: 'Usuario ja esta seguindo!'});
						}
						return response.json ({sucess: 'Seguindo perfil!', usuario : usuario});
					});	
				}				
			}
		});
	},

	parardeseguirusuario: function(request, response){
		var meu_id = request.session.userId;
		var vou_desseguir = request.param("vou_desseguir");
		
		User.findOne({login: vou_desseguir}).exec (function (erro, usuario) {
			if(erro) {
				return response.json({erro: erro});
			}
			else if (!usuario) {
				return response.json({erro: 'Usuario Inexistente!'});
			}
			else {
				usuario.me_segue.remove(meu_id);
				usuario.save (function (erro) {
					if(erro) {
						return response.json({erro: 'Usuario já não está seguindo!'});
					}
					return response.json ({sucess: 'Parou de seguir!', usuario : usuario});
				});		
			}
		});
	},
	
	curtirpost : function(request, response) {
		var find_by_id = function(lista, id){
			for (var i in lista){
				if (lista[i].id == id)
					return i;
			}
			return -1;
		}
		
		var eu_curti = request.param("eu_curti");
		var meu_id = request.session.userId;
		
		Post.findOne({id : eu_curti}).populate(["quem_curtiu","quem_nao_curtiu"]).exec (function (erro, post) {
			if(erro) {
				return response.json({erro: erro});
			}
			else if(!post) {
				return response.json({erro: 'Post Não existe!'});
			}
			else {
				if(find_by_id(post.quem_curtiu, meu_id) == -1) {
					post.quem_curtiu.add(meu_id);
				}
				if(find_by_id(post.quem_nao_curtiu, meu_id) > -1 ) {
					post.quem_nao_curtiu.remove(meu_id);
				}
				post.save (function (erro) {
					if(erro) {
						return response.json({erro: 'Você já curtiu esse post!'});
					}
					Post.findOne({id : eu_curti}).populate(["quem_curtiu","quem_nao_curtiu"]).exec (function (erro, post) {
						return response.json ({quem_curtiu: post.quem_curtiu,quem_nao_curtiu: post.quem_nao_curtiu});
					});
				});		
			}
		})
	},
	
	descurtirpost : function(request, response) {
		var find_by_id = function(lista, id){
			for (var i in lista){
				if (lista[i].id == id)
					return i;
			}
			return -1;
		}
		
		var eu_nao_curti = request.param("eu_nao_curti");
		var meu_id = request.session.userId;
		Post.findOne({id : eu_nao_curti}).populate(["quem_curtiu","quem_nao_curtiu"]).exec (function (erro, post) {

			if(erro) {
				return response.json({erro: erro});
			}
			else if(!post) {
				return response.json({erro: 'Post Não existe!'});
			}
			else {
				if(find_by_id(post.quem_nao_curtiu, meu_id) == -1) {
					post.quem_nao_curtiu.add(meu_id);
				}
				if(find_by_id(post.quem_curtiu, meu_id) > -1) {
					post.quem_curtiu.remove(meu_id);
				}
				post.save (function (erro) {
					if(erro) {
						return response.json({erro: 'Você já não curte esse post!'});
					}
					Post.findOne({id : eu_nao_curti}).populate(["quem_curtiu","quem_nao_curtiu"]).exec (function (erro, post) {
						return response.json ({quem_curtiu: post.quem_curtiu,quem_nao_curtiu: post.quem_nao_curtiu});
					});
				});		
			}
		})
	}
};

