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
const polygonChain = chains.find((chain: any) => chain.name === "Polygon");
const ethereumChain = chains.find((chain: any) => chain.name === "Ethereum");
console.log("got ethereum chain: ", ethereumChain)
console.log("got polygon chain: ", polygonChain)
// deploy script
async function main() {
  /**
   * DEPLOY ON POLYGON
   */
  const polygonProvider = getDefaultProvider(polygonChain.rpc);
  const polygonConnectedWallet = wallet.connect(polygonProvider);
  console.log("polygon provider: ", polygonProvider);
  console.log("polygon connected wallet: ", polygonConnectedWallet)
  const polygonSender = await deployContract(
    polygonConnectedWallet,
    MessageSenderContract,
    [polygonChain.gateway, polygonChain.gasReceiver],
  );
  console.log("MessageSender deployed on Polygon:", polygonSender.address);
  polygonChain.messageSender = polygonSender.address;
  const polygonReceiver = await deployContract(
    polygonConnectedWallet,
    MessageReceiverContract,
    [polygonChain.gateway, polygonChain.gasReceiver],
  );
  console.log(
    "MessageReceiver deployed on polygon:",
    polygonReceiver.address,
  );
  polygonChain.messageReceiver = polygonReceiver.address;

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
  const updatedChains = [polygonChain,ethereumChain];
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
