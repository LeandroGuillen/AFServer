var db = require('../admin/db');

/**
 * Devuelve todos las fichas del sistema
 */
list = function(req, res){
	// TODO Comprobar que usuario logueado es ADMIN
	var user = req.session.user_id;
	
	db.listCharsheets(user, function(err, data){
		if (err) {
			res.json(200, {
				statusCode: '401',
				statusMessage : 'Error reading charsheets'
			});
		}
		else {
			res.json(200, data);
			res.end();
		}
	});
};

exports.list = list;

/**
 * Devuelve las fichas asociadas a una partida
 */
exports.listByGame = function(req, res){
	// TODO Comprobar que usuario logueado es el DJ de la partida actual
	var user = req.session.user_id;
	var game = req.session.game_id;
	
	Charsheet.find({}, {}, function(err, data){
		if (err){
			res.json(200, {
				statusCode: '401',
				statusMessage : 'Error reading charsheets'
			});
		}
		else {
			res.json(200, data);
			res.end();
		}
	});
};

/**
 * Devuelve la ficha del usuario actual en la partida actual
 */
exports.current = function(req, res){
	var user = req.session.user_id;
	// TODO recuperar informacion de partida para ver cual es la ficha actual
	console.log(user);
	db.getCharsheetsByOwner(user, function(err, data){
		if (err) {
			res.json(200, {
				statusCode: '401',
				statusMessage : 'Error reading charsheets'
			});
		}
		else {
			res.json(200, data);
			res.end();
		}
	});
};

/**
 * Crea una nueva ficha
 */
exports.new = function(req, res){
	var charsheet = req.body;
	db.createCharsheet(charsheet, function(err){
		if(err) {
			res.json(200, {
				statusCode: '401',
				statusMessage : 'Error saving character'
			});
		} else {
			res.json(200, {
				statusCode: '200',
				statusMessage : 'The character was saved correctly',
				body: charsheet
			});
		}
	});
}

exports.delete = function(req, res){
	var character = req.body.name;
	console.log("body: "+req.body);
	if(typeof character == "undefined"){
		res.json(200, {
			statusCode: '401',
			statusMessage : 'Could not delete the character'
		});
	} else {
		db.deleteCharsheet(character, function(err){
			if(err) {
				res.json(200, {
					statusCode: '401',
					statusMessage : 'Error deleting character'
				});
			} else {
				list(req, res);
			}
		});
	}
}