let mongoose = require('mongoose');

class DBConfig {

   static config () {
       mongoose.Promise = global.Promise;
       mongoose.connect('mongodb://127.0.0.1:27017/counterfactual', { useNewUrlParser: true });
   }
}

module.exports = DBConfig;