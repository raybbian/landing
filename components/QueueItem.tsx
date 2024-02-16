import {QueueItem as QueueItemType} from "@prisma/client";
import {FormEvent, useState} from "react";
import {allBgAccentColors, getBorderStatusColor, getTextStatusColor} from "@/lib/colors";
import {FaCirclePlus} from "react-icons/fa6";
import {status as statusType} from "@/lib/colors";


type QueueItemFormData = {
    name: string,
    description?: string,
    deadline?: Date,
    link?: string,
    color: number,
}

export default function QueueItem({queueItem, className, dbQueueItems, setDbQueueItems, queueId}: {
    queueItem?: QueueItemType,
    className?: string,
    dbQueueItems: QueueItemType[],
    setDbQueueItems: (queueItems: QueueItemType[]) => void,
    queueId?: string,
}) {
    const [creating, setCreating] = useState(0);
    //0 -> dummy item (queueItem null -> dummy, queueItem nonNull -> actual), 1 -> creating (form), 2 -> loading transaction
    const [focusedSubform, setFocusedSubform] = useState("none");
    const [formData, setFormData] = useState<QueueItemFormData>({
        name: "",
        description: queueItem?.description || "",
        deadline: queueItem?.deadline || undefined,
        link: queueItem?.link || "",
        color: 0,
    });
    const [formStatus, setFormStatus] = useState<{
        message: string,
        type: statusType
    }>({
        message: "",
        type: "default",
    });

    function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const {name, description, deadline, link, color} = formData;
        if (name === "") {
            setFormStatus({
                message: "Item name cannot be empty!",
                type: "error",
            })
            return;
        }
        if (name.length > 100) {
            setFormStatus({
                message: "Item name is too long!",
                type: "error",
            })
            return;
        }

        setCreating(2);
        setFormStatus({
            message: "Creating item...",
            type: "info",
        })

        fetch('api/create-queue-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queueId,
                name,
                description,
                deadline,
                link,
                color,
            })
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    setCreating(0);
                    setFormData({
                        name: "",
                        color: 0,
                    })
                    setFormStatus({
                        message: "",
                        type: "default",
                    })
                    setDbQueueItems([...dbQueueItems, data])
                })
            } else {
                setCreating(1);
                setFormStatus({
                    message: "Failed to add item!",
                    type: "error",
                })
            }
        })
    }

    function getStatus() {
        if (creating === 0 && !queueItem)
            return "dummy"
        if (creating === 0 && !!queueItem)
            return "view"
        if (creating === 1)
            return "form"
        else // creating === 2
            return "loading"
    }

    if (!queueItem && creating === 0) {
        return (
            <div
                className={"w-full h-36 border-[3px] border-ctp-surface0 bg-ctp-crust rounded-lg border-dashed grid place-items-center"}>
                <FaCirclePlus
                    className={"text-ctp-surface0 hover:text-ctp-surface1 cursor-pointer"}
                    size={64}
                    onClick={() => setCreating(1)}
                />
            </div>
        )
    }

    return (
        <div
            className={`w-full h-36 border-[1px] ${getBorderStatusColor(formStatus.type)} bg-ctp-mantle rounded-lg relative`}>
            <form
                className={"w-full h-full flex flex-col justify-between"}
                onSubmit={e => handleFormSubmit(e)}
            >
                <div
                    className={`flex-none w-full h-10 border-b-[1px] bg-ctp-surface0 border-ctp-surface0 rounded-t-lg px-3`}>
                    <input
                        className={`w-full h-full focus:outline-none bg-ctp-surface0`}
                        type={"text"}
                        name={"name"}
                        value={queueItem?.name || formData.name}
                        onChange={(e) => {
                            setFormData({...formData, name: e.target.value})
                        }}
                        placeholder={"Item name"}
                        autoFocus={true}
                        disabled={getStatus() == "view"}
                    />
                </div>
                <textarea
                    className={`w-full h-full bg-ctp-mantle px-3 py-2 text-sm focus:outline-none resize-none ${getStatus() != "form" && "rounded-b-lg"}`}
                    name={"description"}
                    value={queueItem?.description || formData.description}
                    placeholder={"Description"}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    disabled={getStatus() == "view"}
                />
                {(getStatus() == "form" || getStatus() == "loading") &&
                    <div
                        className={"flex-none w-full h-8 flex flex-row border-t-[1px] border-ctp-surface0 rounded-b-lg"}>
                        <div className={"flex-none w-[85%] h-full rounded-bl-lg flex flex-row"}>
                            {focusedSubform === "color" &&
                                <ColorPicker
                                    formData={formData}
                                    setFormData={setFormData}
                                    setFocusedSubform={setFocusedSubform}
                                    className={"flex-none"}
                                />
                            }
                            {focusedSubform === "none" &&
                                <>
                                    <div className={"flex-grow h-full rounded-bl-lg"}>
                                        <input
                                            className={"w-full h-full bg-ctp-mantle text-sm px-3 focus:outline-none rounded-bl-lg"}
                                            type={"url"}
                                            name={"link"}
                                            placeholder={"Link"}
                                            value={queueItem?.link || formData.link}
                                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                                        />
                                    </div>
                                    <button
                                        className={`aspect-square h-full bg-ctp-surface0 hover:bg-ctp-surface1 cursor-pointer grid place-items-center z-10`}
                                        onClick={() => setFocusedSubform("color")}
                                        type={"button"}
                                    >
                                        <div
                                            className={`h-1/2 aspect-square ${allBgAccentColors[formData.color]} rounded-full`}></div>
                                    </button>
                                    <div className={"flex-grow h-full"}>
                                        <input
                                            className={"w-full h-full bg-ctp-mantle text-sm px-2 focus:outline-none"}
                                            type={"date"}
                                            name={"deadline"}
                                            value={queueItem?.deadline?.toISOString().split('T')[0] || formData.deadline?.toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                deadline: new Date(e.target.value)
                                            })}
                                        />
                                    </div>
                                </>
                            }
                        </div>
                        <button
                            className={"flex-grow h-full bg-ctp-surface0 hover:bg-ctp-surface1 rounded-br-lg text-sm"}
                            type={"submit"}
                        >
                            {!queueItem ? "Add" : "Edit"}
                        </button>
                    </div>
                }
            </form>
            {formStatus.message.length > 0 &&
                <p className={`absolute top-full mt-2 mr-2 right-0 text-sm ${getBorderStatusColor(formStatus.type)} ${getTextStatusColor(formStatus.type)}`}>{formStatus.message}</p>
            }
        </div>
    )
}

function ColorPicker({formData, setFormData, setFocusedSubform, className, disabled}: {
    formData: QueueItemFormData,
    setFormData: (value: QueueItemFormData) => void,
    setFocusedSubform: (value: string) => void
    className?: string,
    disabled?: boolean,
}) {
    return (
        <div className={`${className} grid grid-cols-7 grid-rows-2 w-full h-full rounded-bl-lg`}>
            {allBgAccentColors.map((color, index) => (
                <button
                    className={`w-full h-full col-span-1 row-span-1 ${color} cursor-pointer ${index === 7 && "rounded-bl-lg"} focus:z-10`}
                    onClick={() => {
                        setFormData({...formData, color: index})
                        setFocusedSubform("none")
                    }}
                    disabled={disabled}
                    key={index}
                />
            ))}
        </div>
    )
}
