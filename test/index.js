const fs = require('fs')
const test = require('tape')
const InputDataDecoder = require('../index')

test('decoder', t => {
  // https://etherscan.io/tx/0xa6f019f2fc916bd8df607f1c99148ebb06322999ff08bc88927fe8406acae1b2
  const data = fs.readFileSync(`${__dirname}/data/abi1_input_data.txt`)

  t.test('abi filepath', t => {
    t.plan(6)
    const decoder = new InputDataDecoder(`${__dirname}/data/abi1.json`)

    const result = decoder.decodeData(data)
    t.equal(result.name, 'registerOffChainDonation')
    t.deepEqual(result.types, [
      'address',
      'uint256',
      'uint256',
      'string',
      'bytes32'
    ])
    t.equal(result.inputs[0].toString(16), '5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02')
    t.equal(result.inputs[1].toString(16), '58a20230')
    t.equal(result.inputs[2].toString(16), '402934')
    t.equal(result.inputs[3], 'BTC')
    t.end()
  })

  t.test('abi array object', t => {
    t.plan(6)
    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/abi1.json`))
    const decoder = new InputDataDecoder(abi)

    const result = decoder.decodeData(data)
    t.equal(result.name, 'registerOffChainDonation')
    t.deepEqual(result.types, [
      'address',
      'uint256',
      'uint256',
      'string',
      'bytes32'
    ])
    t.equal(result.inputs[0].toString(16), '5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02')
    t.equal(result.inputs[1].toString(16), '58a20230')
    t.equal(result.inputs[2].toString(16), '402934')
    t.equal(result.inputs[3], 'BTC')
    t.end()
  })

  // https://etherscan.io/tx/0xc7add41f6ae5e4fe268f654709f450983510ab7da67812be608faf2133a90b5a
  t.test('contract creation data', t => {
    t.plan(2)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/abi1.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/contract_creation_data.txt`)
    const result = decoder.decodeData(data)

    t.equal(result.inputs[0].toString(16), '0xB2Cb826C945D8Df01802b5cf3c4105685D4933A0')
    t.equal(result.inputs[1].toString(16), 'STIFTUNG Dfinity FDC')
  })

  // https://etherscan.io/tx/0x94fadf5f5c7805b8ceb8a13a0a7fbce06054ff08cdfdc2fd555a7902592aebe6
  t.test('erc721 transferFrom', t => {
    t.plan(3)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/erc721_abi.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/erc721_transferfrom_tx_data.txt`)
    const result = decoder.decodeData(data)

    t.equal(result.inputs[0].toString(16), '10017ca37b1257ac0771e24652aa28c758e378eb')
    t.equal(result.inputs[1].toString(16), 'e7a632d89104385bdd3992eeb82cffeb48e4e539')
    t.equal(result.inputs[2].toString(16), '5dc5')
  })

  t.test('abiv2', t => {
    t.plan(5)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/abiv2.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/abiv2_input_data.txt`)
    const result = decoder.decodeData(data)

    t.equal(result.inputs[0].id.toString(10), '2')
    t.equal(result.inputs[0].state.toString(10), '2')
    t.equal(result.inputs[0].valuation.toString(10), '50')
    t.equal(result.inputs[0].fingerprint.toString(), '0xabcd000000000000000000000000000000000000000000000000000000000000')
    t.equal(result.inputs[0].countdown.toString(10), '1549925124')
  })

  // https://github.com/miguelmota/ethereum-input-data-decoder/issues/8
  t.test('256 address', t => {
    t.plan(2)
    const decoder = new InputDataDecoder(`${__dirname}/data/abi2.json`)

    const data = '0xa9059cbb85f1150654584d0192059454e9dc1532d9d9cf914926406a02370cea80cf32f600000000000000000000000000000000000000000000000000000000033dc10b'

    const result = decoder.decodeData(data)
    t.equal(result.inputs[0].toString(16), 'e9dc1532d9d9cf914926406a02370cea80cf32f6')
    t.equal(result.inputs[1].toString(10), '54378763')
  })
})
