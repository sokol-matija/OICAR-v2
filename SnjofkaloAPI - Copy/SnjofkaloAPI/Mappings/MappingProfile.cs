using AutoMapper;
using SnjofkaloAPI.Models.Entities;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.DTOs.Requests;

namespace SnjofkaloAPI.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserResponse>();
            CreateMap<User, UserListResponse>();
            CreateMap<UpdateUserRequest, User>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<UpdateUserAdminRequest, User>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<ItemImage, ItemImageResponse>();

            CreateMap<Item, ItemResponse>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.ItemCategory.CategoryName))
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images.OrderBy(i => i.ImageOrder)));

            CreateMap<Item, ItemListResponse>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.ItemCategory.CategoryName))
                .ForMember(dest => dest.PrimaryImage, opt => opt.MapFrom(src => src.Images.OrderBy(i => i.ImageOrder).FirstOrDefault()))
                .ForMember(dest => dest.ImageCount, opt => opt.MapFrom(src => src.Images.Count));

            CreateMap<CreateItemRequest, Item>()
                .ForMember(dest => dest.IDItem, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ItemCategory, opt => opt.Ignore())
                .ForMember(dest => dest.CartItems, opt => opt.Ignore())
                .ForMember(dest => dest.OrderItems, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<UpdateItemRequest, Item>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<ItemImageRequest, ItemImage>()
                .ForMember(dest => dest.IDItemImage, opt => opt.Ignore())
                .ForMember(dest => dest.ItemID, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Item, opt => opt.Ignore());

            CreateMap<ItemCategory, CategoryResponse>()
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count(i => i.IsActive)));

            CreateMap<CreateCategoryRequest, ItemCategory>()
                .ForMember(dest => dest.IDItemCategory, opt => opt.Ignore())
                .ForMember(dest => dest.Items, opt => opt.Ignore());

            CreateMap<UpdateCategoryRequest, ItemCategory>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<CartItem, CartItemResponse>()
                .ForMember(dest => dest.ItemTitle, opt => opt.MapFrom(src => src.Item.Title))
                .ForMember(dest => dest.ItemPrice, opt => opt.MapFrom(src => src.Item.Price))
                .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.Quantity * src.Item.Price))
                .ForMember(dest => dest.IsInStock, opt => opt.MapFrom(src => src.Item.StockQuantity > 0))
                .ForMember(dest => dest.AvailableStock, opt => opt.MapFrom(src => src.Item.StockQuantity));

            CreateMap<Order, OrderResponse>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
                .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.Name))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.OrderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder)));

            CreateMap<Order, OrderListResponse>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
                .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.Name))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.OrderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder)));

            CreateMap<OrderItem, OrderItemResponse>()
                .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.Quantity * src.PriceAtOrder));
        }
    }
}