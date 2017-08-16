const debug = require('debug')('routes:brackets-ext');

const DomainManager = require('../libs/brackets-server/lib/domains/DomainManager');
const util = require('../libs/util');

module.exports = function(express) {
  const router = express.Router();

  router.get('/api', util.isLoggedIn, (req, res) => {
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify(DomainManager.getDomainDescriptions(), null, 4));
  });

  return router;
};