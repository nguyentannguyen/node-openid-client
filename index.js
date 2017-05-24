const express = require('express'),
	session = require('express-session'),
	passport = require('passport'),
	Issuer = require('openid-client').Issuer,
	OIDCStrategy = require('openid-client').Strategy;

Issuer.discover('http://localhost:8080/oauth/openid/')
	.then((issuer) => {
		console.log(issuer);
		return Promise.resolve(new issuer.Client({
			client_id: 'OIDC',
			client_secret: 'Z9v6n1xtEkjI5EellGqh',
		}));
	})
	.then((client) => {
		console.log(client);

		passport.use('oidc',
			new OIDCStrategy({
				client: client,
				params: {
					redirect_uri: 'http://2cfe9c44.ngrok.io/callback',
					scope: 'openid profile'
				}
			},
			function(tokenset, userInfo, done) {
				return done(null, userInfo);
			}
		));

		passport.deserializeUser(function(req, user, cb) {
			return cb(null, user);
		});

		passport.serializeUser(function(req, user, cb) {
			return cb(null, user);
		});

		var app = express();

		app.use(session({
			secret: 'holiday in cambodia'
		}));
		app.use(passport.initialize());
		app.use(passport.session());

		app.get('/', function(req, res) {
			if (req.user) {
				return res.json({
					'status': 'loggedin',
					'user': req.user
				});
			}

			return res.json({
				status: 'loggedout'
			});

		})

		app.get('/login', passport.authenticate('oidc'));
		app.get('/callback', passport.authenticate('oidc', { successRedirect: '/', failureRedirect: '/error' }));
		app.get('/logout', function(req, res) {
			req.logout();
			res.redirect('/');
		});
		app.get('/jwks', (req, res) => {
			return res.json({
				keys: [
					{
						"kid": 1,
						"use": "sig",
						"n" : "rx34_OVLibXLy1aZDYND2GWtJOUjFrjlu8QW6pe7-P1T7TZf7DWynWpH1Ih_V-rwd77GOY6hojXPqKsEEsgLx5DcBSvXrV4sDx4fFoqfg9H27J8YjfXkNVQG_0iGKAbS1OB7eoOrEGy2yXOtciSLh7mbEvwGbVXJryG_GuhgZt9fXNS7a6a9eHbe9_-RnvtY-V5-7rxqLDqlqZMqkaN6vOgf655Xqh4Pz4udVs552rJkexZPsrQCMQJSqwjTXh1pl_OzLiGwARPsV6-q3cx3OZLwroPPPUSejudkQkrn0scGfrCXoOs6MkX9DvdSanR6aZmZSwGG0WcLiKxUPykh9w",
						"e" : "AQAB",
						"kty" : "RSA"
					}
				]
			})
		});

		app.listen(3090);
	});