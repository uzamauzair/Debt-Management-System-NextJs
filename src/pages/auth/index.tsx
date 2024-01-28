import { ExternalLink } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import Loader from "~/components/Atoms/Loader";
import { Card, CardDescription, CardHeader } from "~/components/Molecules/Card";

import "react-toastify/dist/ReactToastify.css";

import Login from "./functions/login";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export default function Auth() {
  const { status } = useSession();

  if (status === "loading") return <Loader background />;

  return (
    <>
      <Head>
        <title>Smart Debt Manager - Login</title>
      </Head>

      <main className="flex h-screen flex-col items-center justify-center">
        <Login />

        <Card className="mt-2 w-full">
          <CardHeader>
            <CardDescription className="flex items-center justify-center gap-2">
              <Link href={"/auth/reset"}>Reset your password here.</Link>
              <ExternalLink size={"20px"} />
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </>
  );
}
