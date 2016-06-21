var app = angular.module ('myapp', ['ngRoute', 'ngSanitize']);
//Essa é a rota do angular
app.config(function ($routeProvider ){
	$routeProvider.when ('/', {
		templateUrl: '/templates/login.html'
	});	
	$routeProvider.when ('/home', {
		templateUrl: '/templates/index.html'
	});
	$routeProvider.when ('/cadastro', {
		templateUrl: '/templates/cadastro.html'
	});
	$routeProvider.when ('/groups', {
		templateUrl: '/templates/groups.html'
	});
	$routeProvider.when ('/gruposcadastrados', {
		templateUrl: '/templates/gruposcadastrados.html'
	});
	$routeProvider.when ('/editaPost/:idPost', {
		templateUrl: '/templates/editapost.html'
	});
	$routeProvider.when ('/usuarioscadastrados', {
		templateUrl: '/templates/usuarioscadastrados.html'
	});
	$routeProvider.when ('/grupo/:id', {
		templateUrl: '/templates/paginagrupo.html'
	});
	$routeProvider.when ('/usuario/:login', {
		templateUrl: '/templates/paginausuario.html'
	});
	$routeProvider.when ('/paginaexport', {
		templateUrl: '/templates/paginaexport.html'
	});
	
})

app.controller ('exibiPaginaGrupoController', function ($scope, $routeParams, $http, $location) {
	
	$scope.$on("deu_bom",function(){
		$http.post ("/acharGrupo", {id: $routeParams.id}).then (function (response) {
			if (response.data.erro){
				alert ("Erro: " + response.data.erro);
			}
			else {				
				$scope.grupo = response.data;
				if($scope.user.grupos_segue.find(function(grupo){
					return grupo.id == $routeParams.id;
				})) $scope.to_participando = true;
				else {
					$scope.to_participando = false;
				}
			}
		})
	});
	$scope.associarGrupo = function(login){
		$http.post ("/associargrupo", {login : login, id : $routeParams.id}).then(function (response){
			if (response.data.erro){
				$scope.error = response.data.error;
				$scope.success = false;
				alert ("Erro: " + response.data.erro);
			}
			else {				
				$scope.grupo.participantes.push(response.data.user);
				$location.path('/gruposcadastrados');
			}
		})
	}
		
	$scope.desassociarGrupo = function(login, grupo){
		$http.post ("/desassociarGrupo", {login : login, id : $routeParams.id}).then (function (response) {
			if(response.data.erro) {
				alert ("Erro: " + response.data.erro);
			}
			else {
				var participantes = $scope.grupo.participantes;
				participantes.splice (participantes.findIndex (function (user) { return user.id == $scope.user.id}),1);
				$location.path('/gruposcadastrados');
			}
		})
	}
})

app.controller ('exibiPaginaUsuarioController', function ($scope, $routeParams, $http, $location,$rootScope, $route) {
	$scope.$on("deu_bom",function(){
		$http.post ("/acharUsuario", {login: $routeParams.login}).then (function (response) {
			if (response.data.erro){
				alert ("Erro: " + response.data.erro);
			}
			else {				
				$scope.usuario = response.data.usuario;
				$scope.usuario.posts = response.data.posts;
				if($scope.usuario.me_segue.find(function(usuario){
					return usuario.id == $scope.user.id;
				})) $scope.to_seguindo = true;
				else {
					$scope.to_seguindo = false;
				}
				
			}
		})
	});
	
	$scope.segueUsuario = function(){
		$http.post ("/segueUsuario", {vou_seguir : $routeParams.login}).then(function (response){
			
			if (response.data.erro){
				$scope.error = response.data.error;
				$scope.success = false;

				alert(response.data.erro);
			}
			else {			
				$scope.to_seguindo = true;
				//$scope.grupo.participantes.push(response.data.user);
				//$location.path('/gruposcadastrados');
			}
		})
	}
	
	$scope.pararDeSeguirUsuario = function(){
		$http.post ("/pararDeSeguirUsuario", {vou_desseguir : $routeParams.login}).then(function (response){
			if (response.data.erro){
				$scope.error = response.data.error;
				$scope.success = false;
				alert(response.data.erro);
			}
			else {
				$scope.to_seguindo = false;
				//$scope.grupo.participantes.push(response.data.user);
				//$location.path('/gruposcadastrados');
			}
		})
	}
	
	var find_by_id = function(lista, id){
			for (var i in lista){
				if (lista[i].id == id)
					return i;
			}
			return -1;
		}
	
	$scope.curtirPost = function(post) {
		$http.post ("/curtirPost", {eu_curti : post.id}).then(function (response){	
			if (response.data.erro){
				$scope.error = response.data.error;
				$scope.sucess = false;
				console.log(response.data.erro);
			}
			else {
				console.log($scope.usuario.posts);
				var idx = find_by_id($scope.usuario.posts, post.id);
				var $post = $scope.usuario.posts[idx];
				$post.quem_curtiu = response.data.quem_curtiu;
				$post.quem_nao_curtiu = response.data.quem_nao_curtiu;
				//$route.reload();
				//$scope.to_seguindo = false;
				//$scope.grupo.participantes.push(response.data.user);
				//$location.path('/gruposcadastrados');
			}
		})
	}
	$scope.descurtirPost = function(post) {
		$http.post ("/descurtirPost", {eu_nao_curti : post.id}).then(function (response){	
			if (response.data.erro){
				$scope.error = response.data.error;
				$scope.sucess = false;
				console.log(response.data.erro);
			}
			else {
				console.log($scope.usuario.posts);
				var idx = find_by_id($scope.usuario.posts, post.id);
				var $post = $scope.usuario.posts[idx];
				$post.quem_curtiu = response.data.quem_curtiu;
				$post.quem_nao_curtiu = response.data.quem_nao_curtiu;
				//$scope.to_seguindo = false;
				//$scope.grupo.participantes.push(response.data.user);
				//$location.path('/gruposcadastrados');
			}
		})
	}
})

app.controller ('printPostFollow', function ($scope, $http, $location){
	var find_by_id = function(lista, id){
			for (var i in lista){
				if (lista[i].id == id)
					return i;
			}
			return -1;
		}
	$http.get ("/getPostSigo").then (function (response){
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {
			console.log(response.data);
			$scope.user.posts = response.data;
		}
	})
	$scope.curtirPost = function(post) {
		$http.post ("/curtirPost", {eu_curti : post.id}).then(function (response){	
			if (response.data.erro){
				$scope.error = response.data.error;
				$scope.sucess = false;
				console.log(response.data.erro);
			}
			else {
				console.log($scope.user.posts);
				var idx = find_by_id($scope.user.posts, post.id);
				var $post = $scope.user.posts[idx];
				$post.quem_curtiu = response.data.quem_curtiu;
				$post.quem_nao_curtiu = response.data.quem_nao_curtiu;
				//$route.reload();
				//$scope.to_seguindo = false;
				//$scope.grupo.participantes.push(response.data.user);
				//$location.path('/gruposcadastrados');
			}
		})
	}
	$scope.descurtirPost = function(post) {
		$http.post ("/descurtirPost", {eu_nao_curti : post.id}).then(function (response){	
			if (response.data.erro){
				$scope.error = response.data.error;
				$scope.sucess = false;
				console.log(response.data.erro);
			}
			else {
				console.log($scope.user.posts);
				var idx = find_by_id($scope.user.posts, post.id);
				var $post = $scope.user.posts[idx];
				$post.quem_curtiu = response.data.quem_curtiu;
				$post.quem_nao_curtiu = response.data.quem_nao_curtiu;
				//$scope.to_seguindo = false;
				//$scope.grupo.participantes.push(response.data.user);
				//$location.path('/gruposcadastrados');
			}
		})
	}
})

app.controller ('editaPostController', function ($scope, $routeParams, $http, $location) {
	$http.post ("/carregaTexto", {id: $routeParams.idPost}).then (function (response){
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {				
			$scope.post = response.data.post;
		}
	})
	
	$scope.carregaTexto = function () {
		$http.post("/editaPost", {id: $scope.post.id, text: $scope.post.text}).then (function (response) {
			if (response.data.erro){
				alert ("Erro: " + response.data.erro);
			}
			else {				
				$location.path('/home');
			}	
		})
	}
	
	$scope.deletaPost = function(){
		$http.post("/deletapost", {id:$scope.post.id}).then (function (response){
			if (response.data.erro){
				alert ("Erro: " + response.data.erro);
			}
			else {				
				$location.path('/home');
			}
		})
	}
})

app.controller ('UserController', function ($scope, $http, $location){
	$scope.posts = [];
	$scope.users = [];
	$http.get ("/getUser").then (function (response){
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {
			$scope.user = response.data;
			$scope.$broadcast("deu_bom");

			
			$scope.postar = function (post){				
				$http.post("/saveposts", {posts: post}).then (function (response){
					if (response.data.erro){
						alert ("Erro " + response.data.erro);
					}
					else {
						var novo_post = response.data;
						novo_post.user = $scope.user;
						$scope.user.posts.unshift(novo_post);
					}
					
				})
			}
		}
		$scope.logout = function (){	
			$http.post ("/logout").then (function (response){
				$location.path("/");
			})
		}
	})
	
	$http.get ("/listaUsers").then (function (response){
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {
			$scope.users = response.data;
		}
	})
})

app.controller ('LoginController', function ($scope, $http, $location){
	$scope.verificar = function (usuario, senha){
		$http.post("/login", {nome: usuario, password: senha}).then (function (response){
			if (response.data.erro){
				alert ("Erro: " + response.data.erro);
			}
			else {
				$location.path('/home');
			}
		})		
	}

	$scope.cadastrar = function (usuario, senha){
		$http.post("/register", {nome: usuario, password: senha}).then (function (response){			
			if (response.data.erro){
				alert ("deu ruim " + response.data.erro);
			}
		});

	}

	$scope.completaCadastro = function (nomecompleto, nascimento, descricao){
		$http.post("/completacadastro", {nomecompleto: nomecompleto, dtNascimento: nascimento, desc: descricao}).then (function (response){
			if (response.data.erro){
				alert ("deu ruim" + response.data.erro);
			}
			else {
				$location.path('/home');
			}
		});
	}

	$scope.deletaUser = function(){
		$http.get("/deletauser").then(function(response){
			if (response.data.erro){
				alert ("Erro: " + response.data.erro);
			}
			else {
				$location.path('/');
			}
		});
		
	}
})

app.controller ('ExportController', function ($scope, $http, $location){
	$http.get("/exportaDados.json").then(function(response){
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {
			//console.log(response.data);
			//alert("Exportação feita com sucesso");
		}
	});
});

app.controller ('ImportController', function ($scope, $http){
	$scope.importar_dados = function() {
		//pega o nome do arquivo que sera carregado
		var arquivo = document.getElementById ('arquivo').files[0];

		if(!arquivo) {
			$scope.error = "Nenhum arquivo foi carregado.";
		}
		else {
			var reader = new FileReader ();

			reader.onload = function (event) {
				var conteudo = reader.result;
				try {
					var json = JSON.parse (conteudo);
					$http.post ('/importaDados', { data: json }).then (function (res) {
						if (res.data.error) {
							$scope.error = res.data.error;
							$scope.success = false;
							alert(res.data.error);
						}
						else {
							$scope.success = res.data.success;
							$scope.error = false;
							alert("Importação Feita com sucesso!");
						}
					})
				}
				catch (event) {
					alert (event.message + " SHOW "	);
					$scope.error = event.message;
					$scope.success = false;
				}
			}
			reader.readAsText (arquivo);
		}
	}
});

app.controller ('groupController', function ($scope, $http, $location){
	$scope.groups = [];
	$http.get ("/pegaGrupos").then (function (response){
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {
			
			$scope.groups = response.data;
		}
	});

	$scope.criaGrupo = function (nomedogrupo){
		$http.post ("/criagrupo", {nome: nomedogrupo}).then (function (response){
			if (response.data.erro){

				alert ("Erro: " + response.data.erro);
			}
			else {			
				$location.path('/home');
			}
		})
	}
	
	$scope.deletaGrupo = function(nomedogrupo){
		$http.post("/deletagrupo", {nome: nomedogrupo} ).then(function(response){
			if (response.data.erro){
				alert ("Erro: " + response.data.erro);
			}
			else {				
				$location.path('/home');
			}
		});
	}

})

app.controller('yourCtrl', ['$scope', '$sce', function($scope, $sce){
    $scope.add = function(){
        var text = "<input type='button' value='Test'><b>Test 2</b>";

        // mark it as clean
        text = $sce.trustAsHtml(text);

        $scope.snippet = text;
    };
}]);

app.filter ('trataPost', function () {
	return function (texto) {
		// trata tags -> #tag
		texto = texto.replace (/(#\S+)/g, function (str, tag) {
			return "<i>" + tag + "</i>";
			});
		// trata links -> $l:""
		texto = texto.replace (/\$l:"([^"]+)"/g, function (str, link) {
			return "<a href='" + link + "'>" + link + "</a>";
		});		
		// trata imagens -> $i:""
		texto = texto.replace (/\$i:"([^"]+)"/g, function (str, link) {
			return "<img src='" + link + "' alt='" + link + "'>";
		});
		// trata usuários -> @user
		texto = texto.replace (/@(\S+)/g, function (str, id) {
			return "<a href='#/usuario/" + id + "'>@" + id + "</a>";
		});
		return texto;
	};
});