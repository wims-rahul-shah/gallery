using System;
using System.IO;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace YourNamespace.Services
{
    public interface IBlobStorage
    {
        Task<string> UploadAsync(Stream stream, string blobName, string contentType = null);
        Task<bool> DeleteAsync(string blobName);
        string GetUrl(string blobName);
    }

    public class AzureBlobStorage : IBlobStorage
    {
        private readonly BlobContainerClient _container;

        public AzureBlobStorage(IConfiguration config)
        {
            var useConnStr = Environment.GetEnvironmentVariable("Storage__ConnectionString");
            var container = config["Storage:Container"] ?? "images";
            var accountName = config["Storage:AccountName"];
            var blobServiceUrl = config["Storage:BlobServiceUrl"];

            if (!string.IsNullOrWhiteSpace(useConnStr))
            {
                // Connection string auth
                var service = new BlobServiceClient(useConnStr);
                _container = service.GetBlobContainerClient(container);
            }
            else if (!string.IsNullOrWhiteSpace(blobServiceUrl))
            {
                // Managed Identity / DefaultAzureCredential
                var service = new BlobServiceClient(new Uri(blobServiceUrl), new DefaultAzureCredential());
                _container = service.GetBlobContainerClient(container);
            }
            else if (!string.IsNullOrWhiteSpace(accountName))
            {
                var url = $"https://{accountName}.blob.core.windows.net/";
                var service = new BlobServiceClient(new Uri(url), new DefaultAzureCredential());
                _container = service.GetBlobContainerClient(container);
            }
            else
            {
                throw new InvalidOperationException("Blob storage not configured. Provide Storage__ConnectionString or Storage__AccountName/BlobServiceUrl.");
            }

            _container.CreateIfNotExists(PublicAccessType.Blob);
        }

        public async Task<string> UploadAsync(Stream stream, string blobName, string contentType = null)
        {
            var blob = _container.GetBlobClient(blobName);
            var options = new BlobUploadOptions();
            if (!string.IsNullOrEmpty(contentType))
            {
                options.HttpHeaders = new BlobHttpHeaders { ContentType = contentType };
            }
            await blob.UploadAsync(stream, options);
            return blob.Uri.ToString();
        }

        public async Task<bool> DeleteAsync(string blobName)
        {
            var blob = _container.GetBlobClient(blobName);
            var res = await blob.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);
            return res.Value;
        }

        public string GetUrl(string blobName) => _container.GetBlobClient(blobName).Uri.ToString();
    }
}