param location string = resourceGroup().location
param appName string
param sku string = 'P0v3' // Premium v3 small
param storageSku string = 'Standard_LRS'

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: sku
    capacity: 1
    tier: 'PremiumV3'
  }
  properties: {
    reserved: true // Linux
  }
}

resource web 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      appSettings: [
        { name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE', value: 'true' }
        // Put your app config in Azure App Settings after deploy,
        // not hard-coded here.
      ]
      alwaysOn: true
      http20Enabled: true
      minimumTlsVersion: '1.2'
    }
    httpsOnly: true
  }
}

resource store 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: toLower('${appName}sa')
  location: location
  sku: {
    name: storageSku
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

output webAppName string = web.name
output storageAccountName string = store.name