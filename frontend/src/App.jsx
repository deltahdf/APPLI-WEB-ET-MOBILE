import React from 'react';
import backgroundImage from '../logos/background2.png';


import M from 'materialize-css';

function App({ onNavigate }) {
 React.useEffect(() => {
 M.AutoInit();
 }, []);
 return (
    <div>
    {/* Contenu principal avec l'image de fond */}
    <div
        style={{
            height: '100vh',
            width: '100vw',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: '#fff', 
            textAlign: 'center',
            padding: '20px',
            position: 'relative', 
        }}
            >
        
        <h1 style={{ fontSize: '100px', fontWeight: 'bold', marginTop: '160px' }}>WhatsApp !</h1>

        <div style={{ marginTop: '250px' }}>
        <a
        className="waves-effect waves-light btn-large"
        style={{ fontSize: '30px', backgroundColor: '#25D366', color: 'white', marginLeft: '10px', marginRight: '10px' }}
        onClick={onNavigate}
        >
        Enter here to Login
        </a>
        </div>
        </div>

    
    </div>
    );
}

export default App;