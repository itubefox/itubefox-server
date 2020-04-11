const cookie = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

function express_middleware(host, express) {
    host.use(cookie());
    host.use(helmet());
    host.use(cors());
    host.use(compression());
    host.use(express.urlencoded());
    host.use(express.json());
}

module.exports = express_middleware;