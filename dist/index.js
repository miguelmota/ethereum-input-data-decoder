'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ethers = require('ethers');
var Buffer = require('buffer/').Buffer;
var isBuffer = require('is-buffer');

// TODO: dry up and clean up
// NOTE: this library may be deprecated in future, in favor of ethers v5 AbiCoder.

var InputDataDecoder = function () {
  function InputDataDecoder(prop) {
    _classCallCheck(this, InputDataDecoder);

    this.abi = [];

    if (typeof prop === 'string') {
      try {
        var fs = require('fs');
        this.abi = JSON.parse(fs.readFileSync(prop));
      } catch (err) {
        try {
          this.abi = JSON.parse(prop);
        } catch (err) {
          throw new Error('Invalid ABI: ' + err.message);
        }
      }
    } else if (prop instanceof Object) {
      this.abi = prop;
    } else {
      throw new TypeError('Must pass ABI array object or file path to constructor');
    }
  }

  _createClass(InputDataDecoder, [{
    key: 'decodeConstructor',
    value: function decodeConstructor(data) {
      if (isBuffer(data)) {
        data = data.toString('utf8');
      }

      if (typeof data !== 'string') {
        data = '';
      }

      data = data.trim();

      for (var i = 0; i < this.abi.length; i++) {
        var obj = this.abi[i];

        if (obj.type !== 'constructor') {
          continue;
        }

        var method = obj.name || null;
        var types = obj.inputs ? obj.inputs.map(function (x) {
          return x.type;
        }) : [];
        var names = obj.inputs ? obj.inputs.map(function (x) {
          return x.name;
        }) : [];

        // take last 32 bytes
        data = data.slice(-256);

        if (data.length !== 256) {
          throw new Error('fail');
        }

        if (data.indexOf('0x') !== 0) {
          data = '0x' + data;
        }

        var inputs = ethers.utils.defaultAbiCoder.decode(types, data);
        inputs = deepRemoveUnwantedArrayProperties(inputs);

        return {
          method: method,
          types: types,
          inputs: inputs,
          names: names
        };
      }

      throw new Error('not found');
    }
  }, {
    key: 'decodeData',
    value: function decodeData(data) {
      if (isBuffer(data)) {
        data = data.toString('utf8');
      }

      if (typeof data !== 'string') {
        data = '';
      }

      data = data.trim();

      var dataBuf = Buffer.from(data.replace(/^0x/, ''), 'hex');
      var methodId = toHexString(dataBuf.subarray(0, 4));
      var inputsBuf = dataBuf.subarray(4);

      var result = this.abi.reduce(function (acc, obj) {
        try {
          if (obj.type === 'constructor') {
            return acc;
          }
          if (obj.type === 'event') {
            return acc;
          }
          var method = obj.name || null;
          var types = obj.inputs ? obj.inputs.map(function (x) {
            if (x.type.includes('tuple')) {
              return x;
            } else {
              return x.type;
            }
          }) : [];

          var names = obj.inputs ? obj.inputs.map(function (x) {
            if (x.type.includes('tuple')) {
              return [x.name, x.components.map(function (a) {
                return a.name;
              })];
            } else {
              return x.name;
            }
          }) : [];

          var hash = genMethodId(method, types);

          if (hash === methodId) {
            var inputs = [];

            inputsBuf = normalizeAddresses(types, inputsBuf);
            try {
              inputs = ethers.utils.defaultAbiCoder.decode(types, inputsBuf);
            } catch (err) {
              try {
                var ifc = new ethers.utils.Interface([]);
                inputs = ifc.decodeFunctionData(ethers.utils.FunctionFragment.fromObject(obj), data);
              } catch (err) {}
            }

            // TODO: do this normalization into normalizeAddresses
            inputs = inputs.map(function (input, i) {
              if (types[i].components) {
                var tupleTypes = types[i].components;
                return deepStripTupleAddresses(input, tupleTypes);
              }
              if (types[i] === 'address') {
                return input.split('0x')[1];
              }
              if (types[i] === 'address[]') {
                return input.map(function (address) {
                  return address.split('0x')[1];
                });
              }
              return input;
            });

            // Map any tuple types into arrays
            var typesToReturn = types.map(function (t) {
              if (t.components) {
                var arr = t.components.reduce(function (acc, cur) {
                  return [].concat(_toConsumableArray(acc), [cur.type]);
                }, []);
                var tupleStr = '(' + arr.join(',') + ')';
                if (t.type === 'tuple[]') return tupleStr + '[]';
                return tupleStr;
              }
              return t;
            });

            // defaultAbiCoder attaches some unwanted properties to the list object
            inputs = deepRemoveUnwantedArrayProperties(inputs);

            return {
              method: method,
              types: typesToReturn,
              inputs: inputs,
              names: names
            };
          }

          return acc;
        } catch (err) {
          return acc;
        }
      }, { method: null, types: [], inputs: [], names: [] });

      if (!result.method) {
        this.abi.reduce(function (acc, obj) {
          if (obj.type === 'constructor') {
            return acc;
          }
          if (obj.type === 'event') {
            return acc;
          }
          var method = obj.name || null;

          try {
            var ifc = new ethers.utils.Interface([]);
            var _result = ifc.decodeFunctionData(ethers.utils.FunctionFragment.fromObject(obj), data);
            var inputs = deepRemoveUnwantedArrayProperties(_result);
            result.method = method;
            result.inputs = inputs;
            result.names = obj.inputs ? obj.inputs.map(function (x) {
              if (x.type.includes('tuple')) {
                return [x.name, x.components.map(function (a) {
                  return a.name;
                })];
              } else {
                return x.name;
              }
            }) : [];
            var types = obj.inputs ? obj.inputs.map(function (x) {
              if (x.type.includes('tuple')) {
                return x;
              } else {
                return x.type;
              }
            }) : [];

            result.types = types.map(function (t) {
              if (t.components) {
                var arr = t.components.reduce(function (acc, cur) {
                  return [].concat(_toConsumableArray(acc), [cur.type]);
                }, []);
                var tupleStr = '(' + arr.join(',') + ')';
                if (t.type === 'tuple[]') return tupleStr + '[]';
                return tupleStr;
              }
              return t;
            });
          } catch (err) {}
        });
      }

      if (!result.method) {
        try {
          var decoded = this.decodeConstructor(data);
          if (decoded) {
            return decoded;
          }
        } catch (err) {}
      }

      return result;
    }
  }]);

  return InputDataDecoder;
}();

// remove 0x from addresses


function deepStripTupleAddresses(input, tupleTypes) {
  return input.map(function (item, i) {
    // We find tupleTypes to not be an array where internalType is present in the ABI indicating item is a structure
    var type = tupleTypes[i] ? tupleTypes[i].type : null;

    if (type === 'address' && typeof item === 'string') {
      return item.split('0x')[1];
    }
    if (type === 'address[]' || Array.isArray()) {
      return item.map(function (a) {
        return a.split('0x')[1];
      });
    }

    if (Array.isArray(item)) {
      return deepStripTupleAddresses(item, tupleTypes);
    }

    return item;
  });
}

function deepRemoveUnwantedArrayProperties(arr) {
  return [].concat(_toConsumableArray(arr.map(function (item) {
    if (Array.isArray(item)) return deepRemoveUnwantedArrayProperties(item);
    return item;
  })));
}

function normalizeAddresses(types, input) {
  var offset = 0;
  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    if (type === 'address') {
      input.set(Buffer.alloc(12), offset);
    }

    if (isArray(type)) {
      var size = parseTypeArray(type);
      if (size && size !== 'dynamic') {
        offset += 32 * size;
      } else {
        offset += 32;
      }
    } else {
      offset += 32;
    }
  }

  return input;
}

function parseTypeArray(type) {
  var tmp = type.match(/(.*)\[(.*?)\]$/);
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10);
  }
  return null;
}

function isArray(type) {
  return type.lastIndexOf(']') === type.length - 1;
}

function handleInputs(input, tupleArray) {
  if (input instanceof Object && input.components) {
    input = input.components;
  }

  if (!Array.isArray(input)) {
    if (input instanceof Object && input.type) {
      return input.type;
    }

    return input;
  }

  var ret = '(' + input.reduce(function (acc, x) {
    if (x.type === 'tuple') {
      acc.push(handleInputs(x.components));
    } else if (x.type === 'tuple[]') {
      acc.push(handleInputs(x.components) + '[]');
    } else {
      acc.push(x.type);
    }
    return acc;
  }, []).join(',') + ')';

  if (tupleArray) {
    return ret + '[]';
  }

  return ret;
}

function genMethodId(methodName, types) {
  var input = methodName + '(' + types.reduce(function (acc, x) {
    acc.push(handleInputs(x, x.type === 'tuple[]'));
    return acc;
  }, []).join(',') + ')';

  return ethers.utils.keccak256(Buffer.from(input)).slice(2, 10);
}

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

module.exports = InputDataDecoder;