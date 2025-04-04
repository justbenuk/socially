import { getRandomUsers } from "@/actions/user-actions";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { AvatarImage, Avatar } from "../ui/avatar";
import FollowButton from "./follow-button";

export default async function WhoToFollow() {
  const users = await getRandomUsers();

  if (users.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Who To Follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex gap-2 items-center justify-between"
            >
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.username}`}>
                  <Avatar>
                    <AvatarImage src={user.image ?? "/avatar.png"} />
                  </Avatar>
                </Link>
                <div className="text-xs">
                  <Link
                    className="font-medium cursor-pointer"
                    href={`/profile/${user.username}`}
                  >
                    {user.name}
                  </Link>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <p className="text-muted-foreground">
                    {user._count.followers} followers
                  </p>
                </div>
              </div>
              <FollowButton userId={user.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
