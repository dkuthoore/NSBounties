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
        <SignInButton />
      )}
    </div>
  );
}
