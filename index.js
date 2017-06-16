const express = require('express'),
	session = require('express-session'),
	passport = require('passport'),
	Issuer = require('openid-client').Issuer,
	OIDCStrategy = require('openid-client').Strategy,
	bodyParser = require('body-parser');

(async () => {
	const issuer = await Issuer.discover('http://localhost:8080/oauth/openid/')

	console.log(issuer);
	const client = new issuer.Client({
		client_id: 'OIDC',
		client_secret: 'Z9v6n1xtEkjI5EellGqh'
	});
	console.log(client);

	passport.use('oidc',
		new OIDCStrategy({
			client: client,
			params: {
				redirect_uri: 'http://2cfe9c44.ngrok.io/callback',
				scope: 'openid profile'
			}
		},
			function (tokenset, userInfo, done) {
				console.log(tokenset);
				return done(null, userInfo);
			}
		));

	passport.deserializeUser(function (req, user, cb) {
		return cb(null, user);
	});

	passport.serializeUser(function (req, user, cb) {
		return cb(null, user);
	});

	var app = express();

	app.use(session({
		secret: 'some kind of secret',
		resave: true,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.urlencoded({ extended: false }))

	app.get('/', function (req, res) {
		if (req.user) {
			return res.json({
				'status': 'loggedin',
				'user': req.user
			});
		}

		return res.json({
			status: 'loggedout'
		});

	});

	app.get('/login', passport.authenticate('oidc'));
	app.post('/login', function(req, res, next) {
		console.log('ISS:', req.body['iss']);
		console.log('LOGIN_HINT:', req.body['login_hint']);
		console.log('TARGET_LINK_URL:', req.body['target_link_url']);
		// Prevent strategy from recognizing this as a callback
		req.body = {};
		passport.authenticate('oidc', { login_hint: req.body['login_hint'] })(req, res, next);
	});
	app.get('/callback', passport.authenticate('oidc', { successRedirect: '/', failureRedirect: '/error' }));
	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.listen(3090);
})();