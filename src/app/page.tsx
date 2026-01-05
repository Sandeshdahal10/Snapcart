import { auth } from "@/auth";
import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

/**
 * Server-side Home page.
 *
 * - Ensures a database connection is established.
 * - Retrieves the authenticated session and the corresponding user record.
 * - Redirects to /login if the user is not found.
 * - If the user's profile is incomplete (missing mobile or role) renders the
 *   mobile role editing flow (EditRoleMobile).
 * - Otherwise renders the main navigation with the fully loaded user.
 *
 * This function runs on the server and performs redirects via Next.js server-side APIs.
 */
export default async function Home() {
  await connectDb();
  const session = await auth();

  const user = await User.findById(session?.user?.id);
  if (!user) {
    redirect("/login");
  }
  const inComplete =
    !user.mobile || !user.role || (!user.mobile && user.role === "user");
  if (inComplete) {
    return <EditRoleMobile />;
  }
  const plainUser = JSON.parse(JSON.stringify(user));
  return (
    <>
      <Nav user={plainUser} />
      
    </>
  );
}
