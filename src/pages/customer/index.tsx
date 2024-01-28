import { type Customers } from "@prisma/client";
import { LinkIcon } from "lucide-react";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import PageNumbers from "~/components/Atoms/PageNumbers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import Search from "~/components/Molecules/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/Molecules/Table";
import { env } from "~/env.mjs";
import { formatDate, getBucketUrl, ITEMS_PER_PAGE } from "~/lib/utils";
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
          OR: [{ customer_name: { search: search } }, { phone_number: { search: search } }, { nic: { search: search } }],
        }
      : {};
  //
  const customers = await prisma.customers.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    orderBy: {
      created_time: "desc",
    },
  });
  //
  const count = await prisma.customers.count({ where });
  const total = await prisma.customers.count();
  //
  return {
    props: {
      customers: customers.map((customer) => ({
        ...customer,
        created_time: formatDate(customer.created_time),
      })),
      count,
      total,
    },
  };
};
//
type CustomerType = Customers;
interface pageProps {
  customers: CustomerType[];
  count: number;
  total: number;
}
//
export default function Customer({ customers: serverCustomers, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const [customers, setCustomers] = useState<CustomerType[]>(serverCustomers);
  useEffect(() => {
    setCustomers(serverCustomers);
  }, [serverCustomers]);
  //
  return (
    <>
      <Head>
        <title>Customers {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>A list of all customers.</CardDescription>
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
                  <TableHead className="text-center">Username</TableHead>
                  <TableHead className="text-center">Phone number</TableHead>
                  <TableHead className="text-center">NIC</TableHead>
                  <TableHead className="text-center">NIC Photo links</TableHead>
                  <TableHead className="text-center">Address</TableHead>
                  <TableHead className="text-center">Registered Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length !== 0 ? (
                  customers.map((customer, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">{customer.customer_name}</TableCell>
                        <TableCell className="text-center">{customer.phone_number}</TableCell>
                        <TableCell className="text-center">{customer.nic}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Link href={`${getBucketUrl(env.NEXT_PUBLIC_CUSTOMER_NIC)}/${customer.nic_photo[0]}.jpg`}>
                              <LinkIcon />
                            </Link>
                            <Link href={`${getBucketUrl(env.NEXT_PUBLIC_CUSTOMER_NIC)}/${customer.nic_photo[1]}.jpg`}>
                              <LinkIcon />
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{customer.address}</TableCell>
                        <TableCell className="text-center">{customer.created_time.toString()}</TableCell>
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
                <p>Currently, a total of {total} Customers are on the system</p>
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
