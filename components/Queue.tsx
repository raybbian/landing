import {Queue as QueueType} from "@prisma/client";

export default function Queue({queue, className}: {
    queue: QueueType,
    className?: string,
}) {
    return (
        <div className={`${className} bg-ctp-mantle w-96 h-full rounded-lg border-[1px] border-ctp-surface0`}>
            <p className={"w-full h-12 border-b-[1px] border-ctp-surface0 bg-ctp-mantle rounded-t-lg px-4 text-lg flex items-center"}>{queue.name}</p>
        </div>
    );
}
