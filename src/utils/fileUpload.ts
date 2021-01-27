import { writeFileSync } from 'fs';
import sharp from 'sharp';
import imagemin from 'imagemin';
import mozjpeg from 'imagemin-mozjpeg';

import { Upload } from '../types';

const convertToJpg = async (input: Buffer, mimeType: string) => {
  if (mimeType.includes('png')) {
    return sharp(input)
      .jpeg()
      .toBuffer();
  }
  return input;
};

const uploadBuffer = async (buffer: Buffer, filePath: string, mimetype: string) => {
  const imgBuffer = await convertToJpg(buffer, mimetype);
  const miniBuffer = await imagemin.buffer(imgBuffer, {
    plugins: [mozjpeg({ quality: 75 })],
  });
  writeFileSync(filePath, miniBuffer);
  return true;
};

const fileUpload = async (picture: Upload, filePath: string) => {
  const buffers: Uint8Array[] = [];
  const readableStream = picture;
  const buffer = await new Promise<Buffer | null>((res) => readableStream
    .createReadStream()
    .on('data', (chunk) => {
      buffers.push(chunk);
    })
    .on('end', () => {
      res(Buffer.concat(buffers));
    })
    .on('error', () => {
      res(null);
    }));
  if (!buffer) {
    return null;
  }
  return uploadBuffer(buffer, filePath, picture.mimetype);
};

export default fileUpload;
