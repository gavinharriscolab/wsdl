#!/usr/bin/env node

var WSDL = require("./");

WSDL.load(process.argv[2], function(err, wsdl) {
  if (err) {
    return console.warn(err);
  }

  console.log(JSON.stringify(wsdl, null, 2));
});
