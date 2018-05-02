<h1 align="center">
  <br />
  <img src="https://user-images.githubusercontent.com/168240/39537094-61c30484-4ded-11e8-8c93-410ba0510cf4.png" alt="Ethereum input data decoder" width="750" />
  <br />
  <br />
  <br />
</h1>

> Ethereum smart contract transaction input data decoder

## Demo

[https://lab.miguelmota.com/ethereum-input-data-decoder](https://lab.miguelmota.com/ethereum-input-data-decoder)

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

Example using input response from [web3.getTransaction](https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransaction):

```javascript
web3.eth.getTransaction(txHash, (error, txResult) => {
  const result = decoder.decodeData(txResult.input);
  console.log(result);
});
```

## Test

```bash
npm test
```

## FAQ

- Q: How can I retrieve the ABI?

  - A: You can generate the ABI from the solidity source files using the [Solidity Compiler](http://solidity.readthedocs.io/en/develop/installing-solidity.html).

    ```bash
    solc --abi MyContract.sol -o build
    ```

- Q: Can this library decode contract creation input data?

  - A: Yes, it can decode contract creation input data.

## License

MIT
