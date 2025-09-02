import type { NextApiRequest, NextApiResponse } from "next";
import { readFile, writeFile } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface AnalysisRequest {
  filePath: string;
  analysisType: "complexity" | "performance" | "imports" | "duplicates";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filePath, analysisType }: AnalysisRequest = req.body;

    if (!filePath || !analysisType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let result: any = {};

    switch (analysisType) {
      case "complexity":
        result = await analyzeComplexity(filePath);
        break;
      case "performance":
        result = await analyzePerformance(filePath);
        break;
      case "imports":
        result = await analyzeImports(filePath);
        break;
      case "duplicates":
        result = await analyzeDuplicates(filePath);
        break;
      default:
        return res.status(400).json({ error: "Invalid analysis type" });
    }

    res.status(200).json({
      filePath,
      analysisType,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
}

async function analyzeComplexity(filePath: string) {
  try {
    const fileContent = await readFile(filePath, "utf-8");
    
    // Basic complexity metrics
    const lines = fileContent.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const functions = (fileContent.match(/function\s+\w+|const\s+\w+\s*=.*?=>|class\s+\w+/g) || []).length;
    const conditionals = (fileContent.match(/if\s*\(|switch\s*\(|while\s*\(|for\s*\(/g) || []).length;
    const complexity = conditionals + functions;

    return {
      totalLines: lines.length,
      codeLines: nonEmptyLines.length,
      functions,
      conditionals,
      cyclomaticComplexity: complexity,
      maintainabilityIndex: Math.max(0, 100 - complexity * 2),
    };
  } catch (error) {
    throw new Error(`Failed to analyze complexity: ${error}`);
  }
}

async function analyzePerformance(filePath: string) {
  try {
    const fileContent = await readFile(filePath, "utf-8");
    
    // Performance anti-patterns
    const nestedLoops = (fileContent.match(/for.*{[\s\S]*?for.*{/g) || []).length;
    const domQueries = (fileContent.match(/getElementById|querySelector|getElementsBy/g) || []).length;
    const synchronousOps = (fileContent.match(/\.sync|await.*fs\.|readFileSync/g) || []).length;

    return {
      nestedLoops,
      domQueries,
      synchronousOps,
      performanceScore: Math.max(0, 100 - (nestedLoops * 10 + domQueries * 2 + synchronousOps * 5)),
    };
  } catch (error) {
    throw new Error(`Failed to analyze performance: ${error}`);
  }
}

async function analyzeImports(filePath: string) {
  try {
    const fileContent = await readFile(filePath, "utf-8");
    
    const imports = fileContent.match(/import.*from.*['"];?/g) || [];
    const requires = fileContent.match(/require\s*\(.*\)/g) || [];
    const unusedImports: string[] = [];
    
    // Simple unused import detection
    imports.forEach(importLine => {
      const match = importLine.match(/import\s*{?([^}]+)}?.*from/);
      if (match) {
        const importedItems = match[1].split(',').map(item => item.trim());
        importedItems.forEach(item => {
          const cleanItem = item.replace(/\s*as\s+\w+/, '').trim();
          if (!fileContent.includes(cleanItem) || fileContent.indexOf(cleanItem) === fileContent.indexOf(importLine)) {
            unusedImports.push(cleanItem);
          }
        });
      }
    });

    return {
      totalImports: imports.length + requires.length,
      esModuleImports: imports.length,
      commonJSRequires: requires.length,
      unusedImports,
      bloatwareScore: unusedImports.length,
    };
  } catch (error) {
    throw new Error(`Failed to analyze imports: ${error}`);
  }
}

async function analyzeDuplicates(filePath: string) {
  try {
    const fileContent = await readFile(filePath, "utf-8");
    const lines = fileContent.split('\n');
    
    const duplicateLines: { [key: string]: number[] } = {};
    const duplicateBlocks: any[] = [];
    
    // Find duplicate lines
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 10) { // Ignore short lines
        if (duplicateLines[trimmedLine]) {
          duplicateLines[trimmedLine].push(index + 1);
        } else {
          duplicateLines[trimmedLine] = [index + 1];
        }
      }
    });

    // Filter only actual duplicates
    const actualDuplicates = Object.entries(duplicateLines)
      .filter(([, lineNumbers]) => lineNumbers.length > 1);

    return {
      duplicateLines: actualDuplicates.map(([line, lineNumbers]) => ({
        content: line,
        occurrences: lineNumbers.length,
        lines: lineNumbers,
      })),
      duplicateCount: actualDuplicates.length,
      duplicatePercentage: (actualDuplicates.length / lines.length) * 100,
    };
  } catch (error) {
    throw new Error(`Failed to analyze duplicates: ${error}`);
  }
}