module.exports = function(app){
    
    let viewController = require('../controllers/viewController');

    app.route('/')
    .get(viewController.view)
    
}
