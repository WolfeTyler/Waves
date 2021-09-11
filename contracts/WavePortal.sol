//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint totalWaves;
    constructor() {
        console.log("1, 2, 4, 8, 16, 32, 64...");
    }

    function wave() public {
        totalWaves += 1;
        console.log("%s is waived!", msg.sender);
    }

    function getTotalWaves() view public returns (uint) {
        console.log("We have %d total waves", totalWaves);
        return totalWaves;
    }
}
