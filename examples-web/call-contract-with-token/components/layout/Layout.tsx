import React, { ReactNode } from "react";
import { Navbar } from "./Navbar";

type LayoutProps = {
  children: ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  return (
    <div className="h-auto min-h-screen">
      <Navbar />
      <main>{props.children}</main>
    </div>
  );
};
