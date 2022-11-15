import {
  Box,
  Heading,
  HStack,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
  Checkbox,
  Spacer,
} from "@chakra-ui/react";
import axios from "axios";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { BiArrowBack, BiHome, BiRefresh } from "react-icons/bi";

const listFiles = (
  path: string,
  hidden: boolean = false,
  list: boolean = false
) => {
  return {
    command: `ls ${hidden ? "-a" : ""}${list ? "-l" : ""}`,
    path,
  };
};

const LsFiles = ({ path, setPath }: Props) => {
  const [files, setFiles] = useState<string[]>([]);
  const formik = useFormik({
    initialValues: {
      hidden: false,
      list: false,
    },
    onSubmit: async (values) => {},
    enableReinitialize: true,
  });

  const fetchFiles = async (customPath: string = "", callback = () => {}) => {
    try {
      let pathToUse = customPath === "" ? path : customPath;
      const { hidden, list } = formik.values;
      const { data } = await axios.post(
        "/api/terminal/open",
        listFiles(pathToUse, hidden, list)
      );
      setFiles(data?.split("\n"));
      callback();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
    return () => {};
  }, [formik.values.hidden, formik.values.list, path]);

  const handleOpen = (file: string) => {
    const newPath = `${path == "/" ? "" : path}/${file}`;
    fetchFiles(newPath, () => {
      setPath("path", newPath);
    });
  };

  const goToHome = () => {
    setPath("path", "/");
  };

  const goBack = () => {
    const newPath = path.split("/").slice(0, -1).join("/");
    setPath("path", newPath);
  };

  return (
    <Accordion
      shadow={"lg"}
      className={"bg-white"}
      allowToggle
      rounded={"md"}
      overflow={"clip"}
    >
      <AccordionItem>
        <Flex className="gap-4 bg-black text-white ">
          <AccordionButton w={"full"}>File Explorer</AccordionButton>
          <Spacer />
          <Flex gap={4} mx={4}>
            <Checkbox
              colorScheme={"green"}
              onChange={formik.handleChange("hidden")}
              checked={formik.values.hidden}
            >
              hidden
            </Checkbox>
            <Checkbox
              colorScheme={"green"}
              onChange={formik.handleChange("list")}
              checked={formik.values.list}
            >
              list
            </Checkbox>
          </Flex>
        </Flex>
        <AccordionPanel p={0}>
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
                onClick={() => fetchFiles()}
                aria-label={"refresh ls"}
                variant={"ghost"}
              />
            </HStack>
            <Box mt={4}>
              {files?.map((file: string) => (
                <button
                  onClick={() => handleOpen(file)}
                  // onDoubleClick={() => openFile(file)}
                  className="bg-gray-900 text-green-500 px-4 m-1 hover:bg-gray-400 hover:text-gray-900"
                  key={file}
                >
                  {file}
                </button>
              ))}
            </Box>
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

interface Props {
  path: string;
  setPath: (field: string, value: string) => any;
}

export default LsFiles;
