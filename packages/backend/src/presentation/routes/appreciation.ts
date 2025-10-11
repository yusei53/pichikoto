import type { Context } from "hono";
import { Hono } from "hono";
import { DbClient } from "../../../database/client";
import { CreateAppreciationUseCase } from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import { UpdateAppreciationMessageUseCase } from "../../application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import { WeeklyPointLimitDomainService } from "../../domain/appreciation/WeeklyPointLimitDomainService";
import type { Env } from "../../index";
import { AppreciationRepository } from "../../infrastructure/repositories/AppreciationRepository";
import { ConsumedPointLogRepository } from "../../infrastructure/repositories/ConsumedPointLogRepository";
import { AppreciationsQueryService } from "../../query-service/AppreciationsQueryService";
import { AppreciationController } from "../controllers/appreciation";

const appreciationControllerFactory = (c: Context) => {
  const dbClient = new DbClient();
  dbClient.init(c);

  const appreciationRepository = new AppreciationRepository();
  const consumedPointLogRepository = new ConsumedPointLogRepository();
  const weeklyPointLimitDomainService = new WeeklyPointLimitDomainService(
    consumedPointLogRepository
  );

  const createAppreciationUseCase = new CreateAppreciationUseCase(
    appreciationRepository,
    consumedPointLogRepository,
    weeklyPointLimitDomainService
  );

  const updateAppreciationMessageUseCase = new UpdateAppreciationMessageUseCase(
    appreciationRepository
  );

  const appreciationsQueryService = new AppreciationsQueryService();

  return new AppreciationController(
    createAppreciationUseCase,
    updateAppreciationMessageUseCase,
    appreciationsQueryService
  );
};

export const appreciation = new Hono<{ Bindings: Env }>();

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
