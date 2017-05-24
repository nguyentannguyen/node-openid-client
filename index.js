const express = require('express'),
	passport = require('passport'),
	OIDCStrategy = require('passport-openid-connect').Strategy;
	User = require('passport-openid-connect').User;

passport.serializeUser(OIDCStrategy.serializeUser);

passport.deserializeUser(OIDCStrategy.deserializeUser);

passport.use(new OIDCStrategy({
	issuerHost: 'http://localhost:8080/oauth/openid/',
	client_id: 'OIDC',
	client_secret: 'Z9v6n1xtEkjI5EellGqh',
	redirect_uri: 'http://2cfe9c44.ngrok.io/callback',
	scope: 'openid profile email'
},
	function(identifier, done) {
		process.nextTick(function() {
			return done(null, { sub: identifier });
		});
	}
));

var app = express();

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
	return res.json({
		'user': req.user
	});
})

app.get('/login', passport.authenticate('passport-openid-connect', { successReturnToOrRedirect: '/' }));
app.get('/callback', passport.authenticate('passport-openid-connect', { callback: true, successReturnToOrRedirect: '/' }));
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