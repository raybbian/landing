import prisma from '@/lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {getServerSession} from "next-auth";
import {options} from "@/pages/api/auth/[...nextauth]";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, options);
    if (!session || !session.user?.email) {
        res.status(401).json({message: 'Unauthorized'});
        return;
    }
    if (req.method === 'POST') {
        let {queueId} = req.body;

        if (!queueId) {
            res.status(400).json({message: 'Queue ID is required'});
            return;
        }

        const queue = await prisma.queue.delete({
            where: {
                id: queueId,
            },
        });
        res.json(queue);
    } else {
        res.status(405).json({message: 'Method not allowed'});
    }
};
