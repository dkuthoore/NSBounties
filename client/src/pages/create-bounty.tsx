import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBountySchema } from "@shared/schema";
import type { InsertBounty } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function CreateBounty() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertBounty>({
    resolver: zodResolver(insertBountySchema),
    defaultValues: {
      title: "",
      description: "",
      usdcAmount: "",
      discordHandle: "",
      deadline: undefined,
    },
  });

  const createBounty = useMutation({
    mutationFn: async (data: InsertBounty) => {
      // Format the data before sending to server
      const formattedData = {
        ...data,
        usdcAmount: data.usdcAmount.toString(),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined
      };
      const res = await apiRequest("POST", "/api/bounties", formattedData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bounty Created",
        description: `Save this management URL: ${window.location.origin}/manage/${data.managementUrl}`,
      });
      setLocation("/");
    },
    onError: (err) => {
      toast({
        title: "Error creating bounty",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Bounty</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createBounty.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usdcAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>USDC Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discordHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord Handle</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={value || ''}
                        onChange={e => onChange(e.target.value || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={createBounty.isPending}>
                Create Bounty
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}