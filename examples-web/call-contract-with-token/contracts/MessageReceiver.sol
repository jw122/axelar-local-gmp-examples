//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import {IAxelarExecutable} from "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IAxelarExecutable.sol";
import {IERC20} from "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IERC20.sol";
import {IAxelarGasService} from "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IAxelarGasService.sol";

contract MessageReceiver is IAxelarExecutable {
    IAxelarGasService gasReceiver;

    constructor(address _gateway, address _gasReceiver)
        IAxelarExecutable(_gateway)
    {
        gasReceiver = IAxelarGasService(_gasReceiver);
    }

    event Executed();
    // IAxelarExecutable has an _executeWithToken function that will be triggered by the Axelar network after the callContractWithToken function has been executed. You can write any custom logic there.
    // The payload passed to callContract (and ultimately to the _execute and _executeWithToken) has type bytes. Use the ABI encoder/decoder convert your data to bytes.

    function _executeWithToken(
        string memory, // source
        string memory, // destination
        bytes calldata payload, // recipient addresses
        string memory tokenSymbol, // token
        uint256 amount // amount to send
    ) internal override {
        address[] memory recipients = abi.decode(payload, (address[]));
        address tokenAddress = gateway.tokenAddresses(tokenSymbol);

        uint256 sentAmount = amount / recipients.length;
        for (uint256 i = 0; i < recipients.length; i++) {
            IERC20(tokenAddress).transfer(recipients[i], sentAmount);
        }

        emit Executed();
    }
}
