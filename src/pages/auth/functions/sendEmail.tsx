import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
import FormFieldError from "~/components/Atoms/FormFieldError";
import { Input } from "~/components/Atoms/Input";
import { Label } from "~/components/Atoms/Label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { ForgetPasswordSchema, type ForgetPasswordFormData } from "~/validators/forgetPasswordValidator";

interface SendEmailProps {
  setEmail: (email: string) => void;
  setEmailSent: (emailSent: boolean) => void;
}

export default function SendEmail({ setEmail, setEmailSent }: SendEmailProps) {
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordFormData>({
    resolver: yupResolver(ForgetPasswordSchema),
  });

  const { mutate, isLoading } = api.user.forgotPassword.useMutation({
    onSuccess: () => {
      setEmail(getValues("Email"));
      setEmailSent(true);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: ForgetPasswordFormData) => {
    mutate({ email: data.Email });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mobile:w-[300px] tablet:w-[400px] w-[90%]">
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your email address to receive an One Time Passcode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">Email</Label>
            <Input id="email" placeholder="user@email.com" type="email" {...register("Email")} />
            <FormFieldError error={errors.Email?.message} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" loading={isLoading}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
