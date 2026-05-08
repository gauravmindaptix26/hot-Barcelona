import { redirect } from "next/navigation";
import { getAppServerSession } from "@/lib/auth";

export default async function PostLoginPage() {
  const session = await getAppServerSession();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.isAdmin) {
    redirect("/admin");
  }

  if (session.user.accountType === "advertiser") {
    redirect("/my-ad");
  }

  if (session.user.gender === "female") {
    redirect("/profile/me");
  }

  redirect("/my-ad");
}
