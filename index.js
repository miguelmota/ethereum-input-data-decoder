const fs = require('fs')
const ethabi = require('ethereumjs-abi')
const ethers = require('ethers')
const Buffer = require('buffer/').Buffer
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

      const name = obj.name || null
      const types = obj.inputs ? obj.inputs.map(x => x.type) : []

      // take last 32 bytes
      data = data.slice(-256)

      if (data.length !== 256) {
        throw new Error('fail')
      }

      if (data.indexOf('0x') !== 0) {
        data = `0x${data}`
      }

      const inputs = ethers.utils.defaultAbiCoder.decode(types, data)

      return {
        name,
        types,
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

    const dataBuf = Buffer.from(data.replace(/^0x/, ''), 'hex')
    const methodId = toHexString(dataBuf.subarray(0, 4))
    var inputsBuf = dataBuf.subarray(4)

    const result = this.abi.reduce((acc, obj) => {
      if (obj.type === 'constructor') return acc
      const name = obj.name || null
      const types = obj.inputs ? obj.inputs.map(x => x.type) : []
      const hash = toHexString(ethabi.methodID(name, types))

      if (hash === methodId) {
        inputsBuf = normalizeAddresses(types, inputsBuf)
        const inputs = ethabi.rawDecode(types, inputsBuf)

        return {
          name,
          types,
          inputs
        }
      }

      return acc
    }, { name: null, types: [], inputs: [] })

    if (!result.name) {
      try {
        const decoded = this.decodeConstructor(data)
        if (decoded) {
          return decoded
        }
      } catch (err) { }
    }

    return result
  }
}

function normalizeAddresses (types, input) {
  let offset = 0
  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    if (type === 'address') {
      input.set(Buffer.alloc(12), offset)
    }

    if (isArray(type)) {
      const size = parseTypeArray(type)
      if (size && size !== 'dynamic') {
        offset += 32 * size
      } else {
        offset += 32
      }
    } else {
      offset += 32
    }
  }

  return input
}

function parseTypeArray (type) {
  const tmp = type.match(/(.*)\[(.*?)\]$/)
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10)
  }
  return null
}

function isArray (type) {
  return type.lastIndexOf(']') === type.length - 1
}

function toHexString (byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2)
  }).join('')
}

module.exports = InputDataDecoder
