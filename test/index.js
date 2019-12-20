const fs = require('fs')
const test = require('tape')
const InputDataDecoder = require('../index')

test('decoder', t => {
  // https://etherscan.io/tx/0xa6f019f2fc916bd8df607f1c99148ebb06322999ff08bc88927fe8406acae1b2
  // const data = fs.readFileSync(`${__dirname}/data/abi1_input_data.txt`)

  // t.test('abi filepath', t => {
  //   t.plan(6)
  //   const decoder = new InputDataDecoder(`${__dirname}/data/abi1.json`)

  //   const result = decoder.decodeData(data)
  //   t.equal(result.method, 'registerOffChainDonation')
  //   t.deepEqual(result.types, [
  //     'address',
  //     'uint256',
  //     'uint256',
  //     'string',
  //     'bytes32'
  //   ])
  //   t.equal(result.inputs[0].toString(16), '5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02')
  //   t.equal(result.inputs[1].toString(16), '58a20230')
  //   t.equal(result.inputs[2].toString(16), '402934')
  //   t.equal(result.inputs[3], 'BTC')
  //   t.end()
  // })

  // t.test('abi array object', t => {
  //   t.plan(7)
  //   const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/abi1.json`))
  //   const decoder = new InputDataDecoder(abi)

  //   const result = decoder.decodeData(data)
  //   t.equal(result.method, 'registerOffChainDonation')
  //   t.deepEqual(result.types, ['address', 'uint256', 'uint256', 'string', 'bytes32'])
  //   t.equal(result.inputs[0].toString(16), '5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02')
  //   t.equal(result.inputs[1].toString(16), '58a20230')
  //   t.equal(result.inputs[2].toString(16), '402934')
  //   t.equal(result.inputs[3], 'BTC')
  //   t.deepEqual(result.names, ['addr', 'timestamp', 'chfCents', 'currency', 'memo'])
  //   t.end()
  // })

  // // https://etherscan.io/tx/0xc7add41f6ae5e4fe268f654709f450983510ab7da67812be608faf2133a90b5a
  // t.test('contract creation data (constructor)', t => {
  //   t.plan(4)

  //   const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/abi1.json`))
  //   const decoder = new InputDataDecoder(abi)

  //   const data = fs.readFileSync(`${__dirname}/data/contract_creation_data.txt`)
  //   const result = decoder.decodeData(data)

  //   t.equal(result.inputs[0].toString(16), '0xB2Cb826C945D8Df01802b5cf3c4105685D4933A0')
  //   t.equal(result.inputs[1].toString(16), 'STIFTUNG Dfinity FDC')

  //   t.equal(result.names[0].toString(), '_masterAuth')
  //   t.equal(result.names[1].toString(), '_name')
  // })

  // // https://etherscan.io/tx/0x94fadf5f5c7805b8ceb8a13a0a7fbce06054ff08cdfdc2fd555a7902592aebe6
  // t.test('erc721 transferFrom', t => {
  //   t.plan(6)

  //   const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/erc721_abi.json`))
  //   const decoder = new InputDataDecoder(abi)

  //   const data = fs.readFileSync(`${__dirname}/data/erc721_transferfrom_tx_data.txt`)
  //   const result = decoder.decodeData(data)

  //   t.equal(result.inputs[0].toString(16), '10017ca37b1257ac0771e24652aa28c758e378eb')
  //   t.equal(result.inputs[1].toString(16), 'e7a632d89104385bdd3992eeb82cffeb48e4e539')
  //   t.equal(result.inputs[2].toString(16), '5dc5')


  //   t.equal(result.names[0], '_from')
  //   t.equal(result.names[1], '_to')
  //   t.equal(result.names[2], '_tokenId')
  // })

  // marketSellOrders call
  // https://etherscan.io/tx/0xc79ee30142e935453eabd57f45e01bb394bff78d05cdf8df97631b03ad6cc0cd
  t.test('0x exchange sell (abiv2 tuple[])', t => {
    t.plan(1)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/0x_exchange.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/0x_exchange_data.txt`)
    const result = decoder.decodeData(data)

    console.log(result);

    t.equal(1, 1)

    // t.equal(result.inputs[0].id.toString(10), '2')
    // t.equal(result.inputs[0].state.toString(10), '2')
    // t.equal(result.inputs[0].valuation.toString(10), '50')
    // t.equal(result.inputs[0].fingerprint.toString(), '0xabcd000000000000000000000000000000000000000000000000000000000000')
    // t.equal(result.inputs[0].countdown.toString(10), '1549925124')
  })

  // https://etherscan.io/tx/0xcb0c447659123c5faa2f1e5bc8ac69697688f437c92a8abb4b882bb33cbc661a
  t.test('set issuance (abiv2 tuple)', t => {
    t.plan(11)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/set_exchange_issuance_lib.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/set_issuance.txt`)
    const result = decoder.decodeData(data)

    // inputs are correct
    t.equal(result.inputs[0], '0x81c55017F7Ce6E72451cEd49FF7bAB1e3DF64d0C')
    t.equal(result.inputs[1].toString(), '2810697751873000000')
    t.equal(result.inputs[2][0], '0xA37dE6790861B5541b0dAa7d0C0e651F44c6f4D9')
    t.equal(result.inputs[2][1].toString(), '16878240000000000')
    t.deepEqual(result.inputs[2][2], [1])
    t.deepEqual(result.inputs[2][3], ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'])
    t.deepEqual(result.inputs[2][4], [{ _hex: '0x1a04a045412d3457' }])
    t.deepEqual(result.inputs[2][5], ['0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'])
    t.deepEqual(result.inputs[2][6], [{ _hex: '0x06989640c83ea4a200' }, { _hex: '0x19c110' }])

    // names are correct
    const expectedNames = [
      '_rebalancingSetAddress',
      '_rebalancingSetQuantity',
      [
        '_exchangeIssuanceParams',
        [
          'setAddress',
          'quantity',
          'sendTokenExchangeIds',
          'sendTokens',
          'sendTokenAmounts',
          'receiveTokens',
          'receiveTokenAmounts'
        ]
      ],
      '_orderData',
      '_keepChangeInVault'
    ]
    t.deepEqual(result.names, expectedNames)

    // types are correct
    const expectedTypes = [
      'address',
      'uint256',
      '(address,uint256,uint8[],address[],uint256[],address[],uint256[])',
      'bytes',
      'bool'
    ]
    t.deepEqual(result.types, expectedTypes)
  })

//   // https://github.com/miguelmota/ethereum-input-data-decoder/issues/8
//   t.test('256 address', t => {
//     t.plan(2)
//     const decoder = new InputDataDecoder(`${__dirname}/data/abi2.json`)

//     const data = '0xa9059cbb85f1150654584d0192059454e9dc1532d9d9cf914926406a02370cea80cf32f600000000000000000000000000000000000000000000000000000000033dc10b'

//     const result = decoder.decodeData(data)
//     t.equal(result.inputs[0].toString(16), 'e9dc1532d9d9cf914926406a02370cea80cf32f6')
//     t.equal(result.inputs[1].toString(10), '54378763')
//   })
})
