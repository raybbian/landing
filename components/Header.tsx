import Image from "next/image";
import {PrismaClient} from "@prisma/client";
import {signIn, signOut, useSession} from "next-auth/react";
import {FaCaretDown, FaRightFromBracket, FaRightToBracket} from "react-icons/fa6";
import {useState} from "react";

const prisma = new PrismaClient();

function AccountDropdown({showDropdown}: { showDropdown: boolean }) {
    const {data: session, status} = useSession();
    const user = session?.user;

    let button;
    if (!session) {
        button = (
            <button className={"hover:bg-ctp-surface0 w-full p-2 flex items-center justify-center gap-3"} onClick={() => signIn("github")}>
                <FaRightToBracket/>
                Sign in with GitHub
            </button>
        )
    } else {
        button = (
            <button className={"hover:bg-ctp-surface0 w-full p-2 flex items-center justify-center gap-3"} onClick={() => signOut()}>
                <FaRightFromBracket/>
                Sign out
            </button>
        )
    }

    if (!showDropdown) {
        return <></>;
    }

    return (
        <div
            className={"absolute w-52 bg-ctp-mantle top-14 right-2 cursor-auto rounded-b-lg overflow-hidden border-[1px] border-t-0 border-ctp-surface0"}>
            {session && (
                <div className={"w-full p-4"}>
                    <p className={"font-light"}>Signed in as:</p>
                    <p className={"text-lg font-bold"}>{user?.name}</p>
                    <p>({user?.email})</p>
                </div>
            )}
            {button}
        </div>
    )
}

export default function Header() {
    const {data: session, status} = useSession();
    const user = session?.user;
    const [show, setShow] = useState(false);

    return (
        <div
            className={"w-[100dvw] h-14 bg-ctp-mantle border-b-[1px] border-ctp-surface0 flex justify-between px-2 relative items-center"}>
            <>
                <p className={"text-lg ml-3"}>Welcome, {session ? <span className={"font-bold"}>{user?.name}</span> :
                    <span>please <button className={"cursor-pointer font-bold"} onClick={() => signIn("github")}>sign in.</button></span>}</p>
                <div
                    className={"w-20 p-2 hover:bg-ctp-surface0 flex items-center justify-center gap-2 cursor-pointer"}
                    onClick={() => {
                        setShow(!show)
                    }}
                >
                    <Image src={user?.image || "/default.jpg"} alt={"GitHub"} width={36} height={36}
                           className={"rounded-full"}/>
                    <FaCaretDown className={""} size={16}/>
                </div>
                <AccountDropdown showDropdown={show}/>
            </>
        </div>
    )
}
