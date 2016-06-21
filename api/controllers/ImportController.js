/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


/// Função auxiliar que transforma de um formato 'dd-mm-yyyy' prum Date
function birthday2niver (bday) {
	if(bday != null) {
		return new Date (bday.split ('-').reverse ().join ('-'));
	} else {
		return bday;
	}
}

module.exports = {

		/// Import
	importadados: function (req, res) {
		var bd = req.param ('data');


		//----    USUÁRIOS    ----//
		User.find ().exec (function (err, users) {
			if (err) {
				return res.json ({ error: err });
			}


			var userIdMap = {};

			var usuariosACriar = [];
			bd.users.forEach (function (u) {


				userIdMap[u.login] = u.id;
				
				usuariosACriar.push ({
					login: u.login,
					nome: u.nome,
					senha: u.password,
					birthdate: birthday2niver (u.birthday),
					description: u.bio,
				});
			});
			User.create (usuariosACriar).exec (function (err, usuariosCriados) {
				if (err) {
					return res.json ({ error: err });
				}

				usuariosCriados.forEach (function (u) {

					userIdMap[userIdMap[u.login]] = u.id;
				});
				User.find ().populate (['eu_sigo', 'eu_curti', 'eu_nao_curti']).exec (function (err, usuariosNovos) {
					//----    FOLLOWs    ----//

					bd.follow.forEach (function (f) {

						var quemSegue = usuariosNovos.find (function (u) { return userIdMap[u.login] == f.follower; });

						quemSegue.eu_sigo.add (userIdMap[f.follows]);

						quemSegue.save ();
					});

					//----    GRUPOS    ----//
					var gruposACriar = [];

					var grupoParticipantesMap = {};
					bd.group.forEach (function (pessoa) {
						pessoa.list.forEach (function (g) {
							// mapeia 
							grupoParticipantesMap[g.nome] = g.users;

							gruposACriar.push ({
								nome: g.nome,
								dono: userIdMap[pessoa.id],
							});
						});
					});

					Group.create (gruposACriar).exec (function (err, gruposCriados) {
						if (err) {
							return res.json ({ error: err });
						}
						Group.find ().populate (['dono', 'participantes']).exec (function (err, gruposNovos) {

							gruposCriados.forEach (function (g) {
								var grupoSegue = gruposNovos.find (function (G) { return G.nome == g.nome; });

								grupoSegue.participantes.add (grupoSegue.dono.id);

								grupoSegue.participantes.add (grupoParticipantesMap[g.nome].map (function (u) { return userIdMap[u]; }));
								grupoSegue.save ();
							});

							//----    TWEETS    ----//
							var postsACriar = [];

							var postIdMap = {};
							bd.tweets.forEach (function (t) {

								postIdMap[t.title + t.text] = t.id;

								postsACriar.push ({
									user: userIdMap[t.user],
									title: t.title,
									text: t.text,
									createdAt: t.timestamp,
									updatedAt: t.timestamp,
								});
							});

							Post.create (postsACriar).exec (function (err, postsCriados) {
								if (err) {
									return res.json ({ error: err });
								}
								Post.find ().populate (['quem_curtiu', 'quem_nao_curtiu']).exec (function (err, postsNovos) {
									postsCriados.forEach (function (p) {

										postIdMap[postIdMap[p.titulo + p.conteudo]] = p.id;
									});

									bd.reactions.forEach (function (r) {
										var qualPost = postsNovos.find (function (p) { return p.id == postIdMap[r.tweet]; });
										// like
										if (r.reaction == 1) {
											qualPost.quem_curtiu.add (userIdMap[r.user]);
										}

										else {
											qualPost.quem_nao_curtiu.add (userIdMap[r.user]);
										}

										qualPost.save ();
									});

										return res.json ({ success: 'BD carregado' });

								});
							});
						});
					});
				});
			});
		});
	},
};
