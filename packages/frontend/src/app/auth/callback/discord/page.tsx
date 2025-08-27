import ClientAuthCallbackDiscordPage from "./page.client";

const AuthCallbackDiscordPage = async ({
  searchParams
}: {
  searchParams: Promise<{ code?: string; state?: string; error?: string }>;
}) => {
  const params = await searchParams;
  return (
    <ClientAuthCallbackDiscordPage code={params.code} state={params.state} error={params.error} />
  );
};

export default AuthCallbackDiscordPage;
