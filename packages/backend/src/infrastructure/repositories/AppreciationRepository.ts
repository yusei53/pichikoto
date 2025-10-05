import { eq } from "drizzle-orm";
import { db } from "../../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema
} from "../../../database/schema";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../domain/appreciation/Appreciation";
import { UserID } from "../../domain/user/User";
import { CreatedAt } from "../../utils/CreatedAt";
import { UUID } from "../../utils/UUID";

export interface AppreciationRepositoryInterface {
  store(appreciation: Appreciation): Promise<void>;
  findBy(appreciationId: AppreciationID): Promise<Appreciation | null>;
  delete(appreciationId: AppreciationID): Promise<void>;
}

export class AppreciationRepository implements AppreciationRepositoryInterface {
  async store(appreciation: Appreciation): Promise<void> {
    // 事前に既存レコードをチェック
    const existingAppreciation = await db().query.appreciations.findFirst({
      where: eq(appreciationsSchema.id, appreciation.appreciationID.value.value)
    });

    // appreciationsテーブルにUPSERT
    await db()
      .insert(appreciationsSchema)
      .values({
        id: appreciation.appreciationID.value.value,
        senderId: appreciation.senderID.value.value,
        message: appreciation.message.value,
        pointPerReceiver: appreciation.pointPerReceiver.value,
        createdAt: new Date(appreciation.createdAt.value)
      })
      .onConflictDoUpdate({
        target: appreciationsSchema.id,
        set: {
          message: appreciation.message.value
        }
      });

    // 新規作成の場合のみ受信者レコードを挿入
    if (!existingAppreciation) {
      const receiverValues = appreciation.receiverIDs.value.map(
        (receiverId) => ({
          id: UUID.new().value,
          appreciationId: appreciation.appreciationID.value.value,
          receiverId: receiverId.value.value,
          createdAt: new Date(appreciation.createdAt.value)
        })
      );

      await db().insert(appreciationReceiversSchema).values(receiverValues);
    }
  }

  async findBy(appreciationId: AppreciationID): Promise<Appreciation | null> {
    const appreciationRecord = await this.findAppreciationByID(appreciationId);
    if (!appreciationRecord) return null;

    const receiverRecords =
      await this.findReceiversByAppreciationID(appreciationId);

    return this.toAppreciation(appreciationRecord, receiverRecords);
  }

  async delete(appreciationId: AppreciationID): Promise<void> {
    await db()
      .delete(appreciationsSchema)
      .where(eq(appreciationsSchema.id, appreciationId.value.value));
  }

  private async findAppreciationByID(
    appreciationId: AppreciationID
  ): Promise<AppreciationRecord | null> {
    const appreciation = await db().query.appreciations.findFirst({
      where: eq(appreciationsSchema.id, appreciationId.value.value)
    });

    if (!appreciation) return null;

    return {
      id: appreciation.id,
      senderId: appreciation.senderId,
      message: appreciation.message,
      pointPerReceiver: appreciation.pointPerReceiver,
      createdAt: appreciation.createdAt
    };
  }

  private async findReceiversByAppreciationID(
    appreciationId: AppreciationID
  ): Promise<ReceiverRecord[]> {
    const receivers = await db().query.appreciationReceivers.findMany({
      where: eq(
        appreciationReceiversSchema.appreciationId,
        appreciationId.value.value
      )
    });

    return receivers.map((receiver) => ({
      id: receiver.id,
      appreciationId: receiver.appreciationId,
      receiverId: receiver.receiverId,
      createdAt: receiver.createdAt
    }));
  }

  private toAppreciation(
    appreciationRecord: AppreciationRecord,
    receiverRecords: ReceiverRecord[]
  ): Appreciation {
    const receiverIDs = ReceiverIDs.from(
      receiverRecords.map((receiver) => UserID.from(receiver.receiverId))
    );

    return Appreciation.reconstruct(
      AppreciationID.from(appreciationRecord.id),
      UserID.from(appreciationRecord.senderId),
      receiverIDs,
      AppreciationMessage.from(appreciationRecord.message),
      PointPerReceiver.from(appreciationRecord.pointPerReceiver),
      CreatedAt.from(appreciationRecord.createdAt)
    );
  }
}

type AppreciationRecord = {
  id: string;
  senderId: string;
  message: string;
  pointPerReceiver: number;
  createdAt: Date;
};

type ReceiverRecord = {
  id: string;
  appreciationId: string;
  receiverId: string;
  createdAt: Date;
};
