const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
	origin: 'https://technotes-sv85.onrender.com',
	credentials: true,
	optionsSuccessStatus: 200
}

module.exports = corsOptions;