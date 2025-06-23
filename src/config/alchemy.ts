import { Network, Alchemy } from "alchemy-sdk";

const settings = {
  apiKey: "heIOyFtNvVl6AKDrWjMVO",
  network: Network.ETH_MAINNET,
};

export const alchemy = new Alchemy(settings);