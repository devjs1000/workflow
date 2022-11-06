import { Box, Button, Heading, HStack, IconButton } from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { BiArrowBack, BiHome, BiRefresh } from "react-icons/bi";

const LsFiles = ({ path, setPath }: Props) => {
  const [files, setFiles] = useState<string[]>([]);

  const filterPath = (path: string) => {
    return path.replace(/\/\//g, "/");
  };

  const listFiles = async () => {
    try {
      const { data } = await axios.get(
        `/api/terminal/ls?path=${filterPath(path)}`
      );
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openFolder = async (file: string) => {
    try {
      const newPath = filterPath(`${path}/${file}`);
      const { data } = await axios.get(`/api/terminal/ls?path=${newPath}`);
      setPath("path", newPath);
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const goBack = async () => {
    try {
      const newPath = filterPath(path.split("/").slice(0, -1).join("/"));
      const { data } = await axios.get(`/api/terminal/ls?path=${newPath}`);
      setPath("path", newPath);
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const goToHome = async () => {
    try {
      const newPath = filterPath(path.split("/").slice(0, 1).join("/"));
      const { data: config } = await axios.get("/api/config");
      const { data } = await axios.get(
        `/api/terminal/ls?path=${config.path as any}`
      );
      setPath("path", newPath);
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
          aria-label="go to home"
          icon={<BiHome />}
          onClick={goToHome}
          variant="ghost"
        />

        <IconButton
          aria-label="go back"
          icon={<BiArrowBack />}
          onClick={goBack}
          variant="ghost"
        />

        <IconButton
          icon={<BiRefresh />}
          onClick={listFiles}
          aria-label={"refresh ls"}
          variant={"ghost"}
        />
      </HStack>
      <Box mt={4}>
        {files.map((file) => (
          <Button
            onClick={() => openFolder(file)}
            bg={"gray.900"}
            color={"green.500"}
            px={4}
            key={file}
          >
            {file}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

interface Props {
  path: string;
  setPath: (field: string, value: string) => any;
}

export default LsFiles;
