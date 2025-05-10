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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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
