# Ethereum input data decoder

> Ethereum smart contract transaction input data decoder

Uses [ethereumjs-abi](https://github.com/ethereumjs/ethereumjs-abi) for decoding.

## Install

```bash
npm install ethereum-input-data-decoder
```

## Usage

Pass decoder ABI file path to constructor:

```javascript
const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(`${__dirname}/abi.json`);
```

Alternatively, you can pass ABI array object to constructor;

```javascript
const abi = JSON.parse(fs.readFileSync(`${__dirname}/abi.json`));
const decoder = new InputDataDecoder(abi);
```

Then you can decode input data:

```javascript
const data = `0x67043cae0000000000000000000000005a9dac9315fdd1c...`;
const result = decoder.decodeData(data);

console.log(result);
```

```js
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
Example input data from [this transaction](https://etherscan.io/tx/0xa6f019f2fc916bd8df607f1c99148ebb06322999ff08bc88927fe8406acae1b2).

## License

MIT
