import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d="flex" icon={<ViewIcon />} onClick={onOpen} />
      )}

      <Modal size="md" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" fontSize="2xl" fontFamily="Work sans">
            {user.name}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody textAlign="center">
            <Avatar
              size="2xl"
              name={user.name}
              src={user.pic}
              mb={4}
              mx="auto"
            />
            <Text
              fontSize={{ base: "md", md: "lg" }}
              wordBreak="break-word"
            >
              Email: {user.email}
            </Text>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button colorScheme="purple" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
