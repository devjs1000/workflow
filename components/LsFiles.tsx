import { Box, Button, Heading, HStack, IconButton } from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { BiRefresh } from "react-icons/bi";

const LsFiles = ({ path }: Props) => {
  const [files, setFiles] = useState<string[]>([]);
  const listFiles = async () => {
    try {
      const { data } = await axios(`/api/terminal/ls?path=${path}`);
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      p={4}
      bg={"gray.900"}
      color={"green.500"}
      maxH={"400px"}
      overflow={"auto"}
    >
      <HStack bg={"gray.900"} m={-4} p={4} pos={"sticky"} top={-4}>
        <Heading>LsFiles</Heading>
        <IconButton
          icon={<BiRefresh />}
          onClick={listFiles}
          aria-label={"refresh ls"}
          variant={"ghost"}
        />
      </HStack>
      <Box mt={4}>
        {files.map((file) => (
          <Box bg={"gray.900"} color={"green.500"} px={4} key={file}>
            {file}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface Props {
  path: string;
}

export default LsFiles;
