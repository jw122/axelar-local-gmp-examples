import cn from "classnames";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";

import { Alert, Row, Col } from "react-bootstrap";

const Home: NextPage = () => {
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
      <div className="container sunflowerBanner justify-items-right">
        <Alert variant="warning" style={{ width: "70%", margin: "auto" }}>
          <h1>Welcome to Sunflower Land!</h1>
          <b>
            From our{" "}
            <a
              href="https://docs.sunflower-land.com/getting-started/getting-setup"
              style={{ color: "green" }}
            >
              setup guide:
            </a>{" "}
          </b>
          <p>
            The game requires users to connect to the Polygon blockchain. Before
            playing, you will also need to ensure that you have some $MATIC in
            your wallet to fund your farm.
          </p>
          <p>
            Each time you make a blockchain transaction you need to pay a small
            amount of $MATIC to the Blockchain to secure your data.
          </p>
          To use on the Polygon network, you will first need to transfer these
          tokens from the exchange (eg. Binance) onto the Polygon network. The
          easiest way to achieve this is through Binance's recent Polygon Wallet
          Integration. You can find this by going into the Withdraw section of
          Binance.
        </Alert>
        <Row style={{ marginLeft: "15%", marginRight: "15%", marginTop: "5%" }}>
          <Col>
            <div className="pixel2">
              <a
                href="/onboarding"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontFamily: "VT323",
                }}
              >
                <b>Start Game 🌻</b>
              </a>
            </div>
          </Col>
          <Col>
            {" "}
            <div className="pixel2">
              <a
                href="/onboarding"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontFamily: "VT323",
                }}
              >
                <b>Top up wallet 🪙</b>
              </a>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
