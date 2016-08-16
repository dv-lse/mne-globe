/* */ 
var big5Table = require('./table/big5');
module.exports = {
  'windows950': 'big5',
  'cp950': 'big5',
  'big5': {
    type: 'table',
    table: big5Table
  }
};
