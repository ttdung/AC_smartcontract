// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FileAccessControl0 is Ownable {
  mapping(address => bool) public dataOwner;
  mapping(bytes32 => address) public fileOwners;
  mapping(bytes32 => string) public readFileRule;
  mapping(bytes32 => address[]) public fileWriters;

  event AddFile(bytes32 indexed fileId, address owner, string readRule, address[] writeList);
  event UpdateFile(bytes32 indexed newFileId, bytes32 indexed oldFileId);
  event UpdateReadRule(bytes32 indexed newFileId, bytes32 indexed oldFileId, string readRule);
  event UpdateWriteList(bytes32 indexed newFileId, bytes32 indexed oldFileId, address[] writeList);

  modifier onlyDataOwner(bytes32 fileId) {
    require(msg.sender == fileOwners[fileId], "Only file owner");
    _;
  }

  function setDataOwner(address user, bool isDataOwner) external onlyOwner {
    dataOwner[user] = isDataOwner;
  }

  function addFile(bytes32 fileId, string calldata readRule, address[] calldata writeList) external {
    require(dataOwner[msg.sender], "Only data owner");

    fileOwners[fileId] = msg.sender;
    readFileRule[fileId] = readRule;
    _setWriteList(fileId, writeList);

    emit AddFile(fileId, msg.sender, readRule, writeList);
  }

  function updateFile(bytes32 newFileId, bytes32 oldFileId) external onlyDataOwner(oldFileId) {
    fileOwners[newFileId] = msg.sender;
    readFileRule[newFileId] = readFileRule[oldFileId];
    _setWriteList(newFileId, fileWriters[oldFileId]);

    emit UpdateFile(newFileId, oldFileId);
  }

  function updateReadRule(
    bytes32 newFileId,
    bytes32 oldFileId,
    string calldata readRule
  ) external onlyDataOwner(oldFileId) {
    // move old attribue from oldFile to newFile
    fileOwners[newFileId] = msg.sender;
    _setWriteList(newFileId, fileWriters[oldFileId]);
    // set new ReadRule
    readFileRule[newFileId] = readRule;

    emit UpdateReadRule(newFileId, oldFileId, readRule);
  }

  function updateWriteList(
    bytes32 newFileId,
    bytes32 oldFileId,
    address[] calldata writeList
  ) external onlyDataOwner(oldFileId) {
    // move old attribue from oldFile to newFile
    fileOwners[newFileId] = msg.sender;
    readFileRule[newFileId] = readFileRule[oldFileId];
    // set new writelist
    _setWriteList(newFileId, writeList);

    emit UpdateWriteList(newFileId, oldFileId, writeList);
  }

  function isWriter(bytes32 fileId, address user) external view returns (bool) {
    for (uint256 i = 0; i < fileWriters[fileId].length; i++) {
      if (fileWriters[fileId][i] == user) {
        return true;
      }
    }
    return false;
  }

  function _setWriteList(bytes32 fileId, address[] memory writeList) private {
    for (uint256 i = 0; i < writeList.length; i++) {
      fileWriters[fileId].push(writeList[i]);
    }
  }
}

