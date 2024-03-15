import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('deployer address', deployer.address)

  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log('deployerBalance', deployerBalance);

  const FileAccessControlFactory = await ethers.getContractFactory(
    "FileAccessControl"
  );
  const fileAc = await FileAccessControlFactory.deploy();
  const receipt = await fileAc.deployed();
  console.log(
    `FileAccessControl is deploy at ${fileAc.address} \nTxHash ${receipt.deployTransaction.hash}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
