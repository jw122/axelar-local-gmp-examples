import cn from "classnames";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";

import { Button, Modal, Card } from "react-bootstrap";

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
      <div>
        <div
          className="container justify-items-center"
          style={{ marginTop: "40%", marginLeft: "25%" }}
        >
          <div className="pixel2">
            <a
              href="/onboarding"
              style={{ color: "white", textDecoration: "none" }}
            >
              <b>Play Game 🌻</b>
            </a>
          </div>
          <div className="pixel2" style={{ marginLeft: "3%" }}>
            <a
              href="/onboarding"
              style={{ color: "white", textDecoration: "none" }}
            >
              <b>Top up wallet 🪙</b>
            </a>
          </div>

          {/* <Button variant="warning">
            <a href="/onboarding" style={{ color: "white" }}>
              Go home
            </a>
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
