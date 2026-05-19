using System.Net;
using System.Text.Json;

namespace ShelterCoordinationSystem.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            // Определяем статус-код на основе типа ошибки
            var statusCode = exception switch
            {
                ArgumentException => HttpStatusCode.BadRequest, // 400 для ошибок бизнес-валидации (например, неуникальный email)
                UnauthorizedAccessException => HttpStatusCode.Unauthorized, // 401
                KeyNotFoundException => HttpStatusCode.NotFound, // 404
                _ => HttpStatusCode.InternalServerError // 500 для остальных непредвиденных ошибок
            };

            context.Response.StatusCode = (int)statusCode;

            var response = new
            {
                StatusCode = context.Response.StatusCode,
                Message = statusCode == HttpStatusCode.InternalServerError ? "Произошла внутренняя ошибка сервера" : exception.Message
            };

            var jsonResponse = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(jsonResponse);
        }
    }
}
