import {Queue as QueueType} from "@prisma/client";
import {FormEvent, useEffect, useState} from "react";
import {QueueItem as QueueItemType} from "@prisma/client";
import {useSession} from "next-auth/react";
import QueueItem from "@/components/QueueItem";
import {getBorderStatusColor, getTextStatusColor, status as statusType} from "@/lib/colors";
import {FaCheck, FaCircleNotch, FaCirclePlus, FaPenToSquare, FaTrash, FaXmark} from "react-icons/fa6";
import {queueItemOrdering} from "@/lib/sorting";

export default function Queue({queue, className, dbUserQueues, setDbUserQueues}: {
    queue?: QueueType,
    className?: string,
    dbUserQueues: Record<string, QueueType>,
    setDbUserQueues: (queues: Record<string, QueueType>) => void,
}) {
    const {data: session, status} = useSession();
    const [dbQueueItems, setDbQueueItems] = useState<Record<string, QueueItemType>>({});

    const [creating, setCreating] = useState(0);
    const [formData, setFormData] = useState({
        name: queue?.name || "",
    });
    const [formStatus, setFormStatus] = useState<{
        message: string,
        type: statusType
    }>({
        message: "",
        type: "default",
    });
    const [deleteStatus, setDeleteStatus] = useState(0); //1 -> not yet confirmed, 2 -> confirmed

    function createQueue(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (creating === 2) {
            return;
        }

        if (formData.name === "") {
            setFormStatus({
                message: "Queue name cannot be empty!",
                type: "error",
            })
            return;
        } else if (formData.name.length > 100) {
            setFormStatus({
                message: "Queue name is too long!",
                type: "error",
            })
            return;
        }

        setCreating(2);
        setFormStatus({
            message: "",
            type: "info",
        })

        fetch('api/create-queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.name,
                canAdd: true,
                queueId: queue?.id,
            })
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    setCreating(0)
                    setFormStatus({
                        message: "",
                        type: "default",
                    })
                    let newDbUserQueues = {...dbUserQueues}
                    newDbUserQueues[data.id] = data
                    setDbUserQueues(newDbUserQueues)

                    setFormData({
                        name: queue?.name || "",
                    })
                })
            } else {
                setCreating(1)
                setFormStatus({
                    message: "Queue could not be created!",
                    type: "error",
                })
            }
        })
    }

    function deleteQueue() {
        if (!queue) return;

        if (deleteStatus === 0) {
            setDeleteStatus(1)
            setFormStatus({
                message: "",
                type: "warning",
            })
            return;
        }

        setFormStatus({
            message: "",
            type: "info",
        })

        fetch('api/delete-queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queueId: queue?.id,
            })
        }).then(response => {
            if (response.status === 200) {
                setDeleteStatus(0)
                setFormStatus({
                    message: "",
                    type: "default",
                })
                let newDbUserQueues = {...dbUserQueues}
                delete newDbUserQueues[queue.id]
                setDbUserQueues(newDbUserQueues)
            } else {
                setFormStatus({
                    message: "Queue could not be deleted!",
                    type: "error",
                })
            }
        })
    }

    function getQueueItems() {
        if (!queue) return;

        const queryParams = {
            queueId: queue.id,
        }
        const queryString = new URLSearchParams(queryParams).toString();

        fetch(`api/get-queue-items?${queryString}`)
            .then(response => {
                if (response.status === 200) {
                    response.json().then((data: QueueItemType[]) => {
                        let newDbQueueItems : Record<string, QueueItemType> = {}
                        data.sort(
                            (a, b) => queueItemOrdering(a, b)
                        ).map(queueItem => {
                            newDbQueueItems[queueItem.id] = queueItem
                        })
                        setDbQueueItems(newDbQueueItems)
                    })
                } else {
                    setTimeout(getQueueItems, 1000);
                }
            })
    }

    useEffect(() => {
        getQueueItems()
    }, [session]);

    if (!queue && creating === 0) {
        return (
            <div
                className={`flex-none w-96 h-full rounded-lg border-[3px] border-ctp-surface0 border-dashed grid place-items-center`}>
                <FaCirclePlus
                    className={"text-ctp-surface0 hover:text-ctp-surface1 cursor-pointer"}
                    size={64}
                    onClick={() => setCreating(1)}
                />
            </div>
        )
    }

    const innerContent = (
        <>
            <div
                className={"flex-none w-full h-12 border-b-[1px] border-ctp-surface0 bg-ctp-mantle rounded-t-lg flex flex-row justify-between items-center px-4 gap-4"}>
                <input
                    className={"w-full h-full bg-ctp-mantle focus:outline-none focus:border-ctp-surface0 text-lg"}
                    type={"text"}
                    name={"name"}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={"Queue name"}
                    disabled={!!queue && creating === 0}
                    autoFocus={true}
                />
                {!!queue &&
                    <>
                        {creating === 0 ?
                            <FaPenToSquare
                                size={20}
                                className={"text-ctp-overlay0 hover:text-ctp-overlay2 cursor-pointer"}
                                onClick={() => {
                                    setFormStatus({
                                        message: "",
                                        type: "warning"
                                    })
                                    setCreating(1)
                                }}
                            /> :
                            <FaXmark
                                size={20}
                                className={"text-ctp-overlay0 hover:text-ctp-overlay2 cursor-pointer"}
                                onClick={() => {
                                    setFormStatus({
                                        message: "",
                                        type: "default"
                                    })
                                    setCreating(0)
                                }}
                            />
                        }
                        {deleteStatus === 0 ?
                            <FaTrash
                                size={20}
                                className={"text-ctp-overlay0 hover:text-ctp-overlay2 cursor-pointer"}
                                onClick={() => deleteQueue()}
                            /> :
                            <>
                                <FaXmark
                                    size={20}
                                    className={"text-ctp-overlay0 hover:text-ctp-overlay2 cursor-pointer"}
                                    onClick={() => {
                                        setFormStatus({
                                            message: "",
                                            type: "default",
                                        })
                                        setDeleteStatus(0)
                                    }}
                                />
                                <FaCheck
                                    size={20}
                                    className={"text-ctp-overlay0 hover:text-ctp-overlay2 cursor-pointer"}
                                    onClick={() => deleteQueue()}
                                />
                            </>
                        }
                    </>
                }
            </div>
            <div className={"flex-grow w-full p-3 flex flex-col gap-3 overflow-x-hidden overflow-y-scroll"}>
                {!!queue &&
                    <>
                        {Object.keys(dbQueueItems).map((queueItem) => (
                            <QueueItem queueItem={dbQueueItems[queueItem]} key={queueItem} dbQueueItems={dbQueueItems}
                                       setDbQueueItems={setDbQueueItems} queueId={queue.id}
                                       className={"flex-none"}/>
                        ))}
                        <QueueItem dbQueueItems={dbQueueItems} setDbQueueItems={setDbQueueItems} queueId={queue?.id}
                                   className={"flex-none"}/>
                    </>
                }
                {formStatus.message.length > 0 &&
                    <p className={`${getTextStatusColor(formStatus.type)} ml-2`}>{formStatus.message}</p>
                }
            </div>
            {creating === 1 &&
                <button
                    className={"w-full h-12 bg-ctp-surface0 hover:bg-ctp-surface1 rounded-b-lg"}
                    type={"submit"}
                >
                    {!queue ? "Create" : "Update"}
                </button>
            }
        </>
    )

    return (
        <div
            className={`${className} bg-ctp-crust w-96 h-full rounded-lg border-[1px] ${getBorderStatusColor(formStatus.type)} overflow-y-scroll flex flex-col overflow-hidden`}>
            {creating == 1 ?
                <form
                    className={"w-full h-full flex flex-col justify-between"}
                    onSubmit={e => createQueue(e)}
                >
                    {innerContent}
                </form> :
                <div
                    className={"w-full h-full flex flex-col justify-between"}
                >
                    {innerContent}
                </div>
            }
        </div>
    );
}