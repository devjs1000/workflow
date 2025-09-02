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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Select,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

interface Props {
  currentPath: string;
}

interface AnalysisResult {
  filePath: string;
  analysisType: string;
  result: any;
  timestamp: string;
}

const CodeAnalyzer = ({ currentPath }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [filePath, setFilePath] = useState("");
  const [analysisType, setAnalysisType] = useState<"complexity" | "performance" | "imports" | "duplicates">("complexity");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const analysisTypes = [
    { value: "complexity", label: "Code Complexity" },
    { value: "performance", label: "Performance Analysis" },
    { value: "imports", label: "Import/Export Analysis" },
    { value: "duplicates", label: "Duplicate Detection (DNR)" },
  ];

  const handleAnalysis = async () => {
    if (!filePath) {
      toast({
        title: "Error",
        description: "Please enter a file path",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/analysis", {
        filePath: `${currentPath}/${filePath}`,
        analysisType,
      });

      setAnalysisResult(response.data);
      toast({
        title: "Analysis Complete",
        description: `${analysisType} analysis completed successfully`,
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.details || "Failed to analyze file",
        status: "error",
        duration: 5000,
      });
    }
    setIsLoading(false);
  };

  const renderComplexityResults = (result: any) => (
    <SimpleGrid columns={2} spacing={4}>
      <Stat>
        <StatLabel>Total Lines</StatLabel>
        <StatNumber>{result.totalLines}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>Code Lines</StatLabel>
        <StatNumber>{result.codeLines}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>Functions</StatLabel>
        <StatNumber>{result.functions}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>Conditionals</StatLabel>
        <StatNumber>{result.conditionals}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>Cyclomatic Complexity</StatLabel>
        <StatNumber color={result.cyclomaticComplexity > 10 ? "red.500" : "green.500"}>
          {result.cyclomaticComplexity}
        </StatNumber>
        <StatHelpText>{result.cyclomaticComplexity > 10 ? "High" : "Good"}</StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>Maintainability Index</StatLabel>
        <StatNumber color={result.maintainabilityIndex < 50 ? "red.500" : "green.500"}>
          {result.maintainabilityIndex.toFixed(1)}
        </StatNumber>
        <Progress 
          value={result.maintainabilityIndex} 
          colorScheme={result.maintainabilityIndex < 50 ? "red" : "green"}
          mt={2}
        />
      </Stat>
    </SimpleGrid>
  );

  const renderPerformanceResults = (result: any) => (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={2} spacing={4}>
        <Stat>
          <StatLabel>Nested Loops</StatLabel>
          <StatNumber color={result.nestedLoops > 0 ? "orange.500" : "green.500"}>
            {result.nestedLoops}
          </StatNumber>
          <StatHelpText>{result.nestedLoops > 0 ? "Consider optimization" : "Good"}</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>DOM Queries</StatLabel>
          <StatNumber color={result.domQueries > 5 ? "orange.500" : "green.500"}>
            {result.domQueries}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Sync Operations</StatLabel>
          <StatNumber color={result.synchronousOps > 0 ? "red.500" : "green.500"}>
            {result.synchronousOps}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Performance Score</StatLabel>
          <StatNumber color={result.performanceScore < 50 ? "red.500" : "green.500"}>
            {result.performanceScore}
          </StatNumber>
          <Progress 
            value={result.performanceScore} 
            colorScheme={result.performanceScore < 50 ? "red" : "green"}
            mt={2}
          />
        </Stat>
      </SimpleGrid>
      {result.performanceScore < 70 && (
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Performance Issues Detected!</AlertTitle>
          <AlertDescription>
            Consider optimizing nested loops, reducing DOM queries, and using async operations.
          </AlertDescription>
        </Alert>
      )}
    </VStack>
  );

  const renderImportsResults = (result: any) => (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={2} spacing={4}>
        <Stat>
          <StatLabel>Total Imports</StatLabel>
          <StatNumber>{result.totalImports}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>ES Module Imports</StatLabel>
          <StatNumber>{result.esModuleImports}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>CommonJS Requires</StatLabel>
          <StatNumber>{result.commonJSRequires}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Unused Imports (Bloatware)</StatLabel>
          <StatNumber color={result.bloatwareScore > 0 ? "red.500" : "green.500"}>
            {result.bloatwareScore}
          </StatNumber>
        </Stat>
      </SimpleGrid>
      {result.unusedImports.length > 0 && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Import Bloatware Detected!</AlertTitle>
          <AlertDescription>
            Unused imports: {result.unusedImports.join(", ")}
          </AlertDescription>
        </Alert>
      )}
    </VStack>
  );

  const renderDuplicatesResults = (result: any) => (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={2} spacing={4}>
        <Stat>
          <StatLabel>Duplicate Lines</StatLabel>
          <StatNumber color={result.duplicateCount > 0 ? "orange.500" : "green.500"}>
            {result.duplicateCount}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Duplication %</StatLabel>
          <StatNumber color={result.duplicatePercentage > 10 ? "red.500" : "green.500"}>
            {result.duplicatePercentage.toFixed(1)}%
          </StatNumber>
        </Stat>
      </SimpleGrid>
      {result.duplicateLines.length > 0 && (
        <Box>
          <Text fontWeight="bold" mb={2}>Duplicate Code Found (DNR Violations):</Text>
          <Accordion allowMultiple>
            {result.duplicateLines.map((duplicate: any, index: number) => (
              <AccordionItem key={index}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Badge colorScheme="red">{duplicate.occurrences}x</Badge>
                      <Text fontSize="sm" fontFamily="mono">
                        {duplicate.content.substring(0, 50)}...
                      </Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm">Found on lines: {duplicate.lines.join(", ")}</Text>
                    <Box
                      bg="gray.900"
                      color="green.400"
                      p={2}
                      rounded="md"
                      fontSize="xs"
                      fontFamily="mono"
                    >
                      {duplicate.content}
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      )}
    </VStack>
  );

  const renderResults = () => {
    if (!analysisResult) return null;

    const { result, analysisType } = analysisResult;

    switch (analysisType) {
      case "complexity":
        return renderComplexityResults(result);
      case "performance":
        return renderPerformanceResults(result);
      case "imports":
        return renderImportsResults(result);
      case "duplicates":
        return renderDuplicatesResults(result);
      default:
        return <Text>Unknown analysis type</Text>;
    }
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="orange" size="sm">
        Analyze Code
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>10x Developer Code Analysis</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="auto">
            <VStack spacing={4} align="stretch">
              <HStack>
                <Input
                  placeholder="Enter file path (relative to current directory)"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  flex={1}
                />
                <Select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as any)}
                  maxW="250px"
                >
                  {analysisTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                <Button
                  colorScheme="orange"
                  onClick={handleAnalysis}
                  isLoading={isLoading}
                  loadingText="Analyzing..."
                >
                  Analyze
                </Button>
              </HStack>

              <Text fontSize="sm" color="gray.500">
                Analyzing: {currentPath}/{filePath}
              </Text>

              {analysisResult && (
                <Box
                  p={4}
                  bg="gray.50"
                  rounded="md"
                  border="1px"
                  borderColor="gray.200"
                >
                  <HStack justify="space-between" mb={4}>
                    <Text fontWeight="bold" fontSize="lg">
                      Analysis Results
                    </Text>
                    <Badge colorScheme="blue">
                      {analysisResult.analysisType}
                    </Badge>
                  </HStack>
                  {renderResults()}
                  <Text fontSize="xs" color="gray.500" mt={4}>
                    Analysis completed: {new Date(analysisResult.timestamp).toLocaleString()}
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CodeAnalyzer;