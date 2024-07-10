import * as crypto from 'crypto';

const { SHA_512_HASH } = process.env;

export const hashUtils = {
  hash(plainText: string) {
    const hash = crypto.createHash('sha512');
    return hash.update(`${plainText}${SHA_512_HASH}`).digest('hex');
  },
  compare(hashed: string, hash: string) {
    return hashed === hash;
  },
};
