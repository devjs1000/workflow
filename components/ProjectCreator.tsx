import {
  Box,
  Button,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

interface Props {
  currentPath: string;
}

const ProjectCreator = ({ currentPath }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [projectName, setProjectName] = useState("");
  const [template, setTemplate] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const templates = [
    { value: "nextjs", label: "Next.js (TypeScript)" },
    { value: "react", label: "React (TypeScript)" },
    { value: "vue", label: "Vue.js" },
    { value: "node", label: "Node.js" },
    { value: "express", label: "Express.js" },
    { value: "basic", label: "Basic Folder" },
  ];

  const handleCreateProject = async () => {
    if (!projectName) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/project/create", {
        name: projectName,
        template,
        path: currentPath,
      });

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 5000,
      });

      setProjectName("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.details || "Failed to create project",
        status: "error",
        duration: 5000,
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue" size="sm">
        Create Project
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="full">
                <Text mb={2}>Project Name</Text>
                <Input
                  placeholder="my-awesome-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </Box>
              <Box w="full">
                <Text mb={2}>Template</Text>
                <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
                  {templates.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box w="full">
                <Text fontSize="sm" color="gray.500">
                  Project will be created in: {currentPath}/{projectName}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateProject}
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Create Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProjectCreator;