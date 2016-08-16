/* */ 
var gbkTable = require('./table/gbk');
module.exports = {
  'windows936': 'gbk',
  'gb2312': 'gbk',
  'gbk': {
    type: 'table',
    table: gbkTable
  }
};
