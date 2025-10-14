import type { User } from "./user";

export type Appreciation = {
	id: string;
	pointPerReceiver: number;
	message: string;
	createdAt: Date;
	sender: User;
	receivers: User[];
};
