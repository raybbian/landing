import Queue from "@/components/Queue";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {Queue as QueueType} from "@prisma/client";
import {FaFaceFrown} from "react-icons/fa6";

export default function Canvas({className}: {
    className?: string
}) {
    const {data: session, status} = useSession();

    const [dbUserQueues, setDbUserQueues] = useState<Record<string, QueueType>>({});

    useEffect(() => {
        fetch('api/get-user-queues')
            .then(response => {
                response.json().then((data: QueueType[]) => {
                    data.map(queue => {
                        dbUserQueues[queue.id] = queue;
                    })
                })
            })
    }, [session]);

    if (!session || session.user?.email === null) {
        return (
            <div className={"w-full h-full grid place-items-center"}>
                <div className={"flex flex-col items-center gap-4"}>
                    <FaFaceFrown className={"text-ctp-surface0 hover:text-ctp-surface1"} size={64}/>
                    <p>You are not signed in!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className} bg-ctp-crust flex flex-row gap-4 p-4 overflow-x-scroll`}>
            {Object.keys(dbUserQueues).map((queueId, index) => (
                <Queue queue={dbUserQueues[queueId]} key={index} dbUserQueues={dbUserQueues} setDbUserQueues={setDbUserQueues} className={"flex-none"}/>
            ))}
            <Queue dbUserQueues={dbUserQueues} setDbUserQueues={setDbUserQueues} className={"flex-none"}/>
        </div>
    );
}