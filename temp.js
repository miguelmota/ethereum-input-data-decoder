const ethers = require('ethers')
//let data = '0x6422701600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000032abcd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c61fb040000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000461234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c61feec'

let data = '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000032abcd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c61fb040000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000461234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c61feec'

//data = '0x' + data.slice(-256)

const types = [
  {
    "components": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "state",
        "type": "uint8"
      },
      {
        "name": "valuation",
        "type": "uint256"
      },
      {
        "name": "fingerprint",
        "type": "bytes32"
      },
      {
        "name": "countdown",
        "type": "uint256"
      }
    ],
    "name": "_assets",
    "type": "tuple[]"
  }
]

const BN = require('bn.js')

const inputs = ethers.utils.defaultAbiCoder.decode(types, data)
console.log(inputs[0][0].id)
console.log(inputs[0][0].state)
console.log(inputs[0][0].valuation)
console.log(inputs[0][0].fingerprint)
console.log(inputs[0][0].countdown._hex)
console.log(new BN(inputs[0][0].countdown.toString()))
console.log(inputs[0])
return


    let abi = [
      {
        "components": [
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "state",
            "type": "uint8"
          },
          {
            "name": "valuation",
            "type": "uint256"
          },
          {
            "name": "fingerprint",
            "type": "bytes32"
          },
          {
            "name": "countdown",
            "type": "uint256"
          }
        ],
        "name": "_assets",
        "type": "tuple[]"
      }
    ]

    let hash = ''

    function handleTuple(input) {
      return '(' + input.reduce((acc, x) => {
        if (x.type == 'tuple') {
          acc.push(handleTuple(x.components))
        } else if (x.type == 'tuple[]') {
          acc.push(handleTuple(x.components) + '[]')
        } else {
          acc.push(x.type)
        }
        return acc
      }, []).join(',')  + ')'
    }

    function methodId(methodName, inputs) {
      return methodName + '(' + inputs.reduce((acc, x) => {
        if (x.type === 'tuple[]') {
          acc.push(handleTuple(x.components) + '[]')
        } else if (x.type === 'tuple') {
          acc.push(handleTuple(x.components))
        } else {
          acc.push(x.type)
        }
        return acc
      }, []).join(',') + ')'
    }

    abi = [
      {
        "name": "addr",
        "type": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "name": "chfCents",
        "type": "uint256"
      },
      {
        "name": "currency",
        "type": "string"
      },
      {
        "name": "memo",
        "type": "bytes32"
      }
    ]

    hash = methodId('registerOffChainDonation', abi)
    console.log(hash)
    hash = ethers.utils.keccak256(Buffer.from(hash)).slice(2, 10)

    console.log(hash)

function handleInputs(input) {
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

  console.log('input', input)

  let ret = '(' + input.reduce((acc, x) => {
    if (x.type == 'tuple') {
      acc.push(handleTuple(x.components))
    } else if (x.type == 'tuple[]') {
      acc.push(handleTuple(x.components) + '[]')
    } else {
      acc.push(x.type)
    }
    return acc
  }, []).join(',')  + ')'

  if (tupleArray) {
    return ret + '[]'
  }
}

function genMethodId(methodName, types) {
  const input = methodName + '(' + (types.reduce((acc, x) => {
    acc.push(handleInputs(x))
    return acc
  }, []).join(',')) + ')'

  console.log('input', input)

  return ethers.utils.keccak256(Buffer.from(input)).slice(2, 10)
}

console.log(genMethodId('addAssets', types))