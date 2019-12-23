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
    t.equal(result.method, 'registerOffChainDonation')
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
    t.plan(7)
    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/abi1.json`))
    const decoder = new InputDataDecoder(abi)

    const result = decoder.decodeData(data)
    t.equal(result.method, 'registerOffChainDonation')
    t.deepEqual(result.types, ['address', 'uint256', 'uint256', 'string', 'bytes32'])
    t.equal(result.inputs[0].toString(16), '5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02')
    t.equal(result.inputs[1].toString(16), '58a20230')
    t.equal(result.inputs[2].toString(16), '402934')
    t.equal(result.inputs[3], 'BTC')
    t.deepEqual(result.names, ['addr', 'timestamp', 'chfCents', 'currency', 'memo'])
    t.end()
  })

  // https://etherscan.io/tx/0xc7add41f6ae5e4fe268f654709f450983510ab7da67812be608faf2133a90b5a
  t.test('contract creation data (constructor)', t => {
    t.plan(4)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/abi1.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/contract_creation_data.txt`)
    const result = decoder.decodeData(data)

    t.equal(result.inputs[0].toString(16), '0xB2Cb826C945D8Df01802b5cf3c4105685D4933A0')
    t.equal(result.inputs[1].toString(16), 'STIFTUNG Dfinity FDC')

    t.equal(result.names[0].toString(), '_masterAuth')
    t.equal(result.names[1].toString(), '_name')
  })

  // https://etherscan.io/tx/0x94fadf5f5c7805b8ceb8a13a0a7fbce06054ff08cdfdc2fd555a7902592aebe6
  t.test('erc721 transferFrom', t => {
    t.plan(6)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/erc721_abi.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/erc721_transferfrom_tx_data.txt`)
    const result = decoder.decodeData(data)

    t.equal(result.inputs[0].toString(16), '10017ca37b1257ac0771e24652aa28c758e378eb')
    t.equal(result.inputs[1].toString(16), 'e7a632d89104385bdd3992eeb82cffeb48e4e539')
    t.equal(result.inputs[2].toString(16), '5dc5')

    t.equal(result.names[0], '_from')
    t.equal(result.names[1], '_to')
    t.equal(result.names[2], '_tokenId')
  })

  // marketSellOrders call
  // https://etherscan.io/tx/0xc79ee30142e935453eabd57f45e01bb394bff78d05cdf8df97631b03ad6cc0cd
  t.test('0x exchange sell (abiv2 tuple[])', t => {
    t.plan(4)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/0x_exchange.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/0x_exchange_data.txt`)
    const result = decoder.decodeData(data)

    t.deepEqual(result.method, 'marketSellOrders')

    const expectedInputs = [
      [
        [
          '0x6f02E6d47147B4448Fe2f2eb25B4f534cf110c23',
          '0x0000000000000000000000000000000000000000',
          '0xA258b39954ceF5cB142fd567A46cDdB31a670124',
          '0x0000000000000000000000000000000000000000',
          { '_hex': '0x410d586a20a4bffff5' },
          { '_hex': '0x5e05647aedbbd450' },
          { '_hex': '0x00' },
          { '_hex': '0x00' },
          { '_hex': '0x5d787202' },
          { '_hex': '0x016d1e79ae50' },
          '0xf47261b000000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359',
          '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        ]
      ],
      { '_hex': '0x2386f26fc10000' },
      [ '0x1b82e97aa18170e6b81ce3a829d77b7067cf3644c8706e97e7c96d5a92de61eb0c5c5aeb4fbfadca6b9fbc5adff91bfb32964aa9e1bf8309dad7e1bd3e45f0b44c03' ]
    ]

    t.deepEqual(result.inputs, expectedInputs)

    const expectedTypes = [
      '(address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes,bytes)[]',
      'uint256',
      'bytes[]'
    ]

    t.deepEqual(result.types, expectedTypes)

    const expectedNames = [
      [
        'orders',
        [
          'makerAddress',
          'takerAddress',
          'feeRecipientAddress',
          'senderAddress',
          'makerAssetAmount',
          'takerAssetAmount',
          'makerFee',
          'takerFee',
          'expirationTimeSeconds',
          'salt',
          'makerAssetData',
          'takerAssetData'
        ]
      ],
      'takerAssetFillAmount',
      'signatures'
    ]

    t.deepEqual(result.names, expectedNames)
  })

  // https://etherscan.io/tx/0xcb0c447659123c5faa2f1e5bc8ac69697688f437c92a8abb4b882bb33cbc661a
  t.test('set issuance (abiv2 tuple)', t => {
    t.plan(4)

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/data/set_exchange_issuance_lib.json`))
    const decoder = new InputDataDecoder(abi)

    const data = fs.readFileSync(`${__dirname}/data/set_issuance.txt`)
    const result = decoder.decodeData(data)

    t.equal(result.method, 'issueRebalancingSetWithEther')

    const expectedInputs = [
      '81c55017F7Ce6E72451cEd49FF7bAB1e3DF64d0C',
      { '_hex': '0x27019ab6af611240' },
      [
        'A37dE6790861B5541b0dAa7d0C0e651F44c6f4D9',
        { '_hex': '0x3bf6ab7ba24000' },
        [ 1 ],
        [ 'C02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ],
        [{ '_hex': '0x1a04a045412d3457' }],
        [
          '89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
          '2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
        ],
        [
          { '_hex': '0x06989640c83ea4a200' },
          { '_hex': '0x19c110' }
        ]
      ],
      '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000040400000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000d5a4cdef78c36901bc9ab7c3108c7d7b06f183e7d71c591bb6c677e3fa2958310a2520b916b792c6538b8e43ccb9a1773e94daa441307827c377f3b197d6549f9de54794a806b697a0300000000000000000000000056178a0d5f301baf6cf3e1cd53d9863437345bf90000000000000000000000000acd0b5cf881cd8398ac563872209de1ce15df0f00000000000000000000000055662e225a3376759c24331a9aed764f8f0c9fbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006b70202a2f0d520000000000000000000000000000000000000000000000000000d97e20f757ec00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005dfa648800000000000000000000000000000000000000000000000015e187ad8bbe980000000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000caa536649a0fdc71bd88fc3a7ecf72f2082e39783296db7a0236b404ca968873f51ce89b4237ecdcf0da1d3cee4306348664629deacaca7f7961ada746036229c5b161612cdb96bad0300000000000000000000000056178a0d5f301baf6cf3e1cd53d9863437345bf90000000000000000000000000acd0b5cf881cd8398ac563872209de1ce15df0f00000000000000000000000055662e225a3376759c24331a9aed764f8f0c9fbb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a38050000000000000000000000000000000000000000000000000ce4d38704d0c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005dfa648800000000000000000000000000000000000000000000000015e187ad8bbe98000000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      true
    ]

    t.deepEqual(result.inputs, expectedInputs)

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

    const expectedTypes = [
      'address',
      'uint256',
      '(address,uint256,uint8[],address[],uint256[],address[],uint256[])',
      'bytes',
      'bool'
    ]
    t.deepEqual(result.types, expectedTypes)
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
