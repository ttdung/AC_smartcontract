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
    bytes32 fileId;
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
  event UpdateFile(bytes32 indexed proposalId, bytes32 indexed fileId, string oldname, string newname);
  event UpdateProposal(bytes32 indexed proposalId, bytes32 indexed fileId, string oldname, string newname);
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

  function compare(string memory str1, string memory str2) public pure returns (bool) {
    return (keccak256(abi.encodePacked((str1))) == keccak256(abi.encodePacked((str2))));
  }

  function submitUpdateFileProposal(
    bytes32 proposalId,
    bytes32 fileId,
    string calldata oldname,
    string calldata newname
  ) public {
    string memory text = string.concat(oldname, newname);
    bytes32 fid = keccak256(abi.encodePacked(text));
    // string memory msg1 = string.concat("notmatch expect: ", text);
    //  string memory msg2 = string.concat(msg1, ":");
    //  string memory msg3 = string.concat(msg2, string(abi.encodePacked(keccak256(abi.encodePacked(text)))));

    require(fid == proposalId, "Invalid proposal ID");
    require(isInList(msg.sender, files[fileId].writers) == true, "NO write permission");
    require(compare(files[fileId].name, oldname) == true, "Not matching file name");

    if (isInList(msg.sender, writeProposal[fileId].proposer) == false) {
      writeProposal[proposalId].proposer.push(msg.sender);
      writeProposal[proposalId].fileId = fileId;
      writeProposal[proposalId].oldname = oldname;
      writeProposal[proposalId].newname = newname;

      emit UpdateProposal(
        proposalId,
        writeProposal[proposalId].fileId,
        writeProposal[proposalId].oldname,
        writeProposal[proposalId].newname
      );
    }
  }

  function approveProposal(bytes32 proposalId) public {
    require(isInList(msg.sender, files[writeProposal[proposalId].fileId].writers) == true, "NO voting permission");

    require(isInList(msg.sender, writeProposal[proposalId].proposer) == false, "Already voted");

    writeProposal[proposalId].proposer.push(msg.sender);

    if (writeProposal[proposalId].proposer.length >= files[writeProposal[proposalId].fileId].threshold) {
      // execute updated
      files[writeProposal[proposalId].fileId].name = writeProposal[proposalId].newname;

      emit UpdateFile(
        proposalId,
        writeProposal[proposalId].fileId,
        writeProposal[proposalId].oldname,
        writeProposal[proposalId].newname
      );
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
