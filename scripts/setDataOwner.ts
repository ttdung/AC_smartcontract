import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { CONTRACT_ADDRESS } from "./common";

async function main() {
  const [deployer, dev0, dev1, dev2] = await ethers.getSigners();
  console.log('deployer address', deployer.address);
  console.log('dev0 address', dev0.address);
 
  const FileAccessControlFactory = await ethers.getContractFactory(
    "FileAccessControl"
  );
  const fileAc = FileAccessControlFactory.attach(CONTRACT_ADDRESS);
  
  const setDataOwnerTx = await fileAc.connect(deployer).setDataOwner(dev0.address, true);
  const setDataOwnerTxReceipt =  await setDataOwnerTx.wait();
  console.log('setDataOwnerTxReceipt', Boolean(setDataOwnerTxReceipt.status), setDataOwnerTxReceipt.transactionHash);

  const isDataOwner = await fileAc.dataOwner(dev0.address);
  console.log('isDataOwner', isDataOwner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
