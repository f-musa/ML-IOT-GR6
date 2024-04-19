import React from 'react';
import { useNavigate } from 'react-router-dom';


const EtudiantHome = () => {
    const navigate = useNavigate();
    const logout = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify('')
            });
            if (response.ok) {
                //const data = await response.json();
                localStorage.clear();
                navigate('/login');
            } else {
                // Handle login failure
                console.log('');
            }
        } catch (error) {
            console.error('Login error:', error);
        }

    }
    return (
        <>
            <h1>Prof Home</h1>
            <button onClick={logout}>
                Se deconnecter
            </button>
        </>
    )
}

export default EtudiantHome
