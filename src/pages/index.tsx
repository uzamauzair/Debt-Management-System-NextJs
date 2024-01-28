import { getSession } from "next-auth/react";
import { useEffect } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import LandPage from "~/components/Molecules/LandPage";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });
  //
  return {
    props: {
      session,
      status: session ? "authenticated" : "unauthenticated",
    },
  };
};
//
interface PageProps {
  status: "authenticated" | "unauthenticated";
}
//
export default function Index({ status }: PageProps) {
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/transaction/summary"); // Use router for client-side navigation
    }
  }, [status, router]); // Add status and router to the dependency array
  //
  if (status === "unauthenticated") {
    return <LandPage />;
  }
  return null;
}
