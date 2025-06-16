// import React, { useContext } from "react";
// import { AuthContext } from "../contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function Home() {
//   const { currentUser, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleAuthClick = () => {
//     if (currentUser) {
//       logout();
//     } else {
//       navigate("/auth"); // navigate to your auth page route
//     }
//   };

//   return (
//     <div>
//       <h1>Welcome to the Homepage</h1>
//       <button onClick={handleAuthClick}>
//         {currentUser ? "Logout" : "Sign Up"}
//       </button>
//     </div>
//   );
// }


// src/pages/HomePage.jsx
import React from "react";
import AppLayout from '../../components/layout/AppLayout';

export default function HomePage() {
  return (
    <AppLayout>
      <div>
        <h1>Welcome to the Homepage</h1>
      </div>
    </AppLayout>

  );
}
