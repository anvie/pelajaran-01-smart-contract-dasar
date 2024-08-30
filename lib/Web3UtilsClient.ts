const Web3 = require("web3");
import detectEthereumProvider from "@metamask/detect-provider";

async function connectWallet(): Promise<Array<string>> {
  if (window.ethereum) {
    const eth: any = window.ethereum;
    await eth.enable();
  }
  const provider = await detectEthereumProvider();
  if (!provider) {
    throw new Error("No web3 provider detected");
  }
  const _web3 = new Web3(provider);

  const accounts = await _web3.eth.getAccounts();
  return accounts;
}

export { connectWallet };
