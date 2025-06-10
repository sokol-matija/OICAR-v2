namespace SnjofkaloAPI.Attributes
{
    // Marks a property for automatic encryption/decryption
    [AttributeUsage(AttributeTargets.Property)]
    public class EncryptedAttribute : Attribute
    {
        public bool Required { get; set; } = false;

        public EncryptedAttribute(bool required = false)
        {
            Required = required;
        }
    }
}