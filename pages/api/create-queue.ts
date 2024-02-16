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
        let {name, canAdd, queueId} = req.body;

        if (!queueId) {
            queueId = "";
        }

        if (!name || !canAdd) {
            res.status(400).json({message: 'Name and canAdd are required'});
            return;
        }

        if (name.length == 0) {
            res.status(400).json({message: 'Name cannot be empty'});
            return;
        } else if (name.length > 100) {
            res.status(400).json({message: 'Name cannot be longer than 100 characters'});
            return;
        }

        const queue = await prisma.queue.upsert({
            where: {
                id: queueId,
            },
            update: {
                name,
                canAdd,
            },
            create: {
                User: {
                    connect: {
                        email: session.user?.email
                    }
                },
                name,
                canAdd,
            }
        });
        res.json(queue);
    } else {
        res.status(405).json({message: 'Method not allowed'});
    }
};
