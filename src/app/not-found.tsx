import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div>
      <h2 className="text-xl uppercase font-semibold">Not Found</h2>
      <p className="py-8">Could not find requested resource</p>
      <Button asChild size={"sm"}>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
