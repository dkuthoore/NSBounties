import "@farcaster/auth-kit/styles.css";
import { SignInButton, useProfile } from "@farcaster/auth-kit";

export function FarcasterConnect() {
  const { isAuthenticated, profile } = useProfile();

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <div className="text-sm text-muted-foreground">@{profile.username}</div>
      ) : (
        <div className="[&>button]:px-2 [&>button]:py-1 [&>button]:h-3 [&>button]:min-w-[120px]">
          <SignInButton />
        </div>
      )}
    </div>
  );
}
