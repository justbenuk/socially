import { getPosts } from "@/actions/post-actions";
import { getDbUserId } from "@/actions/user-actions";
import WhoToFollow from "@/components/follow/who-to-follow";
import CreatePost from "@/components/posts/create-post";
import PostCard from "@/components/posts/post-card";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}
        <div className="space-y-6">
          {posts.map((post) => {
            return <PostCard post={post} key={post.id} dbUserId={dbUserId} />;
          })}
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <WhoToFollow />
      </div>
    </div>
  );
}
