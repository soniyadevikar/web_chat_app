import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { Badge, Box, IconButton } from "@chakra-ui/react";
import { ArrowDownIcon } from "@chakra-ui/icons";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages, scrollBehavior }) => {
  const { user } = ChatState();
  const bottomRef = useRef(null);
  const scrollableDivRef = useRef(null);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const isUserAtBottom = () => {
    const scrollElement = scrollableDivRef.current;
    if (!scrollElement) return false;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    return scrollHeight - scrollTop <= clientHeight + 100;
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessageCount(0);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (isUserAtBottom()) {
      setShowScrollButton(false);
      setNewMessageCount(0);
    } else {
      setShowScrollButton(true);
    }
  };

  useEffect(() => {
    const scrollElement = scrollableDivRef.current;
    if (!scrollElement) return;

    if (scrollBehavior === "auto") {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    } else if (scrollBehavior === "smooth") {
      if (isUserAtBottom()) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        setNewMessageCount((prev) => prev + 1);
        setShowScrollButton(true);
      }
    }
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    const handleForceScroll = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    window.addEventListener('force-scroll-to-bottom', handleForceScroll);

    return () => {
      window.removeEventListener('force-scroll-to-bottom', handleForceScroll);
    };
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      overflowY="auto"
      position="relative"
      ref={scrollableDivRef}
      onScroll={handleScroll}
      p={1}
    >
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
            <Box
              bg={m.sender._id === user._id ? "#82f5ad73" : "#ffffff"}
              color="black"
              px={3}
              py={2}
              borderRadius="lg"
              maxW="65%"
              alignSelf={m.sender._id === user._id ? "flex-end" : "flex-start"}
              mt={isSameUser(messages, m, i, user._id) ? 1 : 3}
              ml={m.sender._id === user._id ? "auto" : isSameSenderMargin(messages, m, i, user._id)}
              boxShadow="md"
            >
              {m.content}
            </Box>
          </div>
        ))}

      <div ref={bottomRef}></div>

      {showScrollButton && (
        <IconButton
          icon={
            <Box position="relative">
              <ArrowDownIcon color="black" boxSize={5} />
              {newMessageCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  fontSize="0.7em"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                >
                  {newMessageCount}
                </Badge>
              )}
            </Box>
          }
          position="fixed"
          bottom={{ base: "90px", md: "120px" }}
          right="30px"
          bg="white"
          borderRadius="full"
          size="md"
          _hover={{ bg: "gray.100" }}
          onClick={scrollToBottom}
          zIndex="overlay"
          boxShadow="md"
        />
      )}
    </Box>
  );
};

export default ScrollableChat;