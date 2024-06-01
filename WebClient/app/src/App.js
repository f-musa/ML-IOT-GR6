import { useEffect } from 'react';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EtudiantHome from './pages/EtudiantHome';
import ProfesseurHome from './pages/ProfesseurHome';
import ScanQRCode from './pages/ScanQRCode';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NoPage from './pages/NoPage';
import { socket } from './Utils';
import { etablish_socket_connection } from './ConnectionManager';
import CheckDevices from './pages/CheckDevices';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import IdentityControl from './pages/IdentityControl';
import EnvironmentControl from './pages/EnvironmentControl';

import { serverUrl } from './Utils';

const theme = createTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
    red: {
      light: '#ff6659',
      main: '#ff4436',
      dark: '#cc2211',
      contrastText: '#fff',
    }

  },
});



// const socket = io.connect("http://10.192.50.111:5000");
// socket.emit('whoiam', 'WEB_CLIENT')



export default function App() {

  useEffect(() => {
    etablish_socket_connection();
  }, [])
  return (

    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/examen" element={<EtudiantHome />} />
          <Route path="/professeur" element={<ProfesseurHome />} />
          <Route path="/connect-mobile-device" element={<ScanQRCode socket={socket} />} />
          <Route path="/check-devices" element={<CheckDevices socket={socket} />} />
          <Route path="/identity-control" element={<IdentityControl socket={socket} />} />
          <Route path="/environment-control" element={<EnvironmentControl socket={socket} />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

