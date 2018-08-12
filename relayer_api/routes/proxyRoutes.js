module.exports = function (app) {

    const proxyController = require('../controllers/proxyController');

    app.route('/create')
        .post(proxyController.create);

    app.route('/deploy')
        .post(proxyController.deploy);

    app.route('/execute')
        .post(proxyController.execute);
}
