var options = {
  host: 'search.npmjs.org',
  port: '80',
  path: '/api/_all_docs?include_docs=true&limit=10'
};

var http = require('http'),
    slave = require('../slave'),
    data = '';

/**
 * Some magic function that takes the URL of a tarball. Should
 * download, extract, run tests, and whatnot.

 * TODO: Replace with a reference to the actual function, some time
 * after it's been written.
 */

var interpretJSON = function (obj) {
  getUname(function(err, uname) {



    obj.rows.map(function (el, i) {
      if (!el.id) return;
      var versions = Object.keys(el.doc.versions);

      // TODO may not actually be latest
      var latest = el.doc.versions[versions.pop()];

      if (latest && latest.scripts && latest.scripts.test !== undefined) {

        console.log(el.id, latest.scripts);

        var s = slave.run(el.id);
        s.on('complete', function (code, sig, err) {
          // Add to database.
          console.log('complete>', el.id, code, sig
            , err && err.message.replace('\n', ' '), uname);
        });

        s.on("error", function(err) {
          console.log("Something went wrong: " + err);
        });
      }
    });




  });
};

http.get(options, function (res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    data += chunk;
  });
  res.on('end', function () {
    interpretJSON(JSON.parse(data));
  });
});


// IN CRAWLER FOR NOW, TO BE MOVED TO SLAVE-DRIVER ONCE TABS-->SPACES
var exec = require('child_process').exec;
function getUname(cb) {
  exec('uname -mrs', function (error, stdout, stderr) {
      if (error !== null) {
        cb(error, stdout);
      } else {
        cb(null, stdout.trim());
      }
  });
}
