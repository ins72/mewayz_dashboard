import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import authService from '../../../utils/authService';

const SocialAuthButtons = () => {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState(null);

  const handleSocialAuth = async (provider) => {
    setLoadingProvider(provider);
    setError(null);

    try {
      let result;
      if (provider === 'google') {
        result = await authService.signInWithGoogle();
      } else if (provider === 'apple') {
        result = await authService.signInWithApple();
      }

      if (!result?.success) {
        setError(result?.error || `Failed to sign in with ${provider}`);
      }
      // Success will be handled by auth state change
    } catch (error) {
      console.log(`${provider} auth error:`, error);
      setError(`Something went wrong with ${provider} authentication`);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialAuth('google')}
          disabled={loadingProvider !== null}
          loading={loadingProvider === 'google'}
          className="h-11"
        >
          {loadingProvider === 'google' ? (
            'Connecting...'
          ) : (
            <>
              <Icon name="Chrome" size={18} className="mr-2" />
              Google
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialAuth('apple')}
          disabled={loadingProvider !== null}
          loading={loadingProvider === 'apple'}
          className="h-11"
        >
          {loadingProvider === 'apple' ? (
            'Connecting...'
          ) : (
            <>
              <Icon name="Apple" size={18} className="mr-2" />
              Apple
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Social authentication requires proper OAuth configuration in your Supabase project
        </p>
      </div>
    </div>
  );
};

export default SocialAuthButtons;