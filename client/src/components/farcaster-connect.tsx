import '@farcaster/auth-kit/styles.css';
import { SignInButton, useProfile } from '@farcaster/auth-kit';

export function FarcasterConnect() {
  const { isAuthenticated, profile } = useProfile();

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <div className="text-sm text-muted-foreground">
          @{profile.username}
        </div>
      ) : (
        <div className="[&>button]:px-4 [&>button]:py-2 [&>button]:h-10 [&>button]:min-w-[140px]">
          <SignInButton />
        </div>
      )}
    </div>
  );
}