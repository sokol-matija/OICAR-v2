using Microsoft.EntityFrameworkCore;
using SnjofkaloAPI.Data.Interceptors;
using SnjofkaloAPI.Models.Entities;
using SnjofkaloAPI.Services.Interfaces;

namespace SnjofkaloAPI.Data
{
    public partial class ApplicationDbContext : DbContext
    {
        private readonly IDataEncryptionService? _encryptionService;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IDataEncryptionService? encryptionService = null)
            : base(options)
        {
            _encryptionService = encryptionService;
        }

        public virtual DbSet<CartItem> CartItems { get; set; }
        public virtual DbSet<Item> Items { get; set; }
        public virtual DbSet<ItemCategory> ItemCategories { get; set; }
        public virtual DbSet<ItemImage> ItemImages { get; set; }
        public virtual DbSet<Log> Logs { get; set; }
        public virtual DbSet<Order> Orders { get; set; }
        public virtual DbSet<OrderItem> OrderItems { get; set; }
        public virtual DbSet<Status> Statuses { get; set; }
        public virtual DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (_encryptionService != null)
            {
                optionsBuilder.AddInterceptors(new EncryptionInterceptor(_encryptionService));
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(e => e.IDCartItem).HasName("PK__CartItem__388D28A03249791C");
                entity.ToTable("CartItem");

                entity.HasIndex(e => e.AddedAt, "IX_CartItem_AddedAt");
                entity.HasIndex(e => e.ItemID, "IX_CartItem_ItemID");
                entity.HasIndex(e => e.UserID, "IX_CartItem_UserID");
                entity.HasIndex(e => new { e.UserID, e.ItemID }, "UQ_CartItem_UserID_ItemID").IsUnique();

                entity.Property(e => e.IDCartItem).HasColumnName("IDCartItem");
                entity.Property(e => e.AddedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.UserID).HasColumnName("UserID");

                entity.HasOne(d => d.Item).WithMany(p => p.CartItems)
                    .HasForeignKey(d => d.ItemID)
                    .HasConstraintName("FK__CartItem__ItemID__693CA210");

                entity.HasOne(d => d.User).WithMany(p => p.CartItems)
                    .HasForeignKey(d => d.UserID)
                    .HasConstraintName("FK__CartItem__UserID__68487DD7");
            });

            modelBuilder.Entity<Item>(entity =>
            {
                entity.HasKey(e => e.IDItem).HasName("PK__Item__C9778A103AFB0379");
                entity.ToTable("Item", tb => tb.HasTrigger("tr_Item_UpdatedAt"));

                entity.HasIndex(e => e.ItemCategoryID, "IX_Item_CategoryID");
                entity.HasIndex(e => e.CreatedAt, "IX_Item_CreatedAt");
                entity.HasIndex(e => e.IsActive, "IX_Item_IsActive");
                entity.HasIndex(e => e.Price, "IX_Item_Price");
                entity.HasIndex(e => e.SellerUserID, "IX_Item_SellerUserID");
                entity.HasIndex(e => e.IsApproved, "IX_Item_IsApproved");
                entity.HasIndex(e => e.ItemStatus, "IX_Item_ItemStatus");
                entity.HasIndex(e => e.ApprovedByAdminID, "IX_Item_ApprovedByAdminID");
                entity.HasIndex(e => new { e.SellerUserID, e.ItemStatus, e.IsActive }, "IX_Item_Seller_Status_Active");
                entity.HasIndex(e => new { e.IsApproved, e.ItemStatus }, "IX_Item_Approval_Pending")
                    .HasFilter("IsApproved = 0 AND ItemStatus = 'Pending'");

                entity.Property(e => e.IDItem).HasColumnName("IDItem");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.ItemCategoryID).HasColumnName("ItemCategoryID");
                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.Title).HasMaxLength(200).IsUnicode(false);
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.SellerUserID).HasColumnName("SellerUserID");
                entity.Property(e => e.ApprovedByAdminID).HasColumnName("ApprovedByAdminID");
                entity.Property(e => e.IsApproved).HasDefaultValue(true);
                entity.Property(e => e.ItemStatus).HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.CommissionRate).HasColumnType("decimal(5, 4)");
                entity.Property(e => e.PlatformFee).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.RejectionReason).HasMaxLength(500);

                entity.HasOne(d => d.ItemCategory).WithMany(p => p.Items)
                    .HasForeignKey(d => d.ItemCategoryID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Item__ItemCatego__60A75C0F");

                entity.HasOne(d => d.Seller).WithMany(p => p.SellerItems)
                    .HasForeignKey(d => d.SellerUserID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Item__SellerUser__NEW1");

                entity.HasOne(d => d.ApprovedByAdmin).WithMany(p => p.ApprovedItems)
                    .HasForeignKey(d => d.ApprovedByAdminID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Item__ApprovedBy__NEW2");

                entity.HasCheckConstraint("CK_Item_Price_Positive", "Price >= 0");
                entity.HasCheckConstraint("CK_Item_Stock_NonNegative", "StockQuantity >= 0");
                entity.HasCheckConstraint("CK_Item_CommissionRate", "CommissionRate IS NULL OR (CommissionRate >= 0 AND CommissionRate <= 1)");
                entity.HasCheckConstraint("CK_Item_PlatformFee", "PlatformFee IS NULL OR PlatformFee >= 0");
                entity.HasCheckConstraint("CK_Item_ItemStatus", "ItemStatus IN ('Active', 'Pending', 'Rejected', 'Sold', 'Removed', 'Draft')");
            });

            modelBuilder.Entity<ItemImage>(entity =>
            {
                entity.HasKey(e => e.IDItemImage).HasName("PK__ItemImage__NewKey");
                entity.ToTable("ItemImage");

                entity.HasIndex(e => e.ItemID, "IX_ItemImage_ItemID");
                entity.HasIndex(e => new { e.ItemID, e.ImageOrder }, "IX_ItemImage_ItemID_Order");

                entity.Property(e => e.IDItemImage).HasColumnName("IDItemImage");
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.ImageData).IsRequired();
                entity.Property(e => e.ImageOrder).HasDefaultValue(0);
                entity.Property(e => e.FileName).HasMaxLength(255);
                entity.Property(e => e.ContentType).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

                entity.HasOne(d => d.Item).WithMany(p => p.Images)
                    .HasForeignKey(d => d.ItemID)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK__ItemImage__ItemID__NEW");

                entity.HasCheckConstraint("CK_ItemImage_Order_NonNegative", "ImageOrder >= 0");
            });

            modelBuilder.Entity<ItemCategory>(entity =>
            {
                entity.HasKey(e => e.IDItemCategory).HasName("PK__ItemCate__00EDF652D3CC0AE8");
                entity.ToTable("ItemCategory");

                entity.HasIndex(e => e.CategoryName, "UQ_ItemCategory_Name").IsUnique();

                entity.Property(e => e.IDItemCategory).HasColumnName("IDItemCategory");
                entity.Property(e => e.CategoryName).HasMaxLength(100).IsUnicode(false);
                entity.Property(e => e.Description).HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            modelBuilder.Entity<Log>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Logs__3214EC0713EB5566");
                entity.ToTable("Logs");

                entity.HasIndex(e => e.Level, "IX_Logs_Level");
                entity.HasIndex(e => e.Timestamp, "IX_Logs_Timestamp");
                entity.HasIndex(e => e.UserID, "IX_Logs_UserID");

                entity.Property(e => e.Level).HasMaxLength(20);
                entity.Property(e => e.Logger).HasMaxLength(100);
                entity.Property(e => e.MachineName).HasMaxLength(50);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.UserID).HasColumnName("UserID");

                entity.HasOne(d => d.User).WithMany(p => p.Logs)
                    .HasForeignKey(d => d.UserID)
                    .HasConstraintName("FK__Logs__UserID__7D439ABD");

                entity.HasCheckConstraint("CK_Logs_Level", "Level IN ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')");
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.IDOrder).HasName("PK__Order__5CBBCADB610311D7");
                entity.ToTable("Order", tb => tb.HasTrigger("tr_Order_UpdatedAt"));

                entity.HasIndex(e => e.OrderDate, "IX_Order_OrderDate");
                entity.HasIndex(e => e.OrderNumber, "IX_Order_OrderNumber");
                entity.HasIndex(e => e.StatusID, "IX_Order_StatusID");
                entity.HasIndex(e => e.UserID, "IX_Order_UserID");
                entity.HasIndex(e => e.OrderNumber, "UQ_Order_OrderNumber").IsUnique();

                entity.Property(e => e.IDOrder).HasColumnName("IDOrder");
                entity.Property(e => e.BillingAddress).HasMaxLength(1500);
                entity.Property(e => e.ShippingAddress).HasMaxLength(1500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.OrderDate).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.OrderNotes).HasMaxLength(1000);
                entity.Property(e => e.OrderNumber).HasMaxLength(50).IsUnicode(false);
                entity.Property(e => e.StatusID).HasColumnName("StatusID");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.UserID).HasColumnName("UserID");

                entity.HasOne(d => d.Status).WithMany(p => p.Orders)
                    .HasForeignKey(d => d.StatusID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Order__StatusID__70DDC3D8");

                entity.HasOne(d => d.User).WithMany(p => p.Orders)
                    .HasForeignKey(d => d.UserID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Order__UserID__71D1E811");
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.IDOrderItem).HasName("PK__OrderIte__C1C25E90D8525C49");
                entity.ToTable("OrderItem");

                entity.HasIndex(e => e.ItemID, "IX_OrderItem_ItemID");
                entity.HasIndex(e => e.OrderID, "IX_OrderItem_OrderID");

                entity.Property(e => e.IDOrderItem).HasColumnName("IDOrderItem");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.ItemTitle).HasMaxLength(200).IsUnicode(false);
                entity.Property(e => e.OrderID).HasColumnName("OrderID");
                entity.Property(e => e.PriceAtOrder).HasColumnType("decimal(10, 2)");

                entity.HasOne(d => d.Item).WithMany(p => p.OrderItems)
                    .HasForeignKey(d => d.ItemID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__OrderItem__ItemI__76969D2E");

                entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                    .HasForeignKey(d => d.OrderID)
                    .HasConstraintName("FK__OrderItem__Order__778AC167");

                entity.HasCheckConstraint("CK_OrderItem_Quantity_Positive", "Quantity > 0");
                entity.HasCheckConstraint("CK_OrderItem_Price_NonNegative", "PriceAtOrder >= 0");
            });

            modelBuilder.Entity<Status>(entity =>
            {
                entity.HasKey(e => e.IDStatus).HasName("PK__Status__8DA24510003F5A4E");
                entity.ToTable("Status");

                entity.HasIndex(e => e.Name, "UQ_Status_Name").IsUnique();

                entity.Property(e => e.IDStatus).HasColumnName("IDStatus");
                entity.Property(e => e.Description).HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.Name).HasMaxLength(50).IsUnicode(false);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.IDUser).HasName("PK__User__EAE6D9DF27A35BA1");
                entity.ToTable("User", tb => tb.HasTrigger("tr_User_UpdatedAt"));

                entity.HasIndex(e => e.CreatedAt, "IX_User_CreatedAt");
                entity.HasIndex(e => e.Email, "IX_User_Email");
                entity.HasIndex(e => e.Username, "IX_User_Username");
                entity.HasIndex(e => e.Email, "UQ_User_Email").IsUnique();
                entity.HasIndex(e => e.Username, "UQ_User_Username").IsUnique();
                entity.HasIndex(e => e.RequestedAnonymization, "IX_User_RequestedAnonymization")
                    .HasFilter("RequestedAnonymization = 1");
                entity.HasIndex(e => e.AnonymizationRequestDate, "IX_User_AnonymizationRequestDate")
                    .HasFilter("AnonymizationRequestDate IS NOT NULL");

                entity.Property(e => e.IDUser).HasColumnName("IDUser");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.Email).HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.FirstName).HasMaxLength(200).IsUnicode(false);
                entity.Property(e => e.LastName).HasMaxLength(200).IsUnicode(false);
                entity.Property(e => e.Username).HasMaxLength(200).IsUnicode(false);
                entity.Property(e => e.PhoneNumber).HasMaxLength(100).IsUnicode(false);
                entity.Property(e => e.PasswordHash).HasMaxLength(255);
                entity.Property(e => e.PasswordSalt).HasMaxLength(1024);
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");
                entity.Property(e => e.RequestedAnonymization).HasDefaultValue(false);
                entity.Property(e => e.AnonymizationReason).HasMaxLength(1000);
                entity.Property(e => e.AnonymizationNotes).HasMaxLength(1000);

                entity.HasCheckConstraint("CK_User_AnonymizationRequest",
                    "(RequestedAnonymization = 0 AND AnonymizationRequestDate IS NULL) OR " +
                    "(RequestedAnonymization = 1 AND AnonymizationRequestDate IS NOT NULL)");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

        public override async ValueTask<object?> FindAsync(Type entityType, params object?[]? keyValues)
        {
            var entity = await base.FindAsync(entityType, keyValues);
            if (entity != null && _encryptionService != null)
            {
                _encryptionService.DecryptEntity(entity);
            }
            return entity;
        }

        public override ValueTask<object?> FindAsync(Type entityType, object?[]? keyValues, CancellationToken cancellationToken)
        {
            return FindAsync(entityType, keyValues);
        }

        public override object? Find(Type entityType, params object?[]? keyValues)
        {
            var entity = base.Find(entityType, keyValues);
            if (entity != null && _encryptionService != null)
            {
                _encryptionService.DecryptEntity(entity);
            }
            return entity;
        }

        public async Task<TEntity?> FindAsync<TEntity>(params object?[]? keyValues)
            where TEntity : class
        {
            var entity = await base.FindAsync<TEntity>(keyValues);
            if (entity != null && _encryptionService != null)
            {
                _encryptionService.DecryptEntity(entity);
            }
            return entity;
        }

        public new TEntity? Find<TEntity>(params object?[]? keyValues)
            where TEntity : class
        {
            var entity = base.Find<TEntity>(keyValues);
            if (entity != null && _encryptionService != null)
            {
                _encryptionService.DecryptEntity(entity);
            }
            return entity;
        }
    }
    }