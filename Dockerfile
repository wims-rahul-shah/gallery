# Use official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY gallery/gallery.csproj ./gallery/
RUN dotnet restore ./gallery/gallery.csproj

# Copy everything and build
COPY . .
WORKDIR /src/gallery
RUN dotnet publish gallery.csproj -c Release -o /app/publish /p:UseAppHost=false

# Use runtime image for smaller final container
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "gallery.dll"]
