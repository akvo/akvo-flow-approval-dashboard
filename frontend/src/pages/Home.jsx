import React, { useState } from "react";
import Login from "./Login";

const Home = () => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const handleOnFinish = (values) => {
    const { email, password } = values;
    console.log("email", email);
    console.log("password", password);
  };

  return (
    <div>
      <Login onFinish={handleOnFinish} />
    </div>
  );
};

export default Home;
