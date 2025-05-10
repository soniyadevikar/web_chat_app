import { Box } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import ChatBox from "../components/ChatBox";
import { useNavigate } from "react-router-dom";
import bgImage from '../assets/bg-login.jpg';

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) {
        navigate("/");
      }
    }
  }, [user, navigate]);

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
        {user && <SideDrawer />}
        <Box display="flex" justifyContent="space-between" w="100%" flex="1" p="10px" minH="0">
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        </Box>
      </div>
    </div >
  );
};

export default Chatpage;
