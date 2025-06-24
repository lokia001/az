using System;

namespace Backend.Api.Infrastructure.Exceptions
{
    public class ApiException : Exception
    {
        public ApiException(string message) : base(message) { }
    }

    public class NotFoundException : ApiException
    {
        public NotFoundException(string message) : base(message) { }
    }

    public class UnauthorizedException : ApiException
    {
        public UnauthorizedException(string message) : base(message) { }
    }
}
