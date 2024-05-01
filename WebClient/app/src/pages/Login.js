import React from 'react';
import { styled } from '@mui/system';
import { Avatar, Box, Button, Checkbox, CssBaseline, FormControlLabel, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Copyright = () => (
    <Typography variant="body2" color="textSecondary" align="center">
        <Link color="inherit" href="#">
            @GROUPE ML-IOT 6
        </Link>
    </Typography>
);

const StyledGrid = styled(Grid)({
    height: '100vh',
});

const StyledImageGrid = styled(Grid)({
    backgroundImage: 'url(https://img.freepik.com/free-photo/teenage-girl-does-her-homework-while-sitting-with-books-laptop_169016-39388.jpg?w=1380&t=st=1710748435~exp=1710749035~hmac=943fdf8f6bc67818f03b02077c2ad453ff18de2d0754777a61157febe19f145b)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
}));

const StyledForm = styled('form')(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(1),
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2),
}));

const Login = () => {
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const credentials = {
                id: document.getElementById('id').value,
                password: document.getElementById('password').value
            }
            const response = await fetch('http://127.0.0.1:5000/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);

                const infos = {
                    prenom: data.prenom,
                    nom: data.nom,
                    email: `${data.id}@sorbonne.fr`,
                    id: data.id
                }

                localStorage.setItem('token', data.token); // Store token in localStorage
                localStorage.setItem('role', data.role); // Store role in localStorage
                localStorage.setItem('id', data.id); // Store id in localStorage
                localStorage.setItem('prenom', data.prenom); // Store prenom in localStorage
                localStorage.setItem('nom', data.nom); // Store nom in localStorage
                if (data.role === 'etudiant')
                    navigate('/connect-mobile-device', {
                        state: {
                            user: infos
                        }
                    })
                else
                    navigate('/professeur', infos)
            } else {
                // Handle login failure
                alert("Informations invalides! ");
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <StyledGrid container component="main">
            <CssBaseline />
            <StyledImageGrid item xs={false} sm={4} md={7} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <StyledPaper>
                    <StyledAvatar>
                        <LockOutlinedIcon />
                    </StyledAvatar>
                    <Typography component="h1" variant="h5">
                        Se Connecter
                    </Typography>
                    <StyledForm onSubmit={handleSubmit} method='POST' >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="id"
                            label="Identifiant"
                            name="id"
                            autoComplete=""
                            autoFocus
                            value={id} onChange={(e) => setId(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Mot De Passe"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Se Souvenir de moi"
                        />
                        <StyledSubmitButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                        >
                            Connexion
                        </StyledSubmitButton>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2">
                                    Mot de passe oublié ?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link component={RouterLink} to="/register" variant="body2">
                                    {"Pas de Compte ? S'inscire"}
                                </Link>
                            </Grid>
                        </Grid>
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </StyledForm>
                </StyledPaper>
            </Grid>
        </StyledGrid>
    );
};

export default Login;
