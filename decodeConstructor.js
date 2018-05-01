const SolidityCoder = require('web3/lib/solidity/coder')
const sha3 = require('web3/lib/utils/sha3')
const web3Utils = require('web3/lib/utils/utils')

/**
 * This is based on Consynses ABI-decoder
 * https://github.com/ConsenSys/abi-decoder
 */
module.exports = class Decoder {
  /**
   * Initialize class local variables
   * @param Array abiArray
   */
  constructor(abiArray) {
    this.abiArray = abiArray;
    this.methodIDs = {};
    if (Array.isArray(this.abiArray)) {
      // Iterate new abi to generate method id's
      this.abiArray.forEach((abi) => {
        if (abi.type === 'constructor') {
          this.methodIDs.constructor = abi;
          return this.methodIDs.constructor;
        } else if (abi.name) {
          const signature = sha3(`${abi.name}(${abi.inputs.map(input => input.type).join(',')})`);
          if (abi.type === 'event') {
            this.methodIDs[signature] = abi;
            return this.methodIDs[signature];
          }
          this.methodIDs[signature.slice(0, 8)] = abi;
          return this.methodIDs[signature.slice(0, 8)];
        }
        return null;
      });
    } else {
      throw new Error(`Expected ABI array, got ${typeof abiArray}`);
    }
  }

  /**
   * Return Abi for given instance
   * @return Array
   */
  getABI() {
    return this.abiArray;
  }

  /**
   * Return method ids generated from
   * @return {}
   */
  getMethodIDs() {
    return this.methodIDs;
  }

  /**
   * Decode constructor
   *
   * @param Object contract creation code
   * @return {}
   */
  decodeConstructor(contractCreationBytecode) {
    try {
      if (this.methodIDs.constructor.type !== 'constructor') throw new Error(`Expected constructor got${this.methodIDs.constructor.type}`);
      const abiItem = this.methodIDs.constructor;
      if (abiItem) {
        const params = abiItem.inputs.map(item => item.type);
        const constructorData =
          Decoder.extractConstructorFromBytecode(contractCreationBytecode, params);
        const decoded = SolidityCoder.decodeParams(params, constructorData);
        return {
          name: abiItem.type,
          params: decoded.map((param, index) => {
            let parsedParam = param;
            if (abiItem.inputs[index].type.indexOf('uint') !== -1) {
              parsedParam = Decoder.parseParams(param);
            }
            return {
              name: abiItem.inputs[index].name,
              value: parsedParam,
              type: abiItem.inputs[index].type,
            };
          }),
          constructorData,
        };
      }
    } catch (e) {
      if (e.message === 'Dynamic types found in a ByteCode file with no "Metadata swarm"') { return { name: 'UNDECODED', params: [{ name: 'rawData', value: e.message, type: 'Error Message' }] }; }
      throw e;
    }
    return false;
  }
  static parseParams(param) {
    return Array.isArray(param) ?
      param.map(singleNumber =>
        web3Utils.toBigNumber(singleNumber).toString()) :
      web3Utils.toBigNumber(param).toString();
  }
  /**
   * Decode transaction input data
   *
   * @param Object inputData
   * @return {}
   */
  decodeMethod(inputData) {
    const errorObject = { name: 'UNDECODED', params: [{ name: 'rawData', value: JSON.stringify(inputData), type: 'data' }] };
    if (typeof inputData !== 'string') throw new Error(`Expected string got ${typeof inputData}`);
    if (inputData === '0x') return '';

    const methodID = inputData.slice(2, 10);
    const abiItem = this.methodIDs[methodID];
    if (abiItem) {
      const params = abiItem.inputs.map(item => item.type);

      const decoded = SolidityCoder.decodeParams(params, inputData.slice(10));
      return {
        name: abiItem.name,
        params: decoded.map((param, index) => {
          let parsedParam = param;
          if (abiItem.inputs[index].type.indexOf('uint') !== -1) {
            parsedParam = Decoder.parseParams(param);
          }
          return {
            name: abiItem.inputs[index].name,
            value: parsedParam,
            type: abiItem.inputs[index].type,
          };
        }),
      };
    }
    return errorObject;
  }
  /**
   * Decode transaction logs
   *
   * @param Object logs
   * @return [{}]
   */
  decodeSingleLog(log) {
    if (log.length > 1 || Array.isArray(log)) throw new Error('expected single log, received array or undefined');
    const decodedLog = this.decodeLogs([log]);
    if (decodedLog.length > 0) {
      return decodedLog[0];
    }
    return { name: 'UNDECODED', events: [{ name: 'rawLogs', value: JSON.stringify(log), type: 'logs' }] };
  }
  /**
   * Decode transaction logs
   *
   * @param Object logs
   * @return [{}]
   */
  decodeLogs(logs) {
    const errorObject = { name: 'UNDECODED', events: [{ name: 'rawLogs', value: JSON.stringify(logs), type: 'logs' }] };
    const decodedLogs = logs.map((logItem) => {
      if (!logItem.topics.length) throw new Error(`Problem with logs at ${JSON.stringify(logItem.topics)}`);
      const methodID = logItem.topics[0].slice(2);
      const method = this.methodIDs[methodID];
      if (method) {
        const logData = logItem.data;
        const decodedParameters = [];
        let dataIndex = 0;
        let topicsIndex = 1;

        const dataTypes = [];
        method.inputs.forEach((input) => {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
          return dataTypes;
        });
        const decodedData = SolidityCoder.decodeParams(dataTypes, logData.slice(2));
        // Loop topic and data to get the params
        method.inputs.forEach((param) => {
          const decodedParam = {
            name: param.name,
            type: param.type,
          };

          if (param.indexed) {
            decodedParam.value = logItem.topics[topicsIndex];
            topicsIndex += 1;
          } else {
            decodedParam.value = decodedData[dataIndex];
            dataIndex += 1;
          }

          if (param.type === 'address') {
            decodedParam.value = Decoder.padZeros(web3Utils.toBigNumber(decodedParam.value)
              .toString(16));
          } else if (param.type === 'uint256' || param.type === 'uint8' || param.type === 'int') {
            decodedParam.value = web3Utils.toBigNumber(decodedParam.value).toString(10);
          }

          decodedParameters.push(decodedParam);
          return decodedParameters;
        });


        return {
          name: method.name,
          events: decodedParameters,
          address: logItem.address,
        };
      }
      return errorObject;
    });
    return decodedLogs;
  }
  /**
  * Extracts constructor data from smart contract creation bytecode
  * Uses bytecode end data signature to generate offset and slice
  * @param {string}
  * @return {string}
  */
  static extractConstructorFromBytecode(contractCreationBytecode, params) {
    // http://solidity.readthedocs.io/en/develop/metadata.html#encoding-of-the-metadata-hash-in-the-bytecode
    if (!contractCreationBytecode) throw new Error('contractCreationBytecode is null or undefined');
    if (!params) throw new Error('Params is null or undefined');

    const endOfBytCodeSig = 'a165627a7a72305820';
    const bzzrtOffset = 82;
    const endofByteCode = 4;

    const solidityTypes = SolidityCoder.getSolidityTypes(params);


    const offset = contractCreationBytecode.indexOf(endOfBytCodeSig);
    if (contractCreationBytecode.slice(offset + bzzrtOffset,
      offset + bzzrtOffset + 4) !== '0029') {
      solidityTypes.forEach((solidityType, i) => {
        if (solidityType.isDynamicType(params[i]) ||
          solidityType.isDynamicArray(params[i]) ||
            solidityType.isStaticArray(params[i])) { throw new Error('Dynamic types found in a ByteCode file with no "Metadata swarm"'); }
      });
      return contractCreationBytecode.slice(-64 * params.length);
    }
    return contractCreationBytecode.slice(offset + bzzrtOffset + endofByteCode);
  }

  /**
   * utility function to pad 0x from an address
   *
   * @param address
   * @return string
   */
  static padZeros(address) {
    let formatted = address;
    if (address.indexOf('0x') !== -1) {
      formatted = address.slice(2);
    }

    if (formatted.length < 40) {
      while (formatted.length < 40) formatted = `0${formatted}`;
    }

    return `0x${formatted}`;
  }
}
