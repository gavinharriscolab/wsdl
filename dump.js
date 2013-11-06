#!/usr/bin/env node

var WSDL = require("./");

var options = {
  portHandlers: [function(port, element) {
    var soapAddresses = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "address");

    if (soapAddresses.length === 1) {
      port.soap = {
        address: {
          location: soapAddresses[0].getAttribute("location"),
        },
      };
    }
  }],
  bindingHandlers: [function(binding, element) {
    var soapBindings = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "binding");

    if (soapBindings.length === 1) {
      binding.soap = {
        binding: {
          style: soapBindings[0].getAttribute("style"),
          transport: soapBindings[0].getAttribute("transport"),
        },
      };
    }
  }],
  operationHandlers: [function(operation, element) {
    var soapOperations = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "operation");

    if (soapOperations.length === 1) {
      operation.soapOperation = {
        soapAction: soapOperations[0].getAttribute("soapAction"),
      };
    }

    var inputElement = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "input");
    if (inputElement.length) {
      inputElement = inputElement[0];

      var inputBodyElement = inputElement.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "body");
      if (inputBodyElement.length) {
        inputBodyElement = inputBodyElement[0];

        operation.input.soap = {};

        if (inputBodyElement.hasAttribute("parts")) {
          operation.input.soap.parts = inputBodyElement.getAttribute("parts");
        }

        if (inputBodyElement.hasAttribute("use")) {
          operation.input.soap.use = inputBodyElement.getAttribute("use");
        }

        if (inputBodyElement.hasAttribute("namespace")) {
          operation.input.soap.namespace = inputBodyElement.getAttribute("namespace");
        }

        if (inputBodyElement.hasAttribute("encodingStyle")) {
          operation.input.soap.encodingStyle = inputBodyElement.getAttribute("encodingStyle");
        }
      }
    }

    var outputElement = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "output");
    if (outputElement.length) {
      outputElement = outputElement[0];

      var outputBodyElement = outputElement.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "body");
      if (outputBodyElement.length) {
        outputBodyElement = outputBodyElement[0];

        operation.output.soap = {};

        if (outputBodyElement.hasAttribute("parts")) {
          operation.output.soap.parts = outputBodyElement.getAttribute("parts");
        }

        if (outputBodyElement.hasAttribute("use")) {
          operation.output.soap.use = outputBodyElement.getAttribute("use");
        }

        if (outputBodyElement.hasAttribute("namespace")) {
          operation.output.soap.namespace = outputBodyElement.getAttribute("namespace");
        }

        if (outputBodyElement.hasAttribute("encodingStyle")) {
          operation.output.soap.encodingStyle = outputBodyElement.getAttribute("encodingStyle");
        }
      }
    }
  }],
};

WSDL.load(options, process.argv[2], function(err, wsdl) {
  if (err) {
    return console.warn(err);
  }

  var a = {};

  wsdl.services.forEach(function(service) {
    service.ports.forEach(function(port) {
      if (!port || !port.soap || !port.soap.address || !port.soap.address.location) {
        return;
      }

      var binding = wsdl.bindings.filter(function(binding) {
        return binding.name[0] === port.binding[0] && binding.name[1] === port.binding[1];
      }).shift();

      if (!binding) {
        return;
      }

      binding.operations.forEach(function(operation) {
        if (!operation || !operation.input || !operation.input.soap || !operation.input.soap.namespace) {
          return;
        }

        if (!operation || !operation.soapOperation || !operation.soapOperation.soapAction) {
          return;
        }

        a[operation.name] = {
          uri: port.soap.address.location,
          action: operation.soapOperation.soapAction,
          request: [operation.input.soap.namespace, operation.input.name],
          response: [operation.output.soap.namespace, operation.output.name],
        };
      });
    });
  });

  console.log(JSON.stringify(a, null, 2));
});
