// import React, { useContext, useState } from "react";
// import { AuthContext } from "../contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// // TODO: setting up React Router protected routes using currentUser

// export default function Auth() {
//   const [isSignup, setIsSignup] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const { signUp, login } = useContext(AuthContext);

//   const navigate = useNavigate();

//   const toggleMode = () => {
//     setIsSignup(!isSignup);
//     setMessage("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       if (isSignup) {
//         await signUp(email, password);
//       } else {
//         await login(email, password);
//       }
//       navigate("/"); // redirect on success
//     } catch (error) {
//       setMessage(error.message);
//     }
//   };

//   return (
//     <div>
//       <h1>{isSignup ? "Sign Up" : "Login"}</h1>

//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           required
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <br />
//         <br />
//         <input
//           type="password"
//           placeholder="Password"
//           required
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <br />
//         <br />
//         <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
//       </form>

//       <button onClick={toggleMode}>
//         {isSignup ? "Switch to Login" : "Switch to Sign Up"}
//       </button>

//       {message && (
//         <div style={{ color: "red", marginTop: "10px" }}>{message}</div>
//       )}
//     </div>
//   );
// }

// src/pages/AuthPage.jsx
import React, { useState, useContext } from "react";
import AppLayout from '../../components/layout/AppLayout';
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";

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
      navigate("/"); // redirect on success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}>
        <h1>{isSignup ? "Sign Up" : "Login"}</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <button
          onClick={toggleMode}
          style={{ marginTop: "1rem", background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          {isSignup ? "Switch to Login" : "Switch to Sign Up"}
        </button>
        {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}
      </div>
    </AppLayout>
  );
}
