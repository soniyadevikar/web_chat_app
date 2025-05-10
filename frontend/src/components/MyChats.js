import React, { useEffect, useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Box, Flex, IconButton, Stack, Text, useToast } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { getSender } from '../config/ChatLogics';
import ChatLoading from '../components/ChatLoading';
import GroupChatModal from './miscellaneous/GroupChatModal';
import bgimage from "../assets/bgimage.png";
import DeleteModal from './miscellaneous/DeleteModal';
import API from '../config/axios';

const MyChats = () => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats, notification, setNotification } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await API.get('/api/chat', config);
      setChats(data);

      const lastSeenTime = JSON.parse(localStorage.getItem('lastSeenTime')) || new Date(0).toISOString(); // fallback to old time
      const newNotifications = [];

      data.forEach(chat => {
        if (chat.latestMessage && new Date(chat.latestMessage.updatedAt) > new Date(lastSeenTime)) {
          newNotifications.push({
            _id: chat.latestMessage._id,
            chat: chat,
            sender: chat.latestMessage.sender,
            content: chat.latestMessage.content,
          });
        }
      });

      setNotification(newNotifications);

    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to Load the chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  const deleteChatHandler = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await API.delete(`/api/chat/${chatId}`, config);

      fetchChats();  // refresh chats
      toast({
        title: 'Chat deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-left',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to delete the chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
    fetchChats();
    // eslint-disable-next-line
  }, []);

  if (!loggedUser) return null;

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: '100%', md: '31%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Flex
        pb={3}
        px={3}
        fontSize={{ base: '24px', md: '26px' }}
        fontFamily="Work sans"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontWeight="bold">Chats</Text>

        {/* Group Chat Modal with edit icon */}
        <GroupChatModal>
          <IconButton
            display="flex"
            icon={<EditIcon />}
            variant="ghost"
            fontSize="24px"
            _hover={{ bg: "gray.200" }}
          />
        </GroupChatModal>
      </Flex>

      <Box
        display="flex"
        flexDir="column"
        p={1}
        bg="#fdfdfd"
        w="100%"
        flex="1"
        borderRadius="lg"
        overflowY="scroll"
      >
        {chats ? (
          <Stack spacing={1}>
            {chats
              .slice()
              .sort((a, b) => {
                const aTime = new Date(a.latestMessage?.updatedAt || a.updatedAt).getTime();
                const bTime = new Date(b.latestMessage?.updatedAt || b.updatedAt).getTime();
                return bTime - aTime;
              })
              .map((chat) => {
                const chatNotifications = notification?.filter((n) => n.chat && n.chat._id === chat._id) || [];
                const isGroupChat = chat.isGroupChat;
                const isAdmin = chat.groupAdmin?._id === loggedUser?._id;
                return (
                  <Box
                    key={chat._id}
                    bg={selectedChat === chat ? "#e8e8e8" : "#ffffff"}
                    color="black"
                    px={3}
                    py={2}
                    borderRadius="md"
                    _hover={{ bg: "#e2e2e2" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => {
                      setSelectedChat(chat);
                      setNotification(notification?.filter((n) => n.chat?._id !== chat._id) || []);
                      localStorage.setItem('lastSeenTime', JSON.stringify(new Date().toISOString()));
                    }}
                  >
                    {/* Left Section */}
                    <Flex align="center" gap={3} >
                      <Avatar
                        size="sm"
                        name={!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                        src={!chat.isGroupChat
                          ? chat.users.find(u => u._id !== loggedUser._id)?.pic
                          : bgimage
                        }
                      />
                      <Box overflow="hidden">
                        <Text fontWeight="bold" fontSize={{ base: '20px', md: '18px' }} fontFamily="Work sans" noOfLines={1}>
                          {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                        </Text>

                        {chat.latestMessage && loggedUser && (
                          <Text fontSize="sm" noOfLines={1} opacity={0.8}>
                            <b>
                              {(chat.latestMessage.sender?.name?.toLowerCase() === loggedUser?.name?.toLowerCase())
                                ? "You"
                                : chat.latestMessage.sender?.name}
                              :
                            </b>{" "}
                            {chat.latestMessage.content}
                          </Text>
                        )}
                      </Box>
                    </Flex>

                    {/* Right Section */}
                    <Flex flexDir="column" alignItems="center" gap={1}>
                      {/* Notification Count */}
                      {chatNotifications.length > 0 && (
                        <Box
                          bg="purple.500"
                          color="white"
                          fontSize="xs"
                          borderRadius="full"
                          px={2}
                          minW="20px"
                          textAlign="center"
                        >
                          {chatNotifications.length}
                        </Box>
                      )}

                      {/* Delete Modal Button */}
                      {(!isGroupChat || (isGroupChat && isAdmin)) && (
                        <DeleteModal
                          chatName={!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                          onDelete={() => deleteChatHandler(chat._id)}
                        />
                      )}
                    </Flex>
                  </Box>
                );
              })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
