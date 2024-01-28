import { getSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import PageNumbers from "~/components/Atoms/PageNumbers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/Molecules/dialog";
import Search from "~/components/Molecules/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/Molecules/Table";
import { formatDate, ITEMS_PER_PAGE } from "~/lib/utils";
import { prisma } from "~/server/db";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });
  //
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
  const search = context.query.search ? (context.query.search as string).split(" ").join(" | ") : "";
  const where =
    search !== ""
      ? {
          OR: [{ email: { search: search } }, { username: { search: search } }],
          role: {
            role_type: "cashier",
          },
        }
      : {
          role: {
            role_type: "cashier",
          },
        };
  //
  const cashiers = await prisma.users.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    orderBy: {
      created_time: "desc",
    },
  });
  const count = await prisma.users.count({
    where,
  });
  const total = await prisma.users.count();
  //
  return {
    props: {
      cashiers: cashiers.map((cashier) => ({
        ...cashier,
        createdAt: formatDate(cashier.created_time),
      })),
      count,
      total,
    },
  };
};
//
type CashierType = {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
  created_time: Date;
  deactivated: boolean;
};
interface pageProps {
  cashiers: CashierType[];
  count: number;
  total: number;
}
//
export default function ViewCashiers({ cashiers: serverCashiers, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const [cashiers, setCashiers] = useState<CashierType[]>(serverCashiers);
  const [isDialogOpen1, setIsDialogOpen1] = useState(false);
  const [isDialogOpen2, setIsDialogOpen2] = useState(false);
  useEffect(() => {
    setCashiers(serverCashiers);
  }, [serverCashiers]);
  //
  const [inputValue, setInputValue] = useState("");
  const [isButtonDisabled1, setIsButtonDisabled1] = useState(true);
  const [isButtonDisabled2, setIsButtonDisabled2] = useState(true);
  const [currentCashierId, setCurrentCashierId] = useState<number | null>(null);
  //
  const handleInputChange = (event: { target: { value: any } }) => {
    const value = event.target.value;
    setInputValue(value);
    // Enable the button only if the input value is 'deactivate'
    setIsButtonDisabled1(value !== "deactivate");
    // Enable the button only if the input value is 'activate'
    setIsButtonDisabled2(value !== "activate");
  };
  //
  const handleDialogOpen1 = (userId: number) => {
    setCurrentCashierId(userId);
    setIsDialogOpen1(true);
  };
  const handleDialogOpen2 = (userId: number) => {
    setCurrentCashierId(userId);
    setIsDialogOpen2(true);
  };
  const onSubmit = async () => {
    if (currentCashierId !== null) {
      mutate({ id: currentCashierId }); // Use the currentCashierId here
    }
  };
  //
  const { mutate, isLoading } = api.cashier.deactive.useMutation({
    onError: () => {
      toast.error("Error occured while changing the active status of cashier", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    },
    onSuccess: () => {
      toast.success("Cashier's active status updated successfully", {
        position: toast.POSITION.BOTTOM_RIGHT,
      }),
        setIsDialogOpen1(false);
      setIsDialogOpen2(false);
      router.replace("/cashier");
    },
  });
  return (
    <>
      <Head>
        <title>Cashiers {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Cashiers</CardTitle>
            <CardDescription>A list of all cashiers.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for cashiers"
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
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Created At</TableHead>
                  <TableHead className="text-center">Deactive / Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashiers.length !== 0 ? (
                  cashiers.map((cashier, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">{cashier.username}</TableCell>
                        <TableCell className="text-center">{cashier.email}</TableCell>
                        <TableCell className="text-center">{cashier.created_time.toString()}</TableCell>
                        <TableCell className="text-center">
                          {cashier.deactivated === true ? (
                            <Dialog open={isDialogOpen1}>
                              <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => handleDialogOpen1(cashier.user_id)}>
                                  Activate
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Activate cashier</DialogTitle>
                                  <DialogDescription>Type 'activate' in below box to activate this cashier.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Input id="name" className="col-span-3" onChange={handleInputChange} value={inputValue} />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button style={{ marginRight: "auto" }} onClick={() => setIsDialogOpen1(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    style={{ backgroundColor: "green", color: "white", display: "flex", justifyContent: "flex-end" }}
                                    onClick={() => onSubmit()}
                                    disabled={isButtonDisabled2}
                                    loading={isLoading}>
                                    Activate
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Dialog open={isDialogOpen2}>
                              <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => handleDialogOpen2(cashier.user_id)}>
                                  Deactivate
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Deativate cashier</DialogTitle>
                                  <DialogDescription>Type 'deactivate' in below box to deactivate this cashier.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Input id="name" className="col-span-3" onChange={handleInputChange} value={inputValue} />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button style={{ marginRight: "auto" }} onClick={() => setIsDialogOpen2(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    style={{ backgroundColor: "red", color: "white" }}
                                    onClick={() => onSubmit()}
                                    loading={isLoading}
                                    disabled={isButtonDisabled1}>
                                    Deactivate
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>
                <p>Currently, a total of {total} Cashiers are on the system including Super Admin</p>
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
