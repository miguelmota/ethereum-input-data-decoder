const fs = require('fs');
const test = require('tape');
const InputDataDecoder = require('../');

/*
 * Example input data from this transaction
 * https://etherscan.io/tx/0xa6f019f2fc916bd8df607f1c99148ebb06322999ff08bc88927fe8406acae1b2
 */

test('decoder', t => {
  const data = `0x67043cae0000000000000000000000005a9dac9315fdd1c3d13ef8af7fdfeb522db08f020000000000000000000000000000000000000000000000000000000058a20230000000000000000000000000000000000000000000000000000000000040293400000000000000000000000000000000000000000000000000000000000000a0f3df64775a2dfb6bc9e09dced96d0816ff5055bf95da13ce5b6c3f53b97071c800000000000000000000000000000000000000000000000000000000000000034254430000000000000000000000000000000000000000000000000000000000`;

  t.test(`abi filepath`, t => {
    t.plan(6);
    const decoder = new InputDataDecoder(`${__dirname}/abi.json`);

    const result = decoder.decodeData(data);
    t.equal(result.name, `registerOffChainDonation`);
    t.deepEqual(result.types, [
      `address`,
      `uint256`,
      `uint256`,
      `string`,
      `bytes32`
    ]);
    t.equal(result.inputs[0].toString(16), `5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02`)
    t.equal(result.inputs[1].toString(16), `58a20230`);
    t.equal(result.inputs[2].toString(16), `402934`);
    t.equal(result.inputs[3], `BTC`);
    t.end();
  });

  t.test(`abi array object`, t => {
    t.plan(6);
    const abi = JSON.parse(fs.readFileSync(`${__dirname}/abi.json`));
    const decoder = new InputDataDecoder(abi);

    const result = decoder.decodeData(data);
    t.equal(result.name, `registerOffChainDonation`);
    t.deepEqual(result.types, [
        `address`,
        `uint256`,
        `uint256`,
        `string`,
        `bytes32`
    ]);
    t.equal(result.inputs[0].toString(16), `5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02`)
    t.equal(result.inputs[1].toString(16), `58a20230`);
    t.equal(result.inputs[2].toString(16), `402934`);
    t.equal(result.inputs[3], `BTC`);
    t.end();
  });

  // https://etherscan.io/tx/0xc7add41f6ae5e4fe268f654709f450983510ab7da67812be608faf2133a90b5a
  t.test(`contract creation data`, t => {
    t.plan(2);

    const abi = JSON.parse(fs.readFileSync(`${__dirname}/abi.json`));
    const decoder = new InputDataDecoder(abi);

    const data = fs.readFileSync(`${__dirname}/contract_creation_data.txt`)
    const result = decoder.decodeData(data)

    t.equal(result.inputs[0].toString(16), `0xB2Cb826C945D8Df01802b5cf3c4105685D4933A0`)
    t.equal(result.inputs[1].toString(16), `STIFTUNG Dfinity FDC`)
  })
})

// https://github.com/miguelmota/ethereum-input-data-decoder/issues/8
test('256 address', t => {
  t.plan(2)
  const decoder = new InputDataDecoder(`${__dirname}/abi2.json`)

  const data = '0xa9059cbb85f1150654584d0192059454e9dc1532d9d9cf914926406a02370cea80cf32f600000000000000000000000000000000000000000000000000000000033dc10b'

  const result = decoder.decodeData(data);
  t.equal(result.inputs[0].toString(16), 'e9dc1532d9d9cf914926406a02370cea80cf32f6')
  t.equal(result.inputs[1].toString(10), '54378763')
})
