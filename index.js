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

      const method = obj.name || null
      const types = obj.inputs ? obj.inputs.map(x => x.type) : []
      const names = obj.inputs ? obj.inputs.map(x => x.name) : []

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
        method,
        types,
        inputs,
        names
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
      if (obj.type === 'event') return acc
      const method = obj.name || null
      let types = obj.inputs ? obj.inputs.map(x => {
        if (x.type === 'tuple[]') {
          return x
        } else {
          return x.type
        }
      }) : []

      let names = obj.inputs ? obj.inputs.map(x => {
        if (x.type === 'tuple[]') {
          return ''
        } else {
          return x.name
        }
      }) : []

      const hash = genMethodId(method, types)

      if (hash === methodId) {
        let inputs = []

        try {
          inputsBuf = normalizeAddresses(types, inputsBuf)
          inputs = ethabi.rawDecode(types, inputsBuf)
        } catch (err) {
          // TODO: normalize addresses for tuples
          inputs = ethers.utils.defaultAbiCoder.decode(types, inputsBuf)

          inputs = inputs[0]
        }

        return {
          method,
          types,
          inputs,
          names
        }
      }

      return acc
    }, { method: null, types: [], inputs: [], names: [] })

    if (!result.method) {
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

function handleInputs (input) {
  let tupleArray = false
  if (input instanceof Object && input.components) {
    input = input.components
    tupleArray = true
  }

  if (!Array.isArray(input)) {
    if (input instanceof Object && input.type) {
      return input.type
    }

    return input
  }

  let ret = '(' + input.reduce((acc, x) => {
    if (x.type === 'tuple') {
      acc.push(handleInputs(x.components))
    } else if (x.type === 'tuple[]') {
      acc.push(handleInputs(x.components) + '[]')
    } else {
      acc.push(x.type)
    }
    return acc
  }, []).join(',') + ')'

  if (tupleArray) {
    return ret + '[]'
  }
}

function genMethodId (methodName, types) {
  const input = methodName + '(' + (types.reduce((acc, x) => {
    acc.push(handleInputs(x))
    return acc
  }, []).join(',')) + ')'

  return ethers.utils.keccak256(Buffer.from(input)).slice(2, 10)
}

function toHexString (byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2)
  }).join('')
}

module.exports = InputDataDecoder
