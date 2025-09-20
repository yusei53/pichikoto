import ClientAuthCallbackDiscordPage from "./page.client";

const AuthCallbackDiscordPage = async ({
  searchParams
}: {
  searchParams: Promise<{
    error?: string;
    code?: string;
    state?: string;
  }>;
}) => {
  const params = await searchParams;
  return (
    <ClientAuthCallbackDiscordPage
      error={params.error}
      code={params.code}
      state={params.state}
    />
  );
};

export default AuthCallbackDiscordPage;
