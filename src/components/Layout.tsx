import { User, UserCircle2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/Atoms/Avatar";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "~/components/Molecules/Menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/Molecules/NavigationMenu";
import { Button } from "./Atoms/Button";
import Loader from "./Atoms/Loader";

//
const ALLOWED_UNAUTHED_PATHS = ["/auth", "/", "/auth/reset"];
const NAVBAR_HIDDEN_PATHS = ["/auth", "/auth/reset"];
//
function Layout(props: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  if (status === "loading" && router.pathname !== "/") return <Loader background />;
  if (status === "unauthenticated" && !ALLOWED_UNAUTHED_PATHS.includes(router.pathname)) router.push("/auth");
  if (status === "authenticated" && router.pathname === "/auth") router.push("/transaction/summary");
  //
  return (
    <main className="dark flex min-h-screen flex-col bg-stone-800">
      <div
        style={{ zIndex: 100 }}
        className={`bg-teak-light-1 sticky top-0 flex h-14 items-center border-b backdrop-blur  ${
          NAVBAR_HIDDEN_PATHS.includes(router.pathname) && "hidden"
        }`}>
        <Link href={"/"} className="m-3 flex items-center justify-center gap-2 rounded-lg bg-gray-700 p-1.5 text-white shadow-md">
          <h1 className="font-logo text-2xl italic">Smart Debt Manager</h1>
        </Link>
        <div className="tablet:flex ml-auto items-center gap-4">
          <NavItems />
          <LogoutButton />
        </div>
      </div>
      <div
        style={{ zIndex: 50, position: "relative" }}
        className={`flex flex-grow flex-col items-center justify-center text-white ${router.pathname !== "/auth" && "my-10"}`}>
        {props.children}
      </div>
    </main>
  );
}
//
export default Layout;

function NavItems() {
  const { data: session, status } = useSession();
  console.log(session);

  const CashierNavItems = useCallback(
    () => (
      <>
        <NavigationMenuItem>
          <Link href={"/transaction"}>
            <NavigationMenuTrigger className="bg-teak-dark-1 hover:bg-teak-dark-2 text-lg text-white">Transactions</NavigationMenuTrigger>
          </Link>
          <NavigationMenuContent>
            <div className={`flex w-[400px] flex-col gap-3 p-4 md:grid-cols-2`}>
              <Link href={"/transaction/new"}>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Create Transactions</NavigationMenuItem>
              </Link>
              <Link href={"/transaction"}>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>All Transactions</NavigationMenuItem>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={"/customer"}>
            <NavigationMenuTrigger className="bg-teak-dark-1 hover:bg-teak-dark-2 text-lg text-white">Customers</NavigationMenuTrigger>
          </Link>
          <NavigationMenuContent>
            <div className={`flex w-[400px] flex-col gap-3 p-4 md:grid-cols-2`}>
              <Link href={"/customer/new"}>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Create Customer</NavigationMenuItem>
              </Link>
              <Link href={"/customer"}>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>All Customers</NavigationMenuItem>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <Link href={"/user"}>
          <Button className="bg-black text-white hover:bg-gray-700">My Activities</Button>
        </Link>
      </>
    ),
    [],
  );

  return (
    <>
      {status !== "loading" && status === "authenticated" && (
        <>
          <NavigationMenu className="absolute left-1/2 -translate-x-1/2 transform">
            <NavigationMenuList>
              {session?.user.role === "superAdmin" ? (
                <>
                  <CashierNavItems />
                  <NavigationMenuItem>
                    <Link href={"/cashier"}>
                      <NavigationMenuTrigger className="bg-teak-dark-1 hover:bg-teak-dark-2 text-lg text-white">
                        Cashiers
                      </NavigationMenuTrigger>
                    </Link>
                    <NavigationMenuContent>
                      <div className={`flex w-[400px] flex-col gap-3 p-4 md:grid-cols-2`}>
                        <Link href={"/cashier"}>
                          <NavigationMenuItem className={navigationMenuTriggerStyle()}>All Cashiers</NavigationMenuItem>
                        </Link>
                        <Link href={"/cashier/new"}>
                          <NavigationMenuItem className={navigationMenuTriggerStyle()}>Create Cashier</NavigationMenuItem>
                        </Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </>
              ) : (
                <CashierNavItems />
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </>
      )}
    </>
  );
}

function LogoutButton() {
  const { status } = useSession();

  return (
    <>
      {status === "authenticated" && (
        <Menubar className="border-bc ml-auto mr-4 w-fit">
          <MenubarMenu>
            <MenubarTrigger className="m-0 p-2">
              <User className="text-white" />
            </MenubarTrigger>
            <MenubarContent className="border-bc text-dark">
              <Profile />
              <MenubarSeparator />
              <MenubarItem onClick={() => signOut()}>Log out</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )}
    </>
  );
}

function Profile() {
  const { data: session } = useSession();

  return (
    <Link href={session?.user.role === "cashier" ? `/cashier/${session?.user.id}` : `#`}>
      <MenubarItem className="flex flex-col items-center justify-center p-4">
        <Avatar>
          <AvatarImage src={"Image"} alt="User Avatar" width={100} height={100} />
          <AvatarFallback>
            <UserCircle2 width={100} height={100} />
          </AvatarFallback>
        </Avatar>
        <p>{session?.user.email}</p>
        <p>{session?.user.name}</p>
      </MenubarItem>
    </Link>
  );
}
