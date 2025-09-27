import { useMemo, useState } from "react";

export const usePopover = () => {
	const [triggerHover, setTriggerHover] = useState(false);
	const [contentHover, setContentHover] = useState(false);

	const isOpen = useMemo(() => triggerHover || contentHover, [triggerHover, contentHover]);

	const onTriggerEnter = () => {
		setTriggerHover(true);
	};

	const onTriggerLeave = () => {
		setTriggerHover(false);
	};

	const onContentEnter = () => {
		setContentHover(true);
	};

	const onContentLeave = () => {
		setContentHover(false);
	};

	return { isOpen, onTriggerEnter, onTriggerLeave, onContentEnter, onContentLeave };
};
