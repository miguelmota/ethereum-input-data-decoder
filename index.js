const fs = require('fs')
const ethers = require('ethers')
const isBuffer = require('is-buffer')

class InputDataDecoder {
  constructor (prop) {
    this.abi = []

    if (typeof prop === `string`) {
      this.abi = JSON.parse(fs.readFileSync(prop))
    } else if (prop instanceof Object) {
      this.abi = prop
    } else {
      throw new TypeError(`Must pass ABI array object or file path to constructor`)
    }
  }

  decodeConstructor (data) {
    if (isBuffer(data)) {
      data = data.toString('utf8')
    }

    if (typeof data !== 'string') {
      data = ''
    }

    data = data.trim()

    for (var i = 0; i < this.abi.length; i++) {
      const obj = this.abi[i]

      if (obj.type !== 'constructor') {
        continue
      }

      const method = obj.name || 'constructor'
      const types = obj.inputs ? obj.inputs.map(x => x.type) : []

      // take last 32 bytes
      data = data.slice(-256)

      if (data.length !== 256) {
        throw new Error('fail')
      }

      if (data.indexOf('0x') !== 0) {
        data = `0x${data}`
      }

      const result = ethers.utils.defaultAbiCoder.decode(types, data)
      const inputs = formatInputs(result, obj.inputs)

      return {
        method,
        inputs
      }
    }

    throw new Error('not found')
  }

  decodeData (data) {
    if (isBuffer(data)) {
      data = data.toString('utf8')
    }

    if (typeof data !== 'string') {
      data = ''
    }

    data = data.trim()

    for (var i = 0; i < this.abi.length; i++) {
      const obj = this.abi[i]

      if (obj.type === 'constructor') {
        continue
      }

      if (obj.type === 'event') {
        continue
      }

      try {
        const method = obj.name
        const ifc = new ethers.utils.Interface([])
        const result = ifc.decodeFunctionData(ethers.utils.FunctionFragment.fromObject(obj), data)
console.log("INPUT", result)
        const inputs = formatInputs(result, obj.inputs)

        return {
          method,
          inputs
        }
      } catch (err) {}
    }

    try {
      const decoded = this.decodeConstructor(data)
      if (decoded) {
        return decoded
      }
    } catch (err) { }

    return {
      method: null,
      inputs: []
    }
  }
}

function formatInputs(input, abi) {
  let result = []
  for (let i = 0; i < abi.length; i++) {
    let value = null
    try {
      value = input[abi[i].name]
    } catch(err) {
      console.log(err.message)
    }
    if (abi[i].components) {
      result.push({
        name: abi[i].name,
        type: abi[i].type,
        value: formatInputs(value[0], abi[i].components)
      })
    } else {
      if (Array.isArray(value)) {
        result.push({
          name: abi[i].name,
          type: abi[i].type,
          value: value
        })
      } else {
        result.push({
          name: abi[i].name,
          type: abi[i].type,
          value: value.toString(),
        })
      }
    }
  }
  return result
}

module.exports = InputDataDecoder
