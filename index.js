var request = require("request"),
    xmldom = require("xmldom");

var parser = new xmldom.DOMParser(),
    serialiser = new xmldom.XMLSerializer();

var WSDL = module.exports = function WSDL(options) {
  options = options || {};

  this.messageHandlers = [];
  this.partHandlers = [];
  this.portTypeHandlers = [];
  this.bindingHandlers = [];
  this.operationHandlers = [];
  this.serviceHandlers = [];
  this.portHandlers = [];

  if (options.messageHandlers) {
    this.messageHandlers = this.messageHandlers.concat(options.messageHandlers);
  }

  if (options.partHandlers) {
    this.partHandlers = this.partHandlers.concat(options.partHandlers);
  }

  if (options.portTypeHandlers) {
    this.portTypeHandlers = this.portTypeHandlers.concat(options.portTypeHandlers);
  }

  if (options.bindingHandlers) {
    this.bindingHandlers = this.bindingHandlers.concat(options.bindingHandlers);
  }

  if (options.operationHandlers) {
    this.operationHandlers = this.operationHandlers.concat(options.operationHandlers);
  }

  if (options.serviceHandlers) {
    this.serviceHandlers = this.serviceHandlers.concat(options.serviceHandlers);
  }

  if (options.portHandlers) {
    this.portHandlers = this.portHandlers.concat(options.portHandlers);
  }

  if (options.request) {
    this._request = options.request;
  }

  this.messages = [];
  this.portTypes = [];
  this.bindings = [];
  this.services = [];

  this.state = {
    targetNamespace: [],
  };
};

WSDL.prototype._request = request;

WSDL.prototype.addMessageHandler = function addMessageHandler(messageHandler) {
  this.messageHandlers.push(messageHandler);
};

WSDL.prototype.addPartHandler = function addPartHandler(partHandler) {
  this.partHandlers.push(partHandler);
};

WSDL.prototype.addPortTypeHandler = function addPortTypeHandler(portTypeHandler) {
  this.portTypeHandlers.push(portTypeHandler);
};

WSDL.prototype.addBindingHandler = function addBindingHandler(bindingHandler) {
  this.bindingHandlers.push(bindingHandler);
};

WSDL.prototype.addOperationHandler = function addOperationHandler(operationHandler) {
  this.operationHandlers.push(operationHandler);
};

WSDL.prototype.addServiceHandler = function addServiceHandler(serviceHandler) {
  this.serviceHandlers.push(serviceHandler);
};

WSDL.prototype.addPortHandler = function addPortHandler(portHandler) {
  this.portHandlers.push(portHandler);
};

WSDL.prototype.messageFromXML = function messageFromXML(element) {
  var name = element.getAttribute("name");

  var message = {
    name: [this.state.targetNamespace[0], name],
    parts: [],
  };

  var i;

  for (i=0;i<this.messageHandlers.length;++i) {
    this.messageHandlers[i].call(null, message, element);
  }

  var parts = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "part");

  for (i=0;i<parts.length;++i) {
    message.parts.push(this.partFromXML(parts[i]));
  }

  return message;
};

WSDL.prototype.partFromXML = function partFromXML(element) {
  var name = element.getAttribute("name"),
      elementName = element.getAttribute("element");

  elementName = elementName.split(":");

  if (elementName.length > 1) {
    elementName[0] = element.lookupNamespaceURI(elementName[0]);
  } else {
    elementName.unshift(null);
  }

  var part = {
    name: name,
    element: elementName,
  };

  for (var i=0;i<this.partHandlers.length;++i) {
    this.partHandlers[i].call(null, part, element);
  }

  return part;
};

WSDL.prototype.portTypeFromXML = function portTypeFromXML(element) {
  var name = element.getAttribute("name");

  var portType = {
    name: [this.state.targetNamespace[0], name],
    operations: [],
  };

  var i;

  for (i=0;i<this.portTypeHandlers.length;++i) {
    this.portTypeHandlers[i].call(null, portType, element);
  }

  var operations = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "operation");

  for (i=0;i<operations.length;++i) {
    portType.operations.push(this.operationFromXML(operations[i]));
  }

  return portType;
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
    name: [this.state.targetNamespace[0], name],
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
    operation.input = {};

    if (input[0].hasAttribute("name")) {
      operation.input.name = input[0].getAttribute("name");
    }
  }

  var output = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "output");
  if (output && output.length) {
    operation.output = {};

    if (output[0].hasAttribute("name")) {
      operation.output.name = output[0].getAttribute("name");
    }
  }

  for (var i=0;i<this.operationHandlers.length;++i) {
    this.operationHandlers[i].call(null, operation, element);
  }

  return operation;
};

WSDL.prototype.serviceFromXML = function serviceFromXML(element) {
  var name = element.getAttribute("name");

  var service = {
    name: [this.state.targetNamespace[0], name],
    ports: [],
  };

  var i;

  for (i=0;i<this.serviceHandlers.length;++i) {
    this.serviceHandlers[i].call(null, portType, element);
  }

  var ports = element.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "port");

  for (i=0;i<ports.length;++i) {
    service.ports.push(this.portFromXML(ports[i]));
  }

  return service;
};

WSDL.prototype.portFromXML = function portFromXML(element) {
  var name = element.getAttribute("name"),
      binding = element.getAttribute("binding");

  binding = binding.split(":");

  if (binding.length > 1) {
    binding[0] = element.lookupNamespaceURI(binding[0]);
  } else {
    binding.unshift(null);
  }

  var port = {
    name: name,
    binding: binding,
  };

  for (var i=0;i<this.portHandlers.length;++i) {
    this.portHandlers[i].call(null, port, element);
  }

  return port;
};

WSDL.prototype.load = function load(url, done) {
  var self = this;

  this._request.call(null, url, function(err, res, data) {
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

    var targetNamespace = definition.getAttribute("targetNamespace");

    self.state.targetNamespace.push(targetNamespace);

    var i;

    var messages = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "message");

    for (i=0;i<messages.length;++i) {
      self.messages.push(self.messageFromXML(messages[i]));
    }

    var portTypes = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "portType");

    for (i=0;i<portTypes.length;++i) {
      self.portTypes.push(self.portTypeFromXML(portTypes[i]));
    }

    var bindings = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "binding");

    for (i=0;i<bindings.length;++i) {
      self.bindings.push(self.bindingFromXML(bindings[i]));
    }

    var services = definition.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/", "service");

    for (i=0;i<services.length;++i) {
      self.services.push(self.serviceFromXML(services[i]));
    }

    self.state.targetNamespace.pop();

    return done();
  });
};

WSDL.load = function load(options, url, done) {
  if (typeof url === "function") {
    done = url;
    url = null;
  }

  if (typeof options === "string") {
    url = options;
    options = null;
  }

  var wsdl = new WSDL(options);

  return wsdl.load(url, function(err) {
    if (err) {
      return done(err);
    }

    return done(null, wsdl);
  });
};
