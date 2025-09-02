import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CreateProjectRequest {
  name: string;
  template: string;
  path: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, template, path }: CreateProjectRequest = req.body;

    if (!name || !template || !path) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const projectPath = `${path}/${name}`;
    let command = "";

    switch (template) {
      case "nextjs":
        command = `npx create-next-app@latest ${name} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`;
        break;
      case "react":
        command = `npx create-react-app ${name} --template typescript`;
        break;
      case "vue":
        command = `npm create vue@latest ${name}`;
        break;
      case "node":
        command = `mkdir ${name} && cd ${name} && npm init -y`;
        break;
      case "express":
        command = `npx express-generator ${name}`;
        break;
      default:
        command = `mkdir ${name}`;
    }

    const { stdout, stderr } = await execAsync(command, { cwd: path });

    if (stderr && !stderr.includes("npm WARN")) {
      throw new Error(stderr);
    }

    res.status(200).json({
      message: `Project ${name} created successfully`,
      output: stdout,
      path: projectPath,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to create project",
      details: error.message,
    });
  }
}