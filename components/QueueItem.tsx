import {QueueItem as QueueItemType} from "@prisma/client";
import {FormEvent, useEffect, useState} from "react";
import {allBgAccentColors, allTextAccentColors, getBorderStatusColor, getTextStatusColor} from "@/lib/colors";
import {FaArrowUpRightFromSquare, FaCheck, FaCirclePlus, FaLink, FaPenToSquare, FaXmark} from "react-icons/fa6";
import {status as statusType} from "@/lib/colors";
import {queueItemOrdering} from "@/lib/sorting";


type QueueItemFormData = {
    name: string,
    description?: string,
    deadline?: Date,
    link?: string,
    color: number,
}

export default function QueueItem({queueItem, className, dbQueueItems, setDbQueueItems, queueId, canEdit, ...rest}: {
    queueItem?: QueueItemType,
    className?: string,
    dbQueueItems: Record<string, QueueItemType>,
    setDbQueueItems: (queueItems: Record<string, QueueItemType>) => void,
    queueId?: string,
    canEdit: boolean,
}) {
    const [creating, setCreating] = useState(0);
    //0 -> dummy item (queueItem null -> dummy, queueItem nonNull -> actual), 1 -> creating (form), 2 -> loading transaction
    const [focusedSubform, setFocusedSubform] = useState("none");
    const [formData, setFormData] = useState<QueueItemFormData>({
        name: queueItem?.name || "",
        description: queueItem?.description || "",
        deadline: !!queueItem?.deadline ? new Date(queueItem?.deadline) : undefined,
        link: queueItem?.link || "",
        color: queueItem?.color || 0,
    });
    const [formStatus, setFormStatus] = useState<{
        message: string,
        type: statusType
    }>({
        message: "",
        type: "default",
    });

    function createQueueItem(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (creating === 2) {
            return;
        }

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
        if ((description?.length || 0) > 1000) {
            setFormStatus({
                message: "Description is too long!",
                type: "error",
            })
            return;
        }
        if ((link?.length || 0) > 255) {
            setFormStatus({
                message: "Link is too long!",
                type: "error",
            })
            return;
        }
        if ((color < 0 || color > 14)) {
            setFormStatus({
                message: "Invalid color!",
                type: "error",
            })
            return;
        }

        setCreating(2);
        setFormStatus({
            message: "",
            type: "info",
        })

        fetch('api/create-queue-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queueItemId: queueItem?.id,
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

                    let newDbQueueItems: Record<string, QueueItemType> = {...dbQueueItems}
                    newDbQueueItems[data.id] = data;
                    Object.values(newDbQueueItems).sort(
                        (a, b) => queueItemOrdering(a, b)
                    ).map((queueItem) => {
                        newDbQueueItems[queueItem.id] = queueItem
                    })
                    setDbQueueItems(newDbQueueItems);

                    setFormData({
                        name: queueItem?.name || "",
                        description: queueItem?.description || "",
                        deadline: !!queueItem?.deadline ? new Date(queueItem?.deadline) : undefined,
                        link: queueItem?.link || "",
                        color: queueItem?.color || 0,
                    })
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

    function completeQueueItem() {
        const {name, description, deadline, link, color} = formData;

        setFormStatus({
            message: "",
            type: "info",
        })

        fetch('api/create-queue-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queueItemId: queueItem?.id,
                queueId,
                name,
                description,
                deadline,
                link,
                color,
                status: 1,
            })
        }).then(response => {
            if (response.status === 200) {
                setFormData({
                    name: "",
                    color: 0,
                })
                setFormStatus({
                    message: "",
                    type: "default",
                })

                let newDbQueueItems: Record<string, QueueItemType> = {...dbQueueItems}
                delete newDbQueueItems[queueItem?.id as string];
                setDbQueueItems(newDbQueueItems);
            } else {
                setFormStatus({
                    message: "Failed to delete item!",
                    type: "error",
                })
            }
        })
    }

    useEffect(() => {
        setFormData({
            name: queueItem?.name || "",
            description: queueItem?.description || "",
            deadline: !!queueItem?.deadline ? new Date(queueItem?.deadline) : undefined,
            link: queueItem?.link || "",
            color: queueItem?.color || 0,
        })
    }, [queueItem?.name, queueItem?.description, queueItem?.deadline, queueItem?.link, queueItem?.color])

    if (!queueItem && creating === 0) {
        return (
            <div
                {...rest}
                className={`${className} w-full h-36 border-[3px] border-ctp-surface0 bg-ctp-crust rounded-lg border-dashed grid place-items-center`}>
                <FaCirclePlus
                    className={"text-ctp-surface0 hover:text-ctp-surface1 cursor-pointer"}
                    size={64}
                    onClick={() => {
                        setFormStatus({
                            message: "",
                            type: "success"
                        })
                        setCreating(1)
                    }}
                />
            </div>
        )
    }

    const innerContent = (
        <>
            <div
                className={`flex-none w-full h-10 border-b-[1px] bg-ctp-mantle border-ctp-surface0 rounded-t-lg px-3 flex flex-row items-center gap-3`}>
                <input
                    className={`w-full h-full focus:outline-none bg-ctp-mantle`}
                    type={"text"}
                    name={"name"}
                    value={formData.name}
                    onChange={(e) => {
                        setFormData({...formData, name: e.target.value})
                    }}
                    placeholder={"Item name"}
                    autoFocus={true}
                    disabled={!!queueItem && creating !== 1}
                />
                {!!queueItem && creating !== 1 && formData.link?.length != 0 &&
                    <FaArrowUpRightFromSquare
                        size={18}
                        className={"text-ctp-overlay0 hover:text-ctp-overlay2 cursor-pointer"}
                        onClick={() => window.open(formData.link, "_blank")}
                    />
                }
                {canEdit &&
                    <>
                        {creating === 0 ?
                            <FaPenToSquare
                                size={18}
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
                                size={18}
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
                    </>
                }
            </div>
            <textarea
                className={`w-full h-full bg-ctp-crust px-3 py-2 text-sm focus:outline-none resize-none ${creating !== 1 && "rounded-b-lg"}`}
                name={"description"}
                value={formData.description}
                placeholder={"Description"}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                disabled={!!queueItem && creating !== 1}
            />
            {!!queueItem && creating !== 1 ?
                <div
                    className={`px-3 py-2 text-sm ${allTextAccentColors[formData.color]} flex flex-row justify-between`}>
                    {!formData.deadline ? "No deadline." : `Due on ${new Date(formData.deadline.getTime() + new Date().getTimezoneOffset() * 60000).toDateString()}.`}
                    <FaCheck
                        className={`${allTextAccentColors[formData.color]} cursor-pointer`}
                        size={18}
                        onClick={() => completeQueueItem()}
                    />
                </div>
                :
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
                                        className={"w-full h-full bg-ctp-crust text-sm px-3 focus:outline-none rounded-bl-lg"}
                                        type={"url"}
                                        name={"link"}
                                        placeholder={"Link"}
                                        value={formData.link}
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
                                        className={"w-full h-full bg-ctp-crust text-sm px-2 focus:outline-none"}
                                        type={"date"}
                                        name={"deadline"}
                                        value={formData?.deadline?.toISOString().split('T')[0]}
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
                        {!queueItem ? "Add" : "Save"}
                    </button>
                </div>
            }
        </>
    )

    return (
        <div
            {...rest}
            className={`${className} w-full h-36 border-[1px] ${getBorderStatusColor(formStatus.type)} bg-ctp-crust rounded-lg relative z-10`}>
            {creating === 1 ?
                <form
                    className={"w-full h-full flex flex-col justify-between"}
                    onSubmit={e => createQueueItem(e)}
                >
                    {innerContent}
                </form> :
                <div className={"w-full h-full flex flex-col justify-between"}>
                    {innerContent}
                </div>
            }
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
