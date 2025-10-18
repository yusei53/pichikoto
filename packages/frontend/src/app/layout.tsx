import type { Metadata } from "next";
import { Box } from "styled-system/jsx";
import { MobileNotice } from "~/components/shared/MobileNotice/MobileNotice";
import "./globals.css";

export const metadata: Metadata = {
	title: "hugnote",
	description: "PeachTechのための感謝の気持ちを伝えるプラットフォーム",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta name="apple-mobile-web-app-title" content="hagnote" />
			</head>
			<body style={{ margin: 0 }}>
				<MobileNotice />
				<Box
					display={{
						base: "none", // スマホサイズで非表示
						md: "block", // md以上で表示
					}}
				>
					{children}
				</Box>
			</body>
		</html>
	);
}
