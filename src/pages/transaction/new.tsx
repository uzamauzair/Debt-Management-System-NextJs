import { yupResolver } from "@hookform/resolvers/yup";
import { type Customers } from "@prisma/client";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Textarea } from "~/components/Atoms/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/Molecules/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/Molecules/Select";
import { prisma } from "~/server/db";
import { TransactionSchema, type TransactionFormData } from "~/validators/transactionValidator";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });
  if (!session || (session.user.role !== "cashier" && session.user.role !== "superAdmin")) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
      props: {},
    };
  }
  //
  const customers = await prisma.customers.findMany({ select: { customer_name: true, customer_id: true } });
  return {
    props: {
      customers: customers.map((customer) => ({
        ...customer,
      })),
    },
  };
};
//
interface pageProps {
  customers: Customers[];
}
//
export default function NewTransaction({ customers }: pageProps) {
  const router = useRouter();
  const form = useForm<TransactionFormData>({
    resolver: yupResolver(TransactionSchema),
  });
  //
  const { mutate, isLoading } = api.transaction.create.useMutation({
    onError: (error) =>
      toast.error(error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      }),
    onSuccess: () => {
      toast.success("Transaction Created Successfully", {
        position: toast.POSITION.BOTTOM_RIGHT,
      }),
        router.replace("/transaction");
    },
  });
  //
  const onSubmit = async (data: TransactionFormData) => {
    mutate({
      customer_id: data.Customer,
      amount: data.Amount,
      type: data.TransactionType,
      transaction_details: data.Description,
    });
  };
  //
  return (
    <>
      <Head>
        <title>Create Transactions</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Create a new Transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-4">
                <FormField
                  control={form.control}
                  name="Customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-[400px]">
                            <SelectValue id="customerName" placeholder="Select a Customer" />
                          </SelectTrigger>
                          <SelectContent className="w-max">
                            {customers.map((customer, index) => {
                              return (
                                <SelectItem key={index} value={customer.customer_id.toString()}>
                                  {customer.customer_name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="TransactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-[400px]">
                            <SelectValue id="type" placeholder="Select a Type" />
                          </SelectTrigger>
                          <SelectContent className="w-max">
                            <SelectItem value="debt"> Debt</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea id="description" placeholder="Brief description of the Transaction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input id="amount" placeholder="Price of the tier in LKR" type="number" step={"0.01"} min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button id="button" type="submit" loading={isLoading}>
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
