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

import { Card, Row, Col, Badge, Button } from "react-bootstrap";

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
        backgroundImage: "url('/assets/sunflower2.png')",
        height: "auto",
        position: "fixed",
        minWidth: "100%",
        minHeight: "100%",
      }}
    >
      <div className="container mt-10 justify-items-center">
        <Card className="swapCard p-1 mb-3 bg-white">
          <Card.Body>
            <h2 className="card-title">Source</h2>

            <h5>
              <span className="gradientTextDark">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1257px-Ethereum_logo_2014.svg.png"
                  width="15px"
                ></img>
                Ethereum
              </span>
            </h5>
            <p>
              <b>Sender:</b> {truncatedAddress(wallet.address)} (<b>balance:</b>{" "}
              {senderBalance})
            </p>

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
              <span className="font-bold">Destination Address</span>
              {recipientAddresses.map((recipientAddress) => (
                <span key={recipientAddress} className="mt-1">
                  {truncatedAddress(recipientAddress)}
                </span>
              ))}

              <div
                style={{ marginTop: "3%", marginBottom: "3%" }}
                onClick={handleOnGenerateRecipientAddress}
              >
                <Badge bg="dark">
                  Send to same address on{" "}
                  <span style={{ color: "rgb(180, 130, 255)" }}>Polygon</span>
                </Badge>
              </div>

              <div className="flex">
                <input
                  disabled={loading}
                  required
                  name="amount"
                  type="number"
                  placeholder="Enter amount to send"
                  className="w-full max-w-xs input input-bordered"
                />
                <button className="btnHover color2" type="submit">
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
              <h5>
                <span className="gradientText">
                  {" "}
                  <img
                    src="https://cryptologos.cc/logos/polygon-matic-logo.png"
                    width="25px"
                  ></img>
                  Polygon
                </span>
              </h5>{" "}
              <div className="h-30">
                <p>
                  <b>Balances</b>
                </p>
                <div
                  className="w-full max-w-xs form-control"
                  style={{ borderWidth: "0px" }}
                >
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
                <button
                  className="btnHover color2"
                  style={{ width: "140px", height: "45px", marginLeft: "0px" }}
                >
                  Refresh Balances
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </div>
    </div>
  );
};

export default Home;
