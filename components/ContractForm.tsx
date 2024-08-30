import { createRef, FC, FormEvent, useState } from "react";
import Web3 from "web3";

interface Meta {
  writeMethodName: string;
  readMethodName: string;
}
const metadata: Record<string, Meta> = {
  store: { writeMethodName: "store", readMethodName: "retrieve" },
  setName: { writeMethodName: "setName", readMethodName: "getName" },
};

interface Props {
  web3: Web3;
  currentAccount: string;
}

const ContractForm: FC<Props> = ({ web3, currentAccount }) => {
  const readRef = createRef<HTMLInputElement>();
  const [methodName, setMethodName] = useState<string>("store");

  // Smart contract address
  const contractAddress = "0x8527295fc3E2bA36C0bE3fC23EBdD886d9Bc1F70";

  const contractABI = require("../lib/contract-abi.json");

  // Initialize the contract
  const myContract = new web3.eth.Contract(contractABI, contractAddress);

  // Function to call the 'store' method with the parameter 35
  async function storeValue(meta: Meta, value: number) {
    // Gas settings
    const gasLimit = await myContract.methods
      .store(35)
      .estimateGas({ from: currentAccount });
    const gasPrice = await web3.eth.getGasPrice();

    console.log(`gasLimit: ${gasLimit}`);
    console.log(`gasPrice: ${gasPrice}`);

    myContract.methods[meta.writeMethodName](value)
      .send({
        from: currentAccount,
      })
      .then((value: any) => console.log("value:", value))
      .catch((error: any) => console.log(error));
  }

  async function queryValue(meta: Meta) {
    return myContract.methods[meta.readMethodName]()
      .call()
      .then((value: any) => {
        console.log("value:", value);
        if (readRef.current) {
          readRef.current.value = value;
        }
      })
      .catch((error: any) => console.error(error));
  }

  // Execute the function

  const _onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e);
    const value = (e.target as any).value.value;
    if (value) {
      const meta = metadata[methodName];
      storeValue(meta, value).catch(console.error);
    }
  };

  const _bacaAngka = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readRef.current) {
      readRef.current.value = "Memuat...";
    }
    const meta = metadata[methodName];
    queryValue(meta);
  };

  return (
    <div className="flex mt-10">
      <div className="flex flex-col">
        <div className="flex flex-row gap-4 items-center">
          <div>Fungsi:</div>
          <select
            name="methodName"
            className="rounded-md p-2 w-full"
            onChange={(e: any) => setMethodName(e.target.value)}
          >
            <option value="store">number store</option>
            <option value="setName">name store</option>
          </select>
        </div>
        <form onSubmit={_onSubmit} className="flex gap-2 py-2">
          <input type="text" name="value" className="rounded-md p-2" />
          <input
            type="submit"
            value="TULIS"
            className="py-2 px-4 cursor-pointer bg-orange-700 text-white rounded-md"
          />
        </form>
        <form onSubmit={_bacaAngka} className="flex gap-2 py-2">
          <input
            ref={readRef}
            type="text"
            name="value-read"
            className="rounded-md p-2 bg-gray-300"
            disabled
          />
          <button className="py-2 px-4 cursor-pointer bg-orange-700 text-white rounded-md">
            BACA
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContractForm;
