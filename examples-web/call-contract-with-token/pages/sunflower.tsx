import cn from "classnames";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";

import { Button, Modal } from "react-bootstrap";

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
        <div className="grid grid-cols-2  mt-20 justify-items-center">
          <Button>
            <a href="/onboarding" style={{ color: "white" }}>
              Go home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
