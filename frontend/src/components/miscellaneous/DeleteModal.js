import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

const DeleteModal = ({ chatName, onDelete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <>
      {/* Delete Icon Button to open the Modal */}
      <Button
        onClick={onOpen}
        colorScheme="red"
        size="sm"
        variant="ghost"
        p={2} // 👈 add padding
      >
        <DeleteIcon boxSize={4} />
      </Button>

      {/* The Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete <b>{chatName}</b>?</Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteModal;
