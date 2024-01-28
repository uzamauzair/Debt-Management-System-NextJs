import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
import FormFieldError from "~/components/Atoms/FormFieldError";
import { Input } from "~/components/Atoms/Input";
import { Label } from "~/components/Atoms/Label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { ResetPasswordSchema, type ResetPasswordFormData } from "~/validators/resetPasswordValidator";

interface ResetPasswordProps {
  email: string;
}

export default function ResetPassword({ email }: ResetPasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(ResetPasswordSchema),
  });

  const { mutate, isLoading } = api.user.resetPassword.useMutation({
    onSuccess: () => toast.success("Your password has been reset"),
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: ResetPasswordFormData) => mutate({ email, password: data.Password, otp: data.OTP });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mobile:w-[300px] tablet:w-[400px] w-[90%]">
      <Card>
        <CardHeader>
          <CardTitle>Confirm your Identity</CardTitle>
          <CardDescription>Check your email for the verification code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="otp">One Time Passcode</Label>
            <Input id="otp" placeholder="******" type="number" {...register("OTP")} />
            <FormFieldError error={errors.OTP?.message} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="Enter your new password" type="password" {...register("Password")} />
            <FormFieldError error={errors.Password?.message} />
          </div>
        </CardContent>
        <CardFooter>
          <Button loading={isLoading}>Reset Password</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
