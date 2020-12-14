// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

contract SimpleSmartContract {
  
  function hello() pure public returns(string memory) {
    return 'Hello World';
  }
}