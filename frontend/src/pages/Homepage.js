import {
  Box,
  Divider,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ChatState } from '../Context/ChatProvider';
import API from '../config/axios';
import './Homepage.css';
import heyULogo from '../assets/logo-login.png';

const Homepage = () => {
  const navigate = useNavigate();
  const { setUser } = ChatState();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user) navigate('/chats');
  }, [navigate]);

  return (
    <div className="App">
      <div className="left-panel">
        <img src={heyULogo} alt="HeyU Logo" />
      </div>
      <div className="right-panel">
        <Box className="form-box">
          <Tabs variant="soft-rounded" colorScheme="green" isFitted>
            <TabList mb="1em">
              <Tab sx={{ color: 'white' }}>Login</Tab>
              <Tab sx={{ color: 'white' }}>Sign Up</Tab>
            </TabList>

            <TabPanels>
              {/* LOGIN TAB */}
              <TabPanel>
                <Login />
                <Flex align="center" my={4}>
                  <Divider />
                  <Text px={2} color="gray.500" fontSize="sm">OR</Text>
                  <Divider />
                </Flex>
                <Flex justify="center" mt={4}>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        const { credential } = credentialResponse;
                        const { data } = await API.post("/api/user/google-login", { token: credential });
                        localStorage.setItem("userInfo", JSON.stringify(data));
                        setUser(data);
                        navigate("/chats");
                      } catch (error) {
                        console.error("Google Login Backend Error:", error);
                      }
                    }}
                    onError={() => {
                      console.log("Google Login Failed");
                    }}
                  />
                </Flex>
              </TabPanel>

              {/* SIGNUP TAB */}
              <TabPanel>
                <Flex justify="center" mb={4}>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        const { credential } = credentialResponse;
                        const { data } = await API.post("/api/user/google-login", { token: credential });
                        localStorage.setItem("userInfo", JSON.stringify(data));
                        setUser(data);
                        navigate("/chats");
                      } catch (error) {
                        console.error("Google Login Backend Error:", error);
                      }
                    }}
                    onError={() => {
                      console.log("Google Login Failed");
                    }}
                  />
                </Flex>
                <Flex align="center" my={4}>
                  <Divider />
                  <Text px={2} color="gray.500" fontSize="sm">OR</Text>
                  <Divider />
                </Flex>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

      </div>
    </div>
  );
};

export default Homepage;
