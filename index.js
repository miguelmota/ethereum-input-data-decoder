const fs = require('fs')
const ethabi = require('ethereumjs-abi')
const ethers = require('ethers')

class InputDataDecoder {
  constructor(prop) {
    this.abi = []

    if (typeof prop === `string`) {
      this.abi = JSON.parse(fs.readFileSync(prop))
    } else if (prop instanceof Object) {
      this.abi = prop
    } else {
      throw new TypeError(`Must pass ABI array object or file path to constructor`)
    }
  }

  decodeConstructor(data) {
    if (Buffer.isBuffer(data)) {
      data = data.toString('utf8')
    }

    if (typeof data !== `string`) {
      data = ``
    }

    data = data.trim()

    for (var i = 0; i < this.abi.length; i++) {
      const obj = this.abi[i]
      if (obj.type !== 'constructor') {
        continue
      }

      const name = obj.name
      const types = obj.inputs ? obj.inputs.map(x => x.type) : []

      // take last 32 bytes
      data = data.slice(-256)

      if (data.length !== 256) {
        throw new Error('fial')
      }

      if (data.indexOf(`0x`) !== 0) {
        data = `0x${data}`
      }

      const inputs = ethers.Interface.decodeParams(types, data)

      return {
        name,
        types,
        inputs
      }
    }

    throw new Error('not found')
  }

  decodeData(data) {
    if (Buffer.isBuffer(data)) {
      data = data.toString('utf8')
    }

    if (typeof data !== `string`) {
      data = ``
    }

    data = data.trim()

    try {
      return this.decodeConstructor(data)
    } catch(err) { }

    const dataBuf = new Buffer(data.replace(/^0x/, ``), `hex`)
    const methodId = dataBuf.slice(0, 4).toString(`hex`)
    const inputsBuf = dataBuf.slice(4)

    const result = this.abi.reduce((acc, obj) => {
      const name = obj.name
      const types = obj.inputs ? obj.inputs.map(x => x.type) : []
      const hash = ethabi.methodID(name, types).toString(`hex`)

      if (hash === methodId) {
        const inputs = ethabi.rawDecode(types, inputsBuf, [])

        return {
          name,
          types,
          inputs
        }
      }

      return acc
    }, {})

    return result
  }
}

module.exports = InputDataDecoder
