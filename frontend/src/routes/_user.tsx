import { createFileRoute } from "@tanstack/react-router";
import { UserLayout } from "@/components/user-layout";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
});
