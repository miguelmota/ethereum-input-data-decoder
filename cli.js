const path = require('path')
const fs = require('fs')
const meow = require('meow')
const BN = require('bn.js')
const InputDataDecoder = require('./')

const cli = meow(` Usage
      $ ethereum_input_data_decoder [flags] [input]

    Options
      --abi, -a  ABI file path
      --input, -i Input data file path

    Examples
      $ ethereum_input_data_decoder --abi token.abi --input data.txt
      $ ethereum_input_data_decoder --abi token.abi "0x23b872dd..."
`, {
  flags: {
    abi: {
      type: 'string',
      alias: 'a'
    },
    input: {
      type: 'string',
      alias: 'i'
    }
  }
})

let { abi, input } = cli.flags
if (cli.input && cli.input.length > 0) {
  input = cli.input[0]
  run(abi, input)
} else if (input) {
  try {
    input = fs.readFileSync(path.resolve(input))
  } catch(err) { }
  run(abi, input)
} else {
  input = ''
  process.stdin.setEncoding('utf8')
  process.stdin.resume()
  process.stdin.on('readable', () => {
    let chunk
    while ((chunk = process.stdin.read())) {
      input += chunk.toString()
    }
  })
  const t = setTimeout(() => {
    process.exit(0)
  }, 1e3)
  process.stdin.on('end', () => {
    clearTimeout(t)
    run(abi, input)
  })
}

function run (abi, input) {
  const decoder = new InputDataDecoder(path.resolve(abi))
  const result = decoder.decodeData(input)

  if (result.method === null && result.types.length === 0) {
    console.log('No matches')
    return
  }

  const padType = result.types.reduce((a, x) => Math.max(a, x.length), 0)+2
  const padName = result.names.reduce((a, x) => Math.max(a, x.length), 0)+2

  const output = [`${'method'.padEnd(padType)}${result.method}\n`]
  for (let i = 0; i < result.types.length; i++) {
    let value = result.inputs[i]
    if (BN.isBN(value)) {
      value = value.toString(10)
    } else if (result.types[i] === 'address') {
      value = `0x${value}`
    } else if (result.types[i] === 'bytes32') {
      value = `0x${value.toString('hex')}`
    }

    output.push(`${result.types[i].padEnd(padType)}${result.names[i].padEnd(padName)}${value}`)
  }

  console.log(output.join('\n'))
}
