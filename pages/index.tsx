import {Inter} from "next/font/google";
import Header from "@/components/Header";
import Canvas from "@/components/Canvas";

const inter = Inter({subsets: ["latin"]});

export default function Home() {
    return (
        <main className={`h-[100dvh] w-[100dvw] ${inter.className} flex flex-col`}>
            <Header className={"w-full h-14 flex-none"}/>
            <Canvas className={"w-full h-full"}/>
        </main>
    );
}
