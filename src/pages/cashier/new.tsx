import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/Molecules/Form";
import { CashierSchema, type CashierFormData } from "~/validators/cashierValidator";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });
  if (session?.user.role !== "superAdmin") {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
      props: {},
    };
  }
  //
  return {
    props: {},
  };
};
//
export default function NewCashier() {
  const form = useForm<CashierFormData>({
    resolver: yupResolver(CashierSchema),
  });
  const router = useRouter();
  // create cashier call
  const { mutate, isLoading } = api.cashier.create.useMutation({
    onError: () => {
      toast.error("Already a user exist in this email", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    },
    onSuccess: () => {
      toast.success("Cashier created successfully", {
        position: toast.POSITION.BOTTOM_RIGHT,
      }),
        router.replace("/cashier/");
    },
  });
  const onSubmit = async (data: CashierFormData) => {
    mutate({ email: data.Email, username: data.Username });
    form.reset();
  };
  //
  return (
    <>
      <Head>
        <title>Create Cashier</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Create Cashier</CardTitle>
            <CardDescription>Create a new Cashier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
                <FormField
                  control={form.control}
                  name="Email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input id="email" placeholder="Email of the Cashier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input id="username" placeholder="User Name of the Cashier" {...field} />
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
