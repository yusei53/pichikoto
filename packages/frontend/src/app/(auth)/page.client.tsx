"use client";

import { Gift, SendHorizontal } from "lucide-react";
import { Stack } from "styled-system/jsx";
import { AppToaster } from "~/components/shared/AppToaster/AppToaster";
import { Icon } from "~/components/ui/icon";
import { AppreciationCard } from "~/features/common/AppreciationCard/AppreciationCard";
import { AppreciationForm } from "~/features/common/AppreciationForm/AppreciationForm";
import { UserProfile } from "~/features/common/UserProfile/UserProfile";
import { TopRanking } from "~/features/routes/top-page/TopRanking/TopRanking";
import type { Appreciation } from "~/model/appreciation";
import type { PointLeaderUser } from "~/model/point-leader";
import type { User, UserInfo } from "~/model/user";

type ClientTopPageProps = {
	userInfo: UserInfo;
	allUsers: User[];
	appreciationList: Appreciation[];
	receivedPointRanking: PointLeaderUser[];
	sendPointRanking: PointLeaderUser[];
	isNotificationEnabled: boolean;
};

export const ClientTopPage: React.FC<ClientTopPageProps> = ({
	userInfo,
	appreciationList,
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
						userID={userInfo.discordUserID}
						userName={userInfo.discordUserName}
						avatarUrl={userInfo.discordAvatar}
						isNotificationEnabled={isNotificationEnabled}
					/>
					<AppreciationForm
						users={allUsers}
						remainingPoints={userInfo.remainingPoints}
					/>
				</Stack>
				<Stack
					direction={"column"}
					width={"100%"}
					height={"calc(100vh - 40px)"}
					overflowY={"auto"}
				>
					<Stack direction={"row"} gap={"16px"}>
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
					{/* </AppreciationListHeader> */}
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
