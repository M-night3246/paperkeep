import React, { useState, useContext } from "react";
import AppLayout from '../../components/layout/AppLayout';
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import LargeButton from "../../components/buttons/LargeButton";
import './auth-page.css';

export default function AuthPage() {
  const { signUp, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const toggleMode = () => {
    setError("");
    setIsSignup(!isSignup);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="auth-container">
        <h1>{isSignup ? "Sign Up" : "Login"}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
          <LargeButton type="submit" style={{ width: "100%" }}>
            {isSignup ? "Sign Up" : "Login"}
          </LargeButton>
        </form>
        <button className="auth-toggle" onClick={toggleMode}>
          {isSignup ? "Have an account?" : "Switch to Sign Up"}
        </button>
        {error && <div className="auth-error">{error}</div>}
      </div>
    </AppLayout>
  );
}
