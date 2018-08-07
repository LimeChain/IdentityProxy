let proxyRoutes = require('./proxyRoutes');
let viewRoutes = require('./viewRoutes');

module.exports = function(app){
    proxyRoutes(app);
    viewRoutes(app)
    
}
