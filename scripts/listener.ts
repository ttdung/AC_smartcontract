import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { CONTRACT_ADDRESS } from "./common";


async function approveUpdate(proposalId, fileAc) {
  const [deployer, dev0, dev1, dev2] = await ethers.getSigners();
  const approveProposal = await fileAc.connect(dev2).approveProposal(proposalId);
  const approveProposalTxReceipt =  await approveProposal.wait();
  console.log('uploadFileTxReceipt', Boolean(approveProposalTxReceipt.status), approveProposalTxReceipt.transactionHash);
} 

async function main() {
  const [deployer, dev0, dev1, dev2] = await ethers.getSigners();
  // console.log('deployer address', deployer.address);

  const attr = "student|CS";
  const uid = "du";
  console.log('Attributes: ', attr);

  const FileAccessControlFactory = await ethers.getContractFactory(
    "FileAccessControl"
  );
  const fileAc = FileAccessControlFactory.attach(CONTRACT_ADDRESS);
  
  fileAc.on('AddFile', (fileId, owner, name, readRule, writeList, threshold, eventData) => {
    let addFileEvent ={
        fileId, owner, name, readRule, writeList, threshold //, eventData
    }
    console.log(JSON.stringify(addFileEvent, null, 4));
    
    var request = require('request');
    
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

//   event UpdateProposal(bytes32 indexed fileId, string oldname, string newname);
  fileAc.on('UpdateProposal', (proposalId, fileId, oldname, newname, eventData) => {
    let updateFileEvent ={
        proposalId, fileId, oldname, newname, //, eventData
    }
    console.log("\nEvent Update Proposal:")
    console.log(JSON.stringify(updateFileEvent, null, 4));

    // TODO
    // 1. Check if this node has write permission
    // 2. check if proposal is valid

    // User Dev2: approve proposal to update file
    console.log("\nApproving proposal: ", proposalId)
    approveUpdate(proposalId, fileAc);
  });

  //   event UpdateFile(bytes32 indexed fileId, string oldname, string newname);
  fileAc.on('UpdateFile', (proposalId, fileId, oldname, newname, eventData) => {
    let updateFileEvent ={
        fileId, oldname, newname, //, eventData
    }
    console.log("\nEvent UpdateFile:")
    console.log(JSON.stringify(updateFileEvent, null, 4));

  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
