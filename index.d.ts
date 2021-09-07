import { AbiItem } from "web3-utils";

type NestedArray<T> = T | NestedArray<T>[];

export interface InputData {
  method: string | null;
  types: string[];
  inputs: any[];
  names: NestedArray<string>[];
}

export default class InputDataDecoder {
  constructor(abi: string | AbiItem[]);

  decodeConstructor(data: Buffer | string): InputData;

  decodeData(data: Buffer | string): InputData;
}
