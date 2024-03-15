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
  
//   event AddFile(bytes32 indexed fileId, address owner, string name, string readRule, address[] writeList, uint threshold);

  fileAc.on('AddFile', (fileId, owner, name, readRule, writeList, threshold, eventData) => {
    let addFileEvent ={
        fileId, owner, name, readRule, writeList, threshold //, eventData
    }
    console.log(JSON.stringify(addFileEvent, null, 4));
  });

//   event UpdateFile(bytes32 indexed fileId, string oldname, string newname);
  fileAc.on('UpdateFile', (fileId, oldname, newname, eventData) => {
    let updateFileEvent ={
        fileId, oldname, newname, //, eventData
    }
    console.log(JSON.stringify(updateFileEvent, null, 4));
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
