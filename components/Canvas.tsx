import Queue from "@/components/Queue";
import {useSession} from "next-auth/react";
import {FormEvent, useEffect, useState} from "react";
import {Queue as QueueType} from "@prisma/client";
import {FaCirclePlus, FaFaceFrown} from "react-icons/fa6";
import {getBorderStatusColor, status as statusType} from "@/lib/colors";

export default function Canvas({className}: {
    className?: string
}) {
    const {data: session, status} = useSession();

    const [dbUserQueues, setDbUserQueues] = useState<QueueType[]>([]);

    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
    });
    const [formStatus, setFormStatus] = useState<{
        message: string,
        type: statusType
    }>({
        message: "",
        type: "default",
    });

    function handleFormSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        fetch('api/create-queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.name,
                canAdd: true,
            })
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    setCreating(false)
                    setFormData({
                        name: "",
                    })
                    setDbUserQueues([...dbUserQueues, data])
                })
            } else {
                setFormStatus({
                    message: "Queue could not be created!",
                    type: "error",
                })
            }
        })
    }


    useEffect(() => {
        fetch('api/get-user-queues')
            .then(response => {
                response.json().then((data: QueueType[]) => {
                    setDbUserQueues(data)
                })
            })
    }, [session]);

    let dummyQueue;
    if (!creating) {
        dummyQueue = (
            <div
                className={`flex-none w-96 h-full rounded-lg border-[3px] border-ctp-surface0 border-dashed grid place-items-center`}>
                <FaCirclePlus
                    className={"text-ctp-surface0 hover:text-ctp-surface1 cursor-pointer"}
                    size={64}
                    onClick={() => setCreating(true)}
                />
            </div>
        );
    } else {
        dummyQueue = (
            <div
                className={`flex-none w-96 h-full rounded-lg border-[1px] ${getBorderStatusColor(formStatus.type)}`}>
                <form
                    className={"w-full h-full flex flex-col justify-between"}
                    onSubmit={e => handleFormSubmit(e)}
                >
                    <input
                        className={"w-full h-12 border-b-[1px] border-ctp-surface0 bg-ctp-mantle rounded-t-lg px-4 focus:outline-none focus:border-ctp-surface0 text-lg"}
                        type={"text"}
                        name={"name"}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={"Queue name"}
                    />
                    <button
                        className={"w-full h-12 bg-ctp-surface0 hover:bg-ctp-surface1 rounded-b-lg"}
                        type={"submit"}
                    >
                        Create
                    </button>
                </form>
            </div>
        );
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
        <div className={`${className} bg-ctp-crust flex flex-row gap-4 p-4 overflow-x-scroll`}>
            {dbUserQueues.map((queue, index) => (
                <Queue queue={queue} key={index} className={"flex-none"}/>
            ))}
            {dummyQueue}
        </div>
    );
}