import { Transactions } from "@prisma/client";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import PageNumbers from "~/components/Atoms/PageNumbers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import Search from "~/components/Molecules/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/Molecules/Table";
import { formatDate, ITEMS_PER_PAGE } from "~/lib/utils";
import { prisma } from "~/server/db";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (session?.user.role !== "superAdmin" && session?.user.role !== "cashier") {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
      props: {},
    };
  }
  //
  const search = context.query.search ? (context.query.search as string).split(" ").join(" | ") : "";
  const where =
    search !== ""
      ? {
          OR: [{ transaction_type: { search: search } }, { customer: { customer_name: { search: search } } }],
        }
      : {
          user: {
            user_id: parseInt(session?.user.id.toString()),
          },
        };
  //
  const userActivities = await prisma.transactions.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    orderBy: {
      transaction_date: "desc",
    },
    include: {
      customer: {
        select: {
          customer_name: true,
        },
      },
    },
  });
  //
  const count = await prisma.transactions.count({ where });
  const total = await prisma.transactions.count({
    where: {
      user: {
        user_id: parseInt(session.user.id.toString()),
      },
    },
  });
  //
  return {
    props: {
      userActivities: userActivities.map((userActivity) => ({
        ...userActivity,
        transaction_date: formatDate(userActivity.transaction_date),
      })),
      count,
      total,
    },
  };
};
interface UserActivityDetails extends Transactions {
  customer: {
    customer_name: string;
  };
}
interface pageProps {
  userActivities: UserActivityDetails[];
  count: number;
  total: number;
}
//
export default function UserActivitiesPage({ userActivities: serverUserActivities, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const [userActivities, setUserActivities] = useState<UserActivityDetails[]>(serverUserActivities);
  useEffect(() => {
    setUserActivities(serverUserActivities);
  }, [serverUserActivities]);
  //
  return (
    <>
      <Head>
        <title>My Transactions {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>My Transactions</CardTitle>
            <CardDescription>A list of all transaction made by me.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for customers"
              path={router.asPath}
              params={router.query}
              count={count}
            />
          </CardHeader>
          <CardContent style={{ position: "relative", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Customer name</TableHead>
                  <TableHead className="text-center">Transaction date</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userActivities.length !== 0 ? (
                  userActivities.map((userActivity, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">{userActivity.customer.customer_name}</TableCell>
                        <TableCell className="text-center">{userActivity.transaction_date.toString()}</TableCell>
                        <TableCell className="text-center">{userActivity.transaction_type}</TableCell>
                        <TableCell className="text-center">{userActivity.amount}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No records.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>
                <p>Currently, a total of {total} Cashiers are on the system</p>
              </TableCaption>
              <TableCaption>
                <PageNumbers
                  count={count}
                  itemsPerPage={ITEMS_PER_PAGE}
                  pageNumber={pageNumber}
                  path={router.asPath}
                  params={router.query}
                />
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
