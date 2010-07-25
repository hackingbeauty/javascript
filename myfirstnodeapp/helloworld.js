var sys = require('sys'), 
  http = require('http');

http.createServer(function(req, res) {
  setTimeout(function() {
    res.sendHeader(200, {'Content-Type': 'text/html'});
    res.sendBody('<h1>Hello World</h1>');
    res.finish();
  }, 2000);
}).listen(8080);

sys.puts('Server running at http://127.0.0.1:8080/');