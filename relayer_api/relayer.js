(function(){
    let express = require('express');
    let bodyParser = require('body-parser');
    let handlebars = require('./config/handlebars');
    let port = require('./config/settings.js').server.port;
    let routes = require('./routes/routes.js')

    let app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    handlebars.handlebarInit(app);

    routes(app)

    app.listen(port, () => {
        console.log('Started up at port: ', port)
    });
})();