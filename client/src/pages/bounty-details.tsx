import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, ExternalLink, ArrowLeft, Edit2 } from "lucide-react";
import { SiDiscord, SiFarcaster } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import type { Bounty, InsertBounty } from "@shared/schema";
import { useAccount } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { connectWallet, transferUSDC } from "@/lib/web3";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBountySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatTextWithLinks } from "@/lib/utils";
import { useProfile } from '@farcaster/auth-kit';

export default function BountyDetails({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { isAuthenticated: isFarcasterAuthenticated, profile: farcasterProfile } = useProfile();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: bounty, isLoading } = useQuery<Bounty>({
    queryKey: [`/api/bounties/${params.id}`],
  });

  const form = useForm<InsertBounty>({
    resolver: zodResolver(insertBountySchema),
    defaultValues: {
      title: "",
      description: "",
      usdcAmount: "",
      discordHandle: "",
      farcasterHandle: "",
      deadline: undefined,
    },
  });

  // Update form values when bounty data is loaded
  useEffect(() => {
    if (bounty) {
      form.reset({
        title: bounty.title,
        description: bounty.description,
        usdcAmount: bounty.usdcAmount.toString(),
        discordHandle: bounty.discordHandle || "",
        farcasterHandle: bounty.farcasterHandle || "",
        deadline: bounty.deadline ? new Date(bounty.deadline).toISOString().split('T')[0] : undefined,
      });
    }
  }, [bounty, form]);

  // Check if the current user is the creator of the bounty
  const isCreator = address === bounty?.creatorAddress ||
    (isFarcasterAuthenticated &&
      farcasterProfile?.username &&
      bounty?.farcasterHandle === `@${farcasterProfile.username}`);

  const updateBounty = useMutation({
    mutationFn: async (data: Partial<InsertBounty>) => {
      const res = await apiRequest("PATCH", `/api/bounties/${params.id}`, {
        ...data,
        creatorAddress: address,
        farcasterHandle: farcasterProfile?.username ? `@${farcasterProfile.username}` : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bounties/${params.id}`] });
      toast({ title: "Bounty updated successfully" });
      setIsEditing(false);
    },
    onError: (err) => {
      toast({
        title: "Error updating bounty",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const deleteBounty = useMutation({
    mutationFn: async () => {
      const authData = {
        creatorAddress: address,
        farcasterHandle: farcasterProfile?.username ? `@${farcasterProfile.username}` : undefined,
      };
      await apiRequest("DELETE", `/api/bounties/${params.id}`, authData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });
      toast({ title: "Bounty deleted successfully" });
      setLocation("/");
    },
    onError: (err) => {
      toast({
        title: "Error deleting bounty",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const closeBounty = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/bounties/${params.id}/status`, {
        status: "closed",
        recipientAddress,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bounties/${params.id}`] });
      toast({ title: "Bounty marked as closed" });
    },
    onError: (err) => {
      toast({
        title: "Error closing bounty",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handlePayment = async () => {
    try {
      const { signer } = await connectWallet();
      await transferUSDC(signer, recipientAddress, bounty!.usdcAmount.toString());
      await closeBounty.mutateAsync();
      toast({ title: "Payment successful" });
      setLocation("/");
    } catch (err) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openDiscordDM = () => {
    if (!bounty?.discordHandle) return;

    // Copy to clipboard
    navigator.clipboard.writeText(bounty.discordHandle);

    // Show toast
    toast({
      description: `Copied ${bounty.discordHandle} to clipboard`,
    });

    // Open Discord
    window.open(`discord://discord.com/users/${encodeURIComponent(bounty.discordHandle)}`, '_blank');
  };

  if (isLoading || !bounty) {
    return (
      <div className="container mx-auto py-8">
        <Card className="animate-pulse">
          <CardContent className="h-64" />
        </Card>
      </div>
    );
  }

  if (bounty.status === "closed") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bounty Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This bounty has been marked as complete.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing && isCreator) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Edit Bounty</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateBounty.mutate(data))} className="space-y-6">
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
                  name="farcasterHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farcaster Handle</FormLabel>
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

                <Button type="submit" className="w-full" disabled={updateBounty.isPending}>
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bounties
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{bounty?.title}</CardTitle>
            <div className="flex items-center gap-2">
              {isCreator && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {bounty?.farcasterHandle && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  <SiFarcaster className="h-3 w-3 mr-1" />
                  Farcaster
                </Badge>
              )}
              <Badge variant={bounty?.status === "open" ? "default" : "secondary"}>
                {bounty?.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {formatTextWithLinks(bounty.description)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Reward</h3>
            <p className="text-2xl font-bold">${Number(bounty.usdcAmount).toFixed(2)} USDC</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            {bounty.discordHandle ? (
              <Button
                variant="outline"
                onClick={openDiscordDM}
                className="flex items-center gap-2"
              >
                <SiDiscord className="h-4 w-4" />
                {bounty.discordHandle}
                <ExternalLink className="h-4 w-4" />
              </Button>
            ) : bounty.farcasterHandle ? (
              <Button
                variant="outline"
                onClick={() => window.open(`https://warpcast.com/${bounty.farcasterHandle.replace('@', '')}`, '_blank')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <SiFarcaster className="h-4 w-4" />
                {bounty.farcasterHandle}
                <ExternalLink className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDistanceToNow(new Date(bounty.createdAt))} ago</span>
            </div>

            {bounty.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Due {new Date(bounty.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {isCreator && bounty?.status === "open" && (
            <div className="flex flex-col gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <Input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handlePayment}
                  disabled={!recipientAddress || closeBounty.isPending}
                >
                  Complete & Pay
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this bounty?")) {
                      deleteBounty.mutate();
                    }
                  }}
                  disabled={deleteBounty.isPending}
                >
                  Delete Bounty
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}