import {
  Box,
  Text,
  IconButton,
  Spinner,
  Input,
  FormControl,
  useToast,
  Flex,
  Avatar,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useEffect, useState, useRef } from "react";
import { ChatState } from "../Context/ChatProvider";
import ScrollableChat from "./ScrollableChat";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { getSender, getSenderFull } from "../config/ChatLogics";
import bgimage from "../assets/bgimage.png";
import API from "../config/axios";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user, notification, setNotification, chats, setChats, socket } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [scrollBehavior, setScrollBehavior] = useState("auto");

  const toast = useToast();
  const selectedChatRef = useRef();

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await API.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
      setScrollBehavior("auto");
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  const moveChatToTop = (incomingChat) => {
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) =>
        chat._id === (incomingChat.chat?._id || incomingChat.chat)
          ? { ...chat, latestMessage: incomingChat }
          : chat
      );
      const updatedChat = updatedChats.find((chat) => chat._id === (incomingChat.chat?._id || incomingChat.chat));
      const remainingChats = updatedChats.filter((chat) => chat._id !== (incomingChat.chat?._id || incomingChat.chat));
      return [updatedChat, ...remainingChats];
    });
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage.trim()) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const contentToSend = newMessage;
        setNewMessage("");

        const { data } = await API.post("/api/message", {
          content: contentToSend,
          chatId: selectedChat._id,
        }, config);

        socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);

        moveChatToTop(data); // Move chat to top after sending message

        setScrollBehavior("smooth");

        setTimeout(() => {
          const scrollEvent = new Event('force-scroll-to-bottom');
          window.dispatchEvent(scrollEvent);
        }, 100);

      } catch (error) {
        toast({
          title: "Error sending message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessageReceived) => {
      const chat = selectedChatRef.current;

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chatItem) => {
          if (chatItem._id === (newMessageReceived.chat?._id || newMessageReceived.chat)) {
            return { ...chatItem, latestMessage: newMessageReceived };
          }
          return chatItem;
        });

        const updatedChat = updatedChats.find(chatItem => chatItem._id === (newMessageReceived.chat?._id || newMessageReceived.chat));
        const remainingChats = updatedChats.filter(chatItem => chatItem._id !== (newMessageReceived.chat?._id || newMessageReceived.chat));
        return [updatedChat, ...remainingChats];
      });

      if (!chat || chat._id !== (newMessageReceived.chat?._id || newMessageReceived.chat)) {
        if (!notification.some((n) => n._id === newMessageReceived._id)) {
          setNotification((prev) => [newMessageReceived, ...prev]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        setScrollBehavior("smooth");
      }
    };

    socket.on("message received", handleNewMessage);

    // 🛠 Listen for typing status
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("message received", handleNewMessage);
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket, notification, setNotification, setFetchAgain]);

  let typingTimeout;

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    // clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 3000); // 3 seconds after last key press
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                <Flex
                  align="center"
                  justifyContent={{ base: "center", md: "flex-start" }}
                  gap={3}
                  w="100%"
                >
                  <ProfileModal user={getSenderFull(user, selectedChat.users)}>
                    <Avatar
                      size="md"
                      name={getSender(user, selectedChat.users)}
                      src={getSenderFull(user, selectedChat.users)?.pic}
                      cursor="pointer"
                    />
                  </ProfileModal>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "xl", md: "xl" }}
                    textAlign="center"
                    fontFamily="Work sans"
                  >
                    {getSender(user, selectedChat.users)}
                  </Text>
                </Flex>
              </>
            ) : (
              <>
                <Text
                  fontWeight="bold"
                  fontSize={{ base: '20px', md: '23px' }}
                  fontFamily="Work sans"
                  noOfLines={1}
                >
                  {selectedChat.chatName.toUpperCase()}
                </Text>

                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            backgroundImage={`url(${bgimage})`}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflow="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <ScrollableChat messages={messages} scrollBehavior={scrollBehavior} />
            )}
          </Box>

          <FormControl isRequired mt={3}>
            {istyping && (
              <Text fontSize="sm" color="gray.500" mb={1} ml={1}>
                {getSender(user, selectedChat.users)} is typing...
              </Text>
            )}

            <Box display="flex" alignItems="center" gap={2}>
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
                flex="1"
              />
              <IconButton
                colorScheme="blue"
                icon={<i className="fas fa-paper-plane" />}
                onClick={() => sendMessage({ key: "Enter" })}
                aria-label="Send Message"
                h="40px"
                w="40px"
              />
            </Box>
          </FormControl>
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          h="100%"
          textAlign="center"
          p={5}
        >
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            fontFamily="Work Sans"
            color="gray.700"
            mb={3}
          >
            No Chat Selected
          </Text>
          <Text fontSize="md" color="gray.500">
            Click on a user from the list <br />
            and start your conversation 🚀
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
