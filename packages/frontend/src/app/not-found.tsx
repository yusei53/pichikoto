import { Home, SearchX } from "lucide-react";
import Link from "next/link";
import { Box, Stack } from "styled-system/jsx";

export default function NotFound() {
	return (
		<Box
			minH="100vh"
			bg="white"
			display="flex"
			alignItems="center"
			justifyContent="center"
			px="6"
		>
			<Stack
				direction="column"
				alignItems="center"
				gap="6"
				textAlign="center"
				maxW="md"
			>
				{/* 404アイコン */}
				<Box
					style={{
						animation: "bounce 2s infinite ease-in-out",
						animationDelay: "0.3s",
					}}
				>
					<SearchX
						size={100}
						color="#7BB3F0"
						style={{
							filter: "drop-shadow(0 4px 8px rgba(123, 179, 240, 0.2))",
						}}
					/>
				</Box>

				{/* 404メッセージ */}
				<Stack direction="column" gap="3" alignItems="center">
					<Box
						fontSize="xl"
						fontWeight="bold"
						color="#5A7FB8"
						style={{
							textShadow: "0 2px 4px rgba(90, 127, 184, 0.15)",
						}}
					>
						404 - ページが見つかりません
					</Box>

					<Box fontSize="md" color="#6B7280" fontWeight="medium">
						お探しのページは存在しないか、移動した可能性があります
					</Box>
				</Stack>

				{/* ホームボタン */}
				<Link href="/">
					<Box
						as="button"
						bg="#7BB3F0"
						color="white"
						px="6"
						py="3"
						borderRadius="lg"
						fontWeight="medium"
						fontSize="md"
						cursor="pointer"
						transition="all 0.2s"
						style={{
							boxShadow: "0 4px 12px rgba(123, 179, 240, 0.3)",
							animation: "pulse 2s infinite ease-in-out",
							animationDelay: "1s",
						}}
						_hover={{
							bg: "#5A7FB8",
							transform: "translateY(-2px)",
							boxShadow: "0 6px 16px rgba(123, 179, 240, 0.4)",
						}}
					>
						<Stack direction="row" alignItems="center" gap="2">
							<Home size={20} />
							<Box>ホームに戻る</Box>
						</Stack>
					</Box>
				</Link>
			</Stack>

			{/* CSSアニメーション定義 */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
					@keyframes bounce {
						0%, 20%, 53%, 80%, 100% {
							transform: translateY(0);
						}
						40%, 43% {
							transform: translateY(-15px);
						}
						70% {
							transform: translateY(-7px);
						}
						90% {
							transform: translateY(-3px);
						}
					}

					@keyframes pulse {
						0% {
							transform: scale(1);
						}
						50% {
							transform: scale(1.05);
						}
						100% {
							transform: scale(1);
						}
					}
				`,
				}}
			/>
		</Box>
	);
}
