var app = angular.module ('myapp', ['ngRoute']);
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
	$routeProvider.when ('/usuario/:id', {
		templateUrl: '/templates/paginausuario.html'
	});
	
})

app.controller ('exibiPaginaGrupoController', function ($scope, $routeParams, $http, $location) {
	$http.post ("/acharGrupo", {id: $routeParams.id}).then (function (response) {
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {				
			$scope.grupo = response.data;
			console.log($scope.grupo);
		}
	})
})

app.controller ('exibiPaginaUsuarioController', function ($scope, $routeParams, $http, $location) {
	$http.post ("/acharUsuario", {id: $routeParams.id}).then (function (response) {
		if (response.data.erro){
			alert ("Erro: " + response.data.erro);
		}
		else {				
			$scope.usuario = response.data;
			console.log($scope.usuario);
		}
	})
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
			console.log ($scope.user);
			$scope.postar = function (post){				
				$http.post("/saveposts", {posts: post}).then (function (response){
					if (response.data.erro){
						alert ("Erro " + response.data.erro);
					}
					else {
						$scope.user.posts.push(response.data);
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
		
		
	}
})

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