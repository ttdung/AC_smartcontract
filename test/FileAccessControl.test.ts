/* eslint-disable node/no-missing-import */
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FileAccessControl } from "../typechain-types";

describe("File Access Control Testing", function () {
  let owner: SignerWithAddress;
  let dataOwner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let fileAc: FileAccessControl;

  beforeEach(async () => {
    [owner, dataOwner, user1, user2] = await ethers.getSigners();
    const FileAccessControlFactory = await ethers.getContractFactory(
      "FileAccessControl"
    );
    fileAc = await FileAccessControlFactory.deploy();
    await fileAc.deployed();
  });

  it("Should work successfully", async () => {
    const addDoTx = await fileAc.setDataOwner(dataOwner.address, true);
    await addDoTx.wait();

    const isDo = await fileAc.dataOwner(dataOwner.address);
    expect(isDo).to.equal(true);

    // add file
    const fileId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("abc"));
    const addFileTx = await fileAc
      .connect(dataOwner)
      .addFile(fileId, "student AND (math or CS)", [
        user1.address,
        user2.address,
      ]);
    await addFileTx.wait();

    // update file
    const newFileId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("bcd"));
    const updateFileTx = await fileAc
      .connect(dataOwner)
      .updateFile(newFileId, fileId);
    await updateFileTx.wait();

    const readRule = await fileAc.readFileRule(newFileId);
    expect(readRule).to.equal("student AND (math or CS)");

    // update read rule
    const newFileId2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("cde"));
    const updateReadRuleTx = await fileAc
      .connect(dataOwner)
      .updateReadRule(newFileId2, newFileId, "student AND (math AND CS)");
    await updateReadRuleTx.wait();

    const readRule2 = await fileAc.readFileRule(newFileId2);
    expect(readRule2).to.equal("student AND (math AND CS)");

    // update write list
    const newFileId3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("def"));
    const updateWriteListTx = await fileAc
      .connect(dataOwner)
      .updateWriteList(newFileId3, newFileId2, [user1.address]);
    await updateWriteListTx.wait();

    const isWriterOfOldFile = await fileAc.isWriter(newFileId2, user2.address);
    expect(isWriterOfOldFile).to.equal(true);

    const isWriterOfNewFile = await fileAc.isWriter(newFileId3, user2.address);
    expect(isWriterOfNewFile).to.equal(false);
  });
});
