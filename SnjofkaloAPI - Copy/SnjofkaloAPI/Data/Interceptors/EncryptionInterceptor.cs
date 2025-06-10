using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using SnjofkaloAPI.Services.Interfaces;

namespace SnjofkaloAPI.Data.Interceptors
{
    public class EncryptionInterceptor : SaveChangesInterceptor
    {
        private readonly IDataEncryptionService _encryptionService;

        public EncryptionInterceptor(IDataEncryptionService encryptionService)
        {
            _encryptionService = encryptionService;
        }

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            Console.WriteLine("EncryptionInterceptor.SavingChanges called");
            EncryptEntities(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            Console.WriteLine("EncryptionInterceptor.SavingChangesAsync called");
            EncryptEntities(eventData.Context);
            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
        {
            Console.WriteLine("EncryptionInterceptor.SavedChanges called");
            // Decrypt entities after saving to keep in-memory objects decrypted
            DecryptEntities(eventData.Context);
            return base.SavedChanges(eventData, result);
        }

        public override async ValueTask<int> SavedChangesAsync(SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
        {
            Console.WriteLine("EncryptionInterceptor.SavedChangesAsync called");
            // Decrypt entities after saving to keep in-memory objects decrypted
            DecryptEntities(eventData.Context);
            return await base.SavedChangesAsync(eventData, result, cancellationToken);
        }

        private void EncryptEntities(DbContext? context)
        {
            if (context == null) return;

            var entities = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified)
                .Select(e => e.Entity)
                .ToList();

            Console.WriteLine($"EncryptionInterceptor: Found {entities.Count} entities to encrypt");

            foreach (var entity in entities)
            {
                Console.WriteLine($"EncryptionInterceptor: Encrypting entity of type {entity.GetType().Name}");
                _encryptionService.EncryptEntity(entity);
            }
        }

        private void DecryptEntities(DbContext? context)
        {
            if (context == null) return;

            var entities = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Unchanged || e.State == EntityState.Modified)
                .Select(e => e.Entity)
                .ToList();

            Console.WriteLine($"EncryptionInterceptor: Found {entities.Count} entities to decrypt");

            foreach (var entity in entities)
            {
                _encryptionService.DecryptEntity(entity);
            }
        }
    }
}