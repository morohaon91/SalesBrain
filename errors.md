 GET /api/v1/conversations 200 in 28ms
Authentication error: Error: Access token expired
    at verifyAccessToken (webpack-internal:///(rsc)/./lib/auth/jwt.ts:82:19)
    at eval (webpack-internal:///(rsc)/./lib/auth/middleware.ts:67:84)
    at C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:57234
    at C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\trace\tracer.js:140:36
    at NoopContextManager.with (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\@opentelemetry\api\index.js:1:7062)
    at ContextAPI.with (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\@opentelemetry\api\index.js:1:518)
    at NoopTracer.startActiveSpan (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\@opentelemetry\api\index.js:1:18093)
    at ProxyTracer.startActiveSpan (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\@opentelemetry\api\index.js:1:18854)
    at C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\trace\tracer.js:122:103
    at NoopContextManager.with (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\@opentelemetry\api\index.js:1:7062)
    at ContextAPI.with (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\@opentelemetry\api\index.js:1:518)
    at NextTracerImpl.trace (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\lib\trace\tracer.js:122:28)
    at C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:48896
    at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
    at Object.wrap (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:40958)
    at C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:47472
    at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
    at Object.wrap (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:38293)
    at C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:47434
    at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
    at eT.execute (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:46881)
    at eT.handle (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:58771)
    at doRender (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1366:60)
    at cacheEntry.responseCache.get.routeKind (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1588:34)
    at ResponseCache.get (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\response-cache\index.js:49:26)
    at DevServer.renderToResponseWithComponentsImpl (C:\Users\Mor\Desktop\Repos\SalesBrain\node_modules\next\dist\server\base-server.js:1496:53)