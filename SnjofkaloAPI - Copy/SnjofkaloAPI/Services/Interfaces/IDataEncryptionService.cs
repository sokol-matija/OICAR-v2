namespace SnjofkaloAPI.Services.Interfaces
{
    public interface IDataEncryptionService
    {
        string Encrypt(string plainText);
        string Decrypt(string encryptedText);
        bool IsEncrypted(string text);
        void EncryptEntity<T>(T entity) where T : class;
        void DecryptEntity<T>(T entity) where T : class;
        void EncryptEntities<T>(IEnumerable<T> entities) where T : class;
        void DecryptEntities<T>(IEnumerable<T> entities) where T : class;
    }
}