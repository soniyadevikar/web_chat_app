import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import API from '../config/axios';

const ChatContext = createContext();
const ENDPOINT = "http://localhost:5000";

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [refreshChats, setRefreshChats] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setUser(userInfo);

    if (!userInfo) {
      navigate('/');
    } else {
      const newSocket = io(API.defaults.baseURL);
      setSocket(newSocket);
      newSocket.emit("setup", userInfo);
    }
  }, [navigate]);

  useEffect(() => {
    if (!socket) return;

    const messageListener = (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        if (!notification.find((n) => n._id === newMessageReceived._id)) {
          setNotification((prev) => [newMessageReceived, ...prev]);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === newMessageReceived.chat._id
            ? { ...chat, latestMessage: newMessageReceived }
            : chat
        )
      );
      setRefreshChats((prev) => !prev);
    };

    socket.on("message recieved", messageListener);

    return () => {
      socket.off("message recieved", messageListener);
    };

  }, [socket, selectedChat, notification]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
        socket,
        messages,
        setMessages,
        refreshChats,
        setRefreshChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
