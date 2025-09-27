import { UserPageClient } from "./page.client";

export default async function Page({}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	console.log("user-page");
	return <UserPageClient />;
}
