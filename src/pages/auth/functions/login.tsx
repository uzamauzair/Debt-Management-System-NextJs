import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useState } from "react";
import router from "next/router";

import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Label } from "~/components/Atoms/Label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";

import "react-toastify/dist/ReactToastify.css";

import { yupResolver } from "@hookform/resolvers/yup";
import { signIn } from "next-auth/react";

import FormFieldError from "~/components/Atoms/FormFieldError";
import { LoginFormData, LoginSchema } from "~/validators/loginValidator";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(LoginSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const auth = await signIn("credentials", {
      email: data.Email,
      password: data.Password,
      redirect: false,
      callbackUrl: "/",
    });
    if (auth?.status === 401) {
      setLoading(false);
      toast.error("Invalid Credentials");
      router.push("/auth"); // Use router.push to navigate back to /auth page
    } else if (auth?.error) {
      setLoading(false);
      console.error(auth.error);
      toast.error("An unknown error has occurred");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Unlock to Maintain Smart-Debt-Manager</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">Email</Label>
            <Input id="email" placeholder="malik@coolcity.com" type="email" {...register("Email")} />
            <FormFieldError error={errors.Email?.message} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="********" type="password" {...register("Password")} />
            <FormFieldError error={errors.Password?.message} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
