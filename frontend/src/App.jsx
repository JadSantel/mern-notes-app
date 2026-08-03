import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? (
        <Login />
      ) : (
        <Register onSwitch={() => setIsLogin(true)} />
      )}
      <p>
        {isLogin ? "No account?" : "Already have an account?"}{" "}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register" : "Log In"}
        </button>
      </p>
    </div>
  );
}