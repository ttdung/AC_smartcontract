// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FileAccessControl is Ownable {
  struct File {
    address owner;
    string name; // file url
    string readRule;
    address[] writers;
    uint threshold;
  }

  struct Proposal {
    string oldname;
    string newname;
    address[] proposer;
  }

  mapping(address => bool) public dataOwner;
  mapping(bytes32 => File) public files;
  mapping(bytes32 => Proposal) public writeProposal;

  event AddFile(
    bytes32 indexed fileId,
    address owner,
    string name,
    string readRule,
    address[] writeList,
    uint threshold
  );
  event UpdateFile(bytes32 indexed fileId, string oldname, string newname);
  event UpdateReadRule(bytes32 indexed newFileId, bytes32 indexed oldFileId, string readRule);
  event UpdateWriteList(bytes32 indexed newFileId, bytes32 indexed oldFileId, address[] writeList);

  modifier onlyDataOwner(bytes32 fileId) {
    require(msg.sender == files[fileId].owner, "Only file owner");
    _;
  }

  function setDataOwner(address user, bool isDataOwner) external onlyOwner {
    dataOwner[user] = isDataOwner;
  }

  function addFile(
    bytes32 fileId,
    string calldata name,
    string calldata readRule,
    address[] calldata writeList,
    uint threshold
  ) external {
    // TODO: verify fileId existed or not

    require(dataOwner[msg.sender], "Only data owner");

    files[fileId].owner = msg.sender;
    files[fileId].name = name;
    files[fileId].readRule = readRule;
    _setWriteList(fileId, writeList);
    files[fileId].threshold = threshold;

    emit AddFile(fileId, msg.sender, name, readRule, writeList, threshold);
  }

  function isInList(address user, address[] memory list) public pure returns (bool) {
    for (uint256 i = 0; i < list.length; i++) {
      if (list[i] == user) {
        return true;
      }
    }
    return false;
  }

  function submitUpdateFileProposal(bytes32 fileId, string calldata oldname, string calldata newname) public {
    require(isInList(msg.sender, files[fileId].writers) == true, "NO write permission");

    if (isInList(msg.sender, writeProposal[fileId].proposer) == false) {
      writeProposal[fileId].proposer.push(msg.sender);
      writeProposal[fileId].oldname = oldname;
      writeProposal[fileId].newname = newname;
    }
  }

  function approveProposal(bytes32 fileId) public {
    if (isInList(msg.sender, files[fileId].writers) == true) {
      if (isInList(msg.sender, writeProposal[fileId].proposer) == false) {
        writeProposal[fileId].proposer.push(msg.sender);

        if (writeProposal[fileId].proposer.length >= files[fileId].threshold) {
          // execute updated
          files[fileId].name = writeProposal[fileId].newname;

          emit UpdateFile(fileId, writeProposal[fileId].oldname, writeProposal[fileId].newname);
        }
      }
    }
  }

  // function updateFile(bytes32 newFileId, bytes32 oldFileId) external onlyDataOwner(oldFileId) {
  //   fileOwners[newFileId] = msg.sender;
  //   readFileRule[newFileId] = readFileRule[oldFileId];
  //   _setWriteList(newFileId, fileWriters[oldFileId]);

  //   emit UpdateFile(newFileId, oldFileId);
  // }

  // function updateReadRule(
  //   bytes32 newFileId,
  //   bytes32 oldFileId,
  //   string calldata readRule
  // ) external onlyDataOwner(oldFileId) {
  //   // move old attribue from oldFile to newFile
  //   fileOwners[newFileId] = msg.sender;
  //   _setWriteList(newFileId, fileWriters[oldFileId]);
  //   // set new ReadRule
  //   readFileRule[newFileId] = readRule;

  //   emit UpdateReadRule(newFileId, oldFileId, readRule);
  // }

  // function updateWriteList(
  //   bytes32 newFileId,
  //   bytes32 oldFileId,
  //   address[] calldata writeList
  // ) external onlyDataOwner(oldFileId) {
  //   // move old attribue from oldFile to newFile
  //   fileOwners[newFileId] = msg.sender;
  //   readFileRule[newFileId] = readFileRule[oldFileId];
  //   // set new writelist
  //   _setWriteList(newFileId, writeList);

  //   emit UpdateWriteList(newFileId, oldFileId, writeList);
  // }

  function _setWriteList(bytes32 fileId, address[] memory writeList) private {
    for (uint256 i = 0; i < writeList.length; i++) {
      files[fileId].writers.push(writeList[i]);
    }
  }
}
