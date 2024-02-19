import prisma from '@/lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {getServerSession} from "next-auth";
import {options} from "@/pages/api/auth/[...nextauth]";
import {getRandomProblem, CFProblem as CFProblemType} from "@/lib/codeforces";

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

        let queueItems = await prisma.queueItem.findMany({
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dateCreated;
        if (queueItems.length > 0) {
            dateCreated = new Date(queueItems[queueItems.length - 1].dateCreated);
        } else {
            dateCreated = new Date('1970-01-01');
        }
        dateCreated.setHours(0, 0, 0, 0);

        if (today.getTime() !== dateCreated.getTime()) {
            const problem : CFProblemType = await getRandomProblem(2000, 2400);
            if (!problem) {
                res.status(500).json({message: 'Failed to fetch problem'});
                return;
            }

            const newEntry = await prisma.queueItem.create({
                data: {
                    name: problem.name,
                    description: "Daily Codeforces Problem - " + problem.contestId + problem.index + " - " + problem.rating,
                    link: "https://codeforces.com/problemset/problem/" + problem.contestId + "/" + problem.index,
                    deadline: today,
                    color: 4,
                    User: {
                        connect: {
                            email: session.user?.email
                        }
                    },
                    Queue: {
                        connect: {
                            id: queueId
                        }
                    }
                }
            });

            queueItems = [...queueItems, newEntry];
        }
        res.json(queueItems.filter(item => item.status === 0));
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}
