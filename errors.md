Unhandled Runtime Error
AxiosError: Request failed with status code 400

Source
lib\api\client.ts (362:24) @ async Object.reExtract

  360 |
  361 |     reExtract: async () => {
> 362 |       const response = await instance.post<ApiResponse<unknown>>('/profile/re-extract');
      |                        ^
  363 |       return response.data;
  364 |     },
  365 |   },

  prisma:query SELECT 1
prisma:query SELECT "public"."Simulation"."id", "public"."Simulation"."createdAt", "public"."Simulation"."updatedAt", "public"."Simulation"."completedAt", "public"."Simulation"."validatedAt", "public"."Simulation"."tenantId", "public"."Simulation"."scenarioType", "public"."Simulation"."duration", "public"."Simulation"."status"::text, "public"."Simulation"."aiPersona", "public"."Simulation"."personaDetails", "public"."Simulation"."demonstratedPatterns", "public"."Simulation"."liveScore", "public"."Simulation"."ownerReviewedAt", "public"."Simulation"."ownerApprovalStatus"::text, "public"."Simulation"."extractedPatterns", "public"."Simulation"."qualityScore" FROM "public"."Simulation" WHERE ("public"."Simulation"."tenantId" = $1 AND "public"."Simulation"."status" = CAST($2::text AS "public"."SimulationStatus")) ORDER BY "public"."Simulation"."createdAt" ASC OFFSET $3
 POST /api/v1/profile/re-extract 400 in 23ms