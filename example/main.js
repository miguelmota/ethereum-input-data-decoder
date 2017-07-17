const InputDataDecoder = require('../index');

const abiInput = document.querySelector('#abiInput');
const dataInput = document.querySelector('#dataInput');
const output = document.querySelector('#output');

function decode() {
  const abi = JSON.parse(abiInput.value.trim());
  const decoder = new InputDataDecoder(abi);
  const data = dataInput.value.trim().replace(/\[\d+\]:(.*)\n?/gmi,'$1')

  dataInput.value = data

  const result = decoder.decodeData(data);
  output.value = JSON.stringify(result, null, 2);
}

document.querySelector('#decode')
.addEventListener('click', function(event) {
  event.preventDefault();
  decode();
});

decode();
