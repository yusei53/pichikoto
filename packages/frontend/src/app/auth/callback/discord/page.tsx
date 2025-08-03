import ClientAuthCallbackDiscordPage from "./page.client";

const AuthCallbackDiscordPage = ({
  searchParams
}: {
  searchParams: { code?: string; error?: string };
}) => {
  return (
    <ClientAuthCallbackDiscordPage
      code={searchParams.code}
      error={searchParams.error}
    />
  );
};

export default AuthCallbackDiscordPage;
