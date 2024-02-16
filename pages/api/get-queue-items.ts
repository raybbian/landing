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
    if (req.method === 'GET') {
        const queueId = req.query['queueId']

        if (!queueId) {
            res.status(400).json({message: 'Queue ID is required'});
            return;
        }
        if (Array.isArray(queueId)) {
            res.status(400).json({message: 'Queue ID must be a string'});
            return;
        }

        const queueItems = await prisma.queueItem.findMany({
            where: {
                User: {
                    email: session.user?.email
                },
                queueId,
            },
            orderBy: {
                dateCreated: 'asc'
            }
        });
        res.json(queueItems);
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}
