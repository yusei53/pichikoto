"use client";

import { Gift, SendHorizontal } from "lucide-react";
import { Stack } from "styled-system/jsx";
import { AppToaster } from "~/components/shared/AppToaster/AppToaster";
import { Icon } from "~/components/ui/icon";
import { AppreciationCard } from "~/features/common/AppreciationCard/AppreciationCard";
import { AppreciationForm } from "~/features/common/AppreciationForm/AppreciationForm";
import { UserProfile } from "~/features/common/UserProfile/UserProfile";
import { AppreciationListHeader } from "~/features/routes/top-page/AppreciationListHeader/AppreciationListHeader";
import { TopRanking } from "~/features/routes/top-page/TopRanking/TopRanking";
import type { Appreciation } from "~/model/appreciation";
import type { PointRanking } from "~/model/point-ranking";
import type { User } from "~/model/user";

type ClientTopPageProps = {
	user: User;
	remainingPoints: number;
	allUsers: User[];
	appreciationList: Appreciation[];
	receivedPointRanking: PointRanking[];
	sendPointRanking: PointRanking[];
	isNotificationEnabled: boolean;
};

export const ClientTopPage: React.FC<ClientTopPageProps> = ({
	user,
	appreciationList,
	remainingPoints,
	allUsers,
	receivedPointRanking,
	sendPointRanking,
	isNotificationEnabled,
}) => {
	return (
		<>
			<Stack direction={"row"} gap={"16px"} p={"24px"} overflowY={"hidden"}>
				<Stack direction={"column"} gap={"24px"} width={"800px"}>
					<UserProfile
						userID={user.userID}
						userName={user.discordUserName}
						avatarUrl={user.discordAvatar}
						isNotificationEnabled={isNotificationEnabled}
					/>
					<Stack direction={"row"} gap={"24px"}>
						<TopRanking
							titleIcon={
								<Icon color={"blush"}>
									<SendHorizontal />
								</Icon>
							}
							title="今週送ったランキング"
							rankingUsers={sendPointRanking}
						/>
						<TopRanking
							titleIcon={
								<Icon color={"sage"}>
									<Gift />
								</Icon>
							}
							title="今週もらったランキング"
							rankingUsers={receivedPointRanking}
						/>
					</Stack>
					<AppreciationForm
						users={allUsers}
						remainingPoints={remainingPoints}
					/>
				</Stack>
				<Stack
					direction={"column"}
					width={"100%"}
					height={"calc(100vh - 48px)"}
					overflowY={"auto"}
				>
					<AppreciationListHeader onSearchChange={() => {}} />
					<Stack direction={"column"} gap={"16px"}>
						{appreciationList.map((appreciation) => (
							<AppreciationCard
								key={appreciation.id}
								appreciation={appreciation}
							/>
						))}
					</Stack>
				</Stack>
			</Stack>
			<AppToaster />
		</>
	);
};
