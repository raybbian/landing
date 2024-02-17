import {Queue as QueueType, QueueItem as QueueItemType} from '@prisma/client'

export function queueOrdering(a: QueueType, b: QueueType) {
    return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
}

export function queueItemOrdering(a: QueueItemType, b: QueueItemType) {
    let aDate = new Date(a.dateCreated)
    aDate.setFullYear(aDate.getFullYear() + 10);
    let bDate = new Date(b.dateCreated)
    bDate.setFullYear(bDate.getFullYear() + 10);
    return new Date(a.deadline || aDate).getTime() - new Date(b.deadline || bDate).getTime()
}