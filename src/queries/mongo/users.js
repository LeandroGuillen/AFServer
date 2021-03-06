var crypto = require('crypto');
// var mongoose = require('mongoose');
var db = require('./db');

/**
 * Introduce el nuevo usuario en el sistema. Su login debe ser unico.
 * Ni el login ni el password pueden ser vacios.
 */
exports.register = function (req, res) {
	var user = req.body.user;
	var pass = req.body.password;
	
	//console.log(req.body);
	
	// Comprueba que el user y el pass no son vacios
	if(user == null || pass == null) {
		res.json(200, {
			statusCode: '401',
			statusMessage : 'User and password may not be empty'
		});
	}
	
	// Si esta logueado no puede registrarse
	else if(req.session.user_id) {
		res.json(200, {
			statusCode: '401',
			statusMessage : 'Please log out first'
		});
	}
	
	// Busca el usuario en la base de datos
	else {
		db.findUserByLogin(user, function (err, thisUser) {
			if(err) {
				console.log(err);
				res.json(200, {
					statusCode: '500',
					statusMessage : 'Error accessing DB information'
				});
			}
			
			// Comprueba si el usuario existe
			if (thisUser != null /*&& thisUser.password == digest*/) {
				
				res.json(200, {
					statusCode: '401',
					statusMessage : 'The user already exists'
				});
					
			} else {
				// El usuario no existe, se puede crear
				db.createNewUser(user, pass, function(err){
					if(err) {
						res.json(200, {
							statusCode: '401',
							statusMessage : 'Could not register user'
						});
					}
					
					req.session.user_id = thisUser.login;
				
					res.json(200, {
						statusCode: '200',
						statusMessage : 'User created successfully'
					});
				});
			}
		});
	}
}

/**
 * El usuario entra en el sistema
 */
exports.login = function(req, res) {
	var user = req.body.user;
	var pass = req.body.password;
	
	console.log(req.body);
	console.log("Content-type:"+req.get("Content-type"));
	
	// Busca el usuario en la base de datos
	db.findUserByLogin(user, function (err, thisUser) {
		
		if(err) {
			console.log(err);
			res.json(200, {
				statusCode: '500',
				statusMessage : 'Error accessing login information'
			});
		}
		
		// Calcula resumen SHA1 del password
		var digest = crypto.createHash('sha1').update(pass+"", 'utf8').digest('hex');
		
		// Comprueba que el usuario existe y que el password es correcto
		if (thisUser != null && thisUser.password == digest) {
			
			// TODO obtener user_id
			req.session.user_id = thisUser.login;

			res.json(200, {
				statusCode: '200',
				statusMessage : 'You have been logged in correctly'
			});
		} else {
			// El usuario no existe o el password no es correcto
			// TODO discriminar errores?
			res.json(200, {
				statusCode: '401',
				statusMessage : 'You are not authorized to log in'
			});
		}
	});
}

/**
 * El usuario sale del sistema
 */
exports.logout = function (req, res) {
	// Si el usuario esta logueado lo desloguea
	if(req.session.user_id) {
		delete req.session.user_id;
		res.json(200, {
			statusCode: '200',
			statusMessage : 'You have been logged out correctly'
		});
	} 
	// Si no esta logueado muestra error
	else {
		res.json(200, {
			statusCode: '401',
			statusMessage : 'You were not logged in'
		});
	}
}

/**
 * Comprueba que el usuario esta autenticado y autorizado para realizar
 * una operacion protegida en el sistema.
 */
exports.checkAuth = function(req, res, next) {
	// TODO No solo hay que comprobar que existe un user_id, sino que es el correcto
	if (!req.session.user_id) {
		res.redirect(401, "/start");
	} else {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		next();
	}
}

/**
 * Comprueba que el usuario esta autenticado y autorizado para acceder
 * a la página. En caso negativo redirige a la página principal.
 */
exports.checkAuthRedirect = function(req, res, next) {
	// TODO No solo hay que comprobar que existe un user_id, sino que es el correcto
	if (!req.session.user_id) {
		res.redirect("/start");
	} else {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		next();
	}
}

/**
 * Devuelve una lista completa de usuarios en el sistema
 */
exports.list = function(req, res) {
	
	db.listUsers(function(err, data){
		if (err){
			console.log('Error reading User collection');
			res.json(200, {
				statusCode: '500',
				statusMessage : 'Error accessing user database'
			});
		}
		else {
			res.json(200, data);
			res.end();
		}
	});
}