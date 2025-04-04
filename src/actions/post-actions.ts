'use server'

import { db } from "@/lib/db"
import { getDbUserId } from "./user-actions"
import { revalidatePath } from "next/cache"
import { Comment } from '@prisma/client'

export async function createPost(content: string, imageUrl: string) {
  try {
    const userId = await getDbUserId()
    if (!userId) return

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

export async function getPosts() {
  try {
    const posts = await db.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        auther: {
          select: {
            id:true,
            name: true,
            image: true,
            username: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    return posts
  } catch (error) {
    console.log('Error in get posts', error)
    throw new Error('Failed to get posts')
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId()
    if (!userId) return

    //check if the post already has a like
    const exisitingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    })

    //get the post that needs to either be liked or remove the like
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!post) throw new Error('Post Not Found')

    if (exisitingLike) {
      await db.like.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      })
    } else {
      await db.$transaction([
        db.like.create({
          data: {
            userId,
            postId
          }
        }),
        ...(post.authorId !== userId ? [
          db.notification.create({
            data: {
              type: 'LIKE',
              userId: post.authorId,
              creatorId: userId,
              postId
            }
          })
        ] : [])
      ])
    }
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: error }
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId()


    if (!userId) return
    if (!content) throw new Error('Content is required')
  

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    console.log(post)

    if(!post) return

    const [comment] = await db.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId
        }
      })

      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: 'COMMENT',
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id
          }
        })
      }
      return [newComment]
    })

    revalidatePath(`/posts/${postId}`)
    return { success: true, comment }
  } catch (error) {
    return {success: false, error: 'Something went wrong'}
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId()

    const post = await db.post.findUnique({
      where: { id: postId },
      select: {authorId: true}
    })

    //check that we have a post
    if (!post) throw new Error('Post not found')
    
    //check that the person deleting the post created the post
    if (post.authorId !== userId) throw new Error('Unauthorised - No delete permission')
    
    //delete the post
    await db.post.delete({
      where: {id: postId}
    })

    revalidatePath('/')
    return {success: true}
  
  } catch (error) {
    return { success: false, error: 'Failed to delete post'}
  }
}
