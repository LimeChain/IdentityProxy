module.exports = function(app){
    
    let proxyController = require('../controllers/proxyController');

    app.route('/create')
    .post(proxyController.createIDProxy);

    app.route('/execute')
    .post(proxyController.execute);
}
