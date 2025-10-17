import { HandHeart } from "lucide-react";
import { Box, Stack } from "styled-system/jsx";

export const MobileNotice: React.FC = () => {
	return (
		<Box
			position="fixed"
			top="0"
			left="0"
			right="0"
			bottom="0"
			style={{
				background:
					"linear-gradient(135deg, #f1f7ff 0%, #e8f2ff 50%, #ddeeff 100%)",
			}}
			display={{
				base: "flex", // スマホサイズで表示
				md: "none", // md以上で非表示
			}}
			alignItems="center"
			justifyContent="center"
			zIndex="50"
			px="6"
		>
			<Stack
				direction="column"
				alignItems="center"
				gap="6"
				textAlign="center"
				maxW="sm"
			>
				{/* かわいいアイコン */}
				<Box
					style={{
						animation: "bounce 2s infinite ease-in-out",
						animationDelay: "0.5s",
					}}
				>
					<HandHeart
						size={80}
						color="#4A90E2"
						style={{
							filter: "drop-shadow(0 4px 8px rgba(74, 144, 226, 0.3))",
						}}
					/>
				</Box>

				{/* メインメッセージ */}
				<Stack direction="column" gap="3">
					<Box
						fontSize="xl"
						fontWeight="bold"
						color="#2C5282"
						style={{
							textShadow: "0 2px 4px rgba(44, 82, 130, 0.2)",
						}}
					>
						スマホ対応準備中です
					</Box>

					<Box fontSize="md" color="#4A5568" fontWeight="medium">
						もう少しお待ちください 🙇‍♂️
					</Box>
				</Stack>

				{/* かわいい装飾 */}
				<Stack direction="row" gap="2" alignItems="center">
					<Box fontSize="lg">✨</Box>
					<Box fontSize="sm" color="#5A67D8" fontWeight="medium">
						PC・タブレットでお楽しみください
					</Box>
					<Box fontSize="lg">✨</Box>
				</Stack>
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
							transform: scale(1.1);
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
};
