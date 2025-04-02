'use server'

import { db } from "@/lib/db"
import { getDbUserId } from "./user-actions"
import { revalidatePath } from "next/cache"

export async function createPost(content: string, imageUrl: string) {
  try {
    const userId = await getDbUserId()

    const post = await db.post.create({
      data: {
        content,
        image: imageUrl,
        authorId: userId
      }
    })

    revalidatePath('/')
    return { success: true, post }
  } catch (error) {
    console.log("failed to post", error)
    return { success: false, error: "Failed to create post" }
  }
}
