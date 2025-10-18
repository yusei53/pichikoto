import type { Context } from "hono";
import { Hono } from "hono";
import { DbClient } from "../../../database/client";
import { DiscordNotificationService } from "../../application/services/discord-notification/DiscordNotificationService";
import { CreateAppreciationUseCase } from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import { UpdateAppreciationMessageUseCase } from "../../application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import { WeeklyPointLimitDomainService } from "../../domain/appreciation/WeeklyPointLimitDomainService";
import type { Env } from "../../index";
import { AppreciationRepository } from "../../infrastructure/repositories/AppreciationRepository";
import { AppreciationsQueryService } from "../../query-service/AppreciationsQueryService";
import { ReceivedAppreciationsQueryService } from "../../query-service/ReceivedAppreciationsQueryService";
import { SentAppreciationsQueryService } from "../../query-service/SentAppreciationsQueryService";
import { AppreciationController } from "../controllers/appreciation";
import { requireAuth } from "../middlewares/require-auth";

const appreciationControllerFactory = (c: Context) => {
  const dbClient = new DbClient();
  dbClient.init(c);

  const appreciationRepository = new AppreciationRepository();
  const discordNotificationService = new DiscordNotificationService();
  const weeklyPointLimitDomainService = new WeeklyPointLimitDomainService(
    appreciationRepository
  );

  const createAppreciationUseCase = new CreateAppreciationUseCase(
    appreciationRepository,
    weeklyPointLimitDomainService,
    discordNotificationService
  );

  const updateAppreciationMessageUseCase = new UpdateAppreciationMessageUseCase(
    appreciationRepository
  );

  const appreciationsQueryService = new AppreciationsQueryService();
  const sentAppreciationsQueryService = new SentAppreciationsQueryService();
  const receivedAppreciationsQueryService =
    new ReceivedAppreciationsQueryService();

  return new AppreciationController(
    createAppreciationUseCase,
    updateAppreciationMessageUseCase,
    appreciationsQueryService,
    sentAppreciationsQueryService,
    receivedAppreciationsQueryService
  );
};

export const appreciation = new Hono<{ Bindings: Env }>();

// 認証が必要なルートにミドルウェアを適用
appreciation.use("/", requireAuth);

appreciation.get("/", async (c: Context) => {
  const controller = appreciationControllerFactory(c);
  return controller.getAllAppreciations(c);
});

appreciation.post("/", async (c: Context) => {
  const controller = appreciationControllerFactory(c);
  return controller.createAppreciation(c);
});

appreciation.put("/:id", async (c: Context) => {
  const controller = appreciationControllerFactory(c);
  return controller.updateAppreciationMessage(c);
});

appreciation.get("/sent/:discordUserId", async (c: Context) => {
  const controller = appreciationControllerFactory(c);
  return controller.getSentAppreciations(c);
});

appreciation.get("/received/:discordUserId", async (c: Context) => {
  const controller = appreciationControllerFactory(c);
  return controller.getReceivedAppreciations(c);
});
