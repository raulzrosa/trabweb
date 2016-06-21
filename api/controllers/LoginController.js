/**
 * LoginController
 *
 * @description :: Server-side logic for managing logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	login: function (request, response){
		var userName = request.param("nome");
		var userPassword = request.param ("password");
		User.findOneByLogin(userName, function (erro, user){
			if (erro){
				return response.json({erro: 'não consegui procurar'});
			}
			else if (!user){
				return response.json({erro: 'usuario não encontrado'});
			}
			else if (user.senha != userPassword){
				console.log (user);
				return response.json ({erro: 'senha incorreta'});
			}
			else {
				request.session.userId = user.id;

				return response.json();
			} 
				
		})
	},

	register: function (request, response){
		var userName = request.param("nome");
		var userPassword = request.param ("password");
		User.create ({login: userName, senha: userPassword}).exec(function (erro, user){
			if (erro){
				return response.json ({erro: 'erro ao criar usuário' + erro})
			}
			else {
				console.log ("Usuário criado com sucesso");
				user.save();
				return response.json ("Usuário criado com sucesso");
			}
		});

	},

	getUser: function (request, response){
		User.findOneById (request.session.userId).populate(['posts','grupos_segue','eu_sigo',]).exec (function (erro, user){
			if (erro){
				return response.json ({erro: 'Usuário não encontrado'});
			}
			else{
					return response.json (user);
			}

		})

	},
	getPostSigo: function (request, response) {
		User.findOneById (request.session.userId).populate(['posts','grupos_segue','eu_sigo']).exec (function (erro, user){
			//	console.log(user);
			if (erro){
				return response.json ({erro: 'Usuário não encontrado'});
			}
			else{
				oq_buscar = [{user: user.id},{user: user.eu_sigo.map(function (usuario) {
					return usuario.id;
					}
				)}];
				if(user.grupos_segue.length != 0) {
					oq_buscar.push({text: {contains : user.grupos_segue.map(function(grupo){
						return '@' + grupo.nome;
					})}})
				}
				Post.find({or : oq_buscar, sort: 'updatedAt DESC'}).populate(['user','quem_curtiu','quem_nao_curtiu']).exec(function (erro, todos_post) {
					return response.json (todos_post);
				})
			}

		})
	},
	
	logout : function (request, response){
		request.session.userId = false;
		return response.json();
	},

	completacadastro : function (request, response){
		var nomeCompleto = request.param ('nomecompleto');
		var dtNascimento = request.param ('dtNascimento');
		var descricao = request.param ('desc');

		User.update ({id: request.session.userId}, {nome : nomeCompleto, birthdate : dtNascimento, description : descricao}).exec (function (erro, user){
			if (erro){
				return response.json ({erro: 'Não foi possivel atualizar'});
			}
			else{
				return response.json();
			}
		})
	}

};



