'use server'

import { db } from '@/lib/db'
import { getDbUserId } from './user-actions'

export async function getNotifications() {
  try {
    const userId = await getDbUserId()
    if (!userId) return []
    
    const notifications = await db.notification.findMany({
      where: {
        userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        Post: {
          select: {
            id: true,
            content: true,
            image: true
          }
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    return notifications
  } catch (error) {
    console.log('unable to get notifications', error)
    throw new Error("Failed to fetch notifications")
  }
}

export async function markNotificationsAsRead(notificationId: string[]) {
  try {
    await db.notification.updateMany({
      where: {
        id: {
          in: notificationId
        }
      },
      data: {
        read: true
      }
    })
    return {success: true }
  } catch (error) {
    console.log('unable to mark as read', error)
    throw new Error('Something went wrong')
  }
}