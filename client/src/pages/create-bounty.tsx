import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBountySchema } from "@shared/schema";
import type { InsertBounty } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAccount } from 'wagmi';
import { useProfile } from '@farcaster/auth-kit';

export default function CreateBounty() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { isAuthenticated: isFarcasterAuthenticated, profile: farcasterProfile } = useProfile();

  const form = useForm<InsertBounty>({
    resolver: zodResolver(insertBountySchema),
    defaultValues: {
      title: "",
      description: "",
      usdcAmount: "",
      discordHandle: "",
      farcasterHandle: farcasterProfile?.username ? `@${farcasterProfile.username}` : "",
      deadline: undefined,
    },
  });

  const createBounty = useMutation({
    mutationFn: async (data: InsertBounty) => {
      // Format the data before sending to server
      const formattedData = {
        ...data,
        usdcAmount: data.usdcAmount.toString(),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        creatorAddress: address,
      };
      const res = await apiRequest("POST", "/api/bounties", formattedData);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate bounties query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });

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

  // Allow either wallet or Farcaster authentication
  if (!address && !isFarcasterAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please connect your wallet or sign in with Farcaster to create a bounty.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                name={farcasterProfile?.username ? "farcasterHandle" : "discordHandle"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord / Farcaster Handle</FormLabel>
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
                        type="date"
                        {...field}
                        value={value || ''}
                        min={new Date().toISOString().split('T')[0]}
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