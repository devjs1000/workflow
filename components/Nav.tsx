import { Box, Button } from "@chakra-ui/react";
import React, { Component } from "react";

const Nav = ({}: Props) => {
  return (
    <Box bg="white" p="4" rounded="md" shadow="md" my={2}>
      <Button colorScheme={"blackAlpha"}>Open In VS Code</Button>
    </Box>
  );
};

interface Props {}

export default Nav;
