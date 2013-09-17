var request = require("./request"),
    xmldom = require("xmldom");

var parser = new xmldom.DOMParser(),
    serialiser = new xmldom.XMLSerializer();

var WSDL = module.exports = function WSDL(options) {
  this.bindingHandlers = [];
  this.operationHandlers = [];

  this.bindings = [];
};

WSDL.prototype.bindingFromXML = function bindingFromXML(element) {
  var name = element.getAttribute("name"),
      typeName = element.getAttribute("type");

  typeName = typeName.split(":");

  if (typeName.length > 1) {
    typeName[0] = element.lookupNamespaceURI(typeName[0]);
  } else {
    typeName.unshift(null);
  }

  var i;

  var binding = {
    name: name,
    type: typeName,
    operations: [],
  };

  for (i=0;i<this.bindingHandlers.length;++i) {
    this.bindingHandlers[i].call(null, binding, element);
  }

  var operations = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "operation");

  for (i=0;i<operations.length;++i) {
    binding.operations.push(this.operationFromXML(operations[i]));
  }

  return binding;
};

WSDL.prototype.operationFromXML = function operationFromXML(element) {
  var name = element.getAttribute("name");

  var operation = {
    name: name,
  };

  var input = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "input");
  if (input && input.length) {
    operation.input = {
      name: input[0].getAttribute("name"),
    };
  }

  var output = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "output");
  if (output && output.length) {
    operation.output = {
      name: output[0].getAttribute("name"),
    };
  }

  for (var i=0;i<this.operationHandlers.length;++i) {
    this.operationHandlers.call(null, operation, element);
  }

  return operation;
};

WSDL.prototype.load = function load(url, done) {
  var self = this;

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

    var i;

    var bindings = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "binding");

    for (i=0;i<bindings.length;++i) {
      self.bindings.push(self.bindingFromXML(bindings[i]));
    }

    return done();
  });
};

WSDL.load = function load(url, done) {
  var wsdl = new WSDL();

  return wsdl.load(url, function(err) {
    if (err) {
      return done(err);
    }

    return done(null, wsdl);
  });
};
