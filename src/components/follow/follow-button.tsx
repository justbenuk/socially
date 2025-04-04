'use client'

import { useState } from "react"
import { Button } from "../ui/button"
import { Loader2Icon } from "lucide-react"
import toast from "react-hot-toast"
import { toggleFollow } from "@/actions/follow-actions"

export default function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleFollow() {

    setIsLoading(true)

    try {
      await toggleFollow(userId)
      toast.success("You have followed the user")
    } catch (error) {
      toast.error('Something Went Wrong')
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Button size='sm' variant={'secondary'} onClick={handleFollow} disabled={isLoading} className="w-20">
      {isLoading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : "Follow"}
    </Button>
  )
}
