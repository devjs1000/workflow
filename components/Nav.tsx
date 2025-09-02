import { Box, Button, HStack, Text, Badge } from "@chakra-ui/react";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ProjectCreator from "./ProjectCreator";
import LibraryInstaller from "./LibraryInstaller";
import CodeBlockManager from "./CodeBlockManager";
import CodeAnalyzer from "./CodeAnalyzer";

const Nav = ({ path }: Props) => {
  const openInVsCode = async () => {
    try {
      const { data } = await axios.post(`/api/terminal/open`,{
        command: "code",
        path,
      });

      toast.success("Opened in VS Code");
    } catch (error) {
      console.error(error);
      toast.error("Failed to open in VS Code");
    }
  };
  
  return (
    <Box bg="white" p="4" rounded="md" shadow="md" my={2}>
      <HStack justify="space-between" align="center" mb={4}>
        <HStack>
          <Text fontWeight="bold" fontSize="lg">10x Developer Workflow</Text>
          <Badge colorScheme="green">v1.0</Badge>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Current Path: {path}
        </Text>
      </HStack>
      
      <HStack spacing={3} wrap="wrap">
        <Button onClick={openInVsCode} colorScheme="blackAlpha" size="sm">
          Open In VS Code
        </Button>
        
        <ProjectCreator currentPath={path} />
        <LibraryInstaller currentPath={path} />
        <CodeBlockManager currentPath={path} />
        <CodeAnalyzer currentPath={path} />
        
        <Badge colorScheme="purple" p={2} rounded="md">
          DNR + Bloatware Removal + Complexity Analysis
        </Badge>
      </HStack>
    </Box>
  );
};

interface Props {
  path: string;
}

export default Nav;
