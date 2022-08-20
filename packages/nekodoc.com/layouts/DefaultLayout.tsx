import { NekoDocContent } from "nekodoc";
import React from "react";

import Container from "../components/Container";

type Props = {};

const DefaultLayout: React.FC<Props> = () => (
  <Container>
    <NekoDocContent />
  </Container>
);

export default DefaultLayout;
