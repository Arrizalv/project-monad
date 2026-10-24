// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MonadPantheonArena — On-Chain Victory Settlement
/// @notice Records match victories from "Monad Pantheon: Clash of Deities" on Monad Testnet
/// @dev Deploy via Remix IDE (Injected Provider → Monad Testnet) and update CONTRACT_ADDRESS in constants.js

contract MonadPantheonArena {
    struct VictoryRecord {
        address winner;
        string deity;
        uint256 tilesConquered;
        uint256 timestamp;
    }

    VictoryRecord[] public hallOfFame;
    mapping(address => uint256) public deityWins;

    event ThroneClaimed(
        address indexed winner,
        string deity,
        uint256 tilesConquered,
        uint256 timestamp
    );

    /// @notice Claim a match victory and record it to the Hall of Fame
    /// @param _tilesConquered The number of tiles conquered in the match
    /// @param _deity The name of the deity played (e.g., "Molandak-Zeus")
    function claimVictory(
        uint256 _tilesConquered,
        string memory _deity
    ) external {
        require(_tilesConquered > 0, "Score must be greater than zero");
        hallOfFame.push(
            VictoryRecord(msg.sender, _deity, _tilesConquered, block.timestamp)
        );
        deityWins[msg.sender] += 1;
        emit ThroneClaimed(msg.sender, _deity, _tilesConquered, block.timestamp);
    }

    /// @notice Get the total number of recorded victories
    function getHallOfFameCount() external view returns (uint256) {
        return hallOfFame.length;
    }
}
