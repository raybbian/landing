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
        let {
            queueId,
            name,
            description = "",
            deadline = null,
            link = "",
            color = 0,
            queueItemId
        } = req.body;

        if (!queueItemId) {
            queueItemId = "";
        }

        if (!name || !queueId) {
            res.status(400).json({message: 'Name is required'});
            return;
        }
        if (name.length == 0) {
            res.status(400).json({message: 'Name cannot be empty'});
            return;
        }
        if (name.length > 100) {
            res.status(400).json({message: 'Name cannot be longer than 100 characters'});
            return;
        }
        if (description.length > 1000) {
            res.status(400).json({message: 'Description cannot be longer than 1000 characters'});
            return;
        }
        if (link.length > 255) {
            res.status(400).json({message: 'Link cannot be longer than 255 characters'});
            return;
        }
        if (color < 0 || color > 14) {
            res.status(400).json({message: 'Color must be between 0 and 14'});
            return;
        }

        const queueItem = await prisma.queueItem.upsert({
            where: {
                id: queueItemId,
            },
            update: {
                name, description, deadline, link, color
            },
            create: {
                User: {
                    connect: {
                        email: session.user?.email
                    }
                },
                Queue: {
                    connect: {
                        id: queueId
                    }
                },
                name,
                description,
                deadline,
                link,
                color,
            },
        });
        res.json(queueItem);
    } else {
        res.status(405).json({message: 'Method not allowed'});
    }
};
