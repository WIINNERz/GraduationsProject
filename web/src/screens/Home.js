import React from 'react';
import { useNavigate } from "react-router-dom";


const Home = () => {
    const navigate = useNavigate();
    const handlelogout = () => {
        navigate('/');
    }
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <button onClick={handlelogout}> Logout</button>
        </div>
    );
};

export default Home;