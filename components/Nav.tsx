import { Box, Button, Toast } from "@chakra-ui/react";
import React, { Component } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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
      <Button onClick={openInVsCode} colorScheme={"blackAlpha"}>
        Open In VS Code
      </Button>
    </Box>
  );
};

interface Props {
  path: string;
}

export default Nav;
