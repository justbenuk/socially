"use client";
import {
  createComment,
  deletePost,
  getPosts,
  toggleLike,
} from "@/actions/post-actions";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import DeleteAlertDialog from "./delete-alert-dialog";
import { Button } from "../ui/button";
import { HeartIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

export default function PostCard({
  post,
  dbUserId,
}: {
  post: Post;
  dbUserId: string | null;
}) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsliking] = useState(false);
  const [isDeleteing, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === dbUserId)
  );
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

  async function handleLike() {
    if (isLiking) return;

    try {
      setIsliking(true);
      setHasLiked(!hasLiked);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptimisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsliking(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment Posted");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  }

  async function handleDeletePost() {
    if (isDeleteing) return;

    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post Deleted");
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.auther.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.auther?.image ?? "/author.png"} />
              </Avatar>
            </Link>
            {/* Post header and text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link href={`/profile/${post.auther.username}`}>
                    {post.auther.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.auther.username}`}>
                      @{post.auther.username}
                    </Link>
                    <span> &#9679;</span>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>
                {dbUserId === post.auther.id && (
                  <DeleteAlertDialog
                    isDeleteing={isDeleteing}
                    onDelete={handleDeletePost}
                  />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">
                {post.content}
              </p>
            </div>
          </div>
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant={"ghost"}
                size={"sm"}
                className={`text-muted-foreground gap-2 ${
                  hasLiked
                    ? "text-red-500 hover:text-red-600"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="text-muted-foreground gap-2"
                >
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}
            <Button
              variant={"ghost"}
              size={"sm"}
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircleIcon
                className={`size-5 ${
                  showComments ? "fill-blue-500 text-blue-500" : ""
                }`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>
          {showComments && (
            <div className="space-y-4 p-2">
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage
                        src={comment.author.image ?? "/author.png"}
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span> &#9679;</span>
                        <span>
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none bg-transparent"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size={"sm"}
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
