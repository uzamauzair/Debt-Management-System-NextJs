import { Transactions } from "@prisma/client";
import { saveAs } from "file-saver";
import { getSession } from "next-auth/react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
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
  const searchQuery = {
    OR: [
      { transaction_type: { search: search } },
      { transaction_details: { search: search } },
      {
        customer: { OR: [{ customer_name: { search: search } }] },
      },
    ],
  };
  //
  const where = search !== "" ? searchQuery : {};
  const transactions = await prisma.transactions.findMany({
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
      user: {
        select: {
          username: true,
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
      transactions: transactions.map((transaction) => ({
        ...transaction,
        transaction_date: formatDate(transaction.transaction_date),
      })),
      count,
      total,
    },
  };
};
interface TransactionWithDetails extends Transactions {
  customer: {
    customer_name: string;
  };
  user: {
    username: string;
  };
}
interface pageProps {
  transactions: TransactionWithDetails[];
  count: number;
  total: number;
}
//
export default function TransactionPage({ transactions: serverTransactions, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(serverTransactions);
  useEffect(() => {
    setTransactions(serverTransactions);
  }, [serverTransactions]);
  //
  const { mutate, isLoading } = api.transaction.lastMonthTransactions.useMutation({
    onError: (error) =>
      toast.error(error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      }),
    onSuccess: (data) => {
      const csvData = data.map((transaction) => ({
        "Customer Name": transaction.customer.customer_name,
        Type: transaction.transaction_type,
        Amount: transaction.amount.toString(),
        Details: transaction.transaction_details || "",
        Date: transaction.transaction_date?.toString() || "",
        "Created By": transaction.user.username,
      }));
      //
      const worksheet = XLSX.utils.json_to_sheet(csvData, { header: Object.keys(csvData[0] as {}) });
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const blob = new Blob([XLSX.write(workbook, { bookType: "csv", type: "string" })], { type: "text/csv" });

      saveAs(blob, "last_months_transactions.csv");
    },
  });
  //
  return (
    <>
      <Head>
        <title>Transactions {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CardTitle>Transactions</CardTitle>
                </div>
                <div className="ml-8">
                  <Button className="rounded bg-green-700 px-4 py-2 text-white" loading={isLoading} onClick={() => mutate()}>
                    Export LastMonth's Transactions
                  </Button>
                </div>
              </div>
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
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Amount</TableHead>
                    <TableHead className="text-center">Details</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length !== 0 ? (
                    transactions.map((transaction, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-center">{transaction.customer.customer_name}</TableCell>
                          <TableCell className="text-center">{transaction.transaction_type}</TableCell>
                          <TableCell className="text-center">{transaction.amount}</TableCell>
                          <TableCell className="text-center">{transaction.transaction_details}</TableCell>
                          <TableCell className="text-center">{transaction.transaction_date?.toString()}</TableCell>
                          <TableCell className="text-center">{transaction.user.username}</TableCell>
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
        </div>
      </main>
    </>
  );
}
