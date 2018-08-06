const path = require('path');
const exphbs = require('express-handlebars');

const handlebar = {
   handlebarInit : (app) => {
       app.engine('.hbs', exphbs({
           defaultLayout: path.join(__dirname, '../views/layouts/layout.hbs'),
           extname: '.hbs',
           
           layoutsDir: path.join(__dirname, '../views/layouts'),
           partialsDir: path.join(__dirname, '../views/partials'),
       }));
       
       app.set('view engine', '.hbs');
       app.set('views', path.join(__dirname, '../views'));
   }
}

module.exports = handlebar;