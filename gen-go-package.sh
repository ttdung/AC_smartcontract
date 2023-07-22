#!/usr/bin/env bash

rm -rf ./build/go
mkdir ./build/go


abigen --abi=./build/abi/<ContractName>.json --pkg=contract --type=<ContractName> --out=build/go/<ContractName>.go 
