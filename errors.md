prisma:query SELECT "public"."Simulation"."id", "public"."Simulation"."createdAt", "public"."Simulation"."updatedAt", "public"."Simulation"."completedAt", "public"."Simulation"."validatedAt", "public"."Simulation"."tenantId", "public"."Simulation"."scenarioType", "public"."Simulation"."duration", "public"."Simulation"."status"::text, "public"."Simulation"."aiPersona", "public"."Simulation"."personaDetails", "public"."Simulation"."demonstratedPatterns", "public"."Simulation"."liveScore", "public"."Simulation"."ownerReviewedAt", "public"."Simulation"."ownerApprovalStatus"::text, "public"."Simulation"."extractedPatterns", "public"."Simulation"."qualityScore" FROM "public"."Simulation" WHERE ("public"."Simulation"."tenantId" = $1 AND "public"."Simulation"."status" = CAST($2::text AS "public"."SimulationStatus")) ORDER BY "public"."Simulation"."createdAt" ASC OFFSET $3
prisma:query SELECT "public"."SimulationMessage"."id", "public"."SimulationMessage"."createdAt", "public"."SimulationMessage"."simulationId", "public"."SimulationMessage"."role"::text, "public"."SimulationMessage"."content", "public"."SimulationMessage"."tokensUsed", "public"."SimulationMessage"."latencyMs" FROM "public"."SimulationMessage" WHERE "public"."SimulationMessage"."simulationId" IN ($1,$2,$3,$4,$5,$6,$7,$8) ORDER BY "public"."SimulationMessage"."createdAt" ASC OFFSET $9
prisma:query SELECT "public"."BusinessProfile"."id", "public"."BusinessProfile"."createdAt", "public"."BusinessProfile"."updatedAt", "public"."BusinessProfile"."tenantId", "public"."BusinessProfile"."industry", "public"."BusinessProfile"."serviceDescription", "public"."BusinessProfile"."targetClientType", "public"."BusinessProfile"."typicalBudgetRange", "public"."BusinessProfile"."commonClientQuestions", "public"."BusinessProfile"."yearsExperience", "public"."BusinessProfile"."serviceOfferings", "public"."BusinessProfile"."specializations", "public"."BusinessProfile"."certifications", "public"."BusinessProfile"."serviceArea", "public"."BusinessProfile"."teamSize", "public"."BusinessProfile"."communicationStyle", "public"."BusinessProfile"."pricingLogic", "public"."BusinessProfile"."qualificationCriteria", "public"."BusinessProfile"."objectionHandling", "public"."BusinessProfile"."decisionMakingPatterns", "public"."BusinessProfile"."ownerVoiceExamples", "public"."BusinessProfile"."closerFramework", "public"."BusinessProfile"."ownerNorms", "public"."BusinessProfile"."ownerValues", "public"."BusinessProfile"."profileApprovalStatus"::text, "public"."BusinessProfile"."approvedAt", "public"."BusinessProfile"."goLiveAt", "public"."BusinessProfile"."completedScenarios", "public"."BusinessProfile"."suggestedNextScenario", "public"."BusinessProfile"."isComplete", "public"."BusinessProfile"."completionScore", "public"."BusinessProfile"."completionPercentage", "public"."BusinessProfile"."lastExtractedAt", "public"."BusinessProfile"."simulationCount" FROM "public"."BusinessProfile" WHERE ("public"."BusinessProfile"."tenantId" = $1 AND 1=1) LIMIT $2 OFFSET $3
[AI USAGE] {
  tenant: '5fe39285-a900-4f17-895d-55bc930c1752',
  type: 'extraction',
  model: 'claude-sonnet-4-6',
  cost: '$0.0297',
  tokensIn: 704,
  tokensOut: 1838,
  tokens: 2542,
  latency: '22463ms',
  meta: {}
}
[AI USAGE] {
  tenant: '5fe39285-a900-4f17-895d-55bc930c1752',
  type: 'extraction',
  model: 'claude-sonnet-4-6',
  cost: '$0.0389',
  tokensIn: 775,
  tokensOut: 2436,
  tokens: 3211,
  latency: '26738ms',
  meta: {}
}
[AI USAGE] {
  tenant: '5fe39285-a900-4f17-895d-55bc930c1752',
  type: 'extraction',
  model: 'claude-sonnet-4-6',
  cost: '$0.0360',
  tokensIn: 729,
  tokensOut: 2254,
  tokens: 2983,
  latency: '27547ms',
  meta: {}
}
AI request timeout after 30000ms
[AI USAGE] {
  tenant: '5fe39285-a900-4f17-895d-55bc930c1752',
  type: 'extraction',
  model: 'claude-sonnet-4-6',
  cost: '$0.0000',
  tokensIn: 0,
  tokensOut: 0,
  tokens: 0,
  latency: '30004ms',
  meta: { error: 'timeout' }
}
[Re-extract] Failed for competitor_comparison_universal: Error: AI service timed out. Please try again.
    at createChatCompletion (webpack-internal:///(rsc)/./lib/ai/client.ts:149:23)
    at runNextTicks (node:internal/process/task_queues:65:5)
    at listOnTimeout (node:internal/timers:549:9)
    at process.processTimers (node:internal/timers:523:7)
    at async extractRawFromMessages (webpack-internal:///(rsc)/./lib/extraction/extraction-engine.ts:133:22)
    at async extractWithTimeout (webpack-internal:///(rsc)/./app/api/v1/profile/re-extract/route.ts:36:21)
    at async Promise.all (index 0)
    at async handler (webpack-internal:///(rsc)/./app/api/v1/profile/re-extract/route.ts:117:34)
    at async C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:57228
    at async eT.execute (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:46851)
    at async eT.handle (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:58760)
    at async doRender (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1366:42)
    at async cacheEntry.responseCache.get.routeKind (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1588:28)
    at async DevServer.renderToResponseWithComponentsImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1496:28)
    at async DevServer.renderPageComponent (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1962:32)
    at async DevServer.pipeImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:922:25)
    at async NextNodeServer.handleCatchallRenderRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\next-server.js:272:17)
    at async DevServer.handleRequestImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:818:17)
    at async C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\dev\next-dev-server.js:339:20
    at async Span.traceAsyncFn (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\trace\trace.js:154:20)
    at async DevServer.handleRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\dev\next-dev-server.js:336:24)
    at async invokeRender (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:179:21)
    at async handleRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:359:24)
    at async requestHandlerImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:383:13)
    at async Server.requestListener (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\start-server.js:141:13)
AI request timeout after 30000ms
[AI USAGE] {
  tenant: '5fe39285-a900-4f17-895d-55bc930c1752',
  type: 'extraction',
  model: 'claude-sonnet-4-6',
  cost: '$0.0000',
  tokensIn: 0,
  tokensOut: 0,
  tokens: 0,
  latency: '30006ms',
  meta: { error: 'timeout' }
}
[Re-extract] Failed for skeptical_lead_universal: Error: AI service timed out. Please try again.
    at createChatCompletion (webpack-internal:///(rsc)/./lib/ai/client.ts:149:23)
    at runNextTicks (node:internal/process/task_queues:65:5)
    at listOnTimeout (node:internal/timers:549:9)
    at process.processTimers (node:internal/timers:523:7)
    at async extractRawFromMessages (webpack-internal:///(rsc)/./lib/extraction/extraction-engine.ts:133:22)
    at async extractWithTimeout (webpack-internal:///(rsc)/./app/api/v1/profile/re-extract/route.ts:36:21)
    at async Promise.all (index 1)
    at async handler (webpack-internal:///(rsc)/./app/api/v1/profile/re-extract/route.ts:117:34)
    at async C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:57228
    at async eT.execute (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:46851)
    at async eT.handle (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:58760)
    at async doRender (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1366:42)
    at async cacheEntry.responseCache.get.routeKind (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1588:28)
    at async DevServer.renderToResponseWithComponentsImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1496:28)
    at async DevServer.renderPageComponent (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1962:32)
    at async DevServer.pipeImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:922:25)
    at async NextNodeServer.handleCatchallRenderRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\next-server.js:272:17)
    at async DevServer.handleRequestImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:818:17)
    at async C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\dev\next-dev-server.js:339:20
    at async Span.traceAsyncFn (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\trace\trace.js:154:20)
    at async DevServer.handleRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\dev\next-dev-server.js:336:24)
    at async invokeRender (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:179:21)
    at async handleRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:359:24)
    at async requestHandlerImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:383:13)
    at async Server.requestListener (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\start-server.js:141:13)
AI request timeout after 30000ms
[AI USAGE] {
  tenant: '5fe39285-a900-4f17-895d-55bc930c1752',
  type: 'extraction',
  model: 'claude-sonnet-4-6',
  cost: '$0.0000',
  tokensIn: 0,
  tokensOut: 0,
  tokens: 0,
  latency: '30007ms',
  meta: { error: 'timeout' }
}
[Re-extract] Failed for busy_not_ready_universal: Error: AI service timed out. Please try again.
    at createChatCompletion (webpack-internal:///(rsc)/./lib/ai/client.ts:149:23)
    at async extractRawFromMessages (webpack-internal:///(rsc)/./lib/extraction/extraction-engine.ts:133:22)
    at async extractWithTimeout (webpack-internal:///(rsc)/./app/api/v1/profile/re-extract/route.ts:36:21)
    at async Promise.all (index 2)
    at async handler (webpack-internal:///(rsc)/./app/api/v1/profile/re-extract/route.ts:117:34)
    at async C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:57228
    at async eT.execute (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:46851)
    at async eT.handle (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:58760)
    at async doRender (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1366:42)
    at async cacheEntry.responseCache.get.routeKind (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1588:28)
    at async DevServer.renderToResponseWithComponentsImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1496:28)
    at async DevServer.renderPageComponent (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1962:32)
    at async DevServer.pipeImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:922:25)
    at async NextNodeServer.handleCatchallRenderRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\next-server.js:272:17)
    at async DevServer.handleRequestImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:818:17)
    at async C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\dev\next-dev-server.js:339:20
    at async Span.traceAsyncFn (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\trace\trace.js:154:20)
    at async DevServer.handleRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\dev\next-dev-server.js:336:24)
    at async invokeRender (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:179:21)
    at async handleRequest (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:359:24)
    at async requestHandlerImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\router-server.js:383:13)
    at async Server.requestListener (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\start-server.js:141:13)