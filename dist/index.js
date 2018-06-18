'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var ethabi = require('ethereumjs-abi');
var ethers = require('ethers');

var InputDataDecoder = function () {
  function InputDataDecoder(prop) {
    _classCallCheck(this, InputDataDecoder);

    this.abi = [];

    if (typeof prop === 'string') {
      this.abi = JSON.parse(fs.readFileSync(prop));
    } else if (prop instanceof Object) {
      this.abi = prop;
    } else {
      throw new TypeError('Must pass ABI array object or file path to constructor');
    }
  }

  _createClass(InputDataDecoder, [{
    key: 'decodeConstructor',
    value: function decodeConstructor(data) {
      if (Buffer.isBuffer(data)) {
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

        var name = obj.name || null;
        var types = obj.inputs ? obj.inputs.map(function (x) {
          return x.type;
        }) : [];

        // take last 32 bytes
        data = data.slice(-256);

        if (data.length !== 256) {
          throw new Error('fial');
        }

        if (data.indexOf('0x') !== 0) {
          data = '0x' + data;
        }

        var inputs = ethers.Interface.decodeParams(types, data);

        return {
          name: name,
          types: types,
          inputs: inputs
        };
      }

      throw new Error('not found');
    }
  }, {
    key: 'decodeData',
    value: function decodeData(data) {
      if (Buffer.isBuffer(data)) {
        data = data.toString('utf8');
      }

      if (typeof data !== 'string') {
        data = '';
      }

      data = data.trim();

      var dataBuf = new Buffer(data.replace(/^0x/, ''), 'hex');
      var methodId = dataBuf.slice(0, 4).toString('hex');
      var inputsBuf = dataBuf.slice(4);

      var result = this.abi.reduce(function (acc, obj) {
        if (obj.type === 'constructor') return acc;
        var name = obj.name || null;
        var types = obj.inputs ? obj.inputs.map(function (x) {
          return x.type;
        }) : [];
        var hash = ethabi.methodID(name, types).toString('hex');

        if (hash === methodId) {
          // https://github.com/miguelmota/ethereum-input-data-decoder/issues/8
          if (methodId === 'a9059cbb') {
            inputsBuf = Buffer.concat([new Buffer(12), inputsBuf.slice(12, 32), inputsBuf.slice(32)]);
          }

          var inputs = ethabi.rawDecode(types, inputsBuf);

          return {
            name: name,
            types: types,
            inputs: inputs
          };
        }

        return acc;
      }, { name: null, types: [], inputs: [] });

      if (!result.name) {
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

module.exports = InputDataDecoder;