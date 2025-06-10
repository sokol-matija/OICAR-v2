using BCrypt.Net;

namespace SnjofkaloAPI.Utilities
{
    public static class PasswordHelper
    {
        public static string HashPassword(string password, out byte[] salt)
        {
            salt = BCrypt.Net.BCrypt.GenerateSalt(12).ToCharArray().Select(c => (byte)c).ToArray();

            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }

        public static bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        public static string GenerateSecurePassword(int length = 12)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}