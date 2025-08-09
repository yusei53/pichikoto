import ClientAuthCallbackDiscordPage from "./page.client";

const AuthCallbackDiscordPage = async ({
  searchParams
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) => {
  const params = await searchParams;

  return (
    <ClientAuthCallbackDiscordPage code={params.code} error={params.error} />
  );
};

export default AuthCallbackDiscordPage;
