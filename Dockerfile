# Use official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY gallery.csproj ./
RUN dotnet restore gallery.csproj

# Copy everything and build
COPY . .
RUN dotnet publish gallery.csproj -c Release -o /app/publish /p:UseAppHost=false

# Use runtime image for smaller final container
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "gallery.dll"]
