const fs = require('fs');
const ethabi = require('ethereumjs-abi');

class InputDataDecoder {
  constructor(prop) {
    this.abi = [];

    if (typeof prop === `string`) {
      this.abi = JSON.parse(fs.readFileSync(prop));
    } else if (prop instanceof Object) {
      this.abi = prop;
    } else {
      throw new TypeError(`Must pass ABI array object or file path to constructor`);
    }
  }

  decodeData(data = ``) {
    if (typeof data !== `string`) {
      data = ``;
    }

    const dataBuf = new Buffer(data.replace(/^0x/, ``), `hex`);
    const methodId = dataBuf.slice(0, 4).toString(`hex`);
    const inputsBuf = dataBuf.slice(4);

    const result = this.abi.reduce((acc, obj) => {
      const name = obj.name;
      const types = obj.inputs.map(x => x.type);
      const hash = ethabi.methodID(name, types).toString(`hex`);

      if (hash === methodId) {
        const inputs = ethabi.rawDecode(types, inputsBuf, []);

        return {
          name,
          types,
          inputs
        }
      }

      return acc;
    }, {});

    return result;
  }
}

module.exports = InputDataDecoder;
