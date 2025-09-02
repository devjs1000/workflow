import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface InstallLibraryRequest {
  packages: string[];
  manager: "npm" | "yarn" | "pnpm";
  path: string;
  isDev?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { packages, manager, path, isDev }: InstallLibraryRequest = req.body;

    if (!packages || !manager || !path) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const packageList = packages.join(" ");
    let command = "";

    switch (manager) {
      case "npm":
        command = `npm install ${isDev ? "--save-dev" : ""} ${packageList}`;
        break;
      case "yarn":
        command = `yarn add ${isDev ? "--dev" : ""} ${packageList}`;
        break;
      case "pnpm":
        command = `pnpm add ${isDev ? "--save-dev" : ""} ${packageList}`;
        break;
    }

    const { stdout, stderr } = await execAsync(command, { cwd: path });

    if (stderr && !stderr.includes("npm WARN") && !stderr.includes("yarn install")) {
      throw new Error(stderr);
    }

    res.status(200).json({
      message: `Successfully installed: ${packageList}`,
      output: stdout,
      packages,
      manager,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to install packages",
      details: error.message,
    });
  }
}