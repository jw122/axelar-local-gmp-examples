import { Contract, ethers, getDefaultProvider, providers } from "ethers";
import {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";

import MessageSenderContract from "../artifacts/contracts/MessageSender.sol/MessageSender.json";
import MessageReceiverContract from "../artifacts/contracts/MessageReceiver.sol/MessageReceiver.json";
import IERC20 from "../artifacts/@axelar-network/axelar-cgp-solidity/contracts/interfaces/IERC20.sol/IERC20.json";
import { isTestnet, wallet } from "../config/constants";

let chains = isTestnet
  ? require("../config/testnet.json")
  : require("../config/local.json");

const moonbeamChain = chains.find(
  (chain: any) => chain.name === "Moonbeam",
) as any;
const ethereumChain = chains.find(
  (chain: any) => chain.name === "Ethereum",
) as any;

if (!moonbeamChain || !ethereumChain) process.exit(0);

const useMetamask = false; // typeof window === 'object';

const moonbeamProvider = useMetamask
  ? new providers.Web3Provider((window as any).ethereum)
  : getDefaultProvider(moonbeamChain.rpc);
const moonbeamConnectedWallet = useMetamask
  ? (moonbeamProvider as providers.Web3Provider).getSigner()
  : wallet.connect(moonbeamProvider);
const ethereumProvider = getDefaultProvider(ethereumChain.rpc);
const ethereumConnectedWallet = wallet.connect(ethereumProvider);

const gatewayAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "tokenAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const srcGatewayContract = new Contract(
  ethereumChain.gateway,
  gatewayAbi,
  ethereumConnectedWallet,
);

const sourceContract = new Contract(
  ethereumChain.messageSender as string,
  MessageSenderContract.abi,
  ethereumConnectedWallet,
);

const destContract = new Contract(
  moonbeamChain.messageReceiver as string,
  MessageReceiverContract.abi,
  moonbeamConnectedWallet,
);

const destGatewayContract = new Contract(
  moonbeamChain.gateway,
  gatewayAbi,
  moonbeamConnectedWallet,
);

export function generateRecipientAddress(): string {
  return wallet.address;
  // return ethers.Wallet.createRandom().address;
}

export async function sendTokenToDestChain(
  amount: string,
  recipientAddresses: string[],
  onSent: (txhash: string) => void,
) {
  // Get token address from the gateway contract
  const tokenAddress = await srcGatewayContract.tokenAddresses("aUSDC");

  const erc20 = new Contract(
    tokenAddress,
    IERC20.abi,
    ethereumConnectedWallet,
  );

  // Approve the token for the amount to be sent
  await erc20
    .approve(sourceContract.address, ethers.utils.parseUnits(amount, 6))
    .then((tx: any) => tx.wait());

  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

  // Calculate how much gas to pay to Axelar to execute the transaction at the destination chain
  const gasFee = await api.estimateGasFee(
    EvmChain.ETHEREUM,
    EvmChain.MOONBEAM,
    GasToken.AVAX,
  );

  // Send the token
  const receipt = await sourceContract
    .sendToMany(
      "Moonbeam",
      destContract.address,
      recipientAddresses,
      "aUSDC",
      ethers.utils.parseUnits(amount, 6),
      {
        value: BigInt(isTestnet ? gasFee : 3000000),
      },
    )
    .then((tx: any) => tx.wait());

  console.log({
    txHash: receipt.transactionHash,
  });
  onSent(receipt.transactionHash);

  // Wait destination contract to execute the transaction.
  return new Promise((resolve, reject) => {
    destContract.on("Executed", () => {
      destContract.removeAllListeners("Executed");
      resolve(null);
    });
  });
}

export function truncatedAddress(address: string): string {
  return (
    address.substring(0, 6) + "..." + address.substring(address.length - 4)
  );
}

export async function getBalance(addresses: string[], isSource: boolean) {
  const contract = isSource ? srcGatewayContract : destGatewayContract;
  const connectedWallet = isSource
    ? ethereumConnectedWallet
    : moonbeamConnectedWallet;
  const tokenAddress = await contract.tokenAddresses("aUSDC");
  const erc20 = new Contract(tokenAddress, IERC20.abi, connectedWallet);
  const balances = await Promise.all(
    addresses.map(async (address) => {
      const balance = await erc20.balanceOf(address);
      return ethers.utils.formatUnits(balance, 6);
    }),
  );
  return balances;
}
