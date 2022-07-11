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

const polygonChain = chains.find(
  (chain: any) => chain.name === "Polygon",
) as any;
const ethereumChain = chains.find(
  (chain: any) => chain.name === "Ethereum",
) as any;

if (!polygonChain || !ethereumChain) process.exit(0);

const useMetamask = false; // typeof window === 'object';

const polygonProvider = useMetamask
  ? new providers.Web3Provider((window as any).ethereum)
  : getDefaultProvider(polygonChain.rpc);
const polygonConnectedWallet = useMetamask
  ? (polygonProvider as providers.Web3Provider).getSigner()
  : wallet.connect(polygonProvider);
const ethereumProvider = getDefaultProvider(ethereumChain.rpc);
const ethereumConnectedWallet = wallet.connect(ethereumProvider);

// Gateway contracts are deployed at the source and destination chains
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
  ethereumChain.gateway, // address
  gatewayAbi, // interface
  ethereumConnectedWallet, // signer
);

console.log("source gateway contract: ", srcGatewayContract)

const sourceContract = new Contract(
  ethereumChain.messageSender as string,
  MessageSenderContract.abi,
  ethereumConnectedWallet,
);

const destContract = new Contract(
  polygonChain.messageReceiver as string,
  MessageReceiverContract.abi,
  polygonConnectedWallet,
);

const destGatewayContract = new Contract(
  polygonChain.gateway,
  gatewayAbi,
  polygonConnectedWallet,
);

export function generateRecipientAddress(): string {
  return wallet.address;
  // return ethers.Wallet.createRandom().address;
}

// takes in the amount to send to destination, and a list of recipients
export async function sendTokenToDestChain(
  amount: string,
  recipientAddresses: string[],
  onSent: (txhash: string) => void,
) {
  // Get token address from the gateway contract
  // this is obtained in order to create the erc20 token representation and approve spend from the source wallet
  const tokenAddress = await srcGatewayContract.tokenAddresses("aUSDC");
  console.log("token address for aUSDC: ", tokenAddress);

  // TODO: why can't we get matic?
  const maticTokenAddress = await srcGatewayContract.tokenAddresses("WMATIC");
  console.log("token addresses for matic: ", maticTokenAddress);

  // contract of the token
  const erc20 = new Contract(
    tokenAddress,
    IERC20.abi,
    ethereumConnectedWallet,
  );

  // Approve the token for the amount to be sent from the wallet account at the source
  await erc20
    .approve(sourceContract.address, ethers.utils.parseUnits(amount, 6))
    .then((tx: any) => tx.wait());

  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

  // Calculate how much gas to pay to Axelar to execute the transaction at the destination chain
  // Call the estimateGasFee method to get the sourceGasFee in the desired gas-payment token on the destination chain
  const gasFee = await api.estimateGasFee(
    EvmChain.ETHEREUM, // source chain
    EvmChain.POLYGON, // dest chain
    GasToken.ETH, // source chain token symbol
  );

  console.log("gas fee: ", gasFee)

  // Send the token with the MessageSender contract (source)
  const receipt = await sourceContract
    .sendToMany(
      "Polygon",
      destContract.address,
      recipientAddresses,
      "aUSDC",
      ethers.utils.parseUnits(amount, 6),
      // The msg.value is the gas amount we pay to the AxelarGasService contract
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
    address.substring(0, 9) + "..." + address.substring(address.length - 4)
  );
}

export async function getBalance(addresses: string[], isSource: boolean) {
  const contract = isSource ? srcGatewayContract : destGatewayContract;
  const connectedWallet = isSource
    ? ethereumConnectedWallet
    : polygonConnectedWallet;
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
