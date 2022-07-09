import cn from "classnames";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";
import { wallet, isTestnet } from "../config/constants";
import {
  sendTokenToDestChain,
  getBalance,
  generateRecipientAddress,
  truncatedAddress,
} from "../utils";

import { Card, Row, Col } from "react-bootstrap";

const Home: NextPage = () => {
  const [recipientAddresses, setRecipientAddresses] = useState<string[]>([]);
  const [balances, setBalances] = useState<string[]>([]);
  const [senderBalance, setSenderBalance] = useState<string>();
  const [txhash, setTxhash] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const amount = formData.get("amount") as string;
    setLoading(true);
    await sendTokenToDestChain(amount, recipientAddresses, setTxhash).finally(
      () => {
        setLoading(false);
        handleRefreshSrcBalances();
        handleRefreshDestBalances();
      },
    );
  }

  const handleRefreshDestBalances = useCallback(async () => {
    const _balances = await getBalance(recipientAddresses, false);
    setBalances(_balances);
  }, [recipientAddresses]);

  const handleRefreshSrcBalances = useCallback(async () => {
    const [_balance] = await getBalance([wallet.address], true);
    setSenderBalance(_balance);
  }, []);

  const handleOnGenerateRecipientAddress = () => {
    const recipientAddress = generateRecipientAddress();
    setRecipientAddresses([...recipientAddresses, recipientAddress]);
  };

  useEffect(() => {
    handleRefreshSrcBalances();
  }, [handleRefreshSrcBalances]);

  return (
    <div
      style={{
        backgroundImage: "url('/assets/sunflower-land.png')",
        height: "auto",
        position: "fixed",
        minWidth: "100%",
        minHeight: "100%",
      }}
    >
      <div className="container mt-10 justify-items-center">
        {/* <h1 className="text-4xl font-medium text-center">Sunflower Land </h1>
        <h2 className="text-base text-center">
          Instantly top up your Polygon wallet
        </h2> */}

        <Card className="swapCard p-1 mb-5 bg-white">
          <Card.Body>
            <h2 className="card-title">Ethereum</h2>

            <p>Sender ({truncatedAddress(wallet.address)})</p>
            <p>balance: {senderBalance}</p>

            <form className="flex flex-col w-full" onSubmit={handleOnSubmit}>
              {txhash && isTestnet && (
                <a
                  href={`https://testnet.axelarscan.io/gmp/${txhash}`}
                  className="link link-accent mt-2"
                  target="blank"
                >
                  Track at axelarscan
                </a>
              )}
              <span className="mt-2 font-bold">Destination Address</span>
              {recipientAddresses.map((recipientAddress) => (
                <span key={recipientAddress} className="mt-1">
                  {truncatedAddress(recipientAddress)}
                </span>
              ))}

              <button
                onClick={handleOnGenerateRecipientAddress}
                type="button"
                className={cn("btn btn-accent mt-2", {
                  loading,
                })}
              >
                Send to wallet on Polygon{" "}
              </button>
              <div className="flex">
                <input
                  disabled={loading}
                  required
                  name="amount"
                  type="number"
                  placeholder="Enter amount to send"
                  className="w-full max-w-xs input input-bordered"
                />
                <button
                  className={cn("btn btn-primary ml-2", {
                    loading,
                    "opacity-30": loading || recipientAddresses.length === 0,
                    "opacity-100": !loading && recipientAddresses.length > 0,
                  })}
                  type="submit"
                >
                  Send
                </button>
              </div>
            </form>
          </Card.Body>
        </Card>

        <Col>
          <Card className="swapCard p-1 mb-5 bg-white">
            <Card.Body>
              {" "}
              <h2 className="card-title">Destination</h2>
              <p>
                <span className="badge badge-secondary">Polygon</span>
              </p>
              <div className="h-30">
                <div className="w-full max-w-xs form-control">
                  <div>
                    {recipientAddresses.map((recipientAddress, i) => (
                      <div
                        key={recipientAddress}
                        className="flex justify-between"
                      >
                        <span>{truncatedAddress(recipientAddress)}</span>
                        <span className="font-bold">
                          {balances[i] || `0.00`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className=" card-actions"
                onClick={handleRefreshDestBalances}
              >
                <button className="btn btn-primary">Refresh Balances</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </div>
    </div>
  );
};

export default Home;
