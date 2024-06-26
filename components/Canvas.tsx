import Queue from "@/components/Queue";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {Queue as QueueType} from "@prisma/client";
import {FaCircleNotch, FaFaceFrown} from "react-icons/fa6";
import {queueOrdering} from "@/lib/sorting";
import {Flipped, Flipper} from "react-flip-toolkit";

export default function Canvas({className}: {
    className?: string
}) {
    const {data: session, status} = useSession();

    const [loadingData, setLoadingData] = useState(0);
    const [dbUserQueues, setDbUserQueues] = useState<Record<string, QueueType>>({});

    function getDbUserQueues() {
        if (loadingData != 0 || !session) return;
        setLoadingData(1);

        fetch('api/get-user-queues')
            .then(response => {
                if (response.status === 200) {
                    response.json().then((data: QueueType[]) => {
                        let newDbUserQueues: Record<string, QueueType> = {};
                        data.sort(
                            (a, b) => queueOrdering(a, b)
                        ).map(queue => {
                            newDbUserQueues[queue.id] = queue;
                        })
                        setDbUserQueues(newDbUserQueues);
                        setLoadingData(2);
                    })
                }
            })
    }

    useEffect(() => {
        getDbUserQueues()
    }, [session]);

    if (status === "loading" || loadingData === 1) {
        return (
            <div className={"w-full h-full grid place-items-center"}>
                <FaCircleNotch className={"animate-spin text-ctp-surface0"} size={64}/>
            </div>
        )
    }

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
        <div className={`${className} bg-ctp-crust flex flex-row gap-4 p-4 overflow-x-scroll `}>
            {Object.keys(dbUserQueues).map((queueId) => {
                return (
                    <Queue
                        key={queueId}
                        queue={dbUserQueues[queueId]}
                        dbUserQueues={dbUserQueues}
                        setDbUserQueues={setDbUserQueues}
                        className={"flex-none"}
                        queueType={(dbUserQueues[queueId].name.substring(0, 10) === "Codeforces") ? "cf" : "normal"}
                        canEdit={true}
                    />
                )
            })}
            <Queue
                dbUserQueues={dbUserQueues}
                setDbUserQueues={setDbUserQueues}
                className={"flex-none"}
                queueType={"normal"}
                canEdit={true}
            />
        </div>
    );
}
