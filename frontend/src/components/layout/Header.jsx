import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import './layout.css';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { FiX, FiMenu, FiLogIn, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import logo from '../../logo.svg';
import { ThemeContext } from '../../contexts/ThemeContext';


const Header = ({ onToggleSidebar, isSidebarOpen, dark, setDark }) => {

  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuthBtnClick = async () => {
    if (currentUser) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed", error);
      }
    } else {
      navigate("/auth");
    }
  };

  // useEffect(() => {
  //   fetch("http://127.0.0.1:8000/api/main/init/", {
  //     method: "GET",
  //     credentials: "include", // ⬅️ required to receive cookies
  //   })
  //     .then(res => res.json())
  //     .then(data => console.log("CSRF setup data:", data));
  // }, []);

  return (
    <header className="header">
      <button className="header-menu-button" onClick={onToggleSidebar}>
          {isSidebarOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
      </button>
      <Link className="header-logo" to = '/'> 
        <img className="header-logo-img" src={logo} alt="Paperkeep Logo" />      
      </Link>
      <div className="header-right">
        <button className="header-button" onClick={handleAuthBtnClick}>
          {currentUser ? <FiLogOut size={25} /> : <FiLogIn size={25} />}
        </button>
        <button className="header-button" onClick={toggleTheme}>
          {theme === "dark" ? <FiSun size={25} /> : <FiMoon size={25} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
