import type { NextApiRequest, NextApiResponse } from "next";
import { readFile, writeFile } from "fs/promises";

interface CleanupRequest {
  filePath: string;
  removeUnusedImports: boolean;
  removeEmptyLines: boolean;
  removeComments: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filePath, removeUnusedImports, removeEmptyLines, removeComments }: CleanupRequest = req.body;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    let content = await readFile(filePath, "utf-8");
    let cleanupActions: string[] = [];

    // Remove unused imports (basic implementation)
    if (removeUnusedImports) {
      const lines = content.split('\n');
      const importLines: string[] = [];
      const codeContent = lines.filter((line, index) => {
        const isImport = line.trim().startsWith('import ') && line.includes('from');
        if (isImport) {
          importLines.push(line);
          return false;
        }
        return true;
      }).join('\n');

      const usedImports = importLines.filter(importLine => {
        const match = importLine.match(/import\s*{?([^}]+)}?.*from/);
        if (match) {
          const importedItems = match[1].split(',').map(item => item.trim());
          return importedItems.some(item => {
            const cleanItem = item.replace(/\s*as\s+\w+/, '').trim();
            return codeContent.includes(cleanItem);
          });
        }
        return true;
      });

      content = [...usedImports, ...codeContent.split('\n')].join('\n');
      cleanupActions.push(`Removed ${importLines.length - usedImports.length} unused imports`);
    }

    // Remove empty lines
    if (removeEmptyLines) {
      const originalLines = content.split('\n').length;
      content = content.split('\n').filter(line => line.trim() !== '').join('\n');
      const newLines = content.split('\n').length;
      cleanupActions.push(`Removed ${originalLines - newLines} empty lines`);
    }

    // Remove comments (basic implementation)
    if (removeComments) {
      const originalLength = content.length;
      // Remove single-line comments
      content = content.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments
      content = content.replace(/\/\*[\s\S]*?\*\//gm, '');
      const newLength = content.length;
      cleanupActions.push(`Removed ~${originalLength - newLength} characters of comments`);
    }

    // Write cleaned content back to file
    await writeFile(filePath, content);

    res.status(200).json({
      message: "File cleaned successfully",
      actions: cleanupActions,
      filePath,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to clean file",
      details: error.message,
    });
  }
}