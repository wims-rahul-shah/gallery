# Azure Readiness Guide

This project now includes everything you need to deploy to **Azure App Service** (Linux) with optional **Azure Blob Storage**.

## What changed

- GitHub Actions workflow `.github/workflows/deploy.yml` for CI/CD.
- `Dockerfile` for container deployment (optional; the workflow does build-and-deploy without container too).
- `infra/azure.bicep` to provision App Service + Storage Account.
- `appsettings.Production.json` as a template for production settings.
- `Services/AzureBlobStorage.cs` for uploading images to Azure Blob.
- `Data/ApplicationDbContextFactory.cs` to make EF Core tooling work in CI.

## 1) Provision Azure resources

Option A (Portal):
1. Create a **Resource Group** (e.g., `rg-gallery`).
2. Create an **App Service Plan** (Linux) and a **Web App** (runtime: .NET 8).
3. Create a **Storage Account** (for images), make a container named `images` (private recommended).

Option B (Bicep):
```bash
az group create -n your-rg-name -l centralindia
az deployment group create -g your-rg-name -f infra/azure.bicep -p appName=your-webapp-name
```

## 2) Configure App Settings (Secrets)

In the Azure Web App **Configuration** blade, set the following (Name -> Value):

- `ASPNETCORE_ENVIRONMENT` -> `Production`
- `ConnectionStrings__DefaultConnection` -> `Data Source=/home/data/app.db` (SQLite) **or** your Azure SQL connection string
- `Auth__Google__ClientId` -> your Google OAuth client id
- `Auth__Google__ClientSecret` -> your Google OAuth client secret
- For Blob Storage (choose ONE auth method):
  - **Managed Identity**: enable System Assigned identity on the Web App; grant **Storage Blob Data Contributor** to the Storage Account. Then set:
    - `Storage__AccountName` = `<yourstorage>` *or* `Storage__BlobServiceUrl` = `https://<yourstorage>.blob.core.windows.net/`
  - **Connection String**: set `Storage__ConnectionString` = `<your-connection-string>`

> Never commit secrets into the repo.

## 3) Wire up Blob Storage in code

In `Program.cs` (or `Startup.cs`), register the service:
```csharp
builder.Services.AddSingleton<YourNamespace.Services.IBlobStorage, YourNamespace.Services.AzureBlobStorage>();
```

Inject `IBlobStorage` where you save images and call:
```csharp
var url = await _blobStorage.UploadAsync(fileStream, blobName, contentType);
```

## 4) CI/CD via GitHub Actions

- Create repo and push code.
- In GitHub, go to **Settings > Secrets and variables > Actions** and add `AZUREAPPSERVICE_PUBLISHPROFILE` (download from Web App > Overview > Get publish profile).
- Update values in `.github/workflows/deploy.yml`: `AZURE_WEBAPP_NAME`, `AZURE_RESOURCE_GROUP`, `AZURE_REGION`.

Push to `main` to trigger the workflow.

## 5) SQLite note

Azure App Service (Linux) allows writing to `/home` which is persistent. If you stay on SQLite, set:
```
ConnectionStrings__DefaultConnection=Data Source=/home/data/app.db
```
A future improvement is to migrate to **Azure SQL** and use `Microsoft.EntityFrameworkCore.SqlServer`.

## 6) Google OAuth callback

Set your Google OAuth redirect URI to:
```
https://<your-webapp-name>.azurewebsites.net/signin-google
```

## 7) Local development parity

- Create a `appsettings.Development.json` with your local secrets or use `dotnet user-secrets`.
- Run with `ASPNETCORE_ENVIRONMENT=Development` locally.

## 8) Optional: Container-based deployment

Build and push the container image to ACR or Docker Hub, then set your Web App to use the container. The provided `Dockerfile` works out of the box.

---

Need help wiring `IBlobStorage` into your controllers/views? See `Services/AzureBlobStorage.cs` and ping me to add the exact changes in your upload endpoints.