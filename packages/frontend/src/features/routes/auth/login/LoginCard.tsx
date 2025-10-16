import { HandHeart, LogIn } from "lucide-react";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

type LoginCardProps = {
	onLogin: () => void;
};

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
	return (
		<Card.Root pt={"32px"} width={"md"}>
			<Card.Body>
				<Stack direction="column" gap="16px" alignItems="center">
					<Box fontSize={"lg"}>ログインして日々の感謝を伝えましょう</Box>
					<Box>
						<HandHeart size={100} />
					</Box>
					<Box fontSize={"xx-large"}>Hugnote</Box>
					<Divider />
					<Box p={"32px"}>
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
