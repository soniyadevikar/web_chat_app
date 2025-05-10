import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ChatProvider from './Context/ChatProvider';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="975756004528-aeqdlo05jm7ptc2l4b7j5ps959u9q8j6.apps.googleusercontent.com">
      <BrowserRouter>
        <ChatProvider>
          <ChakraProvider>
            <App />
          </ChakraProvider>
        </ChatProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
