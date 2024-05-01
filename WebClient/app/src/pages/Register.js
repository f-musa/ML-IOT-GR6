import React from 'react';
import { Box, Avatar, Button, Radio, Container, CssBaseline, FormControlLabel, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
}));


const Register = () => {
  const [selectedRole, setSelectedRole] = useState("etudiant");
  const [file, setFile] = useState()
  //TODO handle form validation
  // const [nomError, setNomError] = useState(false)
  // const [, setNom] = useState()
  // const [prenom, setPrenom] = useState()
  // const [password, setPassword] = useState()

  // function handleNomChange(event) {
  //   setNom(event.target.value);
  //   if (event.validity.valid) {
  //     setNomError(true);
  //   }
  //   else
  //     setNomError(false);
  // }
  const navigate = useNavigate();
  function handleFile(event) {
    setFile(event.target.files[0])
  }
  function handleRadioButtonChange(event) {
    setSelectedRole(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('prenom', document.getElementById('prenom').value);
    formData.append('nom', document.getElementById('nom').value);
    formData.append('id', document.getElementById('id').value);
    formData.append('password', document.getElementById('password').value);
    formData.append('idPhoto', file);
    formData.append('roleUser', document.getElementById('userRoleSelected').value);
   
    try {
      const response = await fetch(' http://127.0.0.1:5000/signup', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Handle successful signup
        alert('Signup successful');
        navigate('/login');
      } else {
        // Handle error response
        alert("Informations invalides! Veuillez verifier et renseigner tous les champs du formulaire");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <StyledPaper>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" method='POST' noValidate sx={{ mt: 3 }} onSubmit={handleSubmit} >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="prenom"
                required
                fullWidth
                id="prenom"
                label="Prenom"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="nom"
                label="Nom"
                name="nom"
                autoComplete="lname"
              // error={nomError}
              // onChange={handleNomChange}
              // helperText={nomError ? "Veuillez renseigner votre nom" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="id"
                label="Identifiant Universitaire"
                name="id"
                autoComplete=""
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Mot de Passe"
                type="password"
                id="password"
                autoComplete="new-password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField required id="idPhoto" type="file" label="Photo d'identification" onChange={handleFile} />

            </Grid>
            <Grid item xs={12}>
              <FormControl id="roleUser">
                <FormLabel >Je suis</FormLabel>
                <RadioGroup

                  aria-labelledby="role"
                  defaultValue="etudiant"
                  name="radio-buttons-group"
                  onChange={handleRadioButtonChange}
                >
                  <FormControlLabel value="etudiant" control={<Radio />} label="Etudiant" />
                  <FormControlLabel value="enseignant" control={<Radio />} label="Enseignant" />
                  <input id="userRoleSelected" type="hidden" value={selectedRole} />
                </RadioGroup>
              </FormControl>

            </Grid>
          </Grid>
          <Button
            type="  submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Vous avez deja un compte? Connectez vous
              </Link>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
      <Box mt={5}>
        <Typography variant="body2" color="textSecondary" align="center">
          <Link color="inherit" href="#">
            @GROUPE ML-IOT 6
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Register;
