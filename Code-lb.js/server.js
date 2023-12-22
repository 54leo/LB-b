/* eslint-disable linebreak-style */

// eslint-disable-next-line no-undef
const express = require('express');
// eslint-disable-next-line no-undef
const jwt = require('jsonwebtoken');
// eslint-disable-next-line no-undef
const bcrypt = require('bcryptjs');
// eslint-disable-next-line no-undef
const crypto = require('crypto');

const key = crypto.randomBytes(32).toString('base64');

const app = express();
const port = 3000;

app.use(express.json());
//defines email and password
const users = [
	{ id: 1, email: 'user@example.com', password: '$2a$10$P/Dp9eQTsM9eWihUw.QpPeP4SjP9o6nHn8ZsC1ljf.bOrJbd2xH2K' } 
];

const JWT_SECRET = key;  
//generates token for the email and the password
function generateToken(user) {
	return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
}
//checks if token details match
function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
}

function comparePassword(password) {
	return bcrypt.compareSync(password);
}
//checks if input matches with defined email and password
app.post('/login', (req, res) => {
	const { email, password } = req.body;
	const user = users.find(u => u.email === email);
	//if it doesnt match return statuscode 404
	if (!user || !comparePassword(password, user.password)) {
		return res.status(401).json({ error: 'Invalid email or password' });
	}

	const token = generateToken(user);
	res.json({ token });
});
//accepts the infos with the token
app.get('/verify', authenticateToken, (req, res) => {
	res.json({ message: 'Token is valid', user: req.user });
});
//logout of the user
app.delete('/logout', authenticateToken, (req, res) => {
	res.status(200).send();
});

app.use((req, res, next) => {
	authenticateToken(req, res, next);
});

app.get('/protected', authenticateToken, (req, res) => {
	res.send('This is a protected resource!');
});

// Authenticate token from the Authorization header in the request
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	//if no token is typed in status code 401 gets printed
	if (!token) {
		return res.status(401).send('Access token is required');
	}
	//if oken not correct statuscode 403 gets printed
	const user = verifyToken(token);
	if (!user) {
		return res.status(403).send('Invalid token');
	}

	req.user = user;
	next();
}

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
