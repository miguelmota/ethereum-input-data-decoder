# Ethereum input data decoder

> Ethereum smart contract transaction input data decoder

Uses [ethereumjs-abi](https://github.com/ethereumjs/ethereumjs-abi) for decoding.

## Demo

[http://lab.moogs.io/ethereum-input-data-decoder](http://lab.moogs.io/ethereum-input-data-decoder)

## Install

```bash
npm install ethereum-input-data-decoder
```

## Usage

Pass [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI) file path to decoder constructor:

```javascript
const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(`${__dirname}/abi.json`);
```

Alternatively, you can pass ABI array object to constructor;

```javascript
const abi = JSON.parse(fs.readFileSync(`${__dirname}/abi.json`));
const decoder = new InputDataDecoder(abi);
```

[example abi](./test/abi.json)

Then you can decode input data:

```javascript
const data = `0x67043cae0000000000000000000000005a9dac9315fdd1c3d13ef8af7fdfeb522db08f020000000000000000000000000000000000000000000000000000000058a20230000000000000000000000000000000000000000000000000000000000040293400000000000000000000000000000000000000000000000000000000000000a0f3df64775a2dfb6bc9e09dced96d0816ff5055bf95da13ce5b6c3f53b97071c800000000000000000000000000000000000000000000000000000000000000034254430000000000000000000000000000000000000000000000000000000000`;

const result = decoder.decodeData(data);

console.log(result);
```

```text
{
  "name": "registerOffChainDonation",
  "types": [
    "address",
    "uint256",
    "uint256",
    "string",
    "bytes32"
    ],
    "inputs": [
      <BN: 5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02>,
      <BN: 58a20230>,
      <BN: 402934>,
      "BTC",
      <Buffer f3 df ... 71 c8>
    ]
}
```

## Test

```bash
npm test
```

## License

MIT
