import { Struct, StructData } from "@binary-files/structjs";

export interface HeaderStructData extends StructData {
  signature: number;
  fileSize: number;
  offsetToStartOfBitmapData: number;
}

export interface InfoHeaderStructData extends StructData {
  sizeOfInfoHeader: number;
  imageWidth: number;
  imageHeight: number;
  planes: number;
  bitsPerPixel: number;
  compression: number;
  bitmapDataSize: number;
  xPixelsPerMeter: number;
  yPixelsPerMeter: number;
  numberOfColors: number;
  importantColors: number;
}

export interface PixelStructData extends StructData {
  red: number;
  green: number;
  blue: number;
}

export const headerStruct = new Struct(
  Struct.Uint16('signature'),
  Struct.Uint32('fileSize'),
  Struct.Skip(4),
  Struct.Uint32('offsetToStartOfBitmapData'),
);

export const infoHeaderStruct = new Struct(
  Struct.Uint32('sizeOfInfoHeader'),
  Struct.Uint32('imageWidth'),
  Struct.Uint32('imageHeight'),
  Struct.Uint16('planes'),
  Struct.Uint16('bitsPerPixel'),
  Struct.Uint32('compression'),
  Struct.Uint32('bitmapDataSize'),
  Struct.Uint32('xPixelsPerMeter'),
  Struct.Uint32('yPixelsPerMeter'),
  Struct.Uint32('numberOfColors'),
  Struct.Uint32('importantColors'),
);

export const pixelDataStruct = new Struct(
  Struct.Uint8('blue'),
  Struct.Uint8('green'),
  Struct.Uint8('red'),
);