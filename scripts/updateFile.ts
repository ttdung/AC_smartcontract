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
  
  const oldname = "/tmp/demo0/encryptedKey.txt";
  const fileId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(oldname));
 // const fileId = "0x74405ea03568a5286c93fdaf15fd483b3dbd704f04cdac36cf04fe389266ad30"
 console.log('fileId', fileId);

  const newname = "hello.txt";

  const text = oldname+newname;
  console.log("text ",text)
  const proposalId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(oldname+newname));
  console.log("proposalId: ", proposalId)

  // User Dev1: submit proposal to update "abc.txt" => "xyz.txt"
  const submitProposal = await fileAc.connect(dev1).submitUpdateFileProposal(proposalId, fileId, oldname, newname);
  const submitProposalTxReceipt =  await submitProposal.wait();
  console.log('uploadFileTxReceipt', Boolean(submitProposalTxReceipt.status), submitProposalTxReceipt.transactionHash);

  // User Dev2: approve proposal to update "abc.txt" => "xyz.txt"
  // const approveProposal = await fileAc.connect(dev2).approveProposal(proposalId);
  // const approveProposalTxReceipt =  await approveProposal.wait();
  // console.log('uploadFileTxReceipt', Boolean(approveProposalTxReceipt.status), approveProposalTxReceipt.transactionHash);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
