#!/usr/bin/env node

var request = require("./request"),
    xmldom = require("xmldom");

var parser = new xmldom.DOMParser(),
    serialiser = new xmldom.XMLSerializer();

var WSDL = function WSDL(options) {
};

WSDL.prototype.load = function load(url, done) {
  request(url, function(err, data) {
    if (err) {
      return done(err);
    }

    try {
      var doc = parser.parseFromString(data);
    } catch (e) {
      return done(e);
    }

    var definition = doc.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "definitions");
    if (!definition || definition.length !== 1) {
      return done(Error("couldn't find root definitions object"));
    }
    definition = definition[0];

    var messages = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "message"),
        portTypes = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "portType"),
        bindings = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "binding");

    messages = [].map.call(messages, function(e) {
      return e;
    });

    return done();
  });
};

WSDL.load = function load(url, done) {
  var wsdl = new WSDL();

  return wsdl.load(url, function(err) {
    return done(err, wsdl);
  });
};
