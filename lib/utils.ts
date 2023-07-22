import { BigNumber, ethers } from "ethers";
import { encode } from "@ethersproject/rlp";

const { hexDataSlice, keccak256, getAddress } = ethers.utils;

export const time = {
  now: () => {
    return Math.floor(new Date().getTime() / 1000);
  },
  timeFromNow: (second: number) => {
    return Math.floor(new Date().getTime() / 1000) + second;
  },
};

export const getRandomAddress = (str: string, nonce: number) => {
  const nonceHex = ethers.BigNumber.from(nonce).toHexString();
  const now = ethers.BigNumber.from(new Date().getTime()).toHexString();
  const strHex = keccak256(Buffer.from(str, "ascii"));
  return getAddress(
    hexDataSlice(keccak256(encode([strHex, now, nonceHex])), 12)
  );
};

export const neg = (num: BigNumber): BigNumber => {
  return num.mul(BigNumber.from(-1));
};
