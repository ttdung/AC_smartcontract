#!/usr/bin/env bash

# Install abigen
go get -u github.com/ethereum/go-ethereum
cd $GOPATH/src/github.com/ethereum/go-ethereum/
make
make devtools

# Get contract function signatures
npx hardhat finder --prettify --colorify method-identifiers --no-compile --path contracts/reward-creator/ProgramFactory.sol --name ProgramFactory