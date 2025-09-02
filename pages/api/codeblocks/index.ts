import type { NextApiRequest, NextApiResponse } from "next";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

interface CodeBlock {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  category: string;
}

const CODEBLOCKS_FILE = "assets/codeblocks.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        try {
          const data = await readFile(CODEBLOCKS_FILE, "utf-8");
          const codeBlocks = JSON.parse(data);
          res.status(200).json(codeBlocks);
        } catch (error) {
          // If file doesn't exist, return default codeblocks
          const defaultCodeBlocks = {
            blocks: [
              {
                id: "react-component",
                title: "React Functional Component",
                description: "Basic React functional component template",
                code: `import React from 'react';

interface Props {
  // Define your props here
}

const ComponentName: React.FC<Props> = ({ }) => {
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
};

export default ComponentName;`,
                language: "typescript",
                tags: ["react", "component", "typescript"],
                category: "react"
              },
              {
                id: "api-route",
                title: "Next.js API Route",
                description: "Basic Next.js API route template",
                code: `import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      res.status(200).json({ message: "GET request" });
      break;
    case "POST":
      res.status(200).json({ message: "POST request" });
      break;
    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}`,
                language: "typescript",
                tags: ["nextjs", "api", "typescript"],
                category: "api"
              }
            ]
          };
          await mkdir("assets", { recursive: true });
          await writeFile(CODEBLOCKS_FILE, JSON.stringify(defaultCodeBlocks, null, 2));
          res.status(200).json(defaultCodeBlocks);
        }
        break;

      case "POST":
        const newBlock: CodeBlock = req.body;
        try {
          const data = await readFile(CODEBLOCKS_FILE, "utf-8");
          const codeBlocks = JSON.parse(data);
          codeBlocks.blocks.push(newBlock);
          await writeFile(CODEBLOCKS_FILE, JSON.stringify(codeBlocks, null, 2));
          res.status(200).json({ message: "Code block added", block: newBlock });
        } catch (error) {
          const codeBlocks = { blocks: [newBlock] };
          await writeFile(CODEBLOCKS_FILE, JSON.stringify(codeBlocks, null, 2));
          res.status(200).json({ message: "Code block added", block: newBlock });
        }
        break;

      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to handle code blocks",
      details: error.message,
    });
  }
}