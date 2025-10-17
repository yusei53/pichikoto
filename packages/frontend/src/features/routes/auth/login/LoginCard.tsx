import { HandHeart, LogIn } from "lucide-react";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

type LoginCardProps = {
	onLogin: () => void;
};

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
	return (
		<Card.Root pt={"48px"} width={"md"}>
			<Card.Body>
				<Stack direction="column" gap="24px" alignItems="center">
					<Box fontSize={"lg"}>ログインして日々の感謝を伝えましょう</Box>
					<Box animation="bounce 3s infinite ease-in-out" pt={"8px"}>
						<HandHeart size={100} />
					</Box>
					<Box
						fontSize={"xx-large"}
						lineHeight={"1"}
						letterSpacing={0.5}
						fontWeight={"bold"}
					>
						Hugnote
					</Box>
					<Divider />
					<Box p={"16px"}>
						<Button variant={"outline"} onClick={onLogin} size={"lg"}>
							<LogIn size={24} />
							Discordでログイン
						</Button>
					</Box>
				</Stack>
			</Card.Body>
		</Card.Root>
	);
};
