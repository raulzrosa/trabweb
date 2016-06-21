var async = require("async");

/// Função auxiliar que transforma de um Date completo pro formato 'dd-mm-yyyy'
function niver2birthday (niver) {
	if(niver  != null) {
		var valores = [niver.getUTCDate (), niver.getUTCMonth () + 1, niver.getUTCFullYear ()];
		return valores.join ('-');
	}
	else {
		return niver;
	}
}

module.exports = {
	exportadados : function (request, response){

		var exporte = {};
		var follow = [];
		var tweets = [];
		var reactions = [];
		var timestamp = new Date ();
		var group = [];

		var usuarios = function(results) {
			exporte.users = results.users.map (function (usuario) {
				usuario.eu_sigo.forEach (function (sigo) {
					follow.push ({
						id: follow.length + 1,
						follower: usuario.id,
						follows: sigo.id,
						timestamp: timestamp,
					});
				});
				return {
					id: usuario.id,
					nome: usuario.nome,
					login: usuario.login,
					password: usuario.senha,
					birthday: niver2birthday (usuario.birthdate),
					bio: usuario.description,
				};
			});
		}
		exporte.follow = follow;

		var postes = function(results) {

			results.posts.forEach (function (post) {
				tweets.push ({
					id: post.id,
					user: post.user,
					title: post.titulo,
					text: post.text,
					timestamp: post.updatedAt,
				});
				post.quem_curtiu.forEach (function (curtiu) {
					reactions.push ({
						tweet: post.id,
						user: curtiu.id,
						reaction: 1,
						timestamp: timestamp,
					});
				});
				post.quem_nao_curtiu.forEach (function (nao_curtiu) {
					reactions.push ({
						tweet: post.id,
						user: nao_curtiu.id,
						reaction: 0,
						timestamp: timestamp,
					});
				});
			});
			exporte.tweets = tweets;
			exporte.reactions = reactions;

		}

		var gruposos = function(results) {
			results.groups.forEach (function (grupo) {
				var grupoRetorno = group.find (function (GRUPAO) {
					return GRUPAO.id == grupo.dono.id;
				});
				if (!grupoRetorno) {
					grupoRetorno = {
						id: grupo.dono.id,
						list: [],
					};
					group.push (grupoRetorno);
				}

				grupoRetorno.list.push ({
					nome: grupo.nome,
					users: grupo.participantes.map (function (user) { return user.id; }),
					relativeId: grupo.id,
				});
			});

			exporte.group = group;
		}

		 async.auto(
		  {
			users: function(callback){ User.find().populate('eu_sigo').exec(function (err, data) {callback(null, data)})},
			posts: function(callback){ Post.find().populate(['user','quem_curtiu','quem_nao_curtiu']).exec(function (err, data) {callback(null, data)})},
			groups: function(callback){ Group.find().populate(['participantes','dono']).exec(function (err, data) {callback(null, data)})},
		  },
		  function(err, results){
		    if (err) throw err;
		    usuarios(results);
		    postes(results);
		    gruposos(results);
		    response.set ('Content-Type', 'application/json');
			response.set ('Content-Disposition', 'attachment');
			return response.send (exporte);
	      })

	}
};	