import * as React from 'react';
import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemText, Modal, Typography } from '@mui/material';
import QRCode from 'react-qr-code'
import { socket } from '../Utils';
import alertify from 'alertifyjs';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '5px',
    p: 4,
  };

export default function AccountDropDown() {
    let username = localStorage.getItem('userName')
    const navigate = useNavigate();
    const logout = () => {
        localStorage.clear();
        navigate('/login');
    }

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    // get user info 
    const connectedUser = {
        prenom: localStorage.getItem('prenom'),
        nom: localStorage.getItem('nom'),
        email: `${localStorage.getItem('id')}@sorbonne.fr`,
        id: localStorage.getItem('id')
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL;

    let valueQRcode = ''
    if (connectedUser) {
        valueQRcode = connectedUser.id + ";" + connectedUser.prenom + ";" + connectedUser.nom + ";" + connectedUser.email + ";" + serverUrl
    }

  const createHandleMenuClick = (menuItem) => {
    return () => {
        if (menuItem == "LOGOUT"){
            logout();
        }else if (menuItem == "QR_CODE"){
            handleOpen();
        }
    };
  };

  React.useEffect(()=>{
    const handleMobileDeviceConnected = () => {
        alertify.success('Votre smartphone est connecté avec succès')
        handleClose();
    }
    const handleMicroserviceDisconnected = (data)=>{
        alertify.error(data?.message)
        if (data?.microservice == "MOBILE"){
          handleOpen();
        }
    }

    socket.on('mobile_device_connected', handleMobileDeviceConnected);
    socket.on("microservice_disconnected", handleMicroserviceDisconnected);

  },[])

  return (
    <Dropdown>
      <MenuButton>Compte</MenuButton>
      <Menu slots={{ listbox: Listbox }}>
        <MenuItem onClick={createHandleMenuClick('COMPTE')}>{username}</MenuItem>
        <MenuItem onClick={createHandleMenuClick('QR_CODE')}>
          Afficher le QR code
        </MenuItem>
        <MenuItem onClick={createHandleMenuClick('LOGOUT')}>Se déconnecter</MenuItem>
      </Menu>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style} display='flex' flexDirection='column' alignItems='center'>
            <Typography id="modal-modal-title" variant="h6" component="h2">
            Pour se connecter votre appareil mobile
            </Typography>
            <Typography>Scanner le QR code.</Typography>
            <QRCode value={valueQRcode} size={120} style={{marginTop: 10}} />
            <List>
                <ListItem>
                    <ListItemText
                        primary={"ID utilisateur: " + connectedUser.id}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={"Prénom et nom: " + connectedUser.prenom + " " + connectedUser.nom}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={"Email: " + connectedUser.email}
                    />
                </ListItem>
            </List>
        </Box>
        </Modal>
    </Dropdown>
  );
}

const blue = {
  50: '#F0F7FF',
  100: '#C2E0FF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E6',
  700: '#0059B3',
  800: '#004C99',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Listbox = styled('ul')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  box-shadow: 0px 4px 6px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
  };
  z-index: 1;
  `,
);

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &:focus {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }
  `,
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
  }

  &:active {
    background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }
  `,
);
