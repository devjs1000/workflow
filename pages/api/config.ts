// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { readFile, writeFile } from 'fs/promises';
import { appendFile } from 'fs';


export default async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {

  try {
    const configFileData = await readFile('assets/configuration.json');
    const configData = JSON.parse(configFileData.toString());
    switch (req.method) {
      case 'GET':
        res.status(200).json(configData);
        break;
      case 'POST':
        const { path } = req.body;
        await writeFile('assets/configuration.json', JSON.stringify({
          path
        }));
        res.status(200).json({ message: 'Configuration updated' });
        break;
    }
  } catch (e) {
    res.status(500).json(e);
  }
}
