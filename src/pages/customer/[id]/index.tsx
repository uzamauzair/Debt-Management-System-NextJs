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
          OR: [
            { transaction_type: { search: search } },
            {
              user: { username: { search: search } },
            },
          ],
          customer: {
            customer_id: parseInt(context.params?.id as string),
          },
        }
      : {
          customer: {
            customer_id: parseInt(context.params?.id as string),
          },
        };
  //
  const transactions = await prisma.transactions.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    select: {
      transaction_date: true,
      transaction_type: true,
      transaction_details: true,
      amount: true,
      customer: {
        select: {
          customer_name: true,
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      transaction_date: "desc",
    },
  });
  //
  const count = await prisma.transactions.count({ where });
  const total = await prisma.transactions.count({
    where: {
      customer: {
        customer_id: parseInt(context.params?.id as string),
      },
    },
  });
  //
  return {
    props: {
      customerTransactions: transactions.map((transaction) => ({
        ...transaction,
        transaction_date: formatDate(transaction.transaction_date),
      })),
      count,
      total,
    },
  };
};
//
interface CustomerTransactions extends Transactions {
  customer: {
    customer_name: string;
  };
  user: {
    username: string;
  };
}
interface pageProps {
  customerTransactions: CustomerTransactions[];
  count: number;
  total: number;
}
//
export default function CustomerTransactionPage({ customerTransactions: serverCustomerTransactions, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransactions[]>(serverCustomerTransactions);
  useEffect(() => {
    setCustomerTransactions(serverCustomerTransactions);
  }, [serverCustomerTransactions]);
  //
  return (
    <>
      <Head>
        <title>Cashiers {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            {customerTransactions && <CardTitle>{`${customerTransactions[0]?.customer.customer_name} 's Transactions`}</CardTitle>}
            <CardDescription> All the Transactions.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for customers"
              path={router.asPath}
              params={router.query}
              count={count}
            />
          </CardHeader>
          <CardContent>
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Created At</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                  <TableHead className="text-center">Details</TableHead>
                  <TableHead className="text-center">Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerTransactions && customerTransactions.length !== 0 ? (
                  customerTransactions.map((customerTransaction, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">{customerTransaction.transaction_date.toString()}</TableCell>
                        <TableCell className="text-center">{customerTransaction.transaction_type}</TableCell>
                        <TableCell className="text-center">{customerTransaction.amount}</TableCell>
                        <TableCell className="text-center">{customerTransaction.transaction_details}</TableCell>
                        <TableCell className="text-center">{customerTransaction.user.username}</TableCell>
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
