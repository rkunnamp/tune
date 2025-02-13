import {fileTypeFromBuffer} from 'file-type';

// predicts file's extension by few hex bytes
export default function fext({hex}) {
  return fileTypeFromBuffer(Buffer.from(hex, "hex"))
}

