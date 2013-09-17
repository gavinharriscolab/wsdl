var crypto = require("crypto"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");

var request = module.exports = function request(url, cb) {
  var hash = crypto.createHash("sha1").update(url).digest("hex"),
      file = path.join(__dirname, "cache", hash);

  if (fs.existsSync(file)) {
    return fs.readFile(file, "utf8", cb);
  }

  var req = http.get(url);

  req.on("error", cb);

  return req.on("response", function(res) {
    if ((res.statusCode === 302 || res.statusCode === 301) && res.headers.location) {
      return request(res.headers.location, cb);
    }

    if (res.statusCode !== 200) {
      return cb(Error("invalid response code; expected 200 but got " + res.statusCode));
    }

    var buffers = [];

    res.on("data", function(e) {
      buffers.push(e);
    });

    res.on("error", cb);

    return res.on("end", function() {
      fs.writeFile(file, Buffer.concat(buffers), function(err) {
        if (err) {
          return cb(err);
        }

        return cb(null, Buffer.concat(buffers).toString("utf8"));
      });
    });
  })
};
