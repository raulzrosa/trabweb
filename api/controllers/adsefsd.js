/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/// Função auxiliar que transforma de um Date completo pro formato 'dd-mm-yyyy'
function niver2birthday (niver) {
	var valores = [niver.getUTCDate (), niver.getUTCMonth () + 1, niver.getUTCFullYear ()];
	return valores.join ('-');
}

/// Função auxiliar que transforma de um formato 'dd-mm-yyyy' prum Date
function birthday2niver (bday) {
	return new Date (bday.split ('-').reverse ().join ('-'));
}

/// Controlador pra importação/exportação de dados
module.exports = {

	/// Import
	carregaBD: function (req, res) {
		var bd = req.param ('bd');
		if (!bd) {
			return res.json ({ error: 'Necessito de dados para importação' });
		}

		// verificação de campos
		if (!bd.users) {
			return res.json ({ error: 'Falta campo "users" no json'});
		}
		if (!bd.follow) {
			return res.json ({ error: 'Falta campo "follow" no json'});
		}
		if (!bd.group) {
			return res.json ({ error: 'Falta campo "group" no json'});
		}
		if (!bd.tweets) {
			return res.json ({ error: 'Falta campo "tweets" no json'});
		}
		if (!bd.reactions) {
			return res.json ({ error: 'Falta campo "reactions" no json'});
		}
		if (!bd.share) {
			return res.json ({ error: 'Falta campo "share" no json'});
		}

		//----    USUÁRIOS    ----//
		User.find ().exec (function (err, users) {
			if (err) {
				return res.json ({ error: err });
			}

			// objeto que mapeia id de usuário do JSON pra id real no BD
			var userIdMap = {};
			// lista de usuários a serem criados
			var usuariosACriar = [];
			bd.users.forEach (function (u) {
				// verifica se já existe usuário com mesmo apelido
				if (users.find (function (U) { return u.login == U.apelido; })) {
					return res.json ({ error: 'Já existe usuário de apelido "' + u.login + '"' });
				}

				// salva ID no login do usuário, pro mapeamento de ID
				// mapeia 'userJSON.apelido → userJSON.id'
				userIdMap[u.login] = u.id;
				
				usuariosACriar.push ({
					apelido: u.login,
					nome: u.nome,
					senha: u.password,
					niver: birthday2niver (u.birthday),
					descricao: u.bio,
				});
			});
			User.create (usuariosACriar).exec (function (err, usuariosCriados) {
				if (err) {
					return res.json ({ error: err });
				}

				usuariosCriados.forEach (function (u) {
					// mapeia 'userJSON.id → userBD.id'
					userIdMap[userIdMap[u.apelido]] = u.id;
				});
				User.find ().populate (['segue_pessoa', 'post_que_curti', 'post_que_odiei']).exec (function (err, usuariosNovos) {
					//----    FOLLOWs    ----//
					// insere seguidas
					bd.follow.forEach (function (f) {
						// acha quem segue (mapeando os ID)
						var quemSegue = usuariosNovos.find (function (u) { return userIdMap[u.apelido] == f.follower; });
						// adiciona a seguida (mapeando os ID, claro)
						quemSegue.segue_pessoa.add (userIdMap[f.follows]);
						// e salva no BD
						quemSegue.save ();
					});

					//----    GRUPOS    ----//
					var gruposACriar = [];
					// mapa de 'grupoJSON.nome → grupoJSON.users'
					var grupoMlkdaMap = {};
					bd.group.forEach (function (pessoa) {
						pessoa.list.forEach (function (g) {
							// mapeia 
							grupoMlkdaMap[g.nome] = g.users;

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
						Group.find ().populate (['dono', 'mlkda']).exec (function (err, gruposNovos) {
							// adiciona mlkda no grupo
							gruposCriados.forEach (function (g) {
								var grupoSegue = gruposNovos.find (function (G) { return G.nome == g.nome; });
								// adiciona o dono do grupo =]
								grupoSegue.mlkda.add (grupoSegue.dono.id);
								// e adiciona a mlkda do JSON
								grupoSegue.mlkda.add (grupoMlkdaMap[g.nome].map (function (u) { return userIdMap[u]; }));
								grupoSegue.save ();
							});

							//----    TWEETS    ----//
							var postsACriar = [];
							// igual o userIdMap, mas pra posts
							var postIdMap = {};
							bd.tweets.forEach (function (t) {
								// mapeia por 'título + conteúdo', porque é o melhor jeito...
								// (menor chance de colisão)
								postIdMap[t.title + t.text] = t.id;

								postsACriar.push ({
									user: userIdMap[t.user],
									titulo: t.title,
									conteudo: t.text,
									createdAt: t.timestamp,
									updatedAt: t.timestamp,
								});
							});

							Post.create (postsACriar).exec (function (err, postsCriados) {
								if (err) {
									return res.json ({ error: err });
								}
								Post.find ().populate (['curtiu', 'odiou']).exec (function (err, postsNovos) {
									postsCriados.forEach (function (p) {
										// mapeia 'postJSON.id → postBD.id'
										postIdMap[postIdMap[p.titulo + p.conteudo]] = p.id;
									});

									bd.reactions.forEach (function (r) {
										var qualPost = postsNovos.find (function (p) { return p.id == postIdMap[r.tweet]; });
										// like
										if (r.reaction == 1) {
											qualPost.curtiu.add (userIdMap[r.user]);
										}
										// dislike
										else {
											qualPost.odiou.add (userIdMap[r.user]);
										}

										qualPost.save ();
									});

									//----    SHARE    ----//
									var repostsACriar = [];
									bd.share.forEach (function (t) {
										// repost, põe nada (vai rolar 't.repost' quiapoco)
										repostsACriar.push ({
											user: userIdMap[t.user],
											repost: postIdMap[t.tweet],
											createdAt: t.timestamp,
											updatedAt: t.timestamp,
										});
									});
									Post.create (repostsACriar).exec (function (err, repostsCriados) {
										if (err) {
											return res.json ({ error: err });
										}

										return res.json ({ success: 'BD carregado' });
									});
								});
							});
						});
					});
				});
			});
		});
	},
};