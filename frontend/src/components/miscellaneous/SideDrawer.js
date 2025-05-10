import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import chatNotificationIcon from '../../assets/talking.png';
import heyULogo from '../../assets/navbarlogo.png';
import API from '../../config/axios';

const SideDrawer = () => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const Toast = useToast();

  const searchTimer = useRef(null);

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await API.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      Toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`
        }
      };
      const { data } = await API.post('/api/chat', { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      Toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <Box bg="white" w="100%" p={2} borderBottom="1px solid #ccc">
      {/* Header Top Row: HeyU + Icons */}
      <Flex
        align="center"
        justify="space-between"
        direction={{ base: "row", md: "row" }}
        mb={{ base: 2, md: 0 }}
      >
        {/* Mobile Title */}
        <Image
          src={heyULogo}
          alt="HeyU Logo"
          w="100px"
          display={{ base: "flex", md: "none" }}
        />

        {/* Desktop Search Trigger */}
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Box
            onClick={onOpen}
            cursor="pointer"
            bg="#f0f0f0"
            borderRadius="md"
            px={4}
            py={2}
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            w={{ md: "300px" }}
            _hover={{ bg: "#e2e2e2" }}
          >
            <i className="fas fa-search" style={{ color: "gray" }}></i>
            <Text color="gray.600" ml={3} fontSize="sm">
              Search or start a new chat
            </Text>
          </Box>
        </Tooltip>

        {/* Desktop Title */}
        <Image
          src={heyULogo}
          alt="HeyU Logo"
          w="150px"
          display={{ base: "none", md: "flex" }}
        />

        {/* Icons Section */}
        {user && (
          <Flex align="center" gap={2}>
            <Menu>
              <MenuButton p={1}>
                <Box position="relative" w="30px" h="30px">
                  <img src={chatNotificationIcon} alt="Notifications" style={{ width: '100%', height: '100%' }} />
                  {notification.length > 0 && (
                    <Box
                      position="absolute"
                      top="-4px"
                      right="-4px"
                      bg="purple.500"
                      color="white"
                      fontSize="xs"
                      fontWeight="bold"
                      px={1.5}
                      py={0.5}
                      borderRadius="full"
                      minW="20px"
                      textAlign="center"
                    >
                      {notification.length}
                    </Box>
                  )}
                </Box>
              </MenuButton>
              <MenuList>
                {!notification.length && (
                  <Box textAlign="center" py={1} px={2} w="100%" color="gray.600">
                    No New Messages
                  </Box>
                )}
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>


            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                <Avatar
                  size='sm'
                  cursor='pointer'
                  name={user?.name}
                  src={user?.pic}
                />
              </MenuButton>
              <MenuList bg="white" py={3} px={2}>
                <Flex direction="column" align="center" justify="center" gap={2}>
                  <ProfileModal user={user}>
                    <Button
                      w="100%"
                      colorScheme="purple"
                      variant="ghost"
                      _hover={{ bg: "purple.50" }}
                    >
                      Profile
                    </Button>
                  </ProfileModal>
                  <Button
                    w="100%"
                    colorScheme="red"
                    variant="ghost"
                    onClick={logoutHandler}
                    _hover={{ bg: "red.50" }}
                  >
                    Log Out
                  </Button>
                </Flex>
              </MenuList>
            </Menu>
          </Flex>
        )}
      </Flex>

      {/* Mobile Search Bar Below Header */}
      <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
        <Box
          onClick={onOpen}
          cursor="pointer"
          bg="#f0f0f0"
          borderRadius="md"
          px={4}
          py={2}
          display={{ base: "flex", md: "none" }}
          alignItems="center"
          w="100%"
          _hover={{ bg: "#e2e2e2" }}
        >
          <i className="fas fa-search" style={{ color: "gray" }}></i>
          <Text color="gray.600" ml={3} fontSize="sm">
            Search or start a new chat
          </Text>
        </Box>
      </Tooltip>

      {/* Drawer for Searching */}
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader align="center" borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Flex align="center" pb={4} position="relative">
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);

                  if (searchTimer.current) clearTimeout(searchTimer.current);

                  searchTimer.current = setTimeout(() => {
                    handleSearch(value);
                  }, 300);
                }}
                pr="2.5rem"
              />
              {search && (
                <Box
                  position="absolute"
                  right="12px"
                  zIndex={1}
                  bg="#e9e9e9"
                  _hover={{
                    bg: "gray.200",
                    border: "1px solid #ccc",
                    borderRadius: "md",
                  }}
                  transition="all 0.2s ease"
                  p={1}
                  cursor="pointer"
                  onClick={() => {
                    if (searchTimer.current) clearTimeout(searchTimer.current);
                    setSearch('');
                    setSearchResult([]);
                  }}
                >
                  <CloseIcon fontSize="xs" color="gray.600" />
                </Box>
              )}
            </Flex>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map(user => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {!loading && search && searchResult.length === 0 && (
              <Box textAlign="center" mt={4} color="gray.500">
                No results found
              </Box>
            )}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>

        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default SideDrawer;
