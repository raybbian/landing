import {Queue as QueueType, QueueItem as QueueItemType} from '@prisma/client'

export function queueOrdering(a: QueueType, b: QueueType) {
    return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
}

export function queueItemOrdering(a: QueueItemType, b: QueueItemType) {
    return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
}