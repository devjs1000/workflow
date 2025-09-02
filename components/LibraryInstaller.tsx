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
  Checkbox,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

interface Props {
  currentPath: string;
}

const LibraryInstaller = ({ currentPath }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [packageInput, setPackageInput] = useState("");
  const [packages, setPackages] = useState<string[]>([]);
  const [manager, setManager] = useState<"npm" | "yarn" | "pnpm">("npm");
  const [isDev, setIsDev] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const popularPackages = [
    "react", "react-dom", "next", "express", "axios", "lodash",
    "moment", "uuid", "cors", "dotenv", "mongoose", "prisma",
    "@types/node", "@types/react", "typescript", "eslint",
    "prettier", "jest", "testing-library", "tailwindcss"
  ];

  const addPackage = (pkg: string) => {
    if (pkg && !packages.includes(pkg)) {
      setPackages([...packages, pkg]);
      setPackageInput("");
    }
  };

  const removePackage = (pkg: string) => {
    setPackages(packages.filter(p => p !== pkg));
  };

  const handleInstall = async () => {
    if (packages.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one package",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/library/install", {
        packages,
        manager,
        path: currentPath,
        isDev,
      });

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 5000,
      });

      setPackages([]);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.details || "Failed to install packages",
        status: "error",
        duration: 5000,
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="green" size="sm">
        Install Libraries
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Install Libraries</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack w="full">
                <Input
                  placeholder="Enter package name"
                  value={packageInput}
                  onChange={(e) => setPackageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addPackage(packageInput);
                    }
                  }}
                />
                <Button onClick={() => addPackage(packageInput)}>Add</Button>
              </HStack>

              <Box w="full">
                <Text mb={2}>Popular Packages (click to add)</Text>
                <Wrap>
                  {popularPackages.map((pkg) => (
                    <WrapItem key={pkg}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => addPackage(pkg)}
                        isDisabled={packages.includes(pkg)}
                      >
                        {pkg}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box w="full">
                <Text mb={2}>Selected Packages ({packages.length})</Text>
                <Wrap>
                  {packages.map((pkg) => (
                    <WrapItem key={pkg}>
                      <Tag size="md" colorScheme="blue">
                        <TagLabel>{pkg}</TagLabel>
                        <TagCloseButton onClick={() => removePackage(pkg)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <HStack w="full" justify="space-between">
                <Box>
                  <Text mb={2}>Package Manager</Text>
                  <Select value={manager} onChange={(e) => setManager(e.target.value as any)}>
                    <option value="npm">npm</option>
                    <option value="yarn">yarn</option>
                    <option value="pnpm">pnpm</option>
                  </Select>
                </Box>
                <Checkbox
                  isChecked={isDev}
                  onChange={(e) => setIsDev(e.target.checked)}
                  colorScheme="orange"
                >
                  Development Dependencies
                </Checkbox>
              </HStack>

              <Text fontSize="sm" color="gray.500">
                Installing in: {currentPath}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleInstall}
              isLoading={isLoading}
              loadingText="Installing..."
              isDisabled={packages.length === 0}
            >
              Install ({packages.length} packages)
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LibraryInstaller;