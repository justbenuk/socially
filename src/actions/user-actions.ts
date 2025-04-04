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

export async function getDbUserId() {

  //first we need to get the clerkId for the current logged in user
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  //if we have the clerkid, we then need to get the user from the db 
  const user = await getUserByClerkId(clerkId)
  if (!user) throw new Error('User not found')

  //if all goes well, we shoulf be abnle to return the user id
  return user.id
}

export async function getRandomUsers() {
  try {
    //get the user id 
    const userId = await getDbUserId()

    if (!userId) return []

    //get 3 random users exclude ourselfs and users we already follow
    const randomUsers = await db.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          { NOT: { followers: { some: { followerId: userId } } } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true
          }
        }
      },
      take: 3
    })

    return randomUsers

  } catch (error) {
    console.log("Error fetching users", error)
    return []
  }
}
