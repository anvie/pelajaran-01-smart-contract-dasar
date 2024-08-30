import detectEthereumProvider from "@metamask/detect-provider";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import ConnectButton from "../components/ConnectButton";
import ContractForm from "../components/ContractForm";
import { Loading } from "../components/Loading";
import { userAccess } from "../lib/UserAccess";

function isSupportedNetwork(chainId: number): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return chainId === 1; // Ethereum Mainnet
}

const Home: NextPage = () => {
  const router = useRouter();

  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [networkSupported, setNetworkSupported] = useState(true);
  const [noMetamask, setNoMetamask] = useState(false);

  const onAccountsChanged = (accs: any) => {
    if (accs.length === 0) {
      setCurrentAccount(null);
      return;
    }
    if (currentAccount !== accs[0]) {
      // clear up user access local storage
      userAccess.clear();
    }
    setCurrentAccount(accs[0]);
  };
  const onNetworkChanged = async (network: any) => {
    if (network) {
      checkNetwork();
    }
  };

  const checkNetwork = () => {
    const chainId = parseInt((window.ethereum as any)?.chainId, 16);
    if (isNaN(chainId)) {
      return;
    }
    console.log("onNetworkChanged", chainId);
    setNetworkSupported(isSupportedNetwork(chainId));
  };

  useEffect(() => {
    const ethereum: any = window.ethereum;
    if (ethereum?.on) {
      ethereum.on("accountsChanged", onAccountsChanged);
      ethereum.on("networkChanged", onNetworkChanged);
    }

    checkNetwork();

    return () => {
      const ethereum: any = window.ethereum;
      if (ethereum?.removeListener) {
        ethereum.removeListener("accountsChanged", onAccountsChanged);
        ethereum.removeListener("networkChanged", onNetworkChanged);
      }
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      console.log("detectEthereumProvider...");
      try {
        const provider: any = await detectEthereumProvider();
        if (!provider) {
          setErrorInfo(
            "You have no Metamask installed, please install Metamask first",
          );
          setNoMetamask(true);
          return;
        }
        const _web3 = new Web3(provider);
        setWeb3(_web3);
        console.log("web3 loaded");
      } catch (err) {
        console.log("web3 not loaded");
        console.log("ERROR:", err);
        setErrorInfo("Cannot load Web3");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      const path = router.asPath.trim();
      console.log(path);
    }
  }, [router, currentAccount]);

  return (
    <div className="pt-16 md:pt-0 flex">
      <Head>
        <title>Smart Contract Dasar</title>
        <meta name="description" content="Smart Contract Dasar Pelajaran 01" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="modal-root"></div>

      <main className={`flex flex-col w-full items-center`}>
        {!networkSupported && (
          <div className="p-5 bg-orange-500 rounded-xl mb-10">
            Network not supported, please change to Ethereum mainnet
          </div>
        )}

        {errorInfo && (
          <div className="p-5 bg-red-500 rounded-xl mb-10">
            ERROR: {errorInfo}
          </div>
        )}

        <h1 className="text-4xl font-semibold mt-32 mb-10">
          Belajar Smart Contract
        </h1>

        {!currentAccount && <Loading className="p-10" />}

        {!noMetamask && (
          <div className="flex w-full justify-center">
            <ConnectButton
              setAccount={(acc) => setCurrentAccount(acc)}
              noConnectedInfo={false}
              currentAddress={currentAccount}
              onError={(err) => {
                setErrorInfo(
                  "No Metamask detected, make sure you have Metamask installed on your browser",
                );
                setNoMetamask(true);
              }}
            />
          </div>
        )}

        {web3 && currentAccount && (
          <ContractForm web3={web3} currentAccount={currentAccount} />
        )}
      </main>
    </div>
  );
};

export default Home;

function watchTransaction(web3: Web3, txHash: any): Promise<any> {
  console.log("🚀 tx.hash", txHash);
  return new Promise<any>((resolve, reject) => {
    web3.eth
      .getTransactionReceipt(txHash)
      .then((receipt: any) => {
        if (!receipt || !receipt.status) {
          resolve(null);
          return;
        }

        if (receipt.blockNumber > 0) {
          // onMintSuccess(tx);
          // setInCreating(false);
          resolve(receipt);
        }
      })
      .catch((err: any) => {
        console.error(err);
        console.log("Cannot watch transaction");
        reject(err);
      });
  });
}
