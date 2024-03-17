import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { CONTRACT_ADDRESS } from "./common";

async function main() {
  const [deployer, dev0, dev1, dev2] = await ethers.getSigners();
  // console.log('deployer address', deployer.address);

  // const attr = "student|CS";
  const attr = process.argv[3];
  console.log('Attributes: ', attr);

  const uid = process.argv[2]
  console.log('uid: ', uid);

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
    
    var request = require('request');
    
    //"/tmp/demo0/encryptedKey.txt"
    const options = {
      url: 'http://127.0.0.1:8081/matchpolicy',
      json: true,
      body: {
          uid: uid,
          policy: readRule,
          attr: attr,
          storeenckeyfile: name 
      }
  };
  
  request.post(options, (err, res, body) => {
      if (err) {
          return console.log(err);
      }
      console.log(`Status: ${res.statusCode}`);
      if (res.statusCode == 200) {
        console.log(body);
             
      }

  });

  });

//   event UpdateFile(bytes32 indexed fileId, string oldname, string newname);
  fileAc.on('UpdateFile', (proposalId, fileId, oldname, newname, eventData) => {
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
