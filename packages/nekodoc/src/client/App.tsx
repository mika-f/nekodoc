import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [clientMessage, setClientMessage] = useState("");

  useEffect(() => {
    setClientMessage("Hello From React");
  }, []);

  return (
    <>
      <h1>Hello World!</h1>
      <h2>{clientMessage}</h2>
    </>
  );
};

export default App;
