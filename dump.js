#!/usr/bin/env node

var WSDL = require("./");

var options = {
  bindingHandlers: [function(binding, element) {
    var soapBindings = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "binding");

    if (soapBindings.length === 1) {
      binding.soapBinding = {
        style: soapBindings[0].getAttribute("style"),
        transport: soapBindings[0].getAttribute("transport"),
      };
    }
  }],
  operationHandlers: [function(operation, element) {
    var soapOperations = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "operation");

    if (soapOperations.length === 1) {
      operation.soapOperations = {
        soapAction: soapOperations[0].getAttribute("soapAction"),
      };
    }
  }],
};

WSDL.load(options, process.argv[2], function(err, wsdl) {
  if (err) {
    return console.warn(err);
  }

  console.log(JSON.stringify(wsdl, null, 2));
});
