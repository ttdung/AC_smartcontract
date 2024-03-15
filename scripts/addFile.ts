import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { CONTRACT_ADDRESS } from "./common";

async function main() {
  const [deployer, dev0, dev1, dev2] = await ethers.getSigners();
  console.log('deployer address', deployer.address);
 
  const FileAccessControlFactory = await ethers.getContractFactory(
    "FileAccessControl"
  );
  const fileAc = FileAccessControlFactory.attach(CONTRACT_ADDRESS);
  
  const fileId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("hash.txt"));
  console.log('fileId', fileId);
  const readRule = "student AND (math or CS)";
  const writerList = [dev1.address, dev2.address];
  const filename = "hello.txt";
  const threshold = 2;

  // addFile(bytes32 fileId, string calldata name, string calldata readRule, 
    // address[] calldata writeList, uint threshold)
  const uploadFileTx = await fileAc.connect(dev0).addFile(fileId, filename, readRule, writerList, threshold);
  const uploadFileTxReceipt =  await uploadFileTx.wait();

  console.log('uploadFileTxReceipt', Boolean(uploadFileTxReceipt.status), uploadFileTxReceipt.transactionHash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});