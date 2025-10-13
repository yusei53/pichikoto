import { Gift, SendHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Icon } from "~/components/ui/icon";

const appreciationOptions = ["send", "receive"] as const;
type ToggleAppreciationOption = (typeof appreciationOptions)[number];

export const useToggleAppreciation = () => {
	const [selectedOption, setSelectedOption] =
		useState<ToggleAppreciationOption>("send");
	const options = useMemo(
		() => [
			{
				label: "送ったmomopos",
				icon: (
					<Icon color={"blush"}>
						<SendHorizontal />
					</Icon>
				),
				id: "send",
			},
			{
				label: "もらったmomopos",
				icon: (
					<Icon color={"sage"}>
						<Gift />
					</Icon>
				),
				id: "receive",
			},
		],
		[]
	);

	const isSelectedOption = useCallback(
		(id: string): id is ToggleAppreciationOption => {
			return appreciationOptions.some((option) => option === id);
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
