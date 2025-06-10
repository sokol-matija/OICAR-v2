using Microsoft.EntityFrameworkCore;
using SnjofkaloAPI.Services.Interfaces;

namespace SnjofkaloAPI.Extensions
{
    public static class QueryableExtensions
    {
        public static async Task<List<T>> ToListDecryptedAsync<T>(this IQueryable<T> query, IDataEncryptionService encryptionService) where T : class
        {
            var entities = await query.ToListAsync();
            encryptionService.DecryptEntities(entities);
            return entities;
        }

        public static async Task<T?> FirstOrDefaultDecryptedAsync<T>(this IQueryable<T> query, IDataEncryptionService encryptionService) where T : class
        {
            var entity = await query.FirstOrDefaultAsync();
            if (entity != null)
            {
                encryptionService.DecryptEntity(entity);
            }
            return entity;
        }

        public static List<T> ToListDecrypted<T>(this IQueryable<T> query, IDataEncryptionService encryptionService) where T : class
        {
            var entities = query.ToList();
            encryptionService.DecryptEntities(entities);
            return entities;
        }
    }
}