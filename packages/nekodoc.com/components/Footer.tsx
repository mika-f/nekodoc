import React from "react";
import Container from "./Container";

type Props = {};

const Footer: React.FC<Props> = () => (
  <footer className="text-white bg-gray-700 h-28">
    <Container>
      <div className="my-4">
        <div className="mb-4 text-2xl font-bold">NekoDoc</div>
        <div>
          Copyright &copy; {new Date().getFullYear()} Natsuneko (Natsune
          Mochizuki).
        </div>
      </div>
    </Container>
  </footer>
);

export default Footer;
