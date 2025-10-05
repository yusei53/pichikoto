"use client";

import { Stack } from "styled-system/jsx";
import { AppTabs } from "~/components/shared/AppTabs/AppTabs";
import { AppToaster } from "~/components/shared/AppToaster/AppToaster";
import { AppreciationCard } from "~/features/common/AppreciationCard/AppreciationCard";
import { AppreciationForm } from "~/features/common/AppreciationForm/AppreciationForm";
import { AppreciationListHeader } from "~/features/common/AppreciationListHeader/AppreciationListHeader";
import { UserProfile } from "~/features/common/UserProfile/UserProfile";
import { AppreciationLog } from "~/features/routes/user-page/AppreciationLog/AppreciationLog";
import { AppreciationStatus } from "~/features/routes/user-page/AppreciationStatus/AppreciationStatus";
import { UserInfo } from "~/features/routes/user-page/UserInfo/UserInfo";
import { useToggleAppreciation } from "~/features/routes/user-page/useToggleAppreciation";
import { useToggleProfile } from "~/features/routes/user-page/useToggleProfile";
import type { Appreciation } from "~/model/appreciation";
import type { User } from "~/model/user";

type UserPageClientProps = {
	user: User;
	isOwnUser: boolean;
	isNotificationEnabled: boolean;
	appreciationList: Appreciation[];
	sendUserList: User[];
	receivedUserList: User[];
	allUsers: User[];
};

export const UserPageClient: React.FC<UserPageClientProps> = ({
	user,
	isNotificationEnabled,
	appreciationList,
	allUsers,
	sendUserList,
	receivedUserList,
}) => {
	const {
		options: profileOptions,
		selectedOption: selectedProfileOption,
		onSelectOption: onSelectProfileOption,
	} = useToggleProfile();
	const {
		options: appreciationOptions,
		selectedOption: selectedAppreciationOption,
		onSelectOption: onSelectAppreciationOption,
	} = useToggleAppreciation();

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
					<AppTabs
						options={profileOptions}
						defaultValue={selectedProfileOption}
						onValueChange={(e) => onSelectProfileOption(e.value)}
					/>
					<Stack direction={"row"} gap={"24px"}>
						<AppreciationStatus title="今月" sendPoint={0} receivedPoint={0} />
						<AppreciationStatus title="累計" sendPoint={0} receivedPoint={0} />
					</Stack>
					{selectedProfileOption === "profile" ? (
						<Stack direction={"row"} gap={"24px"}>
							<UserInfo user={user} />
							<AppreciationLog
								targetUsr={user}
								sendUserList={sendUserList}
								receivedUserList={receivedUserList}
							/>
						</Stack>
					) : (
						<AppreciationForm users={allUsers} remainingPoints={0} />
					)}
				</Stack>
				<Stack
					direction={"column"}
					width={"100%"}
					height={"calc(100vh - 48px)"}
					overflowY={"auto"}
				>
					<AppreciationListHeader onSearchChange={() => { }}>
						<AppTabs
							options={appreciationOptions}
							defaultValue={selectedAppreciationOption}
							onValueChange={(e) => onSelectAppreciationOption(e.value)}
						/>
					</AppreciationListHeader>
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
