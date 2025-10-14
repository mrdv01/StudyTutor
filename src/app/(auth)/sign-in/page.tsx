import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import SignInForm from "./SignInForm";

export default async function SignInPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
