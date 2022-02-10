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
    t.equal(result.inputs[0].toString(16).toLowerCase(), '5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02')
    t.equal(result.inputs[1].toHexString(), '0x58a20230')
    t.equal(result.inputs[2].toHexString(), '0x402934')
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
    t.equal(result.inputs[0].toString().toLowerCase(), '5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02')
    t.equal(result.inputs[1].toHexString(), '0x58a20230')
    t.equal(result.inputs[2].toHexString(), '0x402934')
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

    t.equal(result.inputs[0].toString().toLowerCase(), '10017ca37b1257ac0771e24652aa28c758e378eb')
    t.equal(result.inputs[1].toString().toLowerCase(), 'e7a632d89104385bdd3992eeb82cffeb48e4e539')
    t.equal(result.inputs[2].toHexString(), '0x5dc5')

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
          { 'type': 'BigNumber', 'hex': '0x410d586a20a4bffff5' },
          { 'type': 'BigNumber', 'hex': '0x5e05647aedbbd450' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x5d787202' },
          { 'type': 'BigNumber', 'hex': '0x016d1e79ae50' },
          '0xf47261b000000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359',
          '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        ]
      ],
      { 'type': 'BigNumber', 'hex': '0x2386f26fc10000' },
      ['0x1b82e97aa18170e6b81ce3a829d77b7067cf3644c8706e97e7c96d5a92de61eb0c5c5aeb4fbfadca6b9fbc5adff91bfb32964aa9e1bf8309dad7e1bd3e45f0b44c03']
    ]

    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))

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
      '0x81c55017F7Ce6E72451cEd49FF7bAB1e3DF64d0C',
      { 'type': 'BigNumber', 'hex': '0x27019ab6af611240' },
      [
        '0xA37dE6790861B5541b0dAa7d0C0e651F44c6f4D9',
        { 'type': 'BigNumber', 'hex': '0x3bf6ab7ba24000' },
        [1],
        ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
        [{ 'type': 'BigNumber', 'hex': '0x1a04a045412d3457' }],
        [
          '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
          '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
        ],
        [
          { 'type': 'BigNumber', 'hex': '0x06989640c83ea4a200' },
          { 'type': 'BigNumber', 'hex': '0x19c110' }
        ]
      ],
      '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000040400000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000d5a4cdef78c36901bc9ab7c3108c7d7b06f183e7d71c591bb6c677e3fa2958310a2520b916b792c6538b8e43ccb9a1773e94daa441307827c377f3b197d6549f9de54794a806b697a0300000000000000000000000056178a0d5f301baf6cf3e1cd53d9863437345bf90000000000000000000000000acd0b5cf881cd8398ac563872209de1ce15df0f00000000000000000000000055662e225a3376759c24331a9aed764f8f0c9fbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006b70202a2f0d520000000000000000000000000000000000000000000000000000d97e20f757ec00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005dfa648800000000000000000000000000000000000000000000000015e187ad8bbe980000000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000caa536649a0fdc71bd88fc3a7ecf72f2082e39783296db7a0236b404ca968873f51ce89b4237ecdcf0da1d3cee4306348664629deacaca7f7961ada746036229c5b161612cdb96bad0300000000000000000000000056178a0d5f301baf6cf3e1cd53d9863437345bf90000000000000000000000000acd0b5cf881cd8398ac563872209de1ce15df0f00000000000000000000000055662e225a3376759c24331a9aed764f8f0c9fbb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a38050000000000000000000000000000000000000000000000000ce4d38704d0c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005dfa648800000000000000000000000000000000000000000000000015e187ad8bbe98000000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      true
    ]

    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))

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
    t.equal(result.inputs[0].toString(16).toLowerCase(), 'e9dc1532d9d9cf914926406a02370cea80cf32f6')
    t.equal(result.inputs[1].toString(10), '54378763')
  })

  // https://github.com/miguelmota/ethereum-input-data-decoder/issues/23
  t.test('all inputs for operate(), (complex tuple hierarchies)', t => {
    t.plan(3)
    const decoder = new InputDataDecoder(`${__dirname}/data/PayableProxyForSoloMargin_abi.json`)
    const data = fs.readFileSync(`${__dirname}/data/PayableProxyForSoloMargin_tx_data.txt`)
    const result = decoder.decodeData(data)

    const expectedInputs = [
      [
        [
          '0xb929044aF6a7B7AE12EF0e653ACC59f73cf9577B', // accounts.owner
          { 'type': 'BigNumber', 'hex': '0x00' } // accounts.number
        ]
      ],
      [
        [
          0,
          { 'type': 'BigNumber', 'hex': '0x00' },
          [true, 0, 0, { 'type': 'BigNumber', 'hex': '0x06c46038fa803f00' }],
          { 'type': 'BigNumber', 'hex': '0x00' }, { 'type': 'BigNumber', 'hex': '0x00' },
          '0xa8b39829cE2246f89B31C013b8Cde15506Fb9A76', // actions.otherAddress
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0x'
        ]
      ],
      '0xb929044aF6a7B7AE12EF0e653ACC59f73cf9577B' // sendEthTo
    ]
    const expectedNames = [
      [
        'accounts',
        ['owner', 'number']
      ],
      [
        'actions',
        [
          'actionType',
          'accountId',
          'amount',
          'primaryMarketId',
          'secondaryMarketId',
          'otherAddress',
          'otherAccountId',
          'data'
        ]
      ],
      'sendEthTo'
    ]
    const expectedTypes = [
      '(address,uint256)[]',
      '(uint8,uint256,tuple,uint256,uint256,address,uint256,bytes)[]',
      'address'
    ]

    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))
    t.deepEqual(result.names, expectedNames)
    t.deepEqual(result.types, expectedTypes)
  })

  // We found different behaviour for when WETH is used internally, so make sure to test for both cases
  // - Alexander @ Blocknative
  t.test('1inch swap tests, (common tuple[] usage with internalType)', t => {
    t.plan(6)
    const decoder = new InputDataDecoder(`${__dirname}/data/1inch_exchange_v2_abi.json`)

    // https://etherscan.io/tx/0x4a62d52b5d084476e2cfd6eb4c5dfd8378147aa0186e117ed2710a7e54985ecf
    const dataWithWeth = fs.readFileSync(`${__dirname}/data/1inch_exchange_v2_abi_with_eth.txt`)
    // https://etherscan.io/tx/0x8ac7a9f4f9c8e788b2a4cb29e95f369ba09f0ef4c1bd064e6aa1517ce9247d38
    const dataNoWeth = fs.readFileSync(`${__dirname}/data/1inch_exchange_v2_abi_no_eth.txt`)

    const resultWithWeth = decoder.decodeData(dataWithWeth)
    const resultNoWeth = decoder.decodeData(dataNoWeth)

    const expectedTypes = ['address', '(address,address,address,address,uint256,uint256,uint256,uint256,address,bytes)', '(uint256,uint256,uint256,bytes)[]']

    const expectedNames = [
      'caller', [
        'desc', [
          'srcToken',
          'dstToken',
          'srcReceiver',
          'dstReceiver',
          'amount',
          'minReturnAmount',
          'guaranteedAmount',
          'flags',
          'referrer',
          'permit'
        ]], [
        'calls', [
          'targetWithMandatory',
          'gasLimit',
          'value',
          'data'
        ]
      ]
    ]

    const expectedInputsNoWeth = [
      '0xe069CB01D06bA617bCDf789bf2ff0D5E5ca20C71',
      [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6',
        '0xe069CB01D06bA617bCDf789bf2ff0D5E5ca20C71',
        '0x2C38b7622241958DC0A097D405c468a9176418A3',
        { 'type': 'BigNumber', 'hex': '0x0129c8e900' },
        { 'type': 'BigNumber', 'hex': '0x0b8cfc3e036ef2502538' },
        { 'type': 'BigNumber', 'hex': '0x0be8703fee6d197a3635' },
        { 'type': 'BigNumber', 'hex': '0x04' },
        '0x6884249C226F1443f2b7040A3d6143C170Df34F6',
        '0x'
      ], [
        [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000000000000000000000000000000000000000000000' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xeb5625d9000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec70000000000000000000000002f9ec37d6ccfff1cab21733bdadede11c823ccb00000000000000000000000000000000000000000000000000000000129c8e900'
        ], [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000002f9ec37d6ccfff1cab21733bdadede11c823ccb0' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xc98fefed00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000129c8e9000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000e069cb01d06ba617bcdf789bf2ff0d5e5ca20c710000000000000000000000000000000000000000000000000000000000000003000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec70000000000000000000000005365b5bc56493f08a38e5eb08e36cbbe6fcc83060000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c'
        ], [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000000000000000000000000000000000000000000000' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0x83f1291f000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c000000000000000000000000000000500000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000064eb5625d90000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c0000000000000000000000002f9ec37d6ccfff1cab21733bdadede11c823ccb00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000008000000000000000000000002f9ec37d6ccfff1cab21733bdadede11c823ccb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000104c98fefed000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000e069cb01d06ba617bcdf789bf2ff0d5e5ca20c7100000000000000000000000000000000000000000000000000000000000000030000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c000000000000000000000000f7b9fa01098f22527db205ff9bb6fdf7c7d9f1c5000000000000000000000000f970b8e36e23f7fc3fd752eea86f8be8d83375a600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000000000000448000000000000000000000000000000000000000000000000000000000000024'
        ], [
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0x7f8fe7a000000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000e069cb01d06ba617bcdf789bf2ff0d5e5ca20c7100000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a405971224000000000000000000000000f970b8e36e23f7fc3fd752eea86f8be8d83375a60000000000000000000000006884249c226f1443f2b7040a3d6143c170df34f600000000000000000000000000000000000000000000000000000000000000010000000000000000042b4998f6b3b8f500000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000004df804219786f1d7f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004470bdb947000000000000000000000000f970b8e36e23f7fc3fd752eea86f8be8d83375a6000000000000000000000000000000000000000000000be8703fee6d197a363500000000000000000000000000000000000000000000000000000000'
        ], [
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xb3af37c000000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000024000000000000000000000000f970b8e36e23f7fc3fd752eea86f8be8d83375a60000000000000000000000000000000100000000000000000000000000000001000000000000000000000000f970b8e36e23f7fc3fd752eea86f8be8d83375a60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000002c38b7622241958dc0a097d405c468a9176418a3000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000'
        ]
      ]
    ]

    const expectedInputsWithWeth = [
      '0xb3C9669A5706477a2B237D98eDb9B57678926f04',
      [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0x111111111117dC0aa78b770fA6A738034120C302',
        '0xb3C9669A5706477a2B237D98eDb9B57678926f04',
        '0x83B97790c7dA251FAFB24d6CbfC481cFa4AFc4F6',
        { 'type': 'BigNumber', 'hex': '0x010642ac00' },
        { 'type': 'BigNumber', 'hex': '0x34e551bf0ab692275a' },
        { 'type': 'BigNumber', 'hex': '0x35f9ac3b1a9af32d62' },
        { 'type': 'BigNumber', 'hex': '0x04' },
        '0x382fFCe2287252F930E1C8DC9328dac5BF282bA1',
        '0x'
      ], [
        [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000000000000000000000000000000000000000000000' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xeb5625d9000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000002f9ec37d6ccfff1cab21733bdadede11c823ccb0000000000000000000000000000000000000000000000000000000010642ac00'
        ], [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000002f9ec37d6ccfff1cab21733bdadede11c823ccb0' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xc98fefed0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000010642ac000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000b3c9669a5706477a2b237d98edb9b57678926f040000000000000000000000000000000000000000000000000000000000000003000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000874d8de5b26c9d9f6aa8d7bab283f9a9c6f777f40000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c'
        ], [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000000000000000000000000000000000000000000000' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xb3af37c0000000000000000000000000000000000000000000000000000000000000008080000000000000000000000000000000000000000000000000000000000000240000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c00000000000000000000000000000014000000000000000000000000000000140000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000003fd4cf9303c4bc9e13772618828712c8eac7dd2f000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000'
        ], [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000000000000000000000000000000000000000000000' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xc9f12e9d0000000000000000000000003fd4cf9303c4bc9e13772618828712c8eac7dd2f0000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000326aad2da94c59524ac0d93f6d6cbf9071d7086f20000000000000000000000000000000000000000000000000000000000000000'
        ], [
          { 'type': 'BigNumber', 'hex': '0x8000000000000000000000000000000000000000000000000000000000000000' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xc9f12e9d00000000000000000000000026aad2da94c59524ac0d93f6d6cbf9071d7086f2000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000111111111117dc0aa78b770fa6a738034120c302000000000000000000000003b3c9669a5706477a2b237d98edb9b57678926f040000000000000000000000000000000000000000000000000000000000000000'
        ], [
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0x7f8fe7a000000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000b3c9669a5706477a2b237d98edb9b57678926f0400000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a405971224000000000000000000000000111111111117dc0aa78b770fa6a738034120c302000000000000000000000000382ffce2287252f930e1c8dc9328dac5bf282ba10000000000000000000000000000000000000000000000000000000000000001000000000000000002b79a9b4d8a5c9300000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000fbc539a31bdf05000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004470bdb947000000000000000000000000111111111117dc0aa78b770fa6a738034120c302000000000000000000000000000000000000000000000035f9ac3b1a9af32d6200000000000000000000000000000000000000000000000000000000'
        ], [
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          { 'type': 'BigNumber', 'hex': '0x00' },
          '0xb3af37c000000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000111111111117dc0aa78b770fa6a738034120c302000000000000000000000000000000010000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000064d1660f99000000000000000000000000111111111117dc0aa78b770fa6a738034120c30200000000000000000000000083b97790c7da251fafb24d6cbfc481cfa4afc4f6000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000'
        ]
      ]
    ]

    t.deepEquals(resultNoWeth.types, expectedTypes)
    t.deepEquals(resultWithWeth.types, expectedTypes)
    t.deepEquals(resultNoWeth.names, expectedNames)
    t.deepEquals(resultWithWeth.names, expectedNames)
    t.deepEquals(JSON.stringify(resultNoWeth.inputs), JSON.stringify(expectedInputsNoWeth))
    t.deepEquals(JSON.stringify(resultWithWeth.inputs), JSON.stringify(expectedInputsWithWeth))
  })

  t.test('test abi3.json', t => {
    t.plan(4)
    const decoder = new InputDataDecoder(`${__dirname}/data/abi3.json`)
    const data = fs.readFileSync(`${__dirname}/data/abi3_data.txt`)
    const result = decoder.decodeData(data)

    const expectedInputs = [
      '0x482bc619eE7662759CDc0685B4E78f464Da39C73',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      {
        'type': 'BigNumber',
        'hex': '0x66299080'
      },
      {
        'type': 'BigNumber',
        'hex': '0xe7413e'
      },
      {
        'type': 'BigNumber',
        'hex': '0x61f81da8'
      },
      '0xb0CC32190a06f4bA13027E7D6C516217b49E8eb0',
      [
        27,
        '0xe35fd8994857126c80d25bd1994ba96849fa77556d1360a9e605f04cc8f9d7c1',
        '0x1f2244a355a9ab6ea4864381e5d38d4d9b09a25291d0bf6e61c6f975a4d5b9f7'
      ],
      '0x436c697070657200000000000000000000000000000000000000000000000000'
    ]
    const expectedNames = [
      'inputToken',
      'outputToken',
      'inputAmount',
      'outputAmount',
      'goodUntil',
      'destinationAddress',
      ['theSignature', ['v', 'r', 's']],
      'auxiliaryData'
    ]
    const expectedTypes = [ 'address', 'address', 'uint256', 'uint256', 'uint256', 'address', '(uint8,bytes32,bytes32)', 'bytes' ]

    t.deepEqual(result.method, 'transmitAndSwap')
    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))
    t.deepEqual(result.names, expectedNames)
    t.deepEqual(result.types, expectedTypes)
  })

  t.test('test abi4.json', t => {
    t.plan(4)
    const decoder = new InputDataDecoder(`${__dirname}/data/abi4.json`)
    const data = fs.readFileSync(`${__dirname}/data/abi4_data.txt`)
    const result = decoder.decodeData(data)

    const expectedInputs = [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      {
        'type': 'BigNumber',
        'hex': '0x77359400'
      },
      [
        [
          '0xe2A1b03Cd5D639377B6D6e48d81A50FbC6C955a8',
          '0x4fcfecd10000000000000000000000000000000000000000000000000000000077359400000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        ]
      ],
      {
        'type': 'BigNumber',
        'hex': '0x06d14b423b3af5fc'
      },
      '0xcd43AaD533e663b726DAe4a08185E9db8eBC9f6F'
    ]
    const expectedNames = [
      'fromToken',
      'toToken',
      'fromAmount',
      [
        'trades',
        [
          'moduleAddress',
          'encodedCalldata'
        ]
      ],
      'finalAmountMin',
      'recipient'
    ]
    const expectedTypes = ['address', 'address', 'uint256', '(address,bytes)[]', 'uint256', 'address']

    t.deepEqual(result.method, 'executeTrades')
    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))
    t.deepEqual(result.names, expectedNames)
    t.deepEqual(result.types, expectedTypes)
  })

  // https://github.com/miguelmota/ethereum-input-data-decoder/issues/28
  t.test('test abi5.json', t => {
    t.plan(4)
    const decoder = new InputDataDecoder(`${__dirname}/data/abi5.json`)
    const data = fs.readFileSync(`${__dirname}/data/abi5_data.txt`)
    const result = decoder.decodeData(data)

    const expectedInputs = [
      [
        [
          [
            '0x7842792a8471D0f5aE645f513Cc5999b1bB6B182',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0x6b785a0322126826d8226d77e173d75DAfb84d11',
            {
              'type': 'BigNumber',
              'hex': '0x2386f26fc10000'
            },
            {
              'type': 'BigNumber',
              'hex': '0x00'
            },
            {
              'type': 'BigNumber',
              'hex': '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            }
          ],
          [
            '0x5D87Eb9Ac9C107424734F2a95F11649206cCFeA8',
            '0x6b785a0322126826d8226d77e173d75DAfb84d11',
            '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            {
              'type': 'BigNumber',
              'hex': '0x01ee30107c0827ea7d'
            },
            {
              'type': 'BigNumber',
              'hex': '0x00'
            },
            {
              'type': 'BigNumber',
              'hex': '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            }
          ]
        ]
      ],
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      {
        'type': 'BigNumber',
        'hex': '0x2386f26fc10000'
      },
      {
        'type': 'BigNumber',
        'hex': '0x1b1bd5bfc01a3688'
      }
    ]

    const expectedNames = [ [ 'swapSequences', [ 'pool', 'tokenIn', 'tokenOut', 'swapAmount', 'limitReturnAmount', 'maxPrice' ] ], 'tokenIn', 'tokenOut', 'totalAmountIn', 'minTotalAmountOut' ]
    const expectedTypes = [
      '(address,address,address,uint256,uint256,uint256)', 'address', 'address', 'uint256', 'uint256'
    ]

    t.deepEqual(result.method, 'multihopBatchSwapExactIn')
    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))
    t.deepEqual(result.names, expectedNames)
    t.deepEqual(result.types, expectedTypes)
  })

  // https://github.com/miguelmota/ethereum-input-data-decoder/issues/37
  t.test('test abi6.json', t => {
    t.plan(4)

    const decoder = new InputDataDecoder(`${__dirname}/data/abi6.json`)
    const data = fs.readFileSync(`${__dirname}/data/abi6_data.txt`)
    const result = decoder.decodeData(data)

    // not possible to decode:
    // https://github.com/ethers-io/ethers.js/discussions/2656#discussioncomment-2115587
    const expectedInputs = []
    const expectedNames = [ 'amountOutMin', 'path', 'to', 'deadline' ]
    const expectedTypes = [ 'uint256', 'address[]', 'address', 'uint256' ]

    t.deepEqual(result.method, 'swapExactETHForTokens')
    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))
    t.deepEqual(result.names, expectedNames)
    t.deepEqual(result.types, expectedTypes)
  })

  // https://github.com/miguelmota/ethereum-input-data-decoder/issues/36
  t.test('test abi7.json', t => {
    t.plan(4)

    const decoder = new InputDataDecoder(`${__dirname}/data/abi7.json`)
    const data = fs.readFileSync(`${__dirname}/data/abi7_data.txt`)
    const result = decoder.decodeData(data)

    const expectedInputs = [['0xdac17f958d2ee523a2206206994597c13d831ec70001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8aa99199d1e9644b588796f3215089878440d58e0', '0x7a58b76fFD3989dDbCe7BD632fdcF79B50530A69', { 'type': 'BigNumber', 'hex': '0x60ffb75c' }, { 'type': 'BigNumber', 'hex': '0x1dcd6500' }, { 'type': 'BigNumber', 'hex': '0x1f8587609e8c5bc3bf' }]]
    const expectedNames = [['params', ['path', 'recipient', 'deadline', 'amountIn', 'amountOutMinimum']]]
    const expectedTypes = [ '(bytes,address,uint256,uint256,uint256)' ]

    t.deepEqual(result.method, 'exactInput')
    t.deepEqual(JSON.stringify(result.inputs), JSON.stringify(expectedInputs))
    t.deepEqual(result.names, expectedNames)
    t.deepEqual(result.types, expectedTypes)
  })
})
