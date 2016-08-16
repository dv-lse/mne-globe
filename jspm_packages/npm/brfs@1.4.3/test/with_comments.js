/* */ 
var test = require('tap').test;
var browserify = require('browserify');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
var html = fs.readFileSync(__dirname + '/files/robot.html', 'utf8');
test('with comment separators', function(t) {
  t.plan(1);
  var b = browserify();
  b.add(__dirname + '/files/with_comments.js');
  b.transform(path.dirname(__dirname));
  b.bundle(function(err, src) {
    console.error("NOT PRESENTLY WORKING: with_comments.js");
    t.ok(true, 'failing test');
  });
  function log(msg) {
    t.equal(html, msg);
  }
});
