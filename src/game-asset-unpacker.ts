interface UnpackedAsset {
  data: any;
  finalByteIndex: number;
}

export function unpackGameAssets(arrayBuffer: ArrayBuffer) {
  const paletteAsset = bytesToPalettes(arrayBuffer, 0);
  return {
    paletteAsset
  }
}

function bytesToPalettes(arrayBuffer: ArrayBuffer, startingOffset = 0): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfPalettes = dataView.getUint8(0);
  const paletteSize = 8 * 3; // eight colors, three bytes per color
  const totalPalettesByteSize = (numberOfPalettes * paletteSize) + 1;

  const palettes = [];

  for (let byteOffset = 1; byteOffset < totalPalettesByteSize; byteOffset += 3) {
    const byte0 = dataView.getUint8(byteOffset);
    const byte1 = dataView.getUint8(byteOffset + 1);
    const byte2 = dataView.getUint8(byteOffset + 2);

    const byte0String = byte0.toString(16).padStart(2, '0');
    const byte1String = byte1.toString(16).padStart(2, '0');
    const byte2String = byte2.toString(16).padStart(2, '0');

    palettes.push('#' + byte0String + byte1String + byte2String);
  }

  const paletteData = chunkArrayInGroups(palettes, 8);

  return {
    data: paletteData,
    finalByteIndex: startingOffset + totalPalettesByteSize
  };
}

function chunkArrayInGroups(array: any[], chunkSize: number): string[][] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
