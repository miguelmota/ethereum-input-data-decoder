const fs = require('fs');
const test = require('tape');
const InputDataDecoder = require('../index');

test('decoder', t => {
  const data = `0x67043cae0000000000000000000000005a9dac9315fdd1c3d13ef8af7fdfeb522db08f020000000000000000000000000000000000000000000000000000000058a20230000000000000000000000000000000000000000000000000000000000040293400000000000000000000000000000000000000000000000000000000000000a0f3df64775a2dfb6bc9e09dced96d0816ff5055bf95da13ce5b6c3f53b97071c800000000000000000000000000000000000000000000000000000000000000034254430000000000000000000000000000000000000000000000000000000000`

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
});
