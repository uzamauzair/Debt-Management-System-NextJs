import { ExternalLink } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import Loader from "~/components/Atoms/Loader";
import { Card, CardDescription, CardHeader } from "~/components/Molecules/Card";
import ResetPassword from "./functions/resetPassword";
import SendEmail from "./functions/sendEmail";

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
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  if (status === "loading") return <Loader background />;

  return (
    <>
      <Head>
        <title>Reset Password - Smart Debt Manager</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        {emailSent ? <ResetPassword email={email} /> : <SendEmail setEmail={setEmail} setEmailSent={setEmailSent} />}
        <Card className="mobile:w-[300px] tablet:w-[400px] mt-2 w-[90%]">
          <CardHeader>
            <CardDescription className="flex items-center justify-center gap-2">
              <Link href={"/auth"}>Found your password? Go back here.</Link>
              <ExternalLink size={"20px"} />
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </>
  );
}
