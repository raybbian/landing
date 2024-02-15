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
        const queues = await prisma.queue.findMany({
            where: {
                User: {
                    email: session.user?.email
                }
            }
        });
        res.json(queues);
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}