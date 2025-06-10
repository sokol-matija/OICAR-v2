namespace SnjofkaloAPI.Configurations
{
    public class EncryptionSettings
    {
        public string EncryptionKey { get; set; } = string.Empty;
        public bool EnableEncryption { get; set; } = true;
        public List<string> EncryptedFields { get; set; } = new();
    }
}
