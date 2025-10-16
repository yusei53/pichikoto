import { SendHorizontal, UserIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Icon } from "~/components/ui/icon";

const profileOptions = ["create", "profile"] as const;
type ToggleProfileOption = (typeof profileOptions)[number];

export const useToggleProfile = () => {
	const [selectedOption, setSelectedOption] =
		useState<ToggleProfileOption>("create");
	const options = useMemo(
		() => [
			{
				label: "Hugnoteを作成する",
				icon: (
					<Icon color={"blush"}>
						<SendHorizontal />
					</Icon>
				),
				id: "create",
			},
			{
				label: "プロフィールを表示",
				icon: (
					<Icon color={"sage"}>
						<UserIcon />
					</Icon>
				),
				id: "profile",
			},
		],
		[]
	);

	const isSelectedOption = useCallback(
		(id: string): id is ToggleProfileOption => {
			return profileOptions.some((option) => option === id);
		},
		[]
	);

	const onSelectOption = useCallback(
		(id: string) => {
			if (isSelectedOption(id)) {
				setSelectedOption(id);
			}
			return;
		},
		[setSelectedOption, isSelectedOption]
	);

	return {
		options,
		selectedOption,
		onSelectOption,
	};
};
