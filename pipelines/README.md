# Azure DevOps pipelines (placeholder)

No working pipeline exists yet. This directory reserves the location for the
future `azure-pipelines.yml` that will be added in a later lab.

## Planned CI/CD flow

```text
Git push
   |
   v
Azure DevOps Pipeline
   |
   v
Install dependencies      (npm ci)
   |
   v
Lint                      (npm run lint)
   |
   v
Type check                (npx tsc -b --noEmit)
   |
   v
Tests                     (npm test)
   |
   v
Production build          (npm run build)
   |
   v
Docker build              (docker build -t serviceswap-web .)
   |
   v
Security scan             (image + dependency scanning)
   |
   v
Push image to Azure Container Registry
   |
   v
Deploy to Azure App Service (containers)
```

## Notes for later labs

- Build-time `VITE_*` values are passed as Docker build args from pipeline
  variables, not committed to the repo.
- No Azure credentials belong in this repository; use an Azure DevOps
  service connection (and later, workload identity federation).
- Image tags should be immutable (`$(Build.BuildId)` / commit SHA), not
  `latest`, so deployments are reproducible and rollback-able.
- Key Vault + managed identity is intentionally out of scope until the
  AZ-500 lab.
