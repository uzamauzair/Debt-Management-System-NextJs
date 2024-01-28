import { Analytics } from "@vercel/analytics/react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { ToastContainer } from "react-toastify";

import Layout from "~/components/Layout";

import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from "~/components/theme-provider";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <Layout>
          <Component {...pageProps} />
          <Analytics />
          <ToastContainer />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
};
//
export default api.withTRPC(MyApp);
