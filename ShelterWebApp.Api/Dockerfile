FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ShelterCoordinationSystem.csproj", "./"]
RUN dotnet restore "./ShelterCoordinationSystem.csproj"
COPY . .
RUN dotnet publish "ShelterCoordinationSystem.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5045
ENV ASPNETCORE_URLS=http://+:5045
ENTRYPOINT ["dotnet", "ShelterCoordinationSystem.dll"]
