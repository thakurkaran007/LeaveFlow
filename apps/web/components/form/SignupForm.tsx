"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/src/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@repo/ui/src/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/src/components/select";
import { useCallback, useState } from "react";
import signup from "@/actions/authentications/signup";
import { SignUpSchema } from "@/schema";
import { Button } from "@repo/ui/src/components/button";
import { CardWrapper } from "./CardWrapper";
import { FormError, FormSuccess } from "./form-condition";
import { send } from "@/actions/authentications/send-otp";
import { verifyOtp } from "@/actions/authentications/verify-otp";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, BookOpen } from "lucide-react";

function useMessage(timeout = 3000) {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const showError = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), timeout);
  }, [timeout]);

  const showSuccess = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), timeout);
  }, [timeout]);

  return { error, success, showError, showSuccess, setError, setSuccess };
}

export const SignupForm = () => {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [came, setCame] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const { error, success, showError, showSuccess } = useMessage();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      otp: "",
      name: "",
      email: "",
      password1: "",
      password2: "",
      role: "STUDENT",
    },
  });

  const handleOtp = async () => {
    setIsSending(true);
    try {
      const mail = form.getValues("email");
      if (!mail) {
        showError("Email is required");
        return;
      }
      const res = await send(mail, token);
      if (res.error) {
        showError(res.error.toString());
        return;
      }
      showSuccess(res.success || "OTP sent successfully");
      setCame(true);
    } catch {
      showError("Failed to send OTP");
    } finally {
      setIsSending(false);
    }
  };

  const verify = async () => {
    setIsVerifying(true);
    try {
      const email = form.getValues("email");
      const otpValue = form.getValues("otp");
      const res = await verifyOtp(otpValue, email);
      if (res.success) {
        setVerified(true);
      } else {
        showError(res.error || "OTP verification failed");
      }
    } catch {
      showError("Error verifying OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const submit = async (values: z.infer<typeof SignUpSchema>) => {
    setIsSigningUp(true);
    try {
      const response = await signup(values);
      if (response.error) {
        showError(response.error);
        return;
      }
      showSuccess(response.success || "Account created successfully");
      router.push("/auth/login");
    } catch {
      showError("An error occurred");
    } finally {
      setIsSigningUp(false);
    }
  };

  const selectedRole = form.watch("role");

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Back to login?"
      backButtonhref="/auth/login"
      showSocial={true}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
          <div className="space-y-5">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="abc@gmail.com"
                      className="h-11 rounded-lg"
                      disabled={came || verified || isSending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OTP */}
            {came && !verified && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Enter OTP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="******"
                        className="tracking-widest text-center h-11 rounded-lg"
                        disabled={isVerifying}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Name, Role, Subject & Password */}
            {verified && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Your full name" 
                          type="text" 
                          className="h-11 rounded-lg" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">I am a</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STUDENT">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-blue-600" />
                              <span>Student</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="TEACHER">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-green-600" />
                              <span>Teacher</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="HOD">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-600" />
                              <span>HOD (Head of Department)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* Password Fields */}
                <FormField
                  control={form.control}
                  name="password1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Create a strong password" 
                          type="password" 
                          className="h-11 rounded-lg" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Re-enter your password" 
                          type="password" 
                          className="h-11 rounded-lg" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!came && !verified && (
              <Button 
                type="button" 
                onClick={handleOtp} 
                disabled={isSending} 
                className="flex-1 h-11"
              >
                {isSending ? "Sending..." : "Send OTP"}
              </Button>
            )}
            {came && !verified && (
              <Button 
                type="button" 
                onClick={verify} 
                disabled={isVerifying} 
                className="flex-1 h-11"
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>
            )}
            {verified && (
              <Button 
                type="submit" 
                disabled={isSigningUp} 
                className="flex-1 h-11"
              >
                {isSigningUp ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>

          {/* Messages */}
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}
        </form>
      </Form>
    </CardWrapper>
  );
};