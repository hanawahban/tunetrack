import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Disc3 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch, Match } from "@/lib/control-flow"

const authFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "At least 8 characters."),
})

type AuthFormValues = z.infer<typeof authFormSchema>

export function AuthPage() {
  const { login, register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = React.useState<"login" | "register">("login")

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: AuthFormValues) {
    try {
      if (mode === "login") {
        await login(values.email, values.password)
        toast.success("Welcome back to the shop.")
      } else {
        await register(values.email, values.password)
        toast.success("Membership card punched. You're in.")
      }
      navigate("/")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong.")
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.35 0.08 40 / 0.6), transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Disc3 className="size-9 text-shop-amber" strokeWidth={1.3} />
          <h1 className="font-heading text-2xl font-semibold text-shop-paper">TuneTrack</h1>
          <p className="text-catalog text-xs text-shop-brass">the crate-digger's shop</p>
        </div>

        <div className="rounded-md border border-shop-brass/30 bg-card p-6 shadow-2xl">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")}>
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Join up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <p className="mb-4 text-sm text-muted-foreground">
                Show your card at the counter.
              </p>
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <p className="mb-4 text-sm text-muted-foreground">
                Get a membership card for the shop.
              </p>
            </TabsContent>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@yourlabel.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete={mode === "login" ? "current-password" : "new-password"}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="oxblood" className="w-full" disabled={isLoading}>
                  <Switch>
                    <Match when={isLoading}>One moment…</Match>
                    <Match when={mode === "login"}>Step inside</Match>
                    <Match when={true}>Punch my card</Match>
                  </Switch>
                </Button>
              </form>
            </Form>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
