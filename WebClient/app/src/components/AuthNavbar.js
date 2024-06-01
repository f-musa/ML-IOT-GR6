import React from 'react'
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import AccountDropDown from './AccountDropDown';

const AuthNavbar = ({ userName }) => {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.clear();
        navigate('/login');
    }
    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Bienvenue {userName}
                        </Typography>

                        {/* <Button color="inherit" onClick={() => logout()}>Se deconnecter</Button> */}
                        <AccountDropDown logout={logout} />
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    )
}

export default AuthNavbar;
