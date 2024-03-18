import { task } from "hardhat/config";
import { CONTRACT_ADDRESS } from "../scripts/common";
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("addfiles", "Add new files")
.addParam("filename", "file name")
.addParam("readrule", "access tree")
.setAction( async (taskArgs, hre) => {
    const [deployer, dev0, dev1, dev2] = await (hre as any).ethers.getSigners();
    console.log('deployer address', deployer.address);
    console.log('dev0 address', dev0.address);

    console.log("filename: ",taskArgs.filename);
    console.log("read rules: ",taskArgs.readrule);

    const filename = taskArgs.filename; //"/tmp/demo0/encryptedKey.txt";
    const readRule = taskArgs.readrule; //"student and (math or CS)";
    const writerList = [dev1.address, dev2.address];
    const threshold = 2;
  
    const FileAccessControlFactory = await (hre as any).ethers.getContractFactory(
      "FileAccessControl"
    );
    const fileAc = FileAccessControlFactory.attach(CONTRACT_ADDRESS);
    
    const fileId = (hre as any).ethers.utils.keccak256((hre as any).ethers.utils.toUtf8Bytes(filename));
    console.log('fileId', fileId);
  
  
    // addFile(bytes32 fileId, string calldata name, string calldata readRule, 
      // address[] calldata writeList, uint threshold)
    const uploadFileTx = await fileAc.connect(dev0).addFile(fileId, filename, readRule, writerList, threshold);
    const uploadFileTxReceipt =  await uploadFileTx.wait();
  
    console.log('uploadFileTxReceipt', Boolean(uploadFileTxReceipt.status), uploadFileTxReceipt.transactionHash);

//   const accounts = await (hre as any).ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
});



























