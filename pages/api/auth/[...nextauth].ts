import {NextApiHandler} from 'next';
import NextAuth from 'next-auth';
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import prisma from '@/lib/prisma';

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
    throw new Error('GITHUB_ID and GITHUB_SECRET must be provided');
}

export const options = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],
    secret: process.env.SECRET,
    adapter: PrismaAdapter(prisma),
};