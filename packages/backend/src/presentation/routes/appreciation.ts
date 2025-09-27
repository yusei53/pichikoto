import type { Context } from "hono";
import { Hono } from "hono";
import type { Env } from "../../index";
import { DbClient } from "../../../database/client";
import { CreateAppreciationUseCase } from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import { WeeklyPointLimitDomainService } from "../../domain/appreciation/WeeklyPointLimitDomainService";
import { AppreciationRepository } from "../../infrastructure/repositories/AppreciationRepository";
import { ConsumedPointLogRepository } from "../../infrastructure/repositories/ConsumedPointLogRepository";
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

  return new AppreciationController(createAppreciationUseCase);
};

export const appreciation = new Hono<{ Bindings: Env }>();

appreciation.post("/", async (c: Context) => {
  const controller = appreciationControllerFactory(c);
  return controller.createAppreciation(c);
});