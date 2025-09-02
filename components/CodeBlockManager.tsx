import {
  Box,
  Button,
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
  VStack,
  HStack,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Textarea,
  Select,
  Input,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

interface CodeBlock {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  category: string;
}

interface Props {
  currentPath: string;
}

const CodeBlockManager = ({ currentPath }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  
  const [codeBlocks, setCodeBlocks] = useState<{ blocks: CodeBlock[] }>({ blocks: [] });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // New code block form
  const [newBlock, setNewBlock] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: "",
    category: "general",
  });
  
  const toast = useToast();

  const fetchCodeBlocks = async () => {
    try {
      const response = await axios.get("/api/codeblocks");
      setCodeBlocks(response.data);
    } catch (error) {
      console.error("Failed to fetch code blocks:", error);
    }
  };

  useEffect(() => {
    fetchCodeBlocks();
  }, []);

  const categories = ["all", ...Array.from(new Set(codeBlocks.blocks.map(block => block.category)))];

  const filteredBlocks = codeBlocks.blocks.filter((block) => {
    const matchesCategory = selectedCategory === "all" || block.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const copyToClipboard = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: `${title} code copied to clipboard`,
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        status: "error",
        duration: 2000,
      });
    }
  };

  const handleAddCodeBlock = async () => {
    if (!newBlock.title || !newBlock.code) {
      toast({
        title: "Error",
        description: "Please fill in title and code",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const codeBlockData = {
        ...newBlock,
        id: Date.now().toString(),
        tags: newBlock.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      };

      await axios.post("/api/codeblocks", codeBlockData);
      await fetchCodeBlocks();
      
      toast({
        title: "Success",
        description: "Code block added successfully",
        status: "success",
        duration: 3000,
      });

      setNewBlock({
        title: "",
        description: "",
        code: "",
        language: "javascript",
        tags: "",
        category: "general",
      });
      onAddClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add code block",
        status: "error",
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="purple" size="sm">
        Code Blocks
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <HStack justify="space-between">
              <Text>Open Source Code Blocks</Text>
              <Button onClick={onAddOpen} colorScheme="green" size="sm">
                Add New
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="auto">
            <VStack spacing={4} align="stretch">
              <HStack>
                <Input
                  placeholder="Search code blocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  maxW="200px"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </Select>
              </HStack>

              <Text color="gray.500">
                Found {filteredBlocks.length} code block(s)
              </Text>

              <Accordion allowMultiple>
                {filteredBlocks.map((block) => (
                  <AccordionItem key={block.id}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Text fontWeight="bold">{block.title}</Text>
                            <Badge colorScheme="blue">{block.language}</Badge>
                            <Badge colorScheme="gray">{block.category}</Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            {block.description}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="stretch" spacing={3}>
                        <Wrap>
                          {block.tags.map(tag => (
                            <WrapItem key={tag}>
                              <Badge colorScheme="purple" size="sm">
                                {tag}
                              </Badge>
                            </WrapItem>
                          ))}
                        </Wrap>
                        <Box
                          bg="gray.900"
                          color="green.400"
                          p={4}
                          rounded="md"
                          fontSize="sm"
                          fontFamily="mono"
                          overflow="auto"
                          maxH="300px"
                        >
                          <pre>{block.code}</pre>
                        </Box>
                        <HStack>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => copyToClipboard(block.code, block.title)}
                          >
                            Copy Code
                          </Button>
                        </HStack>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add New Code Block Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Code Block</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Code block title"
                value={newBlock.title}
                onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newBlock.description}
                onChange={(e) => setNewBlock({ ...newBlock, description: e.target.value })}
              />
              <HStack w="full">
                <Select
                  value={newBlock.language}
                  onChange={(e) => setNewBlock({ ...newBlock, language: e.target.value })}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="react">React</option>
                  <option value="python">Python</option>
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                </Select>
                <Input
                  placeholder="Category"
                  value={newBlock.category}
                  onChange={(e) => setNewBlock({ ...newBlock, category: e.target.value })}
                />
              </HStack>
              <Input
                placeholder="Tags (comma separated)"
                value={newBlock.tags}
                onChange={(e) => setNewBlock({ ...newBlock, tags: e.target.value })}
              />
              <Textarea
                placeholder="Paste your code here..."
                value={newBlock.code}
                onChange={(e) => setNewBlock({ ...newBlock, code: e.target.value })}
                rows={10}
                fontFamily="mono"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddCodeBlock}
              isLoading={isLoading}
            >
              Add Code Block
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CodeBlockManager;