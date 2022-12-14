import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {

    if (req.method === "POST") {
       
        try {
            const { command, path } = req.body;
            exec(command as string, { cwd: path as string },
                (error, stdout, stderr) => {
                    if (error) {
                        res.status(500).json(error);
                    } else if (stderr) {
                        res.status(500).json(stderr);
                    } else {
                        res.status(200).json(stdout);
                    }
                });
        } catch (e) {
            res.status(500).json(e);
        }
    }
};
