import type { User } from "~/model/user";

const useDisplayReceivedUsers = (receivedUsers: User[]) => {
	const displayReceivedUsers = receivedUsers.slice(0, 3);
	const hiddenReceivedUsersCount = Math.max(receivedUsers.length - 3, 0);

	return { displayReceivedUsers, hiddenReceivedUsersCount };
};

export default useDisplayReceivedUsers;
