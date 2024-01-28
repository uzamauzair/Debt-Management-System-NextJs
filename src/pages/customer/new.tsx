import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/Molecules/Form";
import { ImageUpload } from "~/components/Molecules/ImageUpload";
import { env } from "~/env.mjs";
import { CustomerSchema, type CustomerFormData } from "~/validators/customerValidator";

type ImageState = {
  completed: boolean;
  loading: boolean;
};
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
  return {
    props: {},
  };
};
//
export default function NewCustomer() {
  const [upload, setUpload] = useState(false);
  const [iconState, setIconState] = useState<ImageState>({ completed: false, loading: false });
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<CustomerFormData>({
    resolver: yupResolver(CustomerSchema),
  });
  const { mutate, isLoading, data } = api.customer.create.useMutation({
    onError: (error) =>
      toast.error(error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      }),
    onSuccess: () => {
      setUpload(true);
      setIconState({ completed: false, loading: true });
    },
  });
  //
  const onSubmit = async (data: CustomerFormData) => {
    mutate({ customer_name: data.Username, phone_number: data.PhoneNumber, nic: data.NIC, address: data.Address });
  };

  const { mutate: UpdateImages, isLoading: isUpdatingImages } = api.customer.updateImages.useMutation({
    onSuccess: () =>
      toast.success("Customer Created Successfully", {
        position: toast.POSITION.BOTTOM_RIGHT,
      }),
  });
  useEffect(() => {
    if (iconState.completed) {
      UpdateImages({ id: data?.customer_id ?? 0, images });
    }
  }, [iconState.completed, UpdateImages, data?.customer_id, images]);

  return (
    <>
      <Head>
        <title>Create Customer</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Create Customer</CardTitle>
            <CardDescription>Create a new Customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form className="w-[400px] space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="Username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input id="customerName" placeholder="Enter Name of the Customer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="PhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input id="phoneNumber" placeholder="Phone number of the Customer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="NIC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIC</FormLabel>
                      <FormControl>
                        <Input id="nic" placeholder="National Identity Number of the Customer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="NICImages"
                  render={({}) => (
                    <FormItem id="image">
                      <FormLabel>NIC Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          key="image"
                          itemId={data?.customer_id.toString() || ""}
                          upload={upload}
                          onUpload={(images) => {
                            setIconState({ completed: true, loading: false });
                            setImages(images);
                          }}
                          setUpload={(value: boolean) => setUpload(value)}
                          setLoading={(value: boolean) =>
                            setIconState((prev) => {
                              return { ...prev, loading: value };
                            })
                          }
                          setValue={(value: string) => form.setValue("NICImages", value)}
                          multiple
                          bucket={env.NEXT_PUBLIC_CUSTOMER_NIC}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input id="address" placeholder="Address of the Customer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button id="button" type="submit" loading={isLoading || isUpdatingImages}>
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
