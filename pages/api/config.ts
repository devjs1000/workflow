// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { readFile } from 'fs/promises';


export default async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const configFileData = await readFile('assets/configuration.json');
  const configData = JSON.parse(configFileData.toString());
  try {
    res.status(200).json(configData);
  } catch (e) {
    res.status(500).json(e);
  }
}
