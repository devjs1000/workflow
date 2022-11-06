import type { NextApiRequest, NextApiResponse } from 'next';
import { readdir } from 'fs/promises';




export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
    try {

        const { path } = req.query;
        const files = await readdir(path as string);
        res.status(200).json(files);
    } catch (e) {
        res.status(500).json(e);
    }

};