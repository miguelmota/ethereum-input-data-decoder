const InputDataDecoder = require('../index');

const abiInput = document.querySelector('#abiInput');
const dataInput = document.querySelector('#dataInput');
const output = document.querySelector('#output');

function decode() {
  output.value = ''

  const abi = JSON.parse(abiInput.value.trim());
  const decoder = new InputDataDecoder(abi);

  // if copied and pasted from etherscan only get data we need
  const data = dataInput.value.trim()
  .replace(/(?:[\s\S]*MethodID: (.*)[\s\S])?[\s\S]?\[\d\]:(.*)/gi, '$1$2')

  dataInput.value = data

  const result = decoder.decodeData(data);

  console.log(result)

  try {
    output.value = JSON.stringify(result, null, 2);
  } catch(error) {
  }
}

document.querySelector('#decode')
.addEventListener('click', function(event) {
  event.preventDefault();
  decode();
});

decode();
