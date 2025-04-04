import React from "react";

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  console.log(params);
  return <div>Profile Page</div>;
}
