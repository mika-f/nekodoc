import { NekoDocContent } from "nekodoc";
import React from "react";

import Container from "../components/Container";
import Footer from "../components/Footer";
import Header from "../components/Header";

type Props = {};

const DefaultLayout: React.FC<Props> = () => (
  <div className="flex flex-col min-h-screen leading-relaxed">
    <Header />
    <main className="flex-grow mb-4">
      <Container>
        <NekoDocContent />
      </Container>
    </main>
    <Footer />
  </div>
);

export default DefaultLayout;
