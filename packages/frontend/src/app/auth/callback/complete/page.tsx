import ClientAuthCallbackCompletePage from "./page.client";

const AuthCallbackCompletePage = async ({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) => {
  const params = await searchParams;
  return <ClientAuthCallbackCompletePage error={params.error} />;
};

export default AuthCallbackCompletePage;
