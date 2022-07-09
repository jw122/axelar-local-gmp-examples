import fs from "fs/promises";
import { getDefaultProvider } from "ethers";
import { isTestnet, wallet } from "../config/constants";

const {
  utils: { deployContract },
} = require("@axelar-network/axelar-local-dev");

// load contracts
const MessageSenderContract = require("../artifacts/contracts/MessageSender.sol/MessageSender.json");
const MessageReceiverContract = require("../artifacts/contracts/MessageReceiver.sol/MessageReceiver.json");

let chains = isTestnet
  ? require("../config/testnet.json")
  : require("../config/local.json");

console.log("test net? ", isTestnet)
// get chains
const moonbeamChain = chains.find((chain: any) => chain.name === "Moonbeam");
const ethereumChain = chains.find((chain: any) => chain.name === "Ethereum");
console.log("got ethereum chain: ", ethereumChain)
// deploy script
async function main() {
  /**
   * DEPLOY ON MOONBEAM
   */
  const moonbeamProvider = getDefaultProvider(moonbeamChain.rpc);
  const moonbeamConnectedWallet = wallet.connect(moonbeamProvider);
  const moonbeeamSender = await deployContract(
    moonbeamConnectedWallet,
    MessageSenderContract,
    [moonbeamChain.gateway, moonbeamChain.gasReceiver],
  );
  console.log("MessageSender deployed on Moonbeam:", moonbeeamSender.address);
  moonbeamChain.messageSender = moonbeeamSender.address;
  const moonbeamReceiver = await deployContract(
    moonbeamConnectedWallet,
    MessageReceiverContract,
    [moonbeamChain.gateway, moonbeamChain.gasReceiver],
  );
  console.log(
    "MessageReceiver deployed on Moonbeam:",
    moonbeamReceiver.address,
  );
  moonbeamChain.messageReceiver = moonbeamReceiver.address;

  /**
   * DEPLOY ON ETHEREUM
   */
  const ethereumProvider = getDefaultProvider(ethereumChain.rpc);
  const ethereumConnectedWallet = wallet.connect(ethereumProvider);
  const ethereumSender = await deployContract(
    ethereumConnectedWallet,
    MessageSenderContract,
    [ethereumChain.gateway, ethereumChain.gasReceiver],
  );
  console.log("MessageSender deployed on Ethereum:", ethereumSender.address);
  ethereumChain.messageSender = ethereumSender.address;
  const ethereumReceiver = await deployContract(
    ethereumConnectedWallet,
    MessageReceiverContract,
    [ethereumChain.gateway, ethereumChain.gasReceiver],
  );
  console.log(
    "MessageReceiver deployed on Ethereum:",
    ethereumReceiver.address,
  );
  ethereumChain.messageReceiver = ethereumReceiver.address;

  // update chains
  const updatedChains = [moonbeamChain,ethereumChain];
  if (isTestnet) {
    await fs.writeFile(
      "config/testnet.json",
      JSON.stringify(updatedChains, null, 2),
    );
  } else {
    await fs.writeFile(
      "config/local.json",
      JSON.stringify(updatedChains, null, 2),
    );
  }
}

main();
