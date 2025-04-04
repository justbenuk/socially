'use server'
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user-actions";
import { db } from "@/lib/db";
export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId()

    if (!userId) return
    if (userId === targetUserId) throw new Error('You can not follow yourself')

    const exisitingFollow = await db.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId
        }
      }
    })

    if (exisitingFollow) {
      await db.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId
          }
        }
      })
    } else {
      await db.$transaction([
        db.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId
          }
        }),
        db.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,
            creatorId: userId
          }
        })
      ])
    }
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false, error: 'Something Went Wrong' }
  }
}
