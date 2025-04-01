'use server'

import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function syncUser() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) return

    //check if user exits 
    const existingUser = await db.user.findUnique({
      where: {
        clerkId: userId
      }
    })

    if (existingUser) return existingUser

    const dbUser = await db.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl
      }
    })

    return dbUser
  } catch (error) {
    console.log("error in sync user", error)
  }
}

export async function getUserByClerkId(clerkId: string) {
  return db.user.findUnique({
    where: {
      clerkId
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true
        }
      }
    }
  })
}
