using Microsoft.Extensions.Options;
using SnjofkaloAPI.Configurations;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Attributes;
using System.Security.Cryptography;
using System.Text;
using System.Reflection;

namespace SnjofkaloAPI.Services.Implementation
{
    public class DataEncryptionService : IDataEncryptionService
    {
        private readonly EncryptionSettings _encryptionSettings;
        private readonly ILogger<DataEncryptionService> _logger;
        private readonly byte[] _key;
        private readonly byte[] _iv;

        public DataEncryptionService(IOptions<EncryptionSettings> encryptionSettings, ILogger<DataEncryptionService> logger)
        {
            _encryptionSettings = encryptionSettings.Value;
            _logger = logger;

            if (!_encryptionSettings.EnableEncryption)
            {
                _logger.LogWarning("Data encryption is disabled");
                return;
            }

            // Derive key and IV from the encryption key
            using var sha256 = SHA256.Create();
            var keyBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(_encryptionSettings.EncryptionKey));
            _key = keyBytes[..32]; // First 32 bytes for AES-256 key
            _iv = keyBytes[16..32]; // Next 16 bytes for IV
        }

        public string Encrypt(string plainText)
        {
            if (!_encryptionSettings.EnableEncryption || string.IsNullOrEmpty(plainText))
                return plainText;

            try
            {
                using var aes = Aes.Create();
                aes.Key = _key;
                aes.IV = _iv;

                var encryptor = aes.CreateEncryptor();
                var plainBytes = Encoding.UTF8.GetBytes(plainText);
                var encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

                // Prefix with a marker to identify encrypted data
                return $"ENC:{Convert.ToBase64String(encryptedBytes)}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error encrypting data");
                return plainText; // Return original text if encryption fails
            }
        }

        public string Decrypt(string encryptedText)
        {
            if (!_encryptionSettings.EnableEncryption || string.IsNullOrEmpty(encryptedText) || !IsEncrypted(encryptedText))
                return encryptedText;

            try
            {
                // Remove the ENC: prefix
                var base64Data = encryptedText[4..];
                var encryptedBytes = Convert.FromBase64String(base64Data);

                using var aes = Aes.Create();
                aes.Key = _key;
                aes.IV = _iv;

                var decryptor = aes.CreateDecryptor();
                var decryptedBytes = decryptor.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);

                return Encoding.UTF8.GetString(decryptedBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error decrypting data: {EncryptedText}", encryptedText);
                return encryptedText; // Return original text if decryption fails
            }
        }

        public bool IsEncrypted(string text)
        {
            return !string.IsNullOrEmpty(text) && text.StartsWith("ENC:");
        }

        public void EncryptEntity<T>(T entity) where T : class
        {
            if (!_encryptionSettings.EnableEncryption || entity == null)
            {
                Console.WriteLine($"EncryptEntity: Encryption disabled or entity null. EnableEncryption: {_encryptionSettings.EnableEncryption}");
                return;
            }

            // Use the actual runtime type instead of the generic type
            var actualType = entity.GetType();
            Console.WriteLine($"EncryptEntity: Processing entity of actual type {actualType.Name}");

            var properties = GetEncryptablePropertiesForType(actualType);
            Console.WriteLine($"EncryptEntity: Found {properties.Count} encryptable properties");

            foreach (var property in properties)
            {
                Console.WriteLine($"EncryptEntity: Processing property {property.Name}");
                try
                {
                    if (property.PropertyType == typeof(string))
                    {
                        var value = property.GetValue(entity) as string;
                        Console.WriteLine($"EncryptEntity: Property {property.Name} value: {value}");

                        if (!string.IsNullOrEmpty(value) && !IsEncrypted(value))
                        {
                            var encryptedValue = Encrypt(value);
                            Console.WriteLine($"EncryptEntity: Encrypted {property.Name}: {value} -> {encryptedValue}");
                            property.SetValue(entity, encryptedValue);
                            Console.WriteLine($"EncryptEntity: Property {property.Name} set to encrypted value");
                        }
                        else
                        {
                            Console.WriteLine($"EncryptEntity: Skipping {property.Name} - null/empty or already encrypted");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"EncryptEntity: Error encrypting property {property.Name}: {ex.Message}");
                    _logger.LogError(ex, "Error encrypting property {PropertyName} on entity {EntityType}",
                        property.Name, actualType.Name);
                }
            }
        }

        public void DecryptEntity<T>(T entity) where T : class
        {
            if (!_encryptionSettings.EnableEncryption || entity == null)
                return;

            // Use the actual runtime type instead of the generic type
            var actualType = entity.GetType();
            var properties = GetEncryptablePropertiesForType(actualType);

            foreach (var property in properties)
            {
                try
                {
                    if (property.PropertyType == typeof(string))
                    {
                        var value = property.GetValue(entity) as string;
                        if (!string.IsNullOrEmpty(value) && IsEncrypted(value))
                        {
                            var decryptedValue = Decrypt(value);
                            property.SetValue(entity, decryptedValue);
                            _logger.LogDebug("Decrypted property {PropertyName} on entity {EntityType}",
                                property.Name, actualType.Name);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error decrypting property {PropertyName} on entity {EntityType}",
                        property.Name, actualType.Name);
                }
            }
        }

        public void EncryptEntities<T>(IEnumerable<T> entities) where T : class
        {
            foreach (var entity in entities)
            {
                EncryptEntity(entity);
            }
        }

        public void DecryptEntities<T>(IEnumerable<T> entities) where T : class
        {
            foreach (var entity in entities)
            {
                DecryptEntity(entity);
            }
        }

        private List<PropertyInfo> GetEncryptableProperties<T>()
        {
            return GetEncryptablePropertiesForType(typeof(T));
        }

        private List<PropertyInfo> GetEncryptablePropertiesForType(Type type)
        {
            var properties = type.GetProperties()
                .Where(p => p.CanRead && p.CanWrite &&
                           (p.GetCustomAttribute<EncryptedAttribute>() != null ||
                            _encryptionSettings.EncryptedFields.Contains(p.Name)))
                .ToList();

            Console.WriteLine($"GetEncryptableProperties for {type.Name}:");
            Console.WriteLine($"  - Total properties: {type.GetProperties().Length}");
            Console.WriteLine($"  - Encryptable properties: {properties.Count}");
            Console.WriteLine($"  - Configured encrypted fields: [{string.Join(", ", _encryptionSettings.EncryptedFields)}]");

            foreach (var prop in properties)
            {
                var hasAttribute = prop.GetCustomAttribute<EncryptedAttribute>() != null;
                var inConfigList = _encryptionSettings.EncryptedFields.Contains(prop.Name);
                Console.WriteLine($"  - {prop.Name}: HasAttribute={hasAttribute}, InConfigList={inConfigList}");
            }

            return properties;
        }
    }
}