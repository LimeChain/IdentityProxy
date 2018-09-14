// (function(){
    let express = require('express');
    let app = express();
    let bodyParser = require('body-parser');
    let handlebars = require('./config/handlebars');
    let port = require('./config/settings.js').server.port;
    let routes = require('./routes/routes.js')
    let MongoDB = require('./services/database/db/mongoose');
    let http = require('http').Server(app);
    let nodeConnection = require('./services/nodeConnection')
    let io = require('socket.io')(http)
    
    nodeConnection.init(io);

    MongoDB.config();
   
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    handlebars.handlebarInit(app);
    app.use(express.static('public'));
    routes(app)

    http.listen(port, () => {
        console.log('Started up at port: ', port)
    });

// })();