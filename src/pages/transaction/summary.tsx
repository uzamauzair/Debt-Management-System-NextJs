import { Transactions } from "@prisma/client";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { Button } from "~/components/Atoms/Button";
import PageNumbers from "~/components/Atoms/PageNumbers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import Search from "~/components/Molecules/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/Molecules/Table";
import { ITEMS_PER_PAGE } from "~/lib/utils";
import { prisma } from "~/server/db";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });
  //
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
  const searchQuery = {
    OR: [
      {
        customer: {
          customer_name: { search: search },
        },
      },
    ],
  };
  //
  const where = search !== "" ? searchQuery : {};
  const transactionSummary = await prisma.transactions.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    select: {
      transaction_type: true,
      amount: true,
      customer: {
        select: {
          customer_id: true,
          customer_name: true,
          phone_number: true,
        },
      },
    },
  });
  //
  const count = await prisma.transactions.count({ where: { ...where } });
  const total = await prisma.transactions.count();
  //
  return {
    props: {
      transactions: transactionSummary.map((transaction) => ({
        ...transaction,
      })),
      transactionSummary,
      count,
      total,
    },
  };
};
//
interface TransactionSummary extends Transactions {
  customer: {
    customer_id: number;
    customer_name: string;
    phone_number: string;
  };
}
interface pageProps {
  transactions: TransactionSummary[];
  transactionSummary: any;
  count: number;
  total: number;
}
//
export default function TransactionSummary({ transactions: serverTransactions, transactionSummary, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  // Group transactions by user
  const userTransactionsMap: { [customerId: number]: TransactionSummary[] } = {};

  for (const transaction of transactionSummary) {
    const customerId = transaction.customer.customer_id;
    if (!userTransactionsMap[customerId]) {
      userTransactionsMap[customerId] = [];
    }
    userTransactionsMap[customerId]?.push(transaction);
  }
  // Function to calculate balance amount for a user
  const calculateUserBalance = (userTransactions: TransactionSummary[]) => {
    let balance = 0;
    for (const transaction of userTransactions) {
      if (transaction.transaction_type === "debt") {
        balance += transaction.amount;
      } else if (transaction.transaction_type === "payment") {
        balance -= transaction.amount;
      }
    }
    return balance.toFixed(2);
  };
  //
  return (
    <>
      <Head>
        <title>Transactions {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
            <CardDescription>A list of all transactions.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for a transaction"
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
                  <TableHead className="text-center">Phone number</TableHead>
                  <TableHead className="text-center">Debt to Pay</TableHead>
                  <TableHead className="text-center">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(userTransactionsMap).map((customerId) => {
                  const userTransactions = userTransactionsMap[parseInt(customerId, 10)] || [];
                  const userBalance = calculateUserBalance(userTransactions);
                  const user = userTransactions[0]?.customer;
                  //
                  return (
                    <TableRow key={customerId}>
                      <TableCell className="text-center">{user?.customer_name}</TableCell>
                      <TableCell className="text-center">{user?.phone_number}</TableCell>
                      <TableCell className="text-center">{userBalance}</TableCell>
                      <TableCell className="text-center">
                        <Button onClick={() => router.push(`/customer/${user?.customer_id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption>
                <p>Currently, a total of {total} Transactions are on the system</p>
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
